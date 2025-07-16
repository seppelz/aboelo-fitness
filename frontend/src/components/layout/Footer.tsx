import React from 'react';
import { Box, Container, Typography, Link, useTheme } from '@mui/material';

const Footer: React.FC = () => {
  const theme = useTheme();
  const currentYear = new Date().getFullYear();

  return (
    <Box 
      component="footer" 
      sx={{ 
        py: 3, 
        px: 2, 
        mt: 'auto', 
        backgroundColor: theme.palette.primary.main,
        color: '#fff'
      }}
    >
      <Container maxWidth="lg">
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 2
          }}
        >
          <Typography 
            variant="h6" 
            align="center"
            sx={{ fontSize: '1.3rem', fontWeight: 'bold' }}
          >
            aboelo-fitness
          </Typography>
          
          <Typography 
            variant="body1" 
            align="center"
            sx={{ fontSize: '1.1rem' }}
          >
            Fitness für Senioren
          </Typography>

          <Typography 
            variant="body2" 
            align="center"
            sx={{ fontSize: '1rem' }}
          >
            © {currentYear} aboelo-fitness
          </Typography>
        </Box>

        <Box 
          sx={{ 
            display: 'flex', 
            justifyContent: 'center',
            flexWrap: 'wrap', 
            mt: 2,
            gap: { xs: 2, sm: 4 }
          }}
        >
          <Link 
            href="#" 
            color="inherit" 
            underline="hover"
            sx={{ fontSize: '1.1rem' }}
          >
            Datenschutz
          </Link>
          <Link 
            href="#" 
            color="inherit" 
            underline="hover"
            sx={{ fontSize: '1.1rem' }}
          >
            Impressum
          </Link>
          <Link 
            href="#" 
            color="inherit" 
            underline="hover"
            sx={{ fontSize: '1.1rem' }}
          >
            Kontakt
          </Link>
          <Link 
            href="#" 
            color="inherit" 
            underline="hover"
            sx={{ fontSize: '1.1rem' }}
          >
            Hilfe
          </Link>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;
