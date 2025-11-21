import { getSupabaseServer } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

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
      .eq("rfid_tag", rfid_tag.trim())
      .single()

    if (!device) {
      await supabase.from("failed_attempts").insert([{
        rfid_tag,
        attempted_at: new Date().toISOString(),
        reason: "Device not found"
      }])
      return NextResponse.json({ status: "denied", message: "Device not registered" }, { status: 403 })
    }

    // Verify PIN (ignore is_used for demo)
    const { data: gatePass } = await supabase
      .from("gate_passes")
      .select("*")
      .eq("device_id", device.id)
      .eq("pin", pin.trim())   // remove any spaces
      .order("created_at", { ascending: false })
      .limit(1)
      .single()

    if (!gatePass) {
      console.log("Failed PIN check. Incoming PIN:", pin)
      return NextResponse.json({ status: "denied", message: "Invalid PIN" }, { status: 403 })
    }

    // Log movement
    await supabase.from("movements").insert([{
      student_id: device.student_id,
      device_id: device.id,
      rfid_tag,
      gate_name,
      gate_direction,
      status: "approved"
    }])

    // Note: Do NOT mark gate pass as used for demo
    // This allows repeated scans with the same PIN

    // Create alert (optional)
    const message = `Your device (${device.device_name}) has exited MMUST premises at ${new Date().toLocaleTimeString()}.`
    await supabase.from("alerts").insert([{
      student_id: device.student_id,
      device_id: device.id,
      alert_type: "device_exit",
      message,
      recipient_email: device.users.email,
      is_sent: false
    }])

    return NextResponse.json({
      status: "approved",
      message: "Device verified",
      student: { name: device.users.name, email: device.users.email },
      notification_sent: true
    }, { status: 200 })

  } catch (error) {
    console.error("Gate scan error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
