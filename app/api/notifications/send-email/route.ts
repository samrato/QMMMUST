import { getSupabaseServer } from "@/lib/supabase/server"
import { verifyJWT } from "@/lib/utils/jwt"
import { type NextRequest, NextResponse } from "next/server"

/**
 * POST /api/notifications/send-email
 *
 * Send email notification to student
 * (In production, integrate with Resend, SendGrid, or similar)
 *
 * Headers:
 * Authorization: Bearer {token}
 *
 * Request body:
 * {
 *   "alert_id": "uuid",
 *   "email": "student@email.com",
 *   "subject": "QMMUST Gate Alert",
 *   "message": "Your device has exited..."
 * }
 *
 * Response:
 * {
 *   "success": true,
 *   "email_id": "msg_123456"
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get("authorization")?.replace("Bearer ", "")
    const { alert_id, email, subject, message } = await request.json()

    if (!token) {
      return NextResponse.json({ error: "No authorization token provided" }, { status: 401 })
    }

    const decoded = await verifyJWT(token)
    if (!decoded || decoded.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized: Admin access required" }, { status: 403 })
    }

    const supabase = await getSupabaseServer()

    // Mock email sending (replace with actual email service)
    console.log(`[EMAIL] Sending to ${email}`)
    console.log(`[EMAIL] Subject: ${subject}`)
    console.log(`[EMAIL] Message: ${message}`)

    // Mark alert as sent
    await supabase.from("alerts").update({ is_sent: true, sent_at: new Date().toISOString() }).eq("id", alert_id)

    return NextResponse.json(
      {
        success: true,
        email_id: `msg_${Date.now()}`,
        message: "Email sent successfully",
      },
      { status: 200 },
    )
  } catch (error) {
    console.error("Send email error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
