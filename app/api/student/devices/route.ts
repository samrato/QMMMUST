import { getSupabaseServer } from "@/lib/supabase/server"
import { verifyJWT } from "@/lib/utils/jwt"
import { type NextRequest, NextResponse } from "next/server"

/**
 * GET /api/student/devices
 *
 * Retrieve all devices registered by a student
 *
 * Headers:
 * Authorization: Bearer {token}
 *
 * Response:
 * {
 *   "devices": [
 *     {
 *       "id": "uuid",
 *       "rfid_tag": "RFID001A",
 *       "device_name": "Dell Inspiron 15",
 *       "device_type": "Laptop",
 *       "created_at": "2024-01-01T00:00:00Z"
 *     }
 *   ]
 * }
 */
export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get("authorization")?.replace("Bearer ", "")

    if (!token) {
      return NextResponse.json({ error: "No authorization token provided" }, { status: 401 })
    }

    const decoded = await verifyJWT(token)
    if (!decoded) {
      return NextResponse.json({ error: "Invalid or expired token" }, { status: 401 })
    }

    const supabase = await getSupabaseServer()

    const { data: devices, error } = await supabase
      .from("devices")
      .select("*")
      .eq("student_id", decoded.sub)
      .order("created_at", { ascending: false })

    if (error) {
      return NextResponse.json({ error: "Failed to fetch devices" }, { status: 500 })
    }

    return NextResponse.json({ devices }, { status: 200 })
  } catch (error) {
    console.error("Get devices error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

/**
 * POST /api/student/devices
 *
 * Register a new device for the student
 *
 * Request body:
 * {
 *   "rfid_tag": "RFID002B",
 *   "device_name": "HP Pavilion",
 *   "device_type": "Laptop"
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get("authorization")?.replace("Bearer ", "")
    const { rfid_tag, device_name, device_type } = await request.json()

    if (!token) {
      return NextResponse.json({ error: "No authorization token provided" }, { status: 401 })
    }

    const decoded = await verifyJWT(token)
    if (!decoded) {
      return NextResponse.json({ error: "Invalid or expired token" }, { status: 401 })
    }

    const supabase = await getSupabaseServer()

    const { data: device, error } = await supabase
      .from("devices")
      .insert([
        {
          student_id: decoded.sub,
          rfid_tag,
          device_name,
          device_type,
        },
      ])
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: "Failed to register device: " + error.message }, { status: 400 })
    }

    return NextResponse.json({ device }, { status: 201 })
  } catch (error) {
    console.error("Register device error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
