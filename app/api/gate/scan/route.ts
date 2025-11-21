import { createClient } from "@supabase/supabase-js";
import { type NextRequest, NextResponse } from "next/server";

/**
 * POST /api/gate/scan
 *
 * IoT Gate Scanner Endpoint - Logs device movement
 */
export async function POST(request: NextRequest) {
  try {
    const { rfid_tag, pin, gate_name, gate_direction } = await request.json();

    if (!rfid_tag || !pin || !gate_name || !gate_direction) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Use Supabase Service Role Key (for backend server, bypasses RLS)
    const supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Find device by RFID tag
    const { data: device, error: deviceError } = await supabase
      .from("devices")
      .select("*, users(name, email)")
      .eq("rfid_tag", rfid_tag)
      .single();

    if (deviceError || !device) {
      await supabase.from("failed_attempts").insert([
        {
          rfid_tag,
          attempted_at: new Date().toISOString(),
          reason: "Device not found",
        },
      ]);

      return NextResponse.json(
        { status: "denied", message: "Device not registered" },
        { status: 403 }
      );
    }

    // Find gate pass (allow repeated use for demo: ignore is_used and expires_at)
    const { data: gatePass, error: gatePassError } = await supabase
      .from("gate_passes")
      .select("*")
      .eq("device_id", device.id)
      .eq("pin", pin)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (gatePassError || !gatePass) {
      await supabase.from("failed_attempts").insert([
        {
          device_id: device.id,
          rfid_tag,
          attempted_at: new Date().toISOString(),
          reason: "Invalid PIN",
        },
      ]);

      return NextResponse.json(
        { status: "denied", message: "Invalid PIN" },
        { status: 403 }
      );
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
    ]);

    // Note: We are NOT marking gate_pass as used so it can be reused for demo

    // Create alert/notification
    const message = `Your device (${device.device_name}) has ${gate_direction}ed MMUST premises at ${new Date().toLocaleTimeString()}. If this was not you, please report immediately.`;

    await supabase.from("alerts").insert([
      {
        student_id: device.student_id,
        device_id: device.id,
        alert_type: "device_exit",
        message,
        recipient_email: device.users.email,
        is_sent: false,
      },
    ]);

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
      { status: 200 }
    );
  } catch (error) {
    console.error("Gate scan error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
