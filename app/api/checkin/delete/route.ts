import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function DELETE(request: Request) {
  try {
    const { id } = await request.json()

    if (!id) {
      return NextResponse.json({ error: "Missing id" }, { status: 400 })
    }

    // 1. Lấy thông tin record sắp xoá
    const { data: record, error: fetchErr } = await supabaseAdmin
      .from("checkins")
      .select("*")
      .eq("id", id)
      .single()

    if (fetchErr || !record) {
      return NextResponse.json({ error: "Không tìm thấy lượt check-in" }, { status: 404 })
    }

    // 2. Tìm xem khách này có trong danh sách chờ (guests) không
    let guestMatch = null
    
    // Ưu tiên tìm theo student_id & event_id, nếu không thì tìm theo tên
    const query = supabaseAdmin.from("guests").select("id").eq("event_id", record.event_id)
    
    if (record.student_id) {
       const res = await query.eq("student_id", record.student_id).maybeSingle()
       if (res.data) guestMatch = res.data
    } else {
       const res = await query.eq("name", record.name).maybeSingle()
       if (res.data) guestMatch = res.data
    }

    // 3. Nếu có trong danh sách chờ, hoàn trả trạng thái is_checked_in = false
    if (guestMatch) {
        await supabaseAdmin.from("guests").update({ is_checked_in: false }).eq("id", guestMatch.id)
    }

    // 4. Tuỳ trường hợp, xoá record history
    const { error } = await supabaseAdmin
      .from("checkins")
      .delete()
      .eq("id", id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, wasInGuestList: !!guestMatch })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
