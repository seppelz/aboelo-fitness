import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  AppBar, 
  Box, 
  Toolbar, 
  IconButton, 
  Typography, 
  Menu, 
  Container, 
  Button, 
  MenuItem,
  Divider,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import HomeIcon from '@mui/icons-material/Home';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import BarChartIcon from '@mui/icons-material/BarChart';
import SettingsIcon from '@mui/icons-material/Settings';
import PersonIcon from '@mui/icons-material/Person';
import LogoutIcon from '@mui/icons-material/Logout';
import HelpIcon from '@mui/icons-material/Help';
import InstallMobileIcon from '@mui/icons-material/InstallMobile';
import { useContext } from 'react';
import { AuthContext } from '../../contexts/AuthContext';
import { useInstallPromptContext } from '../../contexts/InstallPromptContext';
import AppLogo from './AppLogo';

// Navigationslinks für eingeloggte Nutzer
const baseNavItems = [
  { name: 'Startseite', path: '/app', icon: <HomeIcon fontSize="large" /> },
  { name: 'Übungen', path: '/app/exercises', icon: <FitnessCenterIcon fontSize="large" /> },
  { name: 'Fortschritt', path: '/app/progress', icon: <BarChartIcon fontSize="large" /> },
  { name: 'Hilfe', path: '/app/help', icon: <HelpIcon fontSize="large" /> },
  { name: 'Einstellungen', path: '/app/settings', icon: <SettingsIcon fontSize="large" /> },
];

