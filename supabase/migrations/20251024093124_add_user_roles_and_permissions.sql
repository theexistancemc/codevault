/*
  # Add User Roles and Permissions System

  1. New Tables
    - `profiles`
      - `id` (uuid, primary key, references auth.users)
      - `email` (text) - User's email address
      - `full_name` (text) - User's display name
      - `role` (text) - User role: admin, editor, viewer
      - `created_at` (timestamptz) - Account creation timestamp
      - `updated_at` (timestamptz) - Last profile update timestamp
    
    - `permissions`
      - `id` (uuid, primary key) - Permission identifier
      - `role` (text) - Role this permission applies to
      - `resource` (text) - Resource type (snippets, users, settings)
      - `action` (text) - Action allowed (create, read, update, delete)
      - `created_at` (timestamptz) - Permission creation timestamp

  2. Changes to Existing Tables
    - Add `user_id` column to `code_snippets` table
    - Add `is_public` column to `code_snippets` table
    - Update RLS policies to enforce user ownership

  3. Security
    - Enable RLS on all tables
    - Add policies for authenticated user access
    - Admin users can manage all resources
    - Editors can create and manage their own snippets
    - Viewers can only read public snippets
    
  4. Triggers
    - Auto-create profile when user signs up
    - Auto-update timestamps on profile changes
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  full_name text DEFAULT '',
  role text NOT NULL DEFAULT 'editor',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create permissions table
CREATE TABLE IF NOT EXISTS permissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  role text NOT NULL,
  resource text NOT NULL,
  action text NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(role, resource, action)
);

ALTER TABLE permissions ENABLE ROW LEVEL SECURITY;

-- Add user_id and is_public to code_snippets if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'code_snippets' AND column_name = 'user_id'
  ) THEN
    ALTER TABLE code_snippets ADD COLUMN user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'code_snippets' AND column_name = 'is_public'
  ) THEN
    ALTER TABLE code_snippets ADD COLUMN is_public boolean DEFAULT true;
  END IF;
END $$;

-- Drop old policies
DROP POLICY IF EXISTS "Anyone can view code snippets" ON code_snippets;
DROP POLICY IF EXISTS "Anyone can create code snippets" ON code_snippets;
DROP POLICY IF EXISTS "Anyone can update code snippets" ON code_snippets;
DROP POLICY IF EXISTS "Anyone can delete code snippets" ON code_snippets;

-- Create new RLS policies for code_snippets
CREATE POLICY "Users can view public snippets and own snippets"
  ON code_snippets
  FOR SELECT
  TO authenticated
  USING (is_public = true OR user_id = auth.uid());

CREATE POLICY "Authenticated users can create snippets"
  ON code_snippets
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own snippets"
  ON code_snippets
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own snippets"
  ON code_snippets
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Admins can manage all snippets"
  ON code_snippets
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- RLS policies for profiles
CREATE POLICY "Users can view all profiles"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

CREATE POLICY "Admins can update all profiles"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- RLS policies for permissions
CREATE POLICY "Anyone can view permissions"
  ON permissions
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Only admins can manage permissions"
  ON permissions
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Function to create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', ''),
    'editor'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to auto-create profile
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Insert default permissions
INSERT INTO permissions (role, resource, action) VALUES
  ('owner', 'snippets', 'create'),
  ('owner', 'snippets', 'read'),
  ('owner', 'snippets', 'update'),
  ('owner', 'snippets', 'delete'),
  ('owner', 'users', 'create'),
  ('owner', 'users', 'read'),
  ('owner', 'users', 'update'),
  ('owner', 'users', 'delete'),
  ('owner', 'settings', 'manage')
  ('admin', 'snippets', 'create'),
  ('admin', 'snippets', 'read'),
  ('admin', 'snippets', 'update'),
  ('admin', 'snippets', 'delete'),
  ('admin', 'users', 'create'),
  ('admin', 'users', 'read'),
  ('admin', 'users', 'update'),
  ('admin', 'users', 'delete'),
  ('admin', 'settings', 'manage'),
  ('editor', 'snippets', 'create'),
  ('editor', 'snippets', 'read'),
  ('editor', 'snippets', 'update'),
  ('editor', 'snippets', 'delete'),
  ('viewer', 'snippets', 'read')
ON CONFLICT (role, resource, action) DO NOTHING;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_code_snippets_user_id ON code_snippets(user_id);
CREATE INDEX IF NOT EXISTS idx_code_snippets_is_public ON code_snippets(is_public);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);