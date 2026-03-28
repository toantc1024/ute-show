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
    const { title, event_date, checkin_start, checkin_end } = await request.json()

    if (!title) {
      return NextResponse.json({ error: "Tiêu đề là bắt buộc" }, { status: 400 })
    }

    const { data, error } = await supabaseAdmin
      .from("events")
      .insert([{
        title,
        event_date,
        checkin_start,
        checkin_end,
        is_active: false
      }])
      .select()

    if (error) {
      console.error("Event creation error:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ data: data[0] })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
