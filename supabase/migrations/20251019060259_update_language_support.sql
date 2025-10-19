/*
  # Update language support to allow any language

  1. Changes
    - Remove language constraint to allow any programming language
    - The language field will now accept any text value
    - This allows users to specify any programming language (Python, Java, C++, Rust, etc.)
  
  2. Notes
    - Existing data remains unchanged
    - Users can now enter custom language names
    - No data migration needed as we're only removing constraints
*/

-- No changes needed to the table structure
-- The language column already accepts text values
-- This migration documents that we support any language now