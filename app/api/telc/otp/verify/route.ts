import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(req: Request) {
  const { email, otp } = await req.json()
  if (!email || !otp) return NextResponse.json({ error: 'email and otp required' }, { status: 400 })

  const { data, error } = await supabaseAdmin
    .from('otp_verifications')
    .select('*')
    .eq('email', email)
    .eq('otp', otp)
    .eq('verified', false)
    .gt('expires_at', new Date().toISOString())
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error) {
    console.error('[OTP] Supabase select error:', error)
    const missingTable = /Could not find the table/i.test(error.message)
    const message = missingTable
      ? 'Supabase table otp_verifications is missing. Create it using supabase/schema.sql or apply the DB schema.'
      : error.message
    return NextResponse.json({ error: message }, { status: 500 })
  }

  if (!data) {
    return NextResponse.json({ error: 'Invalid or expired OTP' }, { status: 400 })
  }

  await supabaseAdmin
    .from('otp_verifications')
    .update({ verified: true })
    .eq('id', data.id)

  return NextResponse.json({ success: true })
}
