import { getSupabaseServer } from "@/lib/supabase/server";
import { verifyJWT } from "@/lib/utils/jwt";
import { type NextRequest, NextResponse } from "next/server";

/**
 * DELETE /api/student/devices/[id]
 * Delete a device registered by the student
 */

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> } // <- params is a Promise
) {
  try {
    const token = request.headers.get("authorization")?.replace("Bearer ", "")
    if (!token) return NextResponse.json({ error: "No authorization token provided" }, { status: 401 })

    const decoded = await verifyJWT(token)
    if (!decoded) return NextResponse.json({ error: "Invalid or expired token" }, { status: 401 })

    const supabase = await getSupabaseServer()

    // Await the params promise
    const { id } = await context.params

    // Verify the device belongs to the user
    const { data: device, error: fetchError } = await supabase
      .from("devices")
      .select("student_id")
      .eq("id", id)
      .single()

    if (fetchError || !device || device.student_id !== decoded.sub) {
      return NextResponse.json({ error: "Device not found or unauthorized" }, { status: 403 })
    }

    // Delete the device
    const { error: deleteError } = await supabase.from("devices").delete().eq("id", id)
    if (deleteError) return NextResponse.json({ error: "Failed to delete device" }, { status: 500 })

    return NextResponse.json({ message: "Device deleted successfully" }, { status: 200 })
  } catch (error) {
    console.error("Delete device error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}