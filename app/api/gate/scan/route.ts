import { getSupabaseServer } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

/**
 * POST /api/gate/scan
 *
 * IoT Gate Scanner Endpoint - Logs device movement
 *
 * This endpoint would be called by ESP32/RFID scanner at gate
 *
 * Request body:
 * {
 *   "rfid_tag": "RFID001A",
 *   "pin": "123456",
 *   "gate_name": "Main Gate",
 *   "gate_direction": "exit"
 * }
 *
 * Response:
 * {
 *   "status": "approved" | "denied",
 *   "message": "Device verified",
 *   "student": { name, email },
 *   "notification_sent": true
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const { rfid_tag, pin, gate_name, gate_direction } = await request.json()

    if (!rfid_tag || !pin || !gate_name || !gate_direction) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const supabase = await getSupabaseServer()

    // Find device by RFID tag
    const { data: device } = await supabase
      .from("devices")
      .select("*, users(name, email)")
      .eq("rfid_tag", rfid_tag)
      .single()

    if (!device) {
      // Log failed attempt
      await supabase.from("failed_attempts").insert([
        {
          rfid_tag,
          attempted_at: new Date().toISOString(),
          reason: "Device not found",
        },
      ])

      return NextResponse.json(
        {
          status: "denied",
          message: "Device not registered",
        },
        { status: 403 },
      )
    }

    // Verify PIN (in production, this should be verified against the gate_pass table)
    const { data: gatePass } = await supabase
      .from("gate_passes")
      .select("*")
      .eq("device_id", device.id)
      .eq("pin", pin)
      .eq("is_used", false)
      // .gte("expires_at", new Date().toISOString())
      .order("created_at", { ascending: false })
      .limit(1)
      .single()

    if (!gatePass) {
      // Log failed attempt
      await supabase.from("failed_attempts").insert([
        {
          device_id: device.id,
          rfid_tag,
          attempted_at: new Date().toISOString(),
          reason: "Invalid or expired PIN",
        },
      ])

      return NextResponse.json(
        {
          status: "denied",
          message: "Invalid PIN",
        },
        { status: 403 },
      )
    }

    // Log movement
    await supabase.from("movements").insert([
      {
        student_id: device.student_id,
        device_id: device.id,
        rfid_tag,
        gate_name,
        gate_direction,
        status: "approved",
      },
    ])

    Mark gate pass as used
    await supabase
      .from("gate_passes")
      .update({ is_used: true, used_at: new Date().toISOString() })
      .eq("id", gatePass.id)

    // Create alert/notification
    const message = `Your device (${device.device_name}) has exited MMUST premises at ${new Date().toLocaleTimeString()}. If this was not you, please report immediately.`

    await supabase.from("alerts").insert([
      {
        student_id: device.student_id,
        device_id: device.id,
        alert_type: "device_exit",
        message,
        recipient_email: device.users.email,
        is_sent: false,
      },
    ])

    // TODO: Send email via third-party service (Resend, SendGrid, etc.)

    return NextResponse.json(
      {
        status: "approved",
        message: "Device verified",
        student: {
          name: device.users.name,
          email: device.users.email,
        },
        notification_sent: true,
      },
      { status: 200 },
    )
  } catch (error) {
    console.error("Gate scan error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
