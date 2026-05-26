import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const region = searchParams.get('region')
  const levelId = searchParams.get('levelId')

  let query = supabaseAdmin
    .from('exams')
    .select('*, exam_levels(level, price)')
    .order('exam_date')

  if (region) query = query.eq('region', region)
  if (levelId) query = query.eq('level_id', parseInt(levelId))

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(req: Request) {
  const body = await req.json()
  const { levelId, region, address, examDate, startTime, endTime, capacity } = body

  if (!levelId || !region || !examDate || !startTime || !endTime) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const { data, error } = await supabaseAdmin
    .from('exams')
    .insert({
      level_id: levelId,
      region,
      address: address || null,
      exam_date: examDate,
      start_time: startTime,
      end_time: endTime,
      capacity: capacity || 30,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}

export async function DELETE(req: Request) {
  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })

  const { error } = await supabaseAdmin.from('exams').delete().eq('id', parseInt(id))
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
