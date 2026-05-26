import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Paynet's server IP ranges (CIDR) — only accept requests from these
// Per contract: 213.230.106.112/28 and 213.230.65.80/28
const PAYNET_CIDRS = [
  { octets: [213, 230, 106, 112], mask: 28 },
  { octets: [213, 230, 65, 80], mask: 28 },
]

function ipToU32(ip: string): number {
  const [a = 0, b = 0, c = 0, d = 0] = ip.split('.').map(Number)
  return ((a << 24) | (b << 16) | (c << 8) | d) >>> 0
}

function isPaynetIP(ip: string): boolean {
  const ipNum = ipToU32(ip)
  return PAYNET_CIDRS.some(({ octets, mask }) => {
    const baseNum = ipToU32(octets.join('.'))
    const maskNum = (~0 << (32 - mask)) >>> 0
    return (ipNum & maskNum) === (baseNum & maskNum)
  })
}

function clientIP(req: NextRequest): string {
  return (
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    req.headers.get('x-real-ip') ??
    '0.0.0.0'
  )
}

function checkBasicAuth(req: NextRequest): boolean {
  const auth = req.headers.get('authorization')
  if (!auth?.startsWith('Basic ')) return false
  const [user, pass] = Buffer.from(auth.slice(6), 'base64').toString().split(':')
  return user === process.env.PAYNET_USERNAME && pass === process.env.PAYNET_PASSWORD
}

function tashkentNow(): string {
  return new Date().toLocaleString('sv-SE', { timeZone: 'Asia/Tashkent' }).replace('T', ' ')
}

type JsonRpcId = number | string | null

function ok(id: JsonRpcId, result: unknown) {
  return NextResponse.json({ jsonrpc: '2.0', id, result })
}

function err(id: JsonRpcId, code: number, message: string) {
  return NextResponse.json({ jsonrpc: '2.0', id, error: { code, message } })
}

function serviceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  )
}

