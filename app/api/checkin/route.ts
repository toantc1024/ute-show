import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, chuc_vu, don_vi, event_id } = body

    if (!name?.trim() || !chuc_vu?.trim() || !don_vi?.trim() || !event_id) {
      return NextResponse.json({ error: "Missing required fields (name, chuc_vu, don_vi, event_id)" }, { status: 400 })
    }

    const { data, error } = await supabaseAdmin
      .from("checkins")
      .insert([{ 
        name: name.trim(), 
        chuc_vu: chuc_vu.trim(), 
        don_vi: don_vi.trim(),
        event_id: event_id
      }])
      .select()

    if (error) {
      console.error("Supabase insert error:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ data })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
