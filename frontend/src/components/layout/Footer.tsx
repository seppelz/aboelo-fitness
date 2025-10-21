import React, { useState } from 'react';
import { Box, Container, Typography, Link, useTheme, Button } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import InstallMobileIcon from '@mui/icons-material/InstallMobile';
import { useInstallPromptContext } from '../../contexts/InstallPromptContext';

const Footer: React.FC = () => {
  const theme = useTheme();
  const currentYear = new Date().getFullYear();
  const { canInstall, promptInstall, isInstalled } = useInstallPromptContext();
  const [installing, setInstalling] = useState(false);

  const handleInstall = async () => {
    if (!canInstall || installing) {
      return;
    }
    setInstalling(true);
    try {
      await promptInstall();
    } catch (error) {
      console.error('[PWA] Footer install prompt failed', error);
    } finally {
      setInstalling(false);
    }
  };

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
            flexDirection: { xs: 'column', md: 'row' },
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

          {canInstall && !isInstalled && (
            <Button
              variant="contained"
              color="secondary"
              onClick={handleInstall}
              startIcon={<InstallMobileIcon />}
              disabled={installing}
              sx={{ fontWeight: 600 }}
            >
              App installieren
            </Button>
          )}

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
            component={RouterLink}
            to="/datenschutz"
            color="inherit" 
            underline="hover"
            sx={{ fontSize: '1.1rem' }}
          >
            Datenschutz
          </Link>
          <Link 
            component={RouterLink}
            to="/impressum"
            color="inherit" 
            underline="hover"
            sx={{ fontSize: '1.1rem' }}
          >
            Impressum
          </Link>
          <Link 
            component={RouterLink}
            to="/kontakt"
            color="inherit" 
            underline="hover"
            sx={{ fontSize: '1.1rem' }}
          >
            Kontakt
          </Link>
          <Link 
            component={RouterLink}
            to="/help"
            color="inherit" 
            underline="hover"
            sx={{ fontSize: '1.1rem' }}
          >
            Hilfe
          </Link>
          <Link 
            component={RouterLink}
            to="/barrierefreiheit"
            color="inherit" 
            underline="hover"
            sx={{ fontSize: '1.1rem' }}
          >
            Barrierefreiheit
          </Link>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;
