/**
 * Site configuration — reads from Supabase, falls back to defaults.
 * Caches in memory for synchronous access after first load.
 */

import { supabase } from './supabase';

export const DEFAULT_BRANDING = {
  title_ko: '우리은행 퇴직 컨시어지 서비스',
  title_en: 'Woori Bank Retirement Concierge Service',
  title_short_ko: '퇴직 컨시어지',
  title_short_en: 'Retirement Concierge',
};

// In-memory cache for synchronous access
let _brandingCache = { ...DEFAULT_BRANDING };
let _loaded = false;

// Load branding from Supabase (call once on app init)
export const initBranding = async () => {
  try {
    const { data } = await supabase.from('site_config').select('value').eq('key', 'branding').single();
    if (data?.value) {
      _brandingCache = { ...DEFAULT_BRANDING, ...data.value };
      _loaded = true;
    }
  } catch { /* use defaults */ }
  return _brandingCache;
};

// Synchronous getter (uses cache)
export const loadBranding = () => _brandingCache;

export const getSiteTitle = (lang = 'ko', mobile = false) => {
  const b = _brandingCache;
  if (lang === 'en') return mobile ? b.title_short_en : b.title_en;
  return mobile ? b.title_short_ko : b.title_ko;
};

// Save branding to Supabase + update cache
export const saveBranding = async (data) => {
  _brandingCache = { ...DEFAULT_BRANDING, ...data };
  try {
    await supabase.from('site_config').upsert({
      key: 'branding', value: data, updated_at: new Date().toISOString(),
    });
  } catch { /* ignore */ }
};

export const loadLogo = () => {
  try {
    const saved = localStorage.getItem('woori_site_logo');
    if (saved) return JSON.parse(saved);
  } catch { /* ignore */ }
  return null;
};

export const isBrandingLoaded = () => _loaded;
