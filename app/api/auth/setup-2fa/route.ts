import { getSupabaseServer } from "@/lib/supabase/server"
import { verifyJWT } from "@/lib/utils/jwt"
import { generateTOTPSecret, generateBackupCodes } from "@/lib/utils/2fa"
import { type NextRequest, NextResponse } from "next/server"

/**
 * POST /api/auth/setup-2fa
 * Setup 2FA for a user
 */
export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get("authorization")?.replace("Bearer ", "")

    if (!token) {
      return NextResponse.json({ error: "No authorization token provided" }, { status: 401 })
    }

    const decoded = await verifyJWT(token)
    if (!decoded) {
      return NextResponse.json({ error: "Invalid or expired token" }, { status: 401 })
    }

    const totp_secret = generateTOTPSecret()
    const backup_codes = generateBackupCodes(10)

    return NextResponse.json(
      {
        totp_secret,
        backup_codes,
        message: "Scan the QR code with your authenticator app and save the backup codes",
      },
      { status: 200 },
    )
  } catch (error) {
    console.error("Setup 2FA error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

/**
 * PUT /api/auth/setup-2fa
 * Confirm and enable 2FA
 */
export async function PUT(request: NextRequest) {
  try {
    const token = request.headers.get("authorization")?.replace("Bearer ", "")
    const { totp_secret, backup_codes } = await request.json()

    if (!token) {
      return NextResponse.json({ error: "No authorization token provided" }, { status: 401 })
    }

    const decoded = await verifyJWT(token)
    if (!decoded) {
      return NextResponse.json({ error: "Invalid or expired token" }, { status: 401 })
    }

    const supabase = await getSupabaseServer()

    const { error } = await supabase
      .from("users")
      .update({
        two_fa_enabled: true,
        two_fa_secret: totp_secret,
        backup_codes: backup_codes,
      })
      .eq("id", decoded.sub)

    if (error) {
      return NextResponse.json({ error: "Failed to enable 2FA" }, { status: 500 })
    }

    return NextResponse.json({ message: "2FA enabled successfully" }, { status: 200 })
  } catch (error) {
    console.error("Enable 2FA error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
