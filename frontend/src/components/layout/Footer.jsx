import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, Link } from '@mui/material';

const Footer = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const currentYear = new Date().getFullYear();

  return (
    <Box
      component="footer"
      sx={{
        backgroundColor: '#1A1A2E',
        color: 'rgba(255,255,255,0.7)',
        mt: 'auto',
      }}
    >
      <Box sx={{
        maxWidth: 1280, mx: 'auto',
        px: { xs: 2, sm: 3, md: 4 },
        py: { xs: 3, md: 4 },
      }}>
        <Box sx={{
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          justifyContent: 'space-between',
          gap: { xs: 2.5, md: 4 },
        }}>
          {/* Left - Logo & Info */}
          <Box>
            <Typography sx={{ color: '#fff', fontWeight: 800, fontSize: '1rem', mb: 1.5, letterSpacing: '-0.3px' }}>
              우리은행 퇴직자 통합지원 플랫폼
            </Typography>
            <Typography variant="caption" sx={{ display: 'block', lineHeight: 1.8, color: 'rgba(255,255,255,0.5)', fontSize: '0.75rem' }}>
              {t('footer.address')}: 서울시 중구 소공로 51
              <br />
              {t('footer.contact')}: 070-737-8600 | Email: support@woori.com
            </Typography>
          </Box>

          {/* Right - Links */}
          <Box sx={{ display: 'flex', gap: { xs: 2, sm: 4 }, flexShrink: 0 }}>
            <Link
              component="button"
              underline="hover"
              onClick={() => navigate('/policy/privacy')}
              sx={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.6)', fontWeight: 500, '&:hover': { color: '#fff' }, background: 'none', border: 'none', cursor: 'pointer' }}
            >
              {t('footer.privacyPolicy')}
            </Link>
            <Link
              component="button"
              underline="hover"
              onClick={() => navigate('/policy/terms')}
              sx={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.6)', fontWeight: 500, '&:hover': { color: '#fff' }, background: 'none', border: 'none', cursor: 'pointer' }}
            >
              {t('footer.termsOfService')}
            </Link>
          </Box>
        </Box>

        <Box sx={{ borderTop: '1px solid rgba(255,255,255,0.08)', mt: 2.5, pt: 2 }}>
          <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.7rem' }}>
            {t('footer.copyright', { year: currentYear })}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default Footer;
