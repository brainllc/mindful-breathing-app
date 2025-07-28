-- Migration: Replace firstName and lastName with displayName for privacy
-- Run this on your database to update the schema

-- Add the new displayName column
ALTER TABLE users ADD COLUMN display_name TEXT;

-- Migrate existing data: Combine firstName and lastName into displayName
UPDATE users 
SET display_name = CASE 
  WHEN last_name IS NOT NULL AND last_name != '' 
    THEN first_name || ' ' || LEFT(last_name, 1) || '.'
  ELSE first_name
END
WHERE first_name IS NOT NULL;

-- Set displayName as NOT NULL after data migration
ALTER TABLE users ALTER COLUMN display_name SET NOT NULL;

-- Remove the old columns
ALTER TABLE users DROP COLUMN first_name;
ALTER TABLE users DROP COLUMN last_name;

-- Verify the changes
SELECT id, email, display_name FROM users LIMIT 5; 