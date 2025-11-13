import { getSupabaseServer } from "@/lib/supabase/server"
import { verifyJWT } from "@/lib/utils/jwt"
import { type NextRequest, NextResponse } from "next/server"

/**
 * GET /api/admin/students/[id]
 *
 * Get detailed information about a student
 */
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const token = request.headers.get("authorization")?.replace("Bearer ", "")

    if (!token) {
      return NextResponse.json({ error: "No authorization token provided" }, { status: 401 })
    }

    const decoded = await verifyJWT(token)
    if (!decoded || decoded.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized: Admin access required" }, { status: 403 })
    }

    const supabase = await getSupabaseServer()

    // Get student info
    const { data: student } = await supabase.from("users").select("*").eq("id", params.id).single()

    // Get student devices
    const { data: devices } = await supabase.from("devices").select("*").eq("student_id", params.id)

    // Get recent movements
    const { data: movements } = await supabase
      .from("movements")
      .select("*")
      .eq("student_id", params.id)
      .order("created_at", { ascending: false })
      .limit(10)

    return NextResponse.json({ student, devices, movements }, { status: 200 })
  } catch (error) {
    console.error("Get student detail error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

/**
 * PUT /api/admin/students/[id]
 *
 * Update student status
 */
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const token = request.headers.get("authorization")?.replace("Bearer ", "")
    const { is_active } = await request.json()

    if (!token) {
      return NextResponse.json({ error: "No authorization token provided" }, { status: 401 })
    }

    const decoded = await verifyJWT(token)
    if (!decoded || decoded.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized: Admin access required" }, { status: 403 })
    }

    const supabase = await getSupabaseServer()

    const { data: student, error } = await supabase
      .from("users")
      .update({ is_active })
      .eq("id", params.id)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: "Failed to update student" }, { status: 500 })
    }

    return NextResponse.json({ student }, { status: 200 })
  } catch (error) {
    console.error("Update student error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
