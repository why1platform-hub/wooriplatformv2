import React from 'react';
import { useTranslation } from 'react-i18next';
import { ToggleButton, ToggleButtonGroup, Box } from '@mui/material';

const LanguageToggle = () => {
  const { i18n } = useTranslation();

  const handleLanguageChange = (event, newLanguage) => {
    if (newLanguage !== null) {
      i18n.changeLanguage(newLanguage);
      localStorage.setItem('language', newLanguage);
    }
  };

  return (
    <Box sx={{ display: 'flex', alignItems: 'center' }}>
      <ToggleButtonGroup
        value={i18n.language}
        exclusive
        onChange={handleLanguageChange}
        size="small"
        sx={{
          '& .MuiToggleButton-root': {
            px: 1.5,
            py: 0.5,
            fontSize: '0.75rem',
            fontWeight: 500,
            border: '1px solid #E5E5E5',
            '&.Mui-selected': {
              backgroundColor: '#0047BA',
              color: '#FFFFFF',
              '&:hover': {
                backgroundColor: '#003399',
              },
            },
          },
        }}
      >
        <ToggleButton value="ko" aria-label="Korean">
          KO
        </ToggleButton>
        <ToggleButton value="en" aria-label="English">
          EN
        </ToggleButton>
      </ToggleButtonGroup>
    </Box>
  );
};

export default LanguageToggle;
