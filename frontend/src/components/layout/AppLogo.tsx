import React from 'react';
import { Box, Stack, Typography } from '@mui/material';

interface AppLogoProps {
  compact?: boolean;
}

const AppLogo: React.FC<AppLogoProps> = ({ compact = false }) => {
  const size = compact ? 40 : 48;
  const fontSize = compact ? '0.95rem' : '1.1rem';

  return (
    <Stack direction="row" alignItems="center" spacing={1.5} sx={{ userSelect: 'none' }}>
      <Box
        sx={{
          width: size,
          height: size,
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #ff8a65 0%, #2d7d7d 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#ffffff',
          fontWeight: 700,
          fontSize: compact ? '1.1rem' : '1.35rem',
          boxShadow: '0 6px 12px rgba(45, 125, 125, 0.25)',
        }}
      >
        A
      </Box>
      <Box>
        <Typography
          variant={compact ? 'h6' : 'h5'}
          sx={{
            fontWeight: 700,
            letterSpacing: 0.5,
            color: '#ffffff',
            lineHeight: 1,
          }}
        >
          aboelo Fitness
        </Typography>
        {!compact && (
          <Typography
            variant="caption"
            sx={{
              display: 'block',
              color: 'rgba(255,255,255,0.85)',
              letterSpacing: 1.2,
              textTransform: 'uppercase',
              fontWeight: 600,
              fontSize,
            }}
          >
            Aktivpausen &amp; Vitalität
          </Typography>
        )}
      </Box>
    </Stack>
  );
};

export default AppLogo;
