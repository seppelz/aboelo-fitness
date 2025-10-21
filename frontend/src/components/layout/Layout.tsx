import React from 'react';
import { Container, Box, Paper } from '@mui/material';
import { Outlet } from 'react-router-dom';
import Navigation from './Navigation';
import Footer from './Footer';
import WelcomeTutorialDialog from '../onboarding/WelcomeTutorialDialog';

// Keine Props mehr nötig, da wir Outlet verwenden

interface LayoutProps {
  disableContainer?: boolean;
}

const Layout: React.FC<LayoutProps> = ({ disableContainer }) => {
  return (
    <Box sx={{ 
      display: 'flex',
      flexDirection: 'column',
      bgcolor: '#f5f5f5'
    }}>
      <Navigation />
      {disableContainer ? (
        <Box component="main" sx={{ flexGrow: 1 }}>
          <Outlet />
        </Box>
      ) : (
        <Container 
          component="main" 
          maxWidth="lg" 
          sx={{ 
            flexGrow: 1,
            py: 4,
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          <Paper 
            elevation={2} 
            sx={{ 
              p: 3,
              borderRadius: 2,
              flexGrow: 1
            }}
          >
            <Outlet />
          </Paper>
        </Container>
      )}
      <WelcomeTutorialDialog />
      <Footer />
    </Box>
  );
};

export default Layout;
