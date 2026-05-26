import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET() {
  const { data, error } = await supabaseAdmin
    .from('exam_levels')
    .select('*')
    .order('id')

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function PATCH(req: Request) {
  const { levelId, price } = await req.json()
  if (!levelId || price === undefined) {
    return NextResponse.json({ error: 'levelId and price required' }, { status: 400 })
  }

  const { data, error } = await supabaseAdmin
    .from('exam_levels')
    .update({ price: parseFloat(price), updated_at: new Date().toISOString() })
    .eq('id', levelId)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
