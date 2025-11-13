import { getSupabaseServer } from "@/lib/supabase/server"
import { verifyJWT } from "@/lib/utils/jwt"
import { type NextRequest, NextResponse } from "next/server"

/**
 * GET /api/student/movements
 *
 * Retrieve movement logs for authenticated student
 *
 * Headers:
 * Authorization: Bearer {token}
 *
 * Query parameters:
 * - status: "approved" | "denied" | "pending" (optional)
 * - limit: number (default: 50)
 *
 * Response:
 * {
 *   "movements": [
 *     {
 *       "id": "uuid",
 *       "rfid_tag": "RFID001A",
 *       "gate_name": "Main Gate",
 *       "gate_direction": "exit",
 *       "status": "approved",
 *       "created_at": "2024-01-01T10:30:00Z"
 *     }
 *   ]
 * }
 */
export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get("authorization")?.replace("Bearer ", "")
    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status")
    const limit = Number.parseInt(searchParams.get("limit") || "50")

    if (!token) {
      return NextResponse.json({ error: "No authorization token provided" }, { status: 401 })
    }

    const decoded = await verifyJWT(token)
    if (!decoded) {
      return NextResponse.json({ error: "Invalid or expired token" }, { status: 401 })
    }

    const supabase = await getSupabaseServer()

    let query = supabase
      .from("movements")
      .select("*")
      .eq("student_id", decoded.sub)
      .order("created_at", { ascending: false })
      .limit(limit)

    if (status) {
      query = query.eq("status", status)
    }

    const { data: movements, error } = await query

    if (error) {
      return NextResponse.json({ error: "Failed to fetch movements" }, { status: 500 })
    }

    return NextResponse.json({ movements }, { status: 200 })
  } catch (error) {
    console.error("Get movements error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
