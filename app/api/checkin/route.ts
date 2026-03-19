import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, chuc_vu, don_vi } = body

    if (!name?.trim() || !chuc_vu?.trim() || !don_vi?.trim()) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 })
    }

    const { data, error } = await supabaseAdmin
      .from("checkins")
      .insert([{ name: name.trim(), chuc_vu: chuc_vu.trim(), don_vi: don_vi.trim() }])
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
