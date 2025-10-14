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
  useTheme
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import HomeIcon from '@mui/icons-material/Home';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import BarChartIcon from '@mui/icons-material/BarChart';
import SettingsIcon from '@mui/icons-material/Settings';
import PersonIcon from '@mui/icons-material/Person';
import LogoutIcon from '@mui/icons-material/Logout';
import HelpIcon from '@mui/icons-material/Help';
import { useContext } from 'react';
import { AuthContext } from '../../contexts/AuthContext';

// Navigationslinks für eingeloggte Nutzer
const baseNavItems = [
  { name: 'Startseite', path: '/app', icon: <HomeIcon fontSize="large" /> },
  { name: 'Übungen', path: '/app/exercises', icon: <FitnessCenterIcon fontSize="large" /> },
  { name: 'Fortschritt', path: '/app/progress', icon: <BarChartIcon fontSize="large" /> },
  { name: 'Hilfe', path: '/app/help', icon: <HelpIcon fontSize="large" /> },
  { name: 'Einstellungen', path: '/app/settings', icon: <SettingsIcon fontSize="large" /> },
];

const Navigation = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout, isAdmin } = useContext(AuthContext);

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

  return (
    <AppBar position="static" sx={{ mb: 3 }}>
      <Container maxWidth="xl">
        <Toolbar disableGutters>
          {/* Logo für große Bildschirme */}
          <Typography
            variant="h6"
            noWrap
            component="div"
            sx={{ mr: 2, display: { xs: 'none', md: 'flex' }, fontSize: '1.5rem', fontWeight: 'bold' }}
          >
            aboelo-fitness
          </Typography>

          {/* Mobile Navigation */}
          <Box sx={{ flexGrow: 1, display: { xs: 'flex', md: 'none' } }}>
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
              sx={{
                display: { xs: 'block', md: 'none' },
              }}
            >
              {appNavItems.map((item) => (
                <MenuItem 
                  key={item.path} 
                  onClick={() => handleNavigation(item.path)}
                  selected={location.pathname === item.path}
                  sx={{ 
                    py: 1.5,
                    minHeight: '60px'
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {item.icon}
                    <Typography textAlign="center" sx={{ fontSize: '1.2rem' }}>
                      {item.name}
                    </Typography>
                  </Box>
                </MenuItem>
              ))}
            </Menu>
          </Box>

          {/* Logo für mobile Ansicht */}
          <Typography
            variant="h6"
            noWrap
            component="div"
            sx={{ flexGrow: 1, display: { xs: 'flex', md: 'none' }, fontSize: '1.2rem', fontWeight: 'bold' }}
          >
            aboelo-fitness
          </Typography>

          {/* Desktop Navigation */}
          <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' }, justifyContent: 'center', gap: 2 }}>
            {user ? appNavItems.map((item) => (
              <Button
                key={item.path}
                onClick={() => handleNavigation(item.path)}
                sx={{ 
                  my: 2, 
                  color: 'white', 
                  display: 'flex', 
                  flexDirection: 'column',
                  alignItems: 'center',
                  textTransform: 'none',
                  fontSize: '1rem',
                  padding: '10px 20px',
                  backgroundColor: location.pathname === item.path ? 'rgba(255,255,255,0.2)' : 'transparent',
                  '&:hover': {
                    backgroundColor: 'rgba(255,255,255,0.1)',
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
                  fontSize: '1rem'
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
