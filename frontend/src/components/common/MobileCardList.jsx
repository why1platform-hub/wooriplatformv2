import React from 'react';
import { Box, Typography, Chip, useMediaQuery, useTheme } from '@mui/material';

/**
 * A responsive data row that shows as a horizontal table row on desktop
 * and as a vertical card on mobile.
 *
 * fields: [{ label, value, align, flex }]
 * actions: React node for action buttons
 * highlight: optional color for left border accent
 */
const MobileCardItem = ({ fields, actions, highlight, onClick, sx }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  if (!isMobile) return null; // Desktop uses normal table

  return (
    <Box
      onClick={onClick}
      sx={{
        p: 2, mb: 1.5, borderRadius: '10px',
        border: '1px solid #E5E7EB',
        borderLeft: highlight ? `4px solid ${highlight}` : '1px solid #E5E7EB',
        bgcolor: '#fff',
        cursor: onClick ? 'pointer' : 'default',
        '&:hover': onClick ? { boxShadow: '0 2px 8px rgba(0,0,0,0.06)' } : {},
        ...sx,
      }}
    >
      {fields.map((f, i) => (
        f.value !== undefined && f.value !== null && f.value !== '' && (
          <Box key={i} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: i < fields.length - 1 ? 0.8 : 0 }}>
            <Typography variant="caption" color="text.secondary" sx={{ minWidth: 70, fontWeight: 500 }}>
              {f.label}
            </Typography>
            <Box sx={{ flex: 1, textAlign: 'right' }}>
              {typeof f.value === 'string' || typeof f.value === 'number' ? (
                <Typography variant="body2" fontWeight={f.bold ? 600 : 400} sx={{ color: f.color || 'text.primary' }}>
                  {f.value}
                </Typography>
              ) : f.value}
            </Box>
          </Box>
        )
      ))}
      {actions && (
        <Box sx={{ display: 'flex', gap: 0.5, mt: 1.5, pt: 1.5, borderTop: '1px solid #F3F4F6', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
          {actions}
        </Box>
      )}
    </Box>
  );
};

export default MobileCardItem;
