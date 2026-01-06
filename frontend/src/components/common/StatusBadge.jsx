import React from 'react';
import { Chip } from '@mui/material';
import { statusColors } from '../../styles/theme';

const StatusBadge = ({ status, size = 'small' }) => {
  const colors = statusColors[status] || { bg: '#F3F4F6', text: '#6B7280' };

  return (
    <Chip
      label={status}
      size={size}
      sx={{
        backgroundColor: colors.bg,
        color: colors.text,
        fontWeight: 500,
        fontSize: size === 'small' ? '0.75rem' : '0.8125rem',
        height: size === 'small' ? 24 : 28,
      }}
    />
  );
};

export default StatusBadge;
