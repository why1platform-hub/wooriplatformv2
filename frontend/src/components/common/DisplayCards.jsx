import React from 'react';
import { Box, Paper, Typography } from '@mui/material';

const DisplayCards = ({ cards = [] }) => (
  <Box
    sx={{
      display: 'grid',
      gridTemplateAreas: '"stack"',
      placeItems: 'center',
      p: { xs: 2, md: 4 },
    }}
  >
    {cards.map((card, i) => (
      <Paper
        key={i}
        elevation={0}
        sx={{
          gridArea: 'stack',
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          gap: 0.5,
          p: { xs: 2, md: 2.5 },
          width: { xs: 220, sm: 260, md: 300 },
          borderRadius: '12px',
          border: '1px solid',
          borderColor: 'divider',
          bgcolor: '#fff',
          cursor: 'pointer',
          transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
          overflow: 'hidden',
          ...card.sx,
          // Grayscale overlay (before pseudo-element)
          ...(card.hasOverlay !== false && i < cards.length - 1
            ? {
                filter: 'grayscale(100%)',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  inset: 0,
                  borderRadius: '12px',
                  bgcolor: 'rgba(255,255,255,0.5)',
                  backdropFilter: 'blur(0.5px)',
                  transition: 'opacity 0.7s ease',
                  zIndex: 1,
                  pointerEvents: 'none',
                },
                '&:hover': {
                  filter: 'grayscale(0%)',
                  '&::before': { opacity: 0 },
                  ...card.hoverSx,
                },
              }
            : {
                '&:hover': card.hoverSx || {},
              }),
        }}
      >
        {/* Icon */}
        {card.icon && (
          <Box
            sx={{
              width: 32,
              height: 32,
              borderRadius: '8px',
              bgcolor: card.iconBg || '#EBF0FA',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: card.iconColor || '#0047BA',
              mb: 0.5,
              zIndex: 2,
            }}
          >
            {card.icon}
          </Box>
        )}

        {/* Title */}
        <Typography
          sx={{
            fontWeight: 700,
            fontSize: { xs: '0.85rem', md: '0.95rem' },
            color: card.titleColor || '#1a1a1a',
            zIndex: 2,
          }}
        >
          {card.title}
        </Typography>

        {/* Description */}
        {card.description && (
          <Typography
            sx={{
              fontSize: { xs: '0.72rem', md: '0.78rem' },
              color: '#888',
              lineHeight: 1.4,
              zIndex: 2,
            }}
          >
            {card.description}
          </Typography>
        )}

        {/* Date / Meta */}
        {card.date && (
          <Typography
            sx={{
              fontSize: '0.68rem',
              color: '#bbb',
              mt: 'auto',
              pt: 0.5,
              zIndex: 2,
            }}
          >
            {card.date}
          </Typography>
        )}
      </Paper>
    ))}
  </Box>
);

export default DisplayCards;
