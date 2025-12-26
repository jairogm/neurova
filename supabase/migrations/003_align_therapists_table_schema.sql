-- Migration: Align therapists table with app requirements
-- This migration adds missing columns and updates the therapists table structure
-- to match what the application expects

-- Add missing columns that the app uses
ALTER TABLE public.therapists 
ADD COLUMN IF NOT EXISTS full_name text,
ADD COLUMN IF NOT EXISTS phone text,
ADD COLUMN IF NOT EXISTS specialization text,
ADD COLUMN IF NOT EXISTS office_address text,
ADD COLUMN IF NOT EXISTS country_code jsonb,
ADD COLUMN IF NOT EXISTS profile_image text,
ADD COLUMN IF NOT EXISTS emergency_contact jsonb;

-- Update existing columns to match app expectations
-- Rename specialty to specialization if it exists and specialization doesn't
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'therapists' AND column_name = 'specialty'
    ) AND NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'therapists' AND column_name = 'specialization'
    ) THEN
        ALTER TABLE public.therapists RENAME COLUMN specialty TO specialization;
    END IF;
END $$;

-- Rename phone_number to phone if phone doesn't exist
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'therapists' AND column_name = 'phone_number'
    ) AND NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'therapists' AND column_name = 'phone'
    ) THEN
        ALTER TABLE public.therapists RENAME COLUMN phone_number TO phone;
    END IF;
END $$;

-- Rename profile_picture to profile_image if profile_image doesn't exist
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'therapists' AND column_name = 'profile_picture'
    ) AND NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'therapists' AND column_name = 'profile_image'
    ) THEN
        ALTER TABLE public.therapists RENAME COLUMN profile_picture TO profile_image;
    END IF;
END $$;

-- Rename address to office_address if office_address doesn't exist
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'therapists' AND column_name = 'address'
    ) AND NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'therapists' AND column_name = 'office_address'
    ) THEN
        ALTER TABLE public.therapists RENAME COLUMN address TO office_address;
    END IF;
END $$;

-- Update country_code to store JSONB country objects if it's currently text
DO $$
BEGIN
    -- Check if country_code exists and is text type
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'therapists' 
        AND column_name = 'country_code' 
        AND data_type = 'text'
    ) THEN
        -- Add temporary column for conversion
        ALTER TABLE public.therapists ADD COLUMN country_code_temp jsonb;
        
        -- Convert existing text country codes to JSONB objects
        -- This assumes the country column contains country names
        UPDATE public.therapists 
        SET country_code_temp = CASE 
            WHEN country = 'United States' OR country = 'US' THEN '{"iso":"US","name":"United States","phoneCode":"+1","flag":"🇺🇸"}'::jsonb
            WHEN country = 'United Kingdom' OR country = 'UK' OR country = 'GB' THEN '{"iso":"GB","name":"United Kingdom","phoneCode":"+44","flag":"🇬🇧"}'::jsonb
            WHEN country = 'Colombia' OR country = 'CO' THEN '{"iso":"CO","name":"Colombia","phoneCode":"+57","flag":"🇨🇴"}'::jsonb
            WHEN country = 'India' OR country = 'IN' THEN '{"iso":"IN","name":"India","phoneCode":"+91","flag":"🇮🇳"}'::jsonb
            WHEN country = 'Canada' OR country = 'CA' THEN '{"iso":"CA","name":"Canada","phoneCode":"+1","flag":"🇨🇦"}'::jsonb
            WHEN country = 'Australia' OR country = 'AU' THEN '{"iso":"AU","name":"Australia","phoneCode":"+61","flag":"🇦🇺"}'::jsonb
            WHEN country = 'Germany' OR country = 'DE' THEN '{"iso":"DE","name":"Germany","phoneCode":"+49","flag":"🇩🇪"}'::jsonb
            WHEN country = 'France' OR country = 'FR' THEN '{"iso":"FR","name":"France","phoneCode":"+33","flag":"🇫🇷"}'::jsonb
            WHEN country = 'Japan' OR country = 'JP' THEN '{"iso":"JP","name":"Japan","phoneCode":"+81","flag":"🇯🇵"}'::jsonb
            WHEN country = 'Brazil' OR country = 'BR' THEN '{"iso":"BR","name":"Brazil","phoneCode":"+55","flag":"🇧🇷"}'::jsonb
            WHEN country = 'Mexico' OR country = 'MX' THEN '{"iso":"MX","name":"Mexico","phoneCode":"+52","flag":"🇲🇽"}'::jsonb
            WHEN country = 'Spain' OR country = 'ES' THEN '{"iso":"ES","name":"Spain","phoneCode":"+34","flag":"🇪🇸"}'::jsonb
            -- Default to US for any unrecognized values
            ELSE '{"iso":"US","name":"United States","phoneCode":"+1","flag":"🇺🇸"}'::jsonb
        END
        WHERE country IS NOT NULL;
        
        -- Drop old column and rename new one
        ALTER TABLE public.therapists DROP COLUMN country_code;
        ALTER TABLE public.therapists RENAME COLUMN country_code_temp TO country_code;
    END IF;
