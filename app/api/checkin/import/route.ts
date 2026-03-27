import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: Request) {
  try {
    const { candidates } = await request.json()

    if (!Array.isArray(candidates) || candidates.length === 0) {
      return NextResponse.json(
        { error: "No candidates provided" },
        { status: 400 }
      )
    }

    const rows = candidates
      .map((c: { name: string; chuc_vu: string; don_vi: string; event_id?: string }) => ({
        name: String(c.name).trim(),
        chuc_vu: String(c.chuc_vu).trim(),
        don_vi: String(c.don_vi).trim(),
        event_id: c.event_id
      }))
      .filter((r) => r.name && r.chuc_vu && r.don_vi && r.event_id)

    if (rows.length === 0) {
      return NextResponse.json({ error: "No valid rows (missing required fields or event_id)" }, { status: 400 })
    }

    const { error } = await supabaseAdmin.from("checkins").insert(rows)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, count: rows.length })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
