import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"
import nodemailer from "nodemailer"

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Configure SMTP transport
// You should add these environment variables to your .env.local file
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: process.env.SMTP_SECURE === "true", // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER, 
    pass: process.env.SMTP_PASS, 
  },
})

export async function POST(request: Request) {
  try {
    const { event_id } = await request.json()

    if (!event_id) {
      return NextResponse.json({ error: "Thiếu event_id" }, { status: 400 })
    }

    // 1. Get the event details to include in the email
    const { data: event, error: eventError } = await supabaseAdmin
      .from("events")
      .select("*")
      .eq("id", event_id)
      .single()

    if (eventError || !event) {
      return NextResponse.json({ error: "Không tìm thấy chương trình" }, { status: 404 })
    }

    // 2. Get all check-ins for this event
    const { data: checkins, error: checkinsError } = await supabaseAdmin
      .from("checkins")
      .select("name, student_id")
      .eq("event_id", event_id)

    if (checkinsError || !checkins || checkins.length === 0) {
      return NextResponse.json({ error: "Chưa có ai check-in bộ môn này." }, { status: 400 })
    }

    // 3. Filter only those with student_id (to send to UTE student emails)
    const validRecipients = checkins.filter(c => c.student_id && c.student_id.trim().length >= 8)
    
    // De-duplicate in case of multiple check-ins
    const uniqueRecipientsMap = new Map()
    for (const r of validRecipients) {
        uniqueRecipientsMap.set(r.student_id, r)
    }
    const uniqueRecipients = Array.from(uniqueRecipientsMap.values())

    if (uniqueRecipients.length === 0) {
       return NextResponse.json({ error: "Không tìm thấy đại biểu nào có mã định danh / MSSV hợp lệ để gửi email." }, { status: 400 })
    }

    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      // Return a simulated success response if SMTP is not configured yet
      // This allows the UI button to work for demonstration
      console.warn("SMTP credentials not configured. Simulating email send to", uniqueRecipients.length, "recipients")
      return NextResponse.json({ 
        success: true, 
        message: `Đã giả lập gửi thành công ${uniqueRecipients.length} email. (Vui lòng cấu hình SMTP_USER và SMTP_PASS trong .env.local để gửi thật)`,
        count: uniqueRecipients.length
      })
    }

    // 4. Send emails
    let successCount = 0
    let failCount = 0

    // Send emails simultaneously (consider batching for very large lists to avoid rate limits)
    const emailPromises = uniqueRecipients.map(async (guest) => {
      // Assuming HCMUTE student email format: student_id@student.hcmute.edu.vn
      // Adjust if you use a different format or domain
      const emailAddress = `${guest.student_id}@student.hcmute.edu.vn`
      
      try {
        await transporter.sendMail({
          from: `"Ban Tổ Chức UTE" <${process.env.SMTP_USER}>`,
          to: emailAddress,
          subject: `Thư cảm ơn: Check-in thành công "${event.title}"`,
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #333; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
              <div style="text-align: center; margin-bottom: 20px;">
                <h1 style="color: #0c4a6e; margin: 0;">XÁC NHẬN CHECK-IN</h1>
                <p style="color: #64748b; font-size: 14px; margin-top: 5px;">Hệ thống điểm danh YUTE</p>
              </div>
              
              <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #0284c7;">
                <p>Chào <strong>${guest.name}</strong>,</p>
                <p>Cảm ơn bạn đã tham gia chương trình <strong>${event.title}</strong>.</p>
                <p>Hệ thống đã ghi nhận bạn check-in thành công vào sự kiện.</p>
              </div>
              
              <p style="text-align: center; font-size: 12px; color: #94a3b8; margin-top: 30px;">
                Thư này được gửi tự động. Vui lòng không trả lời thư.
              </p>
            </div>
          `,
        })
        successCount++
      } catch (err) {
        console.error(`Error sending email to ${emailAddress}:`, err)
        failCount++
      }
    })

    await Promise.allSettled(emailPromises)

    return NextResponse.json({ 
      success: true, 
      count: successCount, 
      failed: failCount,
      message: `Đã gửi thành công ${successCount} emails.` + (failCount > 0 ? ` (Lỗi ${failCount})` : "")
    })
    
  } catch (err: any) {
    console.error("Send Email API Error:", err)
    return NextResponse.json({ error: err.message || "Lỗi máy chủ" }, { status: 500 })
  }
}
