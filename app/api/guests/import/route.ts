import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: Request) {
  try {
    const { items, event_id } = await request.json()
    
    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "No candidates provided" }, { status: 400 })
    }

    const rows = items
      .map((c: { name: string; chuc_vu: string; don_vi: string }) => ({
        name: String(c.name).trim(),
        chuc_vu: String(c.chuc_vu).trim(),
        don_vi: String(c.don_vi).trim(),
        event_id: event_id || null
      }))
      .filter((r) => r.name && r.chuc_vu && r.don_vi)

    if (rows.length === 0) {
      return NextResponse.json({ error: "No valid rows (missing required fields)" }, { status: 400 })
    }

    const { error } = await supabaseAdmin.from("guests").insert(rows)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, count: rows.length })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
