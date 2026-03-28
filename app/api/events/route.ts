import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET() {
  const { data, error } = await supabaseAdmin
    .from("events")
    .select("*")
    .order("created_at", { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data })
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { title, event_date, checkin_start, checkin_end } = body

    if (!title) {
      return NextResponse.json({ error: "Tiêu đề là bắt buộc" }, { status: 400 })
    }

    const payload = {
      title: title.trim(),
      event_date: event_date || null,
      checkin_start: checkin_start || null,
      checkin_end: checkin_end || null,
      is_active: false
    }

    const { data, error } = await supabaseAdmin
      .from("events")
      .insert([payload])
      .select()

    if (error) {
      console.error("Supabase Admin Insert Error:", error)
      return NextResponse.json({ error: error.message, details: error }, { status: 500 })
    }

    if (!data || data.length === 0) {
      return NextResponse.json({ error: "Không thể tạo chương trình (không có dữ liệu trả về)" }, { status: 500 })
    }

    return NextResponse.json({ data: data[0] })
  } catch (err: any) {
    console.error("Internal Server Error in POST /api/events:", err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
