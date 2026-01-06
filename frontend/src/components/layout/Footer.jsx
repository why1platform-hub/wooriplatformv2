import React from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Typography, Link, Container } from '@mui/material';

const Footer = () => {
  const { t } = useTranslation();
  const currentYear = new Date().getFullYear();

  return (
    <Box
      component="footer"
      sx={{
        backgroundColor: '#F8F9FA',
        borderTop: '1px solid #E5E5E5',
        py: 3,
        mt: 'auto',
      }}
    >
      <Container maxWidth="lg">
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            justifyContent: 'space-between',
            alignItems: { xs: 'flex-start', md: 'center' },
            gap: 2,
          }}
        >
          <Box>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mb: 0.5 }}
            >
              {t('footer.copyright', { year: currentYear })}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {t('footer.contact')}: 070-737-8600 | {t('footer.address')}: 서울시 중구 소공로 51
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', gap: 3 }}>
            <Link
              href="/privacy"
              color="text.secondary"
              underline="hover"
              sx={{ fontSize: '0.75rem' }}
            >
              {t('footer.privacyPolicy')}
            </Link>
            <Link
              href="/terms"
              color="text.secondary"
              underline="hover"
              sx={{ fontSize: '0.75rem' }}
            >
              {t('footer.termsOfService')}
            </Link>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;
