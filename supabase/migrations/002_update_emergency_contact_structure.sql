-- Migration: Update emergency contact structure to use country objects
-- This migration updates emergency contact phone structure from a single number
-- to separate country_code object and phone string

-- Update existing emergency contact records to restructure phone data
UPDATE patients 
SET emergency_contact = jsonb_build_object(
  'name', emergency_contact->>'name',
  'relationship', emergency_contact->>'relationship',
  'country_code', CASE 
    -- Try to extract country code from phone number and map to country object
    WHEN (emergency_contact->>'phone')::text ~ '^\+?1[0-9]{10}$' THEN 
      '{"iso":"US","name":"United States","phoneCode":"+1","flag":"🇺🇸"}'::jsonb
    WHEN (emergency_contact->>'phone')::text ~ '^\+?44[0-9]{10}$' THEN 
      '{"iso":"GB","name":"United Kingdom","phoneCode":"+44","flag":"🇬🇧"}'::jsonb
    WHEN (emergency_contact->>'phone')::text ~ '^\+?57[0-9]{10}$' THEN 
      '{"iso":"CO","name":"Colombia","phoneCode":"+57","flag":"🇨🇴"}'::jsonb
    WHEN (emergency_contact->>'phone')::text ~ '^\+?91[0-9]{10}$' THEN 
      '{"iso":"IN","name":"India","phoneCode":"+91","flag":"🇮🇳"}'::jsonb
    -- Default to US for any unrecognized format
    ELSE '{"iso":"US","name":"United States","phoneCode":"+1","flag":"🇺🇸"}'::jsonb
  END,
  'phone', CASE
    -- Extract just the phone number without country code
    WHEN (emergency_contact->>'phone')::text ~ '^\+?1([0-9]{10})$' THEN 
      regexp_replace((emergency_contact->>'phone')::text, '^\+?1([0-9]{10})$', '\1')
    WHEN (emergency_contact->>'phone')::text ~ '^\+?44([0-9]{10})$' THEN 
      regexp_replace((emergency_contact->>'phone')::text, '^\+?44([0-9]{10})$', '\1')
    WHEN (emergency_contact->>'phone')::text ~ '^\+?57([0-9]{10})$' THEN 
      regexp_replace((emergency_contact->>'phone')::text, '^\+?57([0-9]{10})$', '\1')
    WHEN (emergency_contact->>'phone')::text ~ '^\+?91([0-9]{10})$' THEN 
      regexp_replace((emergency_contact->>'phone')::text, '^\+?91([0-9]{10})$', '\1')
    -- Keep original value if can't parse
    ELSE emergency_contact->>'phone'
  END
)
WHERE emergency_contact IS NOT NULL 
  AND emergency_contact ? 'phone' 
  AND NOT (emergency_contact ? 'country_code');

-- Add constraint to ensure emergency contact has proper structure if it exists
ALTER TABLE patients ADD CONSTRAINT emergency_contact_structure_check 
CHECK (
  emergency_contact IS NULL OR (
    emergency_contact ? 'name' AND
    emergency_contact ? 'relationship' AND
    emergency_contact ? 'country_code' AND
    emergency_contact ? 'phone' AND
    jsonb_typeof(emergency_contact->'name') = 'string' AND
    jsonb_typeof(emergency_contact->'relationship') = 'string' AND
    jsonb_typeof(emergency_contact->'phone') = 'string' AND
    jsonb_typeof(emergency_contact->'country_code') = 'object' AND
    emergency_contact->'country_code' ? 'iso' AND
    emergency_contact->'country_code' ? 'name' AND
    emergency_contact->'country_code' ? 'phoneCode' AND
    emergency_contact->'country_code' ? 'flag'
  )
);