import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

// Payme Merchant API — JSON-RPC 2.0 inbound endpoint.
// Payme's servers call this when a user initiates or completes a payment.
// Docs: https://developer.help.paycom.uz/protokol-merchant-api/
//
// Auth: Authorization: Basic base64(MERCHANT_ID:PAYME_MERCHANT_KEY)
// Always return HTTP 200 (Payme retries on non-200).
// Sandbox endpoint: https://test.paycom.uz  (set NEXT_PUBLIC_PAYME_ENV=test)
// Production endpoint: https://checkout.paycom.uz

type JsonRpcId = number | string | null

function ok(id: JsonRpcId, result: unknown) {
  return NextResponse.json({ jsonrpc: '2.0', id, result })
}

function rpcErr(
  id: JsonRpcId,
  code: number,
  ru: string,
  uz: string = ru,
  en: string = ru,
  data: string | null = null,
) {
  return NextResponse.json({
    jsonrpc: '2.0',
    id,
    error: { code, message: { ru, uz, en }, data },
  })
}

function checkAuth(req: NextRequest): boolean {
  const auth = req.headers.get('authorization')
  if (!auth?.startsWith('Basic ')) return false
  const decoded = Buffer.from(auth.slice(6), 'base64').toString()
  const colonIdx = decoded.indexOf(':')
  if (colonIdx === -1) return false
  const merchant = decoded.slice(0, colonIdx)
  const key = decoded.slice(colonIdx + 1)
  return (
    merchant === process.env.NEXT_PUBLIC_PAYME_MERCHANT_ID &&
    key === process.env.PAYME_MERCHANT_KEY
  )
}

// Shared: verify the order exists and amount matches exam price (in tiyin).
async function validateOrder(
  orderId: number,
  amountTiyin: number,
): Promise<{ ok: true; paymentVerified: boolean } | { ok: false; code: number; ru: string; uz: string; en: string; data: string }> {
  const { data: reg } = await supabaseAdmin
    .from('registrations')
    .select('id, payment_verified, exam_id')
    .eq('id', orderId)
    .single()

  if (!reg) {
    return { ok: false, code: -31001, ru: 'Заказ не найден', uz: 'Buyurtma topilmadi', en: 'Order not found', data: 'order_id' }
  }

  const { data: exam } = await supabaseAdmin
    .from('exams')
    .select('level_id')
    .eq('id', reg.exam_id)
    .single()

  const { data: level } = exam
    ? await supabaseAdmin.from('exam_levels').select('price').eq('id', exam.level_id).single()
    : { data: null }

  if (!level) {
    return { ok: false, code: -31001, ru: 'Заказ не найден', uz: 'Buyurtma topilmadi', en: 'Order not found', data: 'order_id' }
  }

  const expectedTiyin = Math.round(Number(level.price) * 100)
  if (expectedTiyin !== amountTiyin) {
    return { ok: false, code: -31003, ru: 'Неверная сумма', uz: "Noto'g'ri summa", en: 'Wrong amount', data: 'amount' }
  }

  return { ok: true, paymentVerified: reg.payment_verified }
}

