import React from 'react';
import { Chip } from '@mui/material';
import { categoryColors } from '../../styles/theme';

const CategoryBadge = ({ category, size = 'small' }) => {
  const color = categoryColors[category] || '#6B7280';

  return (
    <Chip
      label={category}
      size={size}
      sx={{
        backgroundColor: color,
        color: '#FFFFFF',
        fontWeight: 500,
        fontSize: size === 'small' ? '0.75rem' : '0.8125rem',
        height: size === 'small' ? 24 : 28,
      }}
    />
  );
};

export default CategoryBadge;
