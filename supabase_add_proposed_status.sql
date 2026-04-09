-- Add 'proposed' and 'rejected' status to consultation_bookings
-- Run this in Supabase Dashboard → SQL Editor

ALTER TABLE consultation_bookings DROP CONSTRAINT IF EXISTS consultation_bookings_status_check;
ALTER TABLE consultation_bookings ADD CONSTRAINT consultation_bookings_status_check
  CHECK (status IN ('pending', 'pending_approval', 'confirmed', 'completed', 'cancelled', 'proposed', 'rejected'));
