-- Migration: Update country_code column from text to JSONB
-- This migration changes the country_code column in the patients table
-- from storing just the phone code string to storing a complete country object

-- First, add a temporary column to store the new country objects
ALTER TABLE patients ADD COLUMN country_code_new JSONB;

-- Update existing records to convert string country codes to objects
-- Note: This assumes existing data uses the old format (+1, +44, etc.)
UPDATE patients 
SET country_code_new = CASE 
  WHEN country_code = '+1' THEN '{"iso":"US","name":"United States","phoneCode":"+1","flag":"🇺🇸"}'::jsonb
  WHEN country_code = '+44' THEN '{"iso":"GB","name":"United Kingdom","phoneCode":"+44","flag":"🇬🇧"}'::jsonb
  WHEN country_code = '+57' THEN '{"iso":"CO","name":"Colombia","phoneCode":"+57","flag":"🇨🇴"}'::jsonb
  WHEN country_code = '+91' THEN '{"iso":"IN","name":"India","phoneCode":"+91","flag":"🇮🇳"}'::jsonb
  WHEN country_code = '+61' THEN '{"iso":"AU","name":"Australia","phoneCode":"+61","flag":"🇦🇺"}'::jsonb
  WHEN country_code = '+49' THEN '{"iso":"DE","name":"Germany","phoneCode":"+49","flag":"🇩🇪"}'::jsonb
  WHEN country_code = '+33' THEN '{"iso":"FR","name":"France","phoneCode":"+33","flag":"🇫🇷"}'::jsonb
  WHEN country_code = '+81' THEN '{"iso":"JP","name":"Japan","phoneCode":"+81","flag":"🇯🇵"}'::jsonb
  WHEN country_code = '+55' THEN '{"iso":"BR","name":"Brazil","phoneCode":"+55","flag":"🇧🇷"}'::jsonb
  WHEN country_code = '+52' THEN '{"iso":"MX","name":"Mexico","phoneCode":"+52","flag":"🇲🇽"}'::jsonb
  WHEN country_code = '+34' THEN '{"iso":"ES","name":"Spain","phoneCode":"+34","flag":"🇪🇸"}'::jsonb
  -- Default to US for any unrecognized codes
  ELSE '{"iso":"US","name":"United States","phoneCode":"+1","flag":"🇺🇸"}'::jsonb
END
WHERE country_code IS NOT NULL;

-- Drop the old column
ALTER TABLE patients DROP COLUMN country_code;

-- Rename the new column
ALTER TABLE patients RENAME COLUMN country_code_new TO country_code;

-- Add a constraint to ensure the JSONB has the required structure
ALTER TABLE patients ADD CONSTRAINT country_code_structure_check 
CHECK (
  country_code IS NULL OR (
    country_code ? 'iso' AND
    country_code ? 'name' AND 
    country_code ? 'phoneCode' AND
    country_code ? 'flag' AND
    jsonb_typeof(country_code->'iso') = 'string' AND
    jsonb_typeof(country_code->'name') = 'string' AND
    jsonb_typeof(country_code->'phoneCode') = 'string' AND
    jsonb_typeof(country_code->'flag') = 'string'
  )
);