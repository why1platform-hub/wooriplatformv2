-- Add reject_reason column and update status constraint
ALTER TABLE consultation_bookings ADD COLUMN IF NOT EXISTS reject_reason TEXT DEFAULT '';

-- Drop old constraint and add new one with 'rejected' status
ALTER TABLE consultation_bookings DROP CONSTRAINT IF EXISTS consultation_bookings_status_check;
ALTER TABLE consultation_bookings ADD CONSTRAINT consultation_bookings_status_check
  CHECK (status IN ('pending', 'pending_approval', 'confirmed', 'completed', 'cancelled', 'rejected'));
