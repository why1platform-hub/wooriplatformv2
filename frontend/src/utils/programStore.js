/**
 * Program data store — Supabase-backed.
 * Programs and applications both go to Supabase.
 */

import { supabase } from './supabase';

// ── Programs ──

export const loadPrograms = async () => {
  try {
    const { data, error } = await supabase.from('programs').select('*').order('id');
    if (!error && data) return data;
  } catch { /* fallback */ }
  // Fallback to localStorage
  try {
    const saved = localStorage.getItem('woori_programs');
    if (saved) return JSON.parse(saved);
  } catch { /* ignore */ }
  return [];
};

export const savePrograms = async (programs) => {
  // Batch upsert to Supabase
  try {
    for (const p of programs) {
      await supabase.from('programs').upsert(p);
    }
  } catch { /* ignore */ }
};

export const getProgramById = async (id) => {
  try {
    const { data } = await supabase.from('programs').select('*').eq('id', Number(id)).single();
    if (data) return data;
  } catch { /* fallback */ }
  // Fallback
  const programs = await loadPrograms();
  return programs.find((p) => String(p.id) === String(id)) || null;
};

export const addProgram = async (program) => {
  try {
    const { data } = await supabase.from('programs').insert(program).select().single();
    if (data) return data;
  } catch { /* ignore */ }
  return null;
};

export const updateProgram = async (id, updates) => {
  try {
    await supabase.from('programs').update(updates).eq('id', id);
  } catch { /* ignore */ }
};

export const deleteProgram = async (id) => {
  try {
    await supabase.from('programs').delete().eq('id', id);
  } catch { /* ignore */ }
};

// ── Applications (already in consultationStore for Supabase) ──
// Re-export from consultationStore for backward compat
export { loadApplications, addApplication, updateApplicationStatus } from './consultationStore';

// Sync programs.applicants column with real count from program_applications
export const syncProgramApplicants = async (programId) => {
  try {
    const { data } = await supabase
      .from('program_applications')
      .select('id, status')
      .eq('program_id', String(programId));
    const activeCount = (data || []).filter((r) => r.status !== '취소' && r.status !== '반려').length;
    await supabase.from('programs').update({ applicants: activeCount }).eq('id', Number(programId));
  } catch (e) { console.error('syncProgramApplicants error:', e); }
};

// Sync helpers for components that need sync access (Dashboard)
export const loadProgramsSync = () => {
  try {
    const saved = localStorage.getItem('woori_programs');
    if (saved) return JSON.parse(saved);
  } catch { /* ignore */ }
  return [];
};

// Keep programs cached in localStorage for sync access
export const cachePrograms = (programs) => {
  localStorage.setItem('woori_programs', JSON.stringify(programs));
};
