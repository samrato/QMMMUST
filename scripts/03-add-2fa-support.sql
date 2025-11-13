-- Add 2FA support to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS two_fa_enabled boolean DEFAULT false;
ALTER TABLE users ADD COLUMN IF NOT EXISTS two_fa_secret text;
ALTER TABLE users ADD COLUMN IF NOT EXISTS backup_codes text[] DEFAULT ARRAY[]::text[];

-- Create 2FA attempts table
CREATE TABLE IF NOT EXISTS two_fa_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  attempt_type varchar(50) NOT NULL,
  success boolean NOT NULL DEFAULT false,
  attempted_at timestamp with time zone DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_2fa_attempts_user_id ON two_fa_attempts(user_id);
