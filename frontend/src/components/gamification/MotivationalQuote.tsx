import React from 'react';
import { Box, Typography, Card, CardContent, useTheme } from '@mui/material';
import FormatQuoteIcon from '@mui/icons-material/FormatQuote';

interface MotivationalQuoteProps {
  quote: string;
  variant?: 'card' | 'inline';
}

const MotivationalQuote: React.FC<MotivationalQuoteProps> = ({ 
  quote, 
  variant = 'card' 
}) => {
  const theme = useTheme();

  if (variant === 'inline') {
    return (
      <Box 
        sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 1,
          p: 2,
          borderRadius: 2,
          background: `linear-gradient(135deg, ${theme.palette.primary.light}20 0%, ${theme.palette.secondary.light}20 100%)`,
          border: `1px solid ${theme.palette.primary.light}30`
        }}
      >
        <FormatQuoteIcon sx={{ color: theme.palette.primary.main, opacity: 0.7 }} />
        <Typography 
          variant="body2" 
          sx={{ 
            fontStyle: 'italic',
            color: theme.palette.text.secondary,
            flex: 1
          }}
        >
          {quote}
        </Typography>
      </Box>
    );
  }

  return (
    <Card
      sx={{
        background: `linear-gradient(135deg, ${theme.palette.primary.main}15 0%, ${theme.palette.secondary.main}15 100%)`,
        border: `1px solid ${theme.palette.primary.main}30`,
        borderRadius: 3,
        position: 'relative',
        overflow: 'visible'
      }}
    >
      <CardContent sx={{ p: 3, position: 'relative' }}>
        <FormatQuoteIcon 
          sx={{ 
            position: 'absolute',
            top: -8,
            left: 16,
            fontSize: 24,
            color: theme.palette.primary.main,
            backgroundColor: theme.palette.background.paper,
            borderRadius: '50%',
            p: 0.5
          }} 
        />
        
        <Typography 
          variant="h6" 
          sx={{ 
            fontStyle: 'italic',
            textAlign: 'center',
            fontWeight: 500,
            color: theme.palette.text.primary,
            mt: 1
          }}
        >
          {quote}
        </Typography>
        
        <Box 
          sx={{ 
            display: 'flex', 
            justifyContent: 'center', 
            mt: 2 
          }}
        >
          <Typography 
            variant="caption" 
            sx={{ 
              color: theme.palette.text.secondary,
              textTransform: 'uppercase',
              letterSpacing: 1,
              fontWeight: 600
            }}
          >
            Tägliche Motivation
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

export default MotivationalQuote; 