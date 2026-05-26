import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { sendOtpEmail } from '@/server/email'

function generateOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

export async function POST(req: Request) {
  const { email } = await req.json()
  if (!email) return NextResponse.json({ error: 'email required' }, { status: 400 })

  const otp = generateOtp()
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString() // 10 min

  // Delete any previous unverified OTPs for this email
  await supabaseAdmin
    .from('otp_verifications')
    .delete()
    .eq('email', email)
    .eq('verified', false)

  const { error } = await supabaseAdmin.from('otp_verifications').insert({
    email,
    otp,
    verified: false,
    expires_at: expiresAt,
  })

  if (error) {
    console.error('[OTP] Supabase insert error:', error)
    const missingTable = /Could not find the table/i.test(error.message)
    const message = missingTable
      ? 'Supabase table otp_verifications is missing. Create it using supabase/schema.sql or apply the DB schema.'
      : error.message
    return NextResponse.json({ error: message }, { status: 500 })
  }

  try {
    await sendOtpEmail(email, otp)
  } catch (emailErr) {
    console.error('[OTP] Email send error:', emailErr)
    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 })
  }

  return NextResponse.json({ success: true, message: 'OTP sent to your email' })
}
