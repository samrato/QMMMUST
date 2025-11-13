import { getSupabaseServer } from "@/lib/supabase/server"
import { verifyJWT } from "@/lib/utils/jwt"
import { type NextRequest, NextResponse } from "next/server"

/**
 * GET /api/admin/students
 *
 * Get all students with their device counts
 *
 * Query parameters:
 * - search: search by name or registration number
 * - limit: number of records (default: 100)
 * - offset: pagination offset (default: 0)
 */
export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get("authorization")?.replace("Bearer ", "")
    const { searchParams } = new URL(request.url)
    const search = searchParams.get("search")
    const limit = Number.parseInt(searchParams.get("limit") || "100")
    const offset = Number.parseInt(searchParams.get("offset") || "0")

    if (!token) {
      return NextResponse.json({ error: "No authorization token provided" }, { status: 401 })
    }

    const decoded = await verifyJWT(token)
    if (!decoded || decoded.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized: Admin access required" }, { status: 403 })
    }

    const supabase = await getSupabaseServer()

    let query = supabase
      .from("users")
      .select("id, name, email, registration_number, is_active, last_login, created_at")
      .eq("role", "student")
      .range(offset, offset + limit - 1)

    if (search) {
      query = query.or(`name.ilike.%${search}%,registration_number.ilike.%${search}%`)
    }

    const { data: students, error } = await query

    if (error) {
      return NextResponse.json({ error: "Failed to fetch students" }, { status: 500 })
    }

    return NextResponse.json({ students }, { status: 200 })
  } catch (error) {
    console.error("Get students error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