END $$;

-- Add constraint for country_code JSONB structure if column exists and is JSONB
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'therapists' 
        AND column_name = 'country_code' 
        AND data_type = 'jsonb'
    ) THEN
        -- Drop constraint if it exists
        ALTER TABLE public.therapists DROP CONSTRAINT IF EXISTS therapist_country_code_structure_check;
        
        -- Add new constraint
        ALTER TABLE public.therapists ADD CONSTRAINT therapist_country_code_structure_check 
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
    END IF;
END $$;

-- Create function for updating updated_at timestamp if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Ensure the trigger exists for updating updated_at
DROP TRIGGER IF EXISTS update_therapists_updated_at ON public.therapists;
CREATE TRIGGER update_therapists_updated_at 
    BEFORE UPDATE ON public.therapists 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Update any existing records to have full_name from email if full_name is null
UPDATE public.therapists 
SET full_name = email
WHERE full_name IS NULL AND email IS NOT NULL;

-- Migrate existing emergency contact data to JSONB format
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'therapists' 
        AND column_name = 'emergency_contact_name'
    ) THEN
        -- Convert existing emergency contact data to JSONB format
        UPDATE public.therapists 
        SET emergency_contact = jsonb_build_object(
            'name', emergency_contact_name,
            'phone', emergency_contact_phone,
            'country_code', '{"iso":"US","name":"United States","phoneCode":"+1","flag":"🇺🇸"}'::jsonb,
            'relationship', 'Emergency Contact'
        )
        WHERE emergency_contact_name IS NOT NULL OR emergency_contact_phone IS NOT NULL;
        
        -- Drop old columns
        ALTER TABLE public.therapists 
        DROP COLUMN IF EXISTS emergency_contact_name,
        DROP COLUMN IF EXISTS emergency_contact_phone;
    END IF;
END $$;

-- Add constraint for emergency_contact JSONB structure
ALTER TABLE public.therapists DROP CONSTRAINT IF EXISTS therapist_emergency_contact_structure_check;
ALTER TABLE public.therapists ADD CONSTRAINT therapist_emergency_contact_structure_check 
CHECK (
    emergency_contact IS NULL OR (
        emergency_contact ? 'name' AND
        emergency_contact ? 'phone' AND
        emergency_contact ? 'country_code' AND
        emergency_contact ? 'relationship' AND
        jsonb_typeof(emergency_contact->'name') = 'string' AND
        jsonb_typeof(emergency_contact->'phone') = 'string' AND
        jsonb_typeof(emergency_contact->'country_code') = 'object' AND
        jsonb_typeof(emergency_contact->'relationship') = 'string'
    )
);

-- Remove unused columns
ALTER TABLE public.therapists 
DROP COLUMN IF EXISTS city,
DROP COLUMN IF EXISTS state,
DROP COLUMN IF EXISTS zip_code,
DROP COLUMN IF EXISTS country,
DROP COLUMN IF EXISTS languages_spoken,
DROP COLUMN IF EXISTS insurance_providers,
DROP COLUMN IF EXISTS certifications,
DROP COLUMN IF EXISTS licenses,
DROP COLUMN IF EXISTS education;

-- Add some helpful indexes for performance
CREATE INDEX IF NOT EXISTS idx_therapists_full_name ON public.therapists USING btree (full_name);
CREATE INDEX IF NOT EXISTS idx_therapists_specialization ON public.therapists USING btree (specialization);
CREATE INDEX IF NOT EXISTS idx_therapists_email ON public.therapists USING btree (email);