const Navigation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout, isAdmin } = useContext(AuthContext);
  const { canInstall, promptInstall, isInstalled } = useInstallPromptContext();

  const appNavItems = React.useMemo(() => {
    if (!isAdmin) {
      return baseNavItems;
    }
    return [
      ...baseNavItems.slice(0, 3),
      { name: 'Admin', path: '/app/admin', icon: <BarChartIcon fontSize="large" /> },
      ...baseNavItems.slice(3),
    ];
  }, [isAdmin]);
  
  const [anchorElNav, setAnchorElNav] = useState<null | HTMLElement>(null);
  const [anchorElUser, setAnchorElUser] = useState<null | HTMLElement>(null);
  const [installing, setInstalling] = useState(false);

  const handleOpenNavMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElNav(event.currentTarget);
  };

  const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseNavMenu = () => {
    setAnchorElNav(null);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  const handleNavigation = (path: string) => {
    navigate(path);
    handleCloseNavMenu();
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
    handleCloseUserMenu();
  };

  const handleInstallClick = async () => {
    if (!canInstall || installing) {
      return;
    }
    setInstalling(true);
    try {
      await promptInstall();
    } catch (error) {
      console.error('[PWA] Install prompt failed', error);
    } finally {
      setInstalling(false);
      handleCloseNavMenu();
    }
  };

  return (
    <AppBar
      position="static"
      sx={{
        mb: 3,
        background: 'linear-gradient(135deg, #1f5f5f 0%, #2d7d7d 40%, #3fa3a3 100%)',
        boxShadow: '0 8px 18px rgba(31, 95, 95, 0.35)',
      }}
    >
      <Container maxWidth="xl">
        <Toolbar disableGutters sx={{ minHeight: { xs: 70, md: 88 } }}>
          {/* Mobile Navigation */}
          <Box sx={{ display: { xs: 'flex', md: 'none' }, alignItems: 'center', gap: 1 }}>
            <IconButton
              size="large"
              aria-label="Navigationsmenü"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleOpenNavMenu}
              color="inherit"
            >
              <MenuIcon fontSize="large" />
            </IconButton>
            <AppLogo compact />
          </Box>

          <Menu
            id="menu-appbar"
            anchorEl={anchorElNav}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'left',
            }}
            keepMounted
            transformOrigin={{
              vertical: 'top',
              horizontal: 'left',
            }}
            open={Boolean(anchorElNav)}
            onClose={handleCloseNavMenu}
            sx={{ display: { xs: 'block', md: 'none' } }}
          >
            {user ? (
              appNavItems.map((item) => (
                <MenuItem key={item.path} onClick={() => handleNavigation(item.path)}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {item.icon}
                    <Typography textAlign="center">{item.name}</Typography>
                  </Box>
                </MenuItem>
              ))
            ) : (
              <>
                <MenuItem onClick={() => handleNavigation('/willkommen')}>
                  <Typography textAlign="center">Willkommen</Typography>
                </MenuItem>
                <MenuItem onClick={() => { navigate('/login'); handleCloseNavMenu(); }}>
                  <Typography textAlign="center">Anmelden</Typography>
                </MenuItem>
                <MenuItem onClick={() => { navigate('/register'); handleCloseNavMenu(); }}>
                  <Typography textAlign="center">Registrieren</Typography>
                </MenuItem>
              </>
            )}
          </Menu>

          {/* Logo für große Bildschirme */}
          <Box sx={{ mr: 3, display: { xs: 'none', md: 'flex' } }}>
            <AppLogo />
          </Box>

          {/* Desktop Navigation */}
          <Box
            sx={{
              flexGrow: 1,
              display: { xs: 'none', md: 'flex' },
              justifyContent: 'center',
              gap: 1.5,
              px: 2,
              py: 1,
              borderRadius: 999,
              backgroundColor: 'rgba(255,255,255,0.1)',
              boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.15)',
            }}
          >
            {user ? appNavItems.map((item) => (
              <Button
                key={item.path}
                onClick={() => handleNavigation(item.path)}
                sx={{ 
                  my: 0.5,
                  color: 'white',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textTransform: 'none',
                  fontSize: '0.95rem',
                  px: 2.2,
                  py: 1.2,
                  borderRadius: 2,
                  backgroundColor: location.pathname === item.path ? 'rgba(255,255,255,0.25)' : 'transparent',
                  '&:hover': {
                    backgroundColor: 'rgba(255,255,255,0.2)',
                    boxShadow: '0 6px 14px rgba(31, 95, 95, 0.25)',
                  }
                }}
              >
                {item.icon}
                {item.name}
              </Button>
            )) : (
              <Button
                onClick={() => handleNavigation('/willkommen')}
                sx={{ 
                  my: 2,
                  color: 'white',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textTransform: 'none',
                  fontSize: '1rem',
                  padding: '10px 20px'
                }}
              >
                <HomeIcon fontSize="large" />
                Willkommen
              </Button>
            )}
          </Box>

          <Divider orientation="vertical" flexItem sx={{ mx: 2, bgcolor: 'rgba(255,255,255,0.2)', display: { xs: 'none', md: 'block' } }} />

          {/* Benutzermenü */}
          {user ? (
            <Box sx={{ flexGrow: 0 }}>
              <Button
                onClick={handleOpenUserMenu}
                sx={{ 
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  textTransform: 'none',
                  fontSize: '1rem',
                  px: 2,
                  py: 1.2,
                  borderRadius: 2,
                  backgroundColor: 'rgba(255,255,255,0.08)',
                  '&:hover': {
                    backgroundColor: 'rgba(255,255,255,0.18)',
                  },
                }}
              >
                <PersonIcon fontSize="large" />
                <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
                  {user.name}
                </Box>
              </Button>
              <Menu
                sx={{ mt: '45px' }}
                id="menu-appbar"
                anchorEl={anchorElUser}
                anchorOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                keepMounted
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                open={Boolean(anchorElUser)}
                onClose={handleCloseUserMenu}
              >
                <MenuItem onClick={() => { handleNavigation('/profile'); handleCloseUserMenu(); }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, py: 0.5 }}>
                    <PersonIcon />
                    <Typography textAlign="center" sx={{ fontSize: '1.1rem' }}>Mein Profil</Typography>
                  </Box>
                </MenuItem>
                <MenuItem onClick={handleLogout}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, py: 0.5 }}>
                    <LogoutIcon />
                    <Typography textAlign="center" sx={{ fontSize: '1.1rem' }}>Abmelden</Typography>
                  </Box>
                </MenuItem>
              </Menu>
            </Box>
          ) : (
            <Button 
              color="inherit"
              onClick={() => navigate('/login')}
              sx={{ 
                fontSize: '1.1rem',
                padding: '10px 20px'
              }}
            >
              Anmelden
            </Button>
          )}
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default Navigation;
