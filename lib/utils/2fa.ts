import { randomBytes } from "crypto"

/**
 * Generate TOTP secret for 2FA
 */
export function generateTOTPSecret(): string {
  return randomBytes(20).toString("base64")
}

/**
 * Generate backup codes for 2FA recovery
 */
export function generateBackupCodes(count = 10): string[] {
  return Array.from({ length: count }, () => {
    const code = randomBytes(4).toString("hex").toUpperCase()
    return `${code.slice(0, 4)}-${code.slice(4)}`
  })
}

/**
 * Verify backup code
 */
export function verifyBackupCode(backupCodes: string[], code: string): boolean {
  return backupCodes.includes(code.toUpperCase())
}

/**
 * Remove used backup code
 */
export function removeBackupCode(backupCodes: string[], code: string): string[] {
  return backupCodes.filter((c) => c.toUpperCase() !== code.toUpperCase())
}
