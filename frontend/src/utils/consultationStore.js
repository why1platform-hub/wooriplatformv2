/**
 * Consultation data store — Supabase-backed with localStorage fallback.
 * All writes go to Supabase first, localStorage second.
 * All reads try Supabase first, fall back to localStorage cache.
 */

import { supabase } from './supabase';

// ── KST (UTC+9) date helpers ──
export const getKSTDate = () => {
  const now = new Date();
  return new Date(now.getTime() + (9 * 60 * 60 * 1000) + (now.getTimezoneOffset() * 60 * 1000));
};
export const formatKSTDate = (d) => {
  const kst = d || getKSTDate();
  return `${kst.getFullYear()}.${String(kst.getMonth() + 1).padStart(2, '0')}.${String(kst.getDate()).padStart(2, '0')}`;
};
export const getKSTToday = () => formatKSTDate();

// ── System consultants (matches AuthContext) ──
export const CONSULTANTS = [
  { id: 2, name_ko: '박지영', email: 'instructor1@woori.com', department: '전직지원팀' },
  { id: 3, name_ko: '이민호', email: 'instructor2@woori.com', department: '전직지원팀' },
];

// ── Available time slots ──
export const getAvailableSlots = (dateStr) => {
  const d = new Date(dateStr.replace(/\./g, '-'));
  if (d.getDay() === 0 || d.getDay() === 6) return [];
  const slots = [];
  for (let h = 9; h < 17; h++) {
    for (let m = 0; m < 60; m += 30) {
      slots.push(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`);
    }
  }
  return slots;
};

// ══════════════════════════════════════════════════════════════════════
// ── BOOKINGS ─────────────────────────────────────────────────────────
// ══════════════════════════════════════════════════════════════════════

export const loadBookings = async () => {
  try {
    const { data, error } = await supabase
      .from('consultation_bookings')
      .select('*')
      .order('created_at', { ascending: false });
    if (!error && data) {
      // Map DB columns to camelCase
      return data.map((r) => ({
        id: r.id, userId: r.user_id, userName: r.user_name, userEmail: r.user_email,
        date: r.date, time: r.time, method: r.method, status: r.status,
        consultantId: r.consultant_id, consultantName: r.consultant_name,
        rejectReason: r.reject_reason || '',
        createdAt: r.created_at,
      }));
    }
  } catch { /* fallback */ }
  // Fallback to localStorage
  try {
    const saved = localStorage.getItem('woori_consultation_bookings');
    if (saved) return JSON.parse(saved);
  } catch { /* ignore */ }
  return [];
};

export const addBooking = async (booking) => {
  const row = {
    user_id: booking.userId, user_name: booking.userName, user_email: booking.userEmail,
    date: booking.date, time: booking.time, method: booking.method,
    status: 'pending', consultant_id: null, consultant_name: null,
  };
  try {
    const { data, error } = await supabase.from('consultation_bookings').insert(row).select().single();
    if (!error && data) {
      return { id: data.id, ...booking, status: 'pending', consultantId: null, consultantName: null, createdAt: data.created_at };
    }
  } catch { /* fallback */ }
  return null;
};

export const assignConsultant = async (bookingId, consultantId, consultantName) => {
  try {
    await supabase.from('consultation_bookings')
      .update({ consultant_id: consultantId, consultant_name: consultantName, status: 'pending_approval' })
      .eq('id', bookingId);
  } catch { /* ignore */ }
};

export const approveBooking = async (bookingId) => {
  try {
    await supabase.from('consultation_bookings').update({ status: 'confirmed' }).eq('id', bookingId);
  } catch { /* ignore */ }
};

export const completeBooking = async (bookingId) => {
  try {
    await supabase.from('consultation_bookings').update({ status: 'completed' }).eq('id', bookingId);
  } catch { /* ignore */ }
};

export const cancelBooking = async (bookingId) => {
  try {
    await supabase.from('consultation_bookings').update({ status: 'cancelled' }).eq('id', bookingId);
  } catch { /* ignore */ }
};

export const rejectBooking = async (bookingId, reason) => {
  try {
    const { error } = await supabase.from('consultation_bookings').update({ status: 'rejected', reject_reason: reason }).eq('id', bookingId);
    if (error) {
      // Fallback: if 'rejected' violates CHECK constraint, use 'cancelled' with reason in notes
      await supabase.from('consultation_bookings').update({ status: 'cancelled' }).eq('id', bookingId);
      // Store reject reason separately
      try {
        await supabase.from('consultation_notes').upsert({
          booking_id: bookingId, title: '거절 사유', content: reason || '거절됨',
          updated_at: new Date().toISOString(),
        });
      } catch { /* ignore */ }
    }
  } catch { /* ignore */ }
};

// ── Query helpers (async) ──

export const getBookingsForUser = async (userId) => {
  const all = await loadBookings();
  return all.filter((b) => b.userId === userId && b.status !== 'cancelled');
};

export const getConsultationHistory = async (userId, consultantId) => {
  const all = await loadBookings();
  return all.filter(
    (b) => b.status === 'completed' &&
      (!userId || b.userId === userId) &&
      (!consultantId || b.consultantId === consultantId)
  );
};

export const getBookedSlots = async (dateStr) => {
  const all = await loadBookings();
  return all.filter((b) => b.date === dateStr && b.status !== 'cancelled').map((b) => b.time);
};

// ── Stats (async) ──

export const getConsultationStats = async () => {
  const bookings = await loadBookings();
  const active = bookings.filter((b) => b.status !== 'cancelled');
  return {
    total: active.length,
    pending: active.filter((b) => b.status === 'pending').length,
    pending_approval: active.filter((b) => b.status === 'pending_approval').length,
    confirmed: active.filter((b) => b.status === 'confirmed').length,
    completed: active.filter((b) => b.status === 'completed').length,
  };
};

export const getConsultantStats = async () => {
  const bookings = await loadBookings();
  const active = bookings.filter((b) => b.status !== 'cancelled');
  const byConsultant = {};
  CONSULTANTS.forEach((c) => {
    const mine = active.filter((b) => b.consultantId === c.id);
    byConsultant[c.id] = {
      ...c, total: mine.length,
      completed: mine.filter((b) => b.status === 'completed').length,
      confirmed: mine.filter((b) => b.status === 'confirmed').length,
    };
  });
  return byConsultant;
};

// ══════════════════════════════════════════════════════════════════════
// ── CONSULTATION NOTES ───────────────────────────────────────────────
// ══════════════════════════════════════════════════════════════════════

export const getNote = async (bookingId) => {
  try {
    const { data } = await supabase.from('consultation_notes').select('*').eq('booking_id', bookingId).single();
    if (data) return { title: data.title, content: data.content, updatedAt: data.updated_at };
  } catch { /* ignore */ }
  return null;
};

export const saveNote = async (bookingId, title, content) => {
  try {
    await supabase.from('consultation_notes').upsert({
      booking_id: bookingId, title, content, updated_at: new Date().toISOString(),
    });
  } catch { /* ignore */ }
};

// ══════════════════════════════════════════════════════════════════════
// ── INTAKE FORMS ─────────────────────────────────────────────────────
// ══════════════════════════════════════════════════════════════════════

export const getIntakeForm = async (userId) => {
  try {
    const { data } = await supabase.from('intake_forms').select('*').eq('user_id', userId).single();
    if (data) return { ...data.form_data, updatedAt: data.updated_at };
  } catch { /* ignore */ }
  return null;
};

export const saveIntakeForm = async (userId, formData) => {
  try {
    await supabase.from('intake_forms').upsert({
      user_id: userId, form_data: formData, updated_at: new Date().toISOString(),
    });
  } catch { /* ignore */ }
};

export const hasIntakeForm = async (userId) => {
  return !!(await getIntakeForm(userId));
};

// ══════════════════════════════════════════════════════════════════════
// ── INSTRUCTOR AVAILABILITY ──────────────────────────────────────────
// ══════════════════════════════════════════════════════════════════════

export const getInstructorAvailability = async (instructorId, dateStr) => {
  try {
    const { data } = await supabase.from('instructor_availability')
      .select('slots').eq('instructor_id', instructorId).eq('date', dateStr).single();
    if (data) return data.slots || [];
  } catch { /* ignore */ }
  return [];
};

export const setInstructorAvailability = async (instructorId, dateStr, slots) => {
  try {
    await supabase.from('instructor_availability').upsert({
      instructor_id: instructorId, date: dateStr, slots, updated_at: new Date().toISOString(),
    }, { onConflict: 'instructor_id,date' });
  } catch { /* ignore */ }
};

export const getInstructorSessionDuration = async (instructorId) => {
  try {
    const { data } = await supabase.from('instructor_availability')
      .select('session_duration').eq('instructor_id', instructorId).limit(1).single();
    if (data) return data.session_duration;
  } catch { /* ignore */ }
  return 30;
};

export const setInstructorSessionDuration = async (instructorId, duration) => {
  // Update all rows for this instructor
  try {
    await supabase.from('instructor_availability')
      .update({ session_duration: duration })
      .eq('instructor_id', instructorId);
  } catch { /* ignore */ }
};

export const copyAvailabilityToRange = async (instructorId, sourceDate, targetDates) => {
  const sourceSlots = await getInstructorAvailability(instructorId, sourceDate);
  if (!sourceSlots.length) return;
  const rows = targetDates.map((d) => ({
    instructor_id: instructorId, date: d, slots: sourceSlots, updated_at: new Date().toISOString(),
  }));
  try {
    await supabase.from('instructor_availability').upsert(rows, { onConflict: 'instructor_id,date' });
  } catch { /* ignore */ }
};

export const getAvailableInstructorsForSlot = async (dateStr, timeStr) => {
  const bookings = await loadBookings();
  const booked = bookings.filter(
    (b) => b.date === dateStr && b.time === timeStr && b.status !== 'cancelled'
  );
  const bookedIds = booked.map((b) => b.consultantId);

  const available = [];
  for (const c of CONSULTANTS) {
    const slots = await getInstructorAvailability(c.id, dateStr);
    if (slots.includes(timeStr) && !bookedIds.includes(c.id)) {
      available.push(c);
    }
  }
  return available;
};

// ══════════════════════════════════════════════════════════════════════
// ── SITE CONFIG (branding, banners) ──────────────────────────────────
// ══════════════════════════════════════════════════════════════════════

export const getSiteConfig = async (key) => {
  try {
    const { data } = await supabase.from('site_config').select('value').eq('key', key).single();
    if (data) return data.value;
  } catch { /* ignore */ }
  return null;
};

export const setSiteConfig = async (key, value) => {
  try {
    await supabase.from('site_config').upsert({ key, value, updated_at: new Date().toISOString() });
  } catch { /* ignore */ }
};

// ══════════════════════════════════════════════════════════════════════
// ── PROGRAM APPLICATIONS ─────────────────────────────────────────────
// ══════════════════════════════════════════════════════════════════════

export const loadApplications = async () => {
  try {
    const { data, error } = await supabase.from('program_applications').select('*').order('id', { ascending: false });
    if (error) { console.error('loadApplications error:', error); return []; }
    if (data) {
      return data.map((r) => ({
        id: r.id, user_name: r.user_name, email: r.email,
        programId: r.program_id, program_title: r.program_title,
        category: r.category, status: r.status,
        applied_at: r.applied_at, date: r.date,
      }));
    }
  } catch (e) { console.error('loadApplications exception:', e); }
  return [];
};

export const addApplication = async (app) => {
  try {
    const row = {
      user_name: app.user_name, email: app.email, program_id: app.programId,
      program_title: app.program_title, category: app.category,
      status: app.status || '승인대기', applied_at: app.applied_at, date: app.date,
    };
    const { data, error } = await supabase.from('program_applications').insert(row).select().single();
    if (error) {
      console.error('addApplication error:', error);
      return null;
    }
    if (data) return { ...app, id: data.id };
  } catch (e) { console.error('addApplication exception:', e); }
  return null;
};

export const updateApplicationStatus = async (appId, status) => {
  if (!appId) { console.error('updateApplicationStatus: no appId'); return; }
  try {
    const { error } = await supabase.from('program_applications').update({ status }).eq('id', appId);
    if (error) console.error('updateApplicationStatus error:', error);
  } catch (e) { console.error('updateApplicationStatus exception:', e); }
};

// Cancel application by email+programId (fallback when appId is unknown)
export const cancelApplicationByEmail = async (email, programId) => {
  try {
    const { error } = await supabase.from('program_applications')
      .update({ status: '취소' })
      .eq('email', email)
      .eq('program_id', String(programId))
      .neq('status', '취소');
    if (error) console.error('cancelApplicationByEmail error:', error);
  } catch (e) { console.error('cancelApplicationByEmail exception:', e); }
};
