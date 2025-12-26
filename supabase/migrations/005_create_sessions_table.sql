-- Create enum types for session and payment status
CREATE TYPE session_status AS ENUM ('scheduled', 'completed', 'cancelled', 'rescheduled', 'no_show');
CREATE TYPE payment_status AS ENUM ('pending', 'paid', 'partially_paid', 'refunded');

-- Create sessions table
CREATE TABLE IF NOT EXISTS sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    scheduled_date TIMESTAMPTZ NOT NULL,
    duration INTEGER NOT NULL DEFAULT 60, -- duration in minutes
    session_status session_status NOT NULL DEFAULT 'scheduled',
    payment_status payment_status NOT NULL DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX idx_sessions_patient_id ON sessions(patient_id);
CREATE INDEX idx_sessions_scheduled_date ON sessions(scheduled_date);
CREATE INDEX idx_sessions_session_status ON sessions(session_status);
CREATE INDEX idx_sessions_payment_status ON sessions(payment_status);

-- Enable Row Level Security
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for therapists to manage sessions
CREATE POLICY "Therapists can view sessions for their patients" ON sessions
    FOR SELECT
    USING (
        patient_id IN (
            SELECT p.id
            FROM patients p
            JOIN therapists t ON t.id = p.therapist_id
            WHERE t.user_id = auth.uid()
        )
    );

CREATE POLICY "Therapists can insert sessions for their patients" ON sessions
    FOR INSERT
    WITH CHECK (
        patient_id IN (
            SELECT p.id
            FROM patients p
            JOIN therapists t ON t.id = p.therapist_id
            WHERE t.user_id = auth.uid()
        )
    );

CREATE POLICY "Therapists can update sessions for their patients" ON sessions
    FOR UPDATE
    USING (
        patient_id IN (
            SELECT p.id
            FROM patients p
            JOIN therapists t ON t.id = p.therapist_id
            WHERE t.user_id = auth.uid()
        )
    );

CREATE POLICY "Therapists can delete sessions for their patients" ON sessions
    FOR DELETE
    USING (
        patient_id IN (
            SELECT p.id
            FROM patients p
            JOIN therapists t ON t.id = p.therapist_id
            WHERE t.user_id = auth.uid()
        )
    );

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_sessions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
CREATE TRIGGER update_sessions_updated_at_trigger
    BEFORE UPDATE ON sessions
    FOR EACH ROW
    EXECUTE FUNCTION update_sessions_updated_at();
