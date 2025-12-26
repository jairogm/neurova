-- Add event_id column to sessions table to link with Google Calendar events
ALTER TABLE sessions ADD COLUMN event_id TEXT;

-- Create index for faster lookups by event_id
CREATE INDEX idx_sessions_event_id ON sessions(event_id);

-- Add comment to explain the column
COMMENT ON COLUMN sessions.event_id IS 'Google Calendar event ID for linking appointments with sessions';
