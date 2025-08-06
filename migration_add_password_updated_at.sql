-- Add passwordUpdatedAt field to users table
ALTER TABLE users ADD COLUMN password_updated_at TIMESTAMP;

-- Set initial values for existing users (optional - can be left null)
-- UPDATE users SET password_updated_at = created_at WHERE password_updated_at IS NULL;