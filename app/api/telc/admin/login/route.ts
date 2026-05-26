import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { randomUUID } from 'crypto'

async function sha256(text: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(text)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

export async function POST(req: Request) {
  const { email, password } = await req.json()
  if (!email || !password) {
    return NextResponse.json({ error: 'email and password required' }, { status: 400 })
  }

  const { data: admin, error } = await supabaseAdmin
    .from('telc_admins')
    .select('*')
    .eq('email', email)
    .maybeSingle()

  if (error || !admin) {
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
  }

  const hash = await sha256(password)
  if (hash !== admin.password_hash) {
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
  }

  const token = randomUUID()
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24h

  await supabaseAdmin.from('telc_admin_sessions').insert({
    admin_id: admin.id,
    token,
    expires_at: expiresAt,
  })

  return NextResponse.json({
    token,
    admin: { id: admin.id, email: admin.email, name: admin.name, role: admin.role },
  })
}

// Validate a session token
export async function GET(req: Request) {
  const auth = req.headers.get('authorization')
  const token = auth?.replace('Bearer ', '')
  if (!token) return NextResponse.json({ error: 'No token' }, { status: 401 })

  const { data: session } = await supabaseAdmin
    .from('telc_admin_sessions')
    .select('*, telc_admins(id, email, name, role)')
    .eq('token', token)
    .gt('expires_at', new Date().toISOString())
    .maybeSingle()

  if (!session) return NextResponse.json({ error: 'Invalid or expired session' }, { status: 401 })

  return NextResponse.json({ admin: session.telc_admins })
}
