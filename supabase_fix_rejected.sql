-- Fix: Add 'rejected' to consultation_bookings status constraint
-- and add reject_reason column
-- Run this in Supabase Dashboard → SQL Editor → New Query → Run

-- Drop the old constraint and add new one with 'rejected'
ALTER TABLE consultation_bookings DROP CONSTRAINT IF EXISTS consultation_bookings_status_check;
ALTER TABLE consultation_bookings ADD CONSTRAINT consultation_bookings_status_check
  CHECK (status IN ('pending', 'pending_approval', 'confirmed', 'completed', 'cancelled', 'rejected'));

-- Add reject_reason column if not exists
ALTER TABLE consultation_bookings ADD COLUMN IF NOT EXISTS reject_reason TEXT;