export async function POST(req: NextRequest) {
  if (!checkAuth(req)) {
    return rpcErr(null, -32504, 'Недостаточно прав', "Ruxsat yo'q", 'Insufficient privilege')
  }

  let body: { jsonrpc: string; method: string; id: JsonRpcId; params: Record<string, unknown> }
  try {
    body = await req.json()
  } catch {
    return rpcErr(null, -32700, 'Ошибка парсинга', 'Parse xatosi', 'Parse error')
  }

  if (body.jsonrpc !== '2.0' || !body.method || body.id == null) {
    return rpcErr(body?.id ?? null, -32600, 'Неверный запрос', "Noto'g'ri so'rov", 'Invalid request')
  }

  const { method, id, params } = body
  const now = Date.now()

  switch (method) {
    // ── 1. CheckPerformTransaction ──────────────────────────────────────────
    // Payme asks: "Can we charge this order for this amount?"
    case 'CheckPerformTransaction': {
      const amount = params.amount as number
      const account = params.account as { order_id?: string } | undefined
      if (!account?.order_id || !amount) {
        return rpcErr(id, -32602, 'Неверные параметры', "Noto'g'ri parametrlar", 'Invalid params')
      }

      const result = await validateOrder(Number(account.order_id), amount)
      if (!result.ok) return rpcErr(id, result.code, result.ru, result.uz, result.en, result.data)

      if (result.paymentVerified) {
        return rpcErr(id, -31003, 'Заказ уже оплачен', "Buyurtma allaqachon to'langan", 'Order already paid', 'order_id')
      }

      return ok(id, { allow: true, additional: null })
    }

    // ── 2. CreateTransaction ────────────────────────────────────────────────
    // Payme creates a transaction on their side — we record their ID.
    case 'CreateTransaction': {
      const paymeId = params.id as string
      const time = params.time as number
      const amount = params.amount as number
      const account = params.account as { order_id?: string } | undefined

      if (!paymeId || !time || !amount || !account?.order_id) {
        return rpcErr(id, -32602, 'Неверные параметры', "Noto'g'ri parametrlar", 'Invalid params')
      }

      // Idempotency: return existing record if Payme retries
      const { data: existing } = await supabaseAdmin
        .from('payments')
        .select('id, status, payme_create_time')
        .eq('payme_transaction_id', paymeId)
        .maybeSingle()

      if (existing) {
        if (existing.status === 'cancelled') {
          return rpcErr(id, -31008, 'Транзакция отменена', 'Tranzaksiya bekor qilindi', 'Transaction cancelled', 'transaction')
        }
        return ok(id, {
          create_time: Number(existing.payme_create_time),
          transaction: String(existing.id),
          state: 1,
          receivers: null,
        })
      }

      // Validate order and amount
      const result = await validateOrder(Number(account.order_id), amount)
      if (!result.ok) return rpcErr(id, result.code, result.ru, result.uz, result.en, result.data)

      if (result.paymentVerified) {
        return rpcErr(id, -31003, 'Заказ уже оплачен', "Buyurtma allaqachon to'langan", 'Order already paid', 'order_id')
      }

      const { data: payment, error: insertErr } = await supabaseAdmin
        .from('payments')
        .insert({
          registration_id: Number(account.order_id),
          amount: amount / 100, // tiyin → UZS
          payment_method: 'payme',
          status: 'pending',
          gateway: 'payme',
          payme_transaction_id: paymeId,
          payme_create_time: String(time),
        })
        .select('id')
        .single()

      if (insertErr || !payment) {
        return rpcErr(id, -31099, 'Системная ошибка', 'Tizim xatosi', 'System error')
      }

      return ok(id, {
        create_time: time,
        transaction: String(payment.id),
        state: 1,
        receivers: null,
      })
    }

    // ── 3. PerformTransaction ───────────────────────────────────────────────
    // User completed payment in Payme — mark as paid in our DB.
    case 'PerformTransaction': {
      const paymeId = params.id as string
      if (!paymeId) return rpcErr(id, -32602, 'Неверные параметры', "Noto'g'ri parametrlar", 'Invalid params')

      const { data: payment } = await supabaseAdmin
        .from('payments')
        .select('id, status, payme_create_time, payme_perform_time, registration_id')
        .eq('payme_transaction_id', paymeId)
        .maybeSingle()

      if (!payment) {
        return rpcErr(id, -31003, 'Транзакция не найдена', 'Tranzaksiya topilmadi', 'Transaction not found', 'transaction')
      }

      // Already performed — idempotent response
      if (payment.status === 'completed') {
        return ok(id, {
          perform_time: Number(payment.payme_perform_time),
          transaction: String(payment.id),
          state: 2,
        })
      }

      if (payment.status === 'cancelled') {
        return rpcErr(id, -31008, 'Транзакция отменена', 'Tranzaksiya bekor qilindi', 'Transaction cancelled', 'transaction')
      }

      const now_iso = new Date().toISOString()
      await supabaseAdmin
        .from('payments')
        .update({ status: 'completed', payme_perform_time: String(now), paid_at: now_iso, updated_at: now_iso })
        .eq('id', payment.id)

      await supabaseAdmin
        .from('registrations')
        .update({ status: 'paid', payment_verified: true, updated_at: now_iso })
        .eq('id', payment.registration_id)

      return ok(id, {
        perform_time: now,
        transaction: String(payment.id),
        state: 2,
      })
    }

    // ── 4. CancelTransaction ────────────────────────────────────────────────
    // Payme cancels a transaction (user backed out or timeout).
    case 'CancelTransaction': {
      const paymeId = params.id as string
      const reason = (params.reason as number | undefined) ?? null
      if (!paymeId) return rpcErr(id, -32602, 'Неверные параметры', "Noto'g'ri parametrlar", 'Invalid params')

      const { data: payment } = await supabaseAdmin
        .from('payments')
        .select('id, status, payme_cancel_time, registration_id')
        .eq('payme_transaction_id', paymeId)
        .maybeSingle()

      if (!payment) {
        return rpcErr(id, -31003, 'Транзакция не найдена', 'Tranzaksiya topilmadi', 'Transaction not found', 'transaction')
      }

      // Already cancelled — idempotent
      if (payment.status === 'cancelled') {
        return ok(id, {
          cancel_time: Number(payment.payme_cancel_time),
          transaction: String(payment.id),
          state: -1,
        })
      }

      // Cannot cancel a completed payment (configurable per business rules)
      if (payment.status === 'completed') {
        return rpcErr(id, -31007, 'Нельзя отменить выполненную транзакцию', "Bajarilgan tranzaksiyani bekor qilib bo'lmaydi", 'Cannot cancel completed transaction', 'transaction')
      }

      const now_iso = new Date().toISOString()
      await supabaseAdmin
        .from('payments')
        .update({ status: 'cancelled', payme_cancel_time: String(now), payme_reason: reason, updated_at: now_iso })
        .eq('id', payment.id)

      // Revert registration to pending so user can try again
      await supabaseAdmin
        .from('registrations')
        .update({ status: 'pending', payment_verified: false, updated_at: now_iso })
        .eq('id', payment.registration_id)

      return ok(id, {
        cancel_time: now,
        transaction: String(payment.id),
        state: -1,
      })
    }

    // ── 5. CheckTransaction ─────────────────────────────────────────────────
    // Payme reconciliation — return current transaction state.
    case 'CheckTransaction': {
      const paymeId = params.id as string
      if (!paymeId) return rpcErr(id, -32602, 'Неверные параметры', "Noto'g'ri parametrlar", 'Invalid params')

      const { data: payment } = await supabaseAdmin
        .from('payments')
        .select('id, status, payme_create_time, payme_perform_time, payme_cancel_time, payme_reason')
        .eq('payme_transaction_id', paymeId)
        .maybeSingle()

      if (!payment) {
        return rpcErr(id, -31003, 'Транзакция не найдена', 'Tranzaksiya topilmadi', 'Transaction not found', 'transaction')
      }

      const stateMap: Record<string, number> = { pending: 1, completed: 2, cancelled: -1, failed: -1 }

      return ok(id, {
        create_time: Number(payment.payme_create_time) || 0,
        perform_time: Number(payment.payme_perform_time) || 0,
        cancel_time: Number(payment.payme_cancel_time) || 0,
        transaction: String(payment.id),
        state: stateMap[payment.status] ?? -1,
        reason: payment.payme_reason ?? null,
      })
    }

    default:
      return rpcErr(id, -32601, 'Метод не найден', 'Metod topilmadi', 'Method not found')
  }
}

// Payme spec: non-POST should return -32300
export async function GET() {
  return NextResponse.json(
    { jsonrpc: '2.0', id: null, error: { code: -32300, message: 'Use POST' } },
    { status: 405 },
  )
}
