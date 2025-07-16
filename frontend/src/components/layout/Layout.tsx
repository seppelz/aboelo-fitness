import React from 'react';
import { Container, Box, Paper } from '@mui/material';
import { Outlet } from 'react-router-dom';
import Navigation from './Navigation';
import Footer from './Footer';

// Keine Props mehr nötig, da wir Outlet verwenden

const Layout: React.FC = () => {
  return (
    <Box sx={{ 
      display: 'flex',
      flexDirection: 'column',
      minHeight: '100vh',
      bgcolor: '#f5f5f5'
    }}>
      <Navigation />
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
      <Footer />
    </Box>
  );
};

export default Layout;
