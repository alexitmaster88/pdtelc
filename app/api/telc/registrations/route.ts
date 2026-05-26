import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET() {
  const { data, error } = await supabaseAdmin
    .from('registrations')
    .select('*, exams(region, exam_date, start_time, level_id, exam_levels(level))')
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { examId, firstName, lastName, phoneNumber, email, passportNumber } = body

    if (!examId || !firstName || !lastName || !phoneNumber || !email || !passportNumber) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Check for duplicate passport in the same exam
    const { data: existing } = await supabaseAdmin
      .from('registrations')
      .select('id')
      .eq('exam_id', examId)
      .eq('passport_number', passportNumber)
      .maybeSingle()

    if (existing) {
      return NextResponse.json(
        { error: 'This passport number is already registered for this exam' },
        { status: 409 }
      )
    }

    const { data, error } = await supabaseAdmin
      .from('registrations')
      .insert({
        exam_id: examId,
        first_name: firstName,
        last_name: lastName,
        phone_number: phoneNumber,
        email,
        passport_number: passportNumber,
        status: 'pending',
        email_verified: false,
        payment_verified: false,
      })
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    try { await supabaseAdmin.rpc('increment_registered_count', { exam_id_param: examId }) } catch {}

    return NextResponse.json(data, { status: 201 })
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(req: Request) {
  const body = await req.json()
  const { id, status } = body
  if (!id || !status) return NextResponse.json({ error: 'id and status required' }, { status: 400 })

  const { data, error } = await supabaseAdmin
    .from('registrations')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
