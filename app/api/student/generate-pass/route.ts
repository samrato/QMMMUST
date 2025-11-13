import { getSupabaseServer } from "@/lib/supabase/server"
import { verifyJWT } from "@/lib/utils/jwt"
import { type NextRequest, NextResponse } from "next/server"
import QRCode from "qrcode"

/**
 * POST /api/student/generate-pass
 *
 * Generate QR code and PIN for gate pass
 *
 * Headers:
 * Authorization: Bearer {token}
 *
 * Request body:
 * {
 *   "device_id": "uuid"
 * }
 *
 * Response:
 * {
 *   "gatePass": {
 *     "id": "uuid",
 *     "qr_code": "base64_encoded_image",
 *     "pin": "123456",
 *     "expires_at": "2024-01-02T00:00:00Z"
 *   }
 * }
 */
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
      .select("*")
      .eq("id", device_id)
      .eq("student_id", decoded.sub)
      .single()

    if (!device) {
      return NextResponse.json({ error: "Device not found" }, { status: 404 })
    }

    // Generate PIN (6 digits)
    const pin = Math.floor(100000 + Math.random() * 900000).toString()

    // Generate QR code data
    const qrData = JSON.stringify({
      studentId: decoded.sub,
      deviceId: device_id,
      rfidTag: device.rfid_tag,
      timestamp: new Date().toISOString(),
    })

    // Generate QR code as data URL
    const qrCode = await QRCode.toDataURL(qrData)

    // Save gate pass to database
    const { data: gatePass, error } = await supabase
      .from("gate_passes")
      .insert([
        {
          student_id: decoded.sub,
          device_id,
          qr_code: qrCode,
          pin,
        },
      ])
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: "Failed to generate gate pass" }, { status: 500 })
    }

    return NextResponse.json({ gatePass }, { status: 201 })
  } catch (error) {
    console.error("Generate pass error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
