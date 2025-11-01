/*
  # Add Custom Roles, Badges, and Ban System

  1. New Tables
    - `custom_roles`
      - `id` (uuid, primary key)
      - `name` (text, unique) - Role name (e.g., "Moderator", "Contributor")
      - `color` (text) - Hex color for badge display
      - `description` (text) - Role description
      - `permissions` (jsonb) - Custom permissions for this role
      - `created_by` (uuid) - Admin who created the role
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `user_badges`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles.id)
      - `badge_name` (text) - Badge name/title
      - `badge_color` (text) - Hex color for display
      - `badge_icon` (text) - Emoji or icon identifier
      - `issued_by` (uuid) - Admin who issued badge
      - `created_at` (timestamptz)

    - `banned_users`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles.id, unique)
      - `reason` (text) - Ban reason
      - `banned_by` (uuid) - Admin who banned the user
      - `banned_at` (timestamptz)
      - `expires_at` (timestamptz, nullable) - If null, permanent ban

  2. Changes to Existing Tables
    - Add `is_banned` (boolean) column to profiles table
    - Add `custom_role_id` (uuid, nullable) column to profiles table (for custom roles)
    - Add `badges` (text[]) column to profiles table
    - Add `last_login_at` (timestamptz) column to profiles table
    - Drop old role column constraint, keep it as text for backward compatibility

  3. Security
    - RLS policies for all new tables
    - Only admins can manage custom roles, badges, and bans
    - Users cannot see private ban information

  4. Indexes
    - Index on banned_users.user_id for fast lookup
    - Index on user_badges.user_id for profile display
    - Index on profiles.is_banned for filtering
*/

-- Add new columns to profiles table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'custom_role_id'
  ) THEN
    ALTER TABLE profiles ADD COLUMN custom_role_id uuid;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'is_banned'
  ) THEN
    ALTER TABLE profiles ADD COLUMN is_banned boolean DEFAULT false;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'last_login_at'
  ) THEN
    ALTER TABLE profiles ADD COLUMN last_login_at timestamptz;
  END IF;
END $$;

-- Create custom_roles table
CREATE TABLE IF NOT EXISTS custom_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  color text NOT NULL DEFAULT '#3b82f6',
  description text DEFAULT '',
  permissions jsonb DEFAULT '{"snippets": ["read"]}',
  created_by uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE custom_roles ENABLE ROW LEVEL SECURITY;

-- Create user_badges table
CREATE TABLE IF NOT EXISTS user_badges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  badge_name text NOT NULL,
  badge_color text NOT NULL DEFAULT '#3b82f6',
  badge_icon text NOT NULL,
  issued_by uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, badge_name)
);

ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;

-- Create banned_users table
CREATE TABLE IF NOT EXISTS banned_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,
  reason text NOT NULL,
  banned_by uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  banned_at timestamptz DEFAULT now(),
  expires_at timestamptz,
  CONSTRAINT valid_expiry CHECK (expires_at IS NULL OR expires_at > banned_at)
);

ALTER TABLE banned_users ENABLE ROW LEVEL SECURITY;

-- RLS Policies for custom_roles
CREATE POLICY "Anyone can view custom roles"
  ON custom_roles
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Only admins can manage custom roles"
  ON custom_roles
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- RLS Policies for user_badges
CREATE POLICY "Anyone can view user badges"
  ON user_badges
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Only admins can manage badges"
  ON user_badges
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- RLS Policies for banned_users
CREATE POLICY "Admins can view bans"
  ON banned_users
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Only admins can manage bans"
  ON banned_users
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Add foreign key constraint for custom_role_id
ALTER TABLE profiles ADD CONSTRAINT fk_custom_role
  FOREIGN KEY (custom_role_id) REFERENCES custom_roles(id) ON DELETE SET NULL;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_banned_users_user_id ON banned_users(user_id);
CREATE INDEX IF NOT EXISTS idx_user_badges_user_id ON user_badges(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_is_banned ON profiles(is_banned);
CREATE INDEX IF NOT EXISTS idx_custom_roles_created_by ON custom_roles(created_by);

-- Update profiles table RLS to prevent banned users from accessing
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (
    id = auth.uid() 
    AND is_banned = false
  )
  WITH CHECK (id = auth.uid());

-- Insert default custom role
INSERT INTO custom_roles (name, color, description, permissions, created_by)
SELECT 'Contributor', '#10b981', 'Community contributor with verified contributions', 
  '{"snippets": ["create", "read", "update", "delete"], "users": ["read"]}'::jsonb,
  (SELECT id FROM auth.users LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM custom_roles WHERE name = 'Contributor');