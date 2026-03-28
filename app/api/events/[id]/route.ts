import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  if (!id) return NextResponse.json({ error: "Missing ID" }, { status: 400 })

  const { error } = await supabaseAdmin
    .from("events")
    .delete()
    .eq("id", id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  if (!id) return NextResponse.json({ error: "Missing ID" }, { status: 400 })

  try {
    const body = await request.json()
    const { is_active } = body

    // 1. If we are activating THIS event, deactivate all others first.
    if (is_active === true) {
      await supabaseAdmin
        .from("events")
        .update({ is_active: false })
        .neq("id", id)
    }

    // 2. Update THIS event
    const { data, error } = await supabaseAdmin
      .from("events")
      .update(body)
      .eq("id", id)
      .select()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ data: data[0] })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
