/*
  # Create code snippets storage

  1. New Tables
    - `code_snippets`
      - `id` (uuid, primary key) - Unique identifier for each code snippet
      - `title` (text) - Name/title of the code snippet
      - `language` (text) - Programming language (skript, javascript, html)
      - `code` (text) - The actual code content
      - `created_at` (timestamptz) - Timestamp when snippet was created
      - `updated_at` (timestamptz) - Timestamp when snippet was last updated
      
  2. Security
    - Enable RLS on `code_snippets` table
    - Add policy for public read access (anyone can view snippets)
    - Add policy for public write access (anyone can create/update snippets)
    
  3. Notes
    - This is a public code sharing platform
    - All snippets are publicly accessible
    - Timestamps auto-update on creation and modification
*/

CREATE TABLE IF NOT EXISTS code_snippets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL DEFAULT 'Untitled',
  language text NOT NULL DEFAULT 'javascript',
  code text NOT NULL DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE code_snippets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view code snippets"
  ON code_snippets
  FOR SELECT
  USING (true);

CREATE POLICY "Anyone can create code snippets"
  ON code_snippets
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can update code snippets"
  ON code_snippets
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anyone can delete code snippets"
  ON code_snippets
  FOR DELETE
  USING (true);

-- Create index for faster language filtering
CREATE INDEX IF NOT EXISTS idx_code_snippets_language ON code_snippets(language);

-- Create index for sorting by creation date
CREATE INDEX IF NOT EXISTS idx_code_snippets_created_at ON code_snippets(created_at DESC);