export async function POST(req: NextRequest) {
  // Reject non-Paynet IPs in production
  if (process.env.NODE_ENV === 'production' && !isPaynetIP(clientIP(req))) {
    return new NextResponse(null, { status: 403 })
  }

  if (!checkBasicAuth(req)) {
    return new NextResponse(null, { status: 401, headers: { 'WWW-Authenticate': 'Basic' } })
  }

  let body: { jsonrpc: string; method: string; id: JsonRpcId; params: Record<string, unknown> }
  try {
    body = await req.json()
  } catch {
    return err(null, -32700, 'Parse error')
  }

  if (body.jsonrpc !== '2.0' || !body.method || body.id == null) {
    return err(body?.id ?? null, -32600, 'Invalid request')
  }

  // Reject non-POST is already enforced by Next.js routing, but spec requires -32300
  const { method, id, params } = body
  const db = serviceClient()

  switch (method) {
    case 'GetInformation': {
      const clientId = (params?.fields as Record<string, string>)?.client_id
      if (!clientId) return err(id, -32602, 'Missing client_id in fields')

      const { data: booking } = await db
        .from('bookings')
        .select('id, exam_fee, candidates(full_name)')
        .eq('id', clientId)
        .in('status', ['pending_payment', 'confirmed'])
        .single()

      if (!booking) return err(id, 302, 'Client not found')

      const candidate = (booking.candidates as unknown) as { full_name: string } | null
      return ok(id, {
        status: 0,
        timestamp: tashkentNow(),
        fields: {
          balance: booking.exam_fee,
          name: candidate?.full_name ?? '',
        },
      })
    }

    case 'PerformTransaction': {
      const { amount, transactionId, fields } = params as {
        amount: number
        serviceId: number
        transactionId: number
        fields: { client_id: string }
      }
      if (!fields?.client_id || !transactionId || !amount) {
        return err(id, -32602, 'Missing required params')
      }

      // Idempotency: reject duplicate Paynet transaction IDs
      const { data: existing } = await db
        .from('payments')
        .select('provider_trn_id')
        .eq('paynet_transaction_id', String(transactionId))
        .maybeSingle()

      if (existing) return err(id, 201, 'Transaction already exists')

      const { data: booking } = await db
        .from('bookings')
        .select('id, exam_fee, status')
        .eq('id', fields.client_id)
        .single()

      if (!booking) return err(id, 302, 'Client not found')
      if (booking.status !== 'pending_payment') return err(id, 201, 'Transaction already exists')
      if (booking.exam_fee !== amount) return err(id, 413, 'Invalid amount')

      const { data: payment, error: payErr } = await db
        .from('payments')
        .insert({
          booking_id: fields.client_id,
          paynet_transaction_id: String(transactionId),
          amount,
          status: 'completed',
          gateway: 'paynet',
          paid_at: new Date().toISOString(),
        })
        .select('provider_trn_id')
        .single()

      if (payErr || !payment) return err(id, -32603, 'System error')

      await db
        .from('bookings')
        .update({ status: 'confirmed', payment_status: 'paid' })
        .eq('id', fields.client_id)

      return ok(id, {
        providerTrnId: payment.provider_trn_id,
        timestamp: tashkentNow(),
        fields: { client_id: fields.client_id },
      })
    }

    case 'CheckTransaction': {
      const { transactionId } = params as { transactionId: number }

      const { data: payment } = await db
        .from('payments')
        .select('provider_trn_id, status')
        .eq('paynet_transaction_id', String(transactionId))
        .maybeSingle()

      if (!payment) return err(id, 203, 'Transaction not found')

      const stateMap: Record<string, number> = { completed: 1, cancelled: 2 }
      return ok(id, {
        providerTrnId: payment.provider_trn_id,
        timestamp: tashkentNow(),
        transactionState: stateMap[payment.status] ?? 3,
      })
    }

    case 'CancelTransaction': {
      const { transactionId } = params as { transactionId: number }

      const { data: payment } = await db
        .from('payments')
        .select('provider_trn_id, booking_id, status')
        .eq('paynet_transaction_id', String(transactionId))
        .maybeSingle()

      if (!payment) return err(id, 203, 'Transaction not found')
      if (payment.status === 'cancelled') return err(id, 202, 'Transaction already cancelled')

      await db.from('payments').update({ status: 'cancelled' }).eq('provider_trn_id', payment.provider_trn_id)
      await db
        .from('bookings')
        .update({ status: 'pending_payment', payment_status: 'unpaid' })
        .eq('id', payment.booking_id)

      return ok(id, {
        providerTrnId: payment.provider_trn_id,
        timestamp: tashkentNow(),
        transactionState: 2,
      })
    }

    case 'GetStatement': {
      const { dateFrom, dateTo } = params as { serviceId: number; dateFrom: string; dateTo: string }

      const { data: payments } = await db
        .from('payments')
        .select('provider_trn_id, amount, paynet_transaction_id, paid_at')
        .eq('gateway', 'paynet')
        .gte('paid_at', new Date(dateFrom).toISOString())
        .lte('paid_at', new Date(dateTo).toISOString())

      return ok(id, {
        statements: (payments ?? []).map((p) => ({
          amount: p.amount,
          transactionId: Number(p.paynet_transaction_id),
          providerTrnId: p.provider_trn_id,
          timestamp: new Date(p.paid_at).toLocaleString('sv-SE', { timeZone: 'Asia/Tashkent' }).replace('T', ' '),
        })),
      })
    }

    case 'ChangePassword':
      // Optional method — password management is handled out-of-band
      return ok(id, 'success')

    default:
      return err(id, -32601, 'Method not found')
  }
}

// Paynet spec requires error code -32300 for non-POST requests
export async function GET() {
  return NextResponse.json({ jsonrpc: '2.0', id: null, error: { code: -32300, message: 'Use POST' } }, { status: 405 })
}
