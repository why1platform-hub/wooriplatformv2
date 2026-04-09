/**
 * Support data store — Supabase-backed.
 * Announcements, FAQ, and Inquiries all go to Supabase.
 */

import { supabase } from './supabase';

// ══════════════════════════════════════════════
// ANNOUNCEMENTS
// ══════════════════════════════════════════════

export const loadAnnouncements = async () => {
  try {
    const { data, error } = await supabase.from('announcements').select('*').order('id', { ascending: false });
    if (!error && data && data.length > 0) return data;
  } catch { /* fallback */ }
  try {
    const saved = localStorage.getItem('woori_announcements');
    if (saved) return JSON.parse(saved);
  } catch { /* ignore */ }
  return [];
};

export const loadPublishedAnnouncements = async () => {
  try {
    const { data, error } = await supabase.from('announcements').select('*').eq('status', '게시').order('id', { ascending: false });
    if (!error && data) return data;
  } catch { /* fallback */ }
  try {
    const saved = localStorage.getItem('woori_announcements');
    if (saved) return JSON.parse(saved).filter((a) => a.status === '게시' || a.status === '게시중');
  } catch { /* ignore */ }
  return [];
};

export const saveAnnouncement = async (announcement) => {
  try {
    const { data } = await supabase.from('announcements').upsert(announcement).select().single();
    if (data) return data;
  } catch { /* ignore */ }
  return announcement;
};

export const addAnnouncement = async (announcement) => {
  try {
    const { data } = await supabase.from('announcements').insert(announcement).select().single();
    if (data) return data;
  } catch { /* ignore */ }
  return null;
};

export const updateAnnouncement = async (id, updates) => {
  try {
    await supabase.from('announcements').update(updates).eq('id', id);
  } catch { /* ignore */ }
};

export const deleteAnnouncement = async (id) => {
  try {
    await supabase.from('announcements').delete().eq('id', id);
  } catch { /* ignore */ }
};

export const saveAnnouncementsBatch = async (announcements) => {
  try {
    for (const a of announcements) {
      await supabase.from('announcements').upsert(a);
    }
  } catch { /* ignore */ }
};

// ══════════════════════════════════════════════
// FAQ
// ══════════════════════════════════════════════

export const loadFAQs = async () => {
  try {
    const { data, error } = await supabase.from('faq').select('*').order('id');
    if (!error && data && data.length > 0) return data;
  } catch { /* fallback */ }
  return [];
};

export const addFAQ = async (faq) => {
  try {
    const { data } = await supabase.from('faq').insert(faq).select().single();
    if (data) return data;
  } catch { /* ignore */ }
  return null;
};

export const updateFAQ = async (id, updates) => {
  try {
    await supabase.from('faq').update(updates).eq('id', id);
  } catch { /* ignore */ }
};

export const deleteFAQ = async (id) => {
  try {
    await supabase.from('faq').delete().eq('id', id);
  } catch { /* ignore */ }
};

export const saveFAQsBatch = async (faqs) => {
  try {
    for (const f of faqs) {
      await supabase.from('faq').upsert(f);
    }
  } catch { /* ignore */ }
};

// ══════════════════════════════════════════════
// INQUIRIES
// ══════════════════════════════════════════════

export const loadInquiries = async () => {
  try {
    const { data, error } = await supabase.from('inquiries').select('*').order('id', { ascending: false });
    if (!error && data) return data;
  } catch { /* fallback */ }
  try {
    const saved = localStorage.getItem('woori_inquiries');
    if (saved) return JSON.parse(saved);
  } catch { /* ignore */ }
  return [];
};

export const addInquiry = async (inquiry) => {
  try {
    const { data } = await supabase.from('inquiries').insert(inquiry).select().single();
    if (data) return data;
  } catch { /* ignore */ }
  return null;
};

export const updateInquiry = async (id, updates) => {
  try {
    await supabase.from('inquiries').update(updates).eq('id', id);
  } catch { /* ignore */ }
};

export const deleteInquiry = async (id) => {
  try {
    await supabase.from('inquiries').delete().eq('id', id);
  } catch { /* ignore */ }
};
