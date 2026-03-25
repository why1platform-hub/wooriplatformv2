/**
 * Shared site configuration (branding, logo).
 * Admin can override via Settings page → saved to localStorage.
 * Default values here serve as fallback for new devices.
 *
 * To update defaults (reflected on all devices): edit DEFAULT_BRANDING below.
 */

const BRANDING_KEY = 'woori_site_branding';
const LOGO_KEY = 'woori_site_logo';

// ── Edit these defaults to change what all devices see ──
export const DEFAULT_BRANDING = {
  title_ko: '우리은행 퇴직 컨시어지 서비스',
  title_en: 'Woori Bank Retirement Concierge Service',
  title_short_ko: '퇴직 컨시어지',
  title_short_en: 'Retirement Concierge',
};

export const loadBranding = () => {
  try {
    const saved = localStorage.getItem(BRANDING_KEY);
    if (saved) return { ...DEFAULT_BRANDING, ...JSON.parse(saved) };
  } catch { /* ignore */ }
  return DEFAULT_BRANDING;
};

export const saveBranding = (data) => {
  localStorage.setItem(BRANDING_KEY, JSON.stringify(data));
};

export const getSiteTitle = (lang = 'ko', mobile = false) => {
  const b = loadBranding();
  if (lang === 'en') return mobile ? b.title_short_en : b.title_en;
  return mobile ? b.title_short_ko : b.title_ko;
};

export const loadLogo = () => {
  try {
    const saved = localStorage.getItem(LOGO_KEY);
    if (saved) return JSON.parse(saved);
  } catch { /* ignore */ }
  return null;
};
