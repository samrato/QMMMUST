import { getSupabaseServer } from "@/lib/supabase/server"
import { verifyJWT } from "@/lib/utils/jwt"
import { type NextRequest, NextResponse } from "next/server"
import QRCode from "qrcode"
import { Resend } from "resend"

// Force Node.js runtime for Vercel
export const runtime = "nodejs"
export const dynamic = "force-dynamic"

// Initialize Resend with API key
const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get("authorization")?.replace("Bearer ", "")
    const { device_id } = await request.json()

    if (!token) {
      return NextResponse.json({ error: "No authorization token provided" }, { status: 401 })
    }

    const decoded = await verifyJWT(token)
    if (!decoded) {
      return NextResponse.json({ error: "Invalid or expired token" }, { status: 401 })
    }

    const supabase = await getSupabaseServer()

    // Verify device belongs to student
    const { data: device } = await supabase
      .from("devices")
      .select("*, users(name,email)")
      .eq("id", device_id)
      .eq("student_id", decoded.sub)
      .single()

    if (!device) {
      return NextResponse.json({ error: "Device not found" }, { status: 404 })
    }

    // Generate 6-digit PIN
    const pin = Math.floor(100000 + Math.random() * 900000).toString()

    // Generate QR code (smaller width to avoid large payload)
    const qrData = JSON.stringify({
      studentId: decoded.sub,
      deviceId: device_id,
      rfidTag: device.rfid_tag,
      timestamp: new Date().toISOString(),
    })
    const qrCode = await QRCode.toDataURL(qrData, { width: 200, margin: 1 })

    // Save gate pass to database
    const { data: gatePass, error } = await supabase
      .from("gate_passes")
      .insert([
        { student_id: decoded.sub, device_id, qr_code: qrCode, pin },
      ])
      .select()
      .single()

    if (error) return NextResponse.json({ error: "Failed to generate gate pass" }, { status: 500 })

    // Send email notification
    try {
      await resend.emails.send({
        from: "info@willingtonjuma.space", // Verified domain
        to: device.users.email,
        subject: "Your QMMUST Gate Pass",
        html: `
          <p>Hi ${device.users.name},</p>
          <p>Your gate pass has been generated for <strong>${device.device_name}</strong>.</p>
          <p>PIN: <strong>${pin}</strong></p>
          <p>Scan the QR code below at the gate:</p>
          <img src="${qrCode}" alt="QR Code" />
          <p>This gate pass is valid for one-time use. If this was not requested by you, report immediately.</p>
        `,
      })

      // Mark email as sent
      await supabase
        .from("gate_passes")
        .update({ email_sent_at: new Date().toISOString() })
        .eq("id", gatePass.id)
    } catch (err) {
      console.error("Failed to send gate pass email:", err)
    }

    return NextResponse.json({ gatePass }, { status: 201 })
  } catch (error) {
    console.error("Generate pass error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

