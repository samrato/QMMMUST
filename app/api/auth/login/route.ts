import { getSupabaseServer } from "@/lib/supabase/server"
import { signJWT } from "@/lib/utils/jwt"
import { type NextRequest, NextResponse } from "next/server"
import * as bcrypt from "bcryptjs"

/**
 * POST /api/auth/login
 *
 * Login endpoint for students and admins
 *
 * Request body:
 * {
 *   "registrationNumber": "CS/2021/001",
 *   "password": "student123"
 * }
 *
 * Response:
 * {
 *   "token": "jwt_token_here",
 *   "role": "student" | "admin",
 *   "user": { ... }
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const { registrationNumber, password } = await request.json()

    if (!registrationNumber || !password) {
      return NextResponse.json({ error: "Registration number and password are required" }, { status: 400 })
    }

    const supabase = await getSupabaseServer()

    // Query user by registration number
    const { data: users, error: queryError } = await supabase
      .from("users")
      .select("id, name, email, registration_number, password_hash, role, is_active")
      .eq("registration_number", registrationNumber)
      .limit(1)

    if (queryError) {
      console.error("[v0] Query error:", queryError)
      return NextResponse.json({ error: "Database error" }, { status: 500 })
    }

    if (!users || users.length === 0) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    const user = users[0]

    if (!user.is_active) {
      return NextResponse.json({ error: "Account is inactive" }, { status: 403 })
    }

    const isPasswordValid = await bcrypt.compare(password, user.password_hash)

    if (!isPasswordValid) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    // Create JWT token
    const token = await signJWT({
      sub: user.id,
      registrationNumber: user.registration_number,
      role: user.role,
      email: user.email,
    })

    await supabase.from("users").update({ last_login: new Date().toISOString() }).eq("id", user.id)

    return NextResponse.json(
      {
        token,
        role: user.role,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          registrationNumber: user.registration_number,
        },
      },
      { status: 200 },
    )
  } catch (error) {
    console.error("[v0] Login error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
