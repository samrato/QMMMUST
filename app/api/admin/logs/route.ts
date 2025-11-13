import { getSupabaseServer } from "@/lib/supabase/server"
import { verifyJWT } from "@/lib/utils/jwt"
import { type NextRequest, NextResponse } from "next/server"

/**
 * GET /api/admin/logs
 *
 * Get all asset/gate pass logs with filters
 *
 * Query parameters:
 * - status: "approved" | "denied" | "pending"
 * - date_from: ISO date string
 * - date_to: ISO date string
 * - limit: number of records (default: 100)
 */
export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get("authorization")?.replace("Bearer ", "")
    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status")
    const dateFrom = searchParams.get("date_from")
    const dateTo = searchParams.get("date_to")
    const limit = Number.parseInt(searchParams.get("limit") || "100")

    if (!token) {
      return NextResponse.json({ error: "No authorization token provided" }, { status: 401 })
    }

    const decoded = await verifyJWT(token)
    if (!decoded || decoded.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized: Admin access required" }, { status: 403 })
    }

    const supabase = await getSupabaseServer()

    let query = supabase
      .from("movements")
      .select("*, users(name, registration_number), devices(device_name, rfid_tag)")
      .order("created_at", { ascending: false })
      .limit(limit)

    if (status) {
      query = query.eq("status", status)
    }

    if (dateFrom) {
      query = query.gte("created_at", dateFrom)
    }

    if (dateTo) {
      query = query.lte("created_at", dateTo)
    }

    const { data: logs, error } = await query

    if (error) {
      return NextResponse.json({ error: "Failed to fetch logs" }, { status: 500 })
    }

    return NextResponse.json({ logs }, { status: 200 })
  } catch (error) {
    console.error("Get logs error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
