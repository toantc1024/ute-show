import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"
import nodemailer from "nodemailer"

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.SMTP_USER, 
    pass: process.env.SMTP_PASS, 
  },
})

export async function POST(request: Request) {
  try {
    const { event_id, checkin_ids, customSubject, customHtml } = await request.json()

    if (!event_id) {
      return NextResponse.json({ error: "Thiếu event_id" }, { status: 400 })
    }

    const { data: event, error: eventError } = await supabaseAdmin
      .from("events")
      .select("*")
      .eq("id", event_id)
      .single()

    if (eventError || !event) {
      return NextResponse.json({ error: "Không tìm thấy chương trình" }, { status: 404 })
    }

    let query = supabaseAdmin
      .from("checkins")
      .select("id, name, student_id, email_sent, created_at")
      .eq("event_id", event_id)
      .not("student_id", "is", null)

    if (checkin_ids && Array.isArray(checkin_ids) && checkin_ids.length > 0) {
      query = query.in("id", checkin_ids)
    }

    const { data: checkins, error: checkinsError } = await query

    if (checkinsError || !checkins || checkins.length === 0) {
      return NextResponse.json({ error: "Không tìm thấy đại biểu hợp lệ để gửi thư." }, { status: 400 })
    }

    const validRecipients = checkins.filter(c => c.student_id && c.student_id.trim().length >= 8)
    
    // De-duplicate based on student_id to avoid sending multiple emails to the same person
    const uniqueRecipientsMap = new Map()
    for (const r of validRecipients) {
        uniqueRecipientsMap.set(r.student_id, r)
    }
    const uniqueRecipients = Array.from(uniqueRecipientsMap.values())

    if (uniqueRecipients.length === 0) {
       return NextResponse.json({ error: "Không có đại biểu nào có MSSV hợp lệ." }, { status: 400 })
    }

    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      console.warn("SMTP credentials not configured. Simulating.")
      
      // Update them to sent=true anyway for UX simulation demonstration
      const idsToMarkSent = uniqueRecipients.map(r => r.id)
      await supabaseAdmin.from("checkins").update({ email_sent: true }).in("id", idsToMarkSent)
      
      return NextResponse.json({ 
        success: true, 
        message: `[GIẢ LẬP] Đã gửi thành công ${uniqueRecipients.length} thư. Vui lòng cấu hình SMTP_USER và SMTP_PASS trong .env.local để gửi thật.`,
        count: uniqueRecipients.length
      })
    }

    let successCount = 0
    let failCount = 0
    const successfulIds: string[] = []

    const emailPromises = uniqueRecipients.map(async (guest) => {
      const emailAddress = `${guest.student_id.trim()}@student.hcmute.edu.vn`
      
      // Helper function to replace placeholders
      const replacePlaceholders = (text: string) => {
        const checkinDate = new Date(guest.created_at)
        const formattedTime = checkinDate.toLocaleString('vi-VN', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          day: '2-digit',
          month: '2-digit',
          year: 'numeric'
        })

        return text
          .replace(/{{name}}/g, guest.name || "")
          .replace(/{{event_title}}/g, event.title || "")
          .replace(/{{student_id}}/g, guest.student_id || "")
          .replace(/{{checkin_time}}/g, formattedTime)
      }

      const finalSubject = customSubject 
        ? replacePlaceholders(customSubject) 
        : `Thư cảm ơn: Check-in thành công "${event.title}"`

      const finalHtml = customHtml 
        ? replacePlaceholders(customHtml) 
        : `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #333; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
              <div style="text-align: center; margin-bottom: 20px;">
                <h1 style="color: #0c4a6e; margin: 0;">XÁC NHẬN CHECK-IN</h1>
                <p style="color: #64748b; font-size: 14px; margin-top: 5px;">Hệ thống điểm danh YUTE</p>
              </div>
              
              <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #0284c7;">
                <p>Chào <strong>{{name}}</strong>,</p>
                <p>Cảm ơn bạn đã tham gia chương trình <strong>{{event_title}}</strong>.</p>
                <p>Hệ thống đã ghi nhận bạn check-in thành công vào sự kiện lúc <strong>{{checkin_time}}</strong>.</p>
              </div>
              
              <p style="text-align: center; font-size: 12px; color: #94a3b8; margin-top: 30px;">
                Thư này được gửi theo cấu hình tự động. Vui lòng không trả lời thư.
              </p>
            </div>
          `

      try {
        await transporter.sendMail({
          from: `"Ban Tổ Chức UTE" <${process.env.SMTP_USER}>`,
          to: emailAddress,
          subject: finalSubject,
          html: finalHtml,
        })
        successCount++
        successfulIds.push(guest.id)
      } catch (err) {
        console.error(`Error sending email to ${emailAddress}:`, err)
        failCount++
      }
    })

    await Promise.allSettled(emailPromises)

    // Mark successful ones in DB
    if (successfulIds.length > 0) {
      await supabaseAdmin.from("checkins").update({ email_sent: true }).in("id", successfulIds)
    }

    return NextResponse.json({ 
      success: true, 
      count: successCount, 
      failed: failCount,
      message: `Đã gửi phần hoàn thiện. Thành công: ${successCount}, Lỗi: ${failCount}`
    })
    
  } catch (err: any) {
    console.error("Send Email API Error:", err)
    return NextResponse.json({ error: err.message || "Lỗi máy chủ" }, { status: 500 })
  }
}
