import React from 'react';
import { Box, Typography, Button, Container, Paper } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import SentimentDissatisfiedIcon from '@mui/icons-material/SentimentDissatisfied';

const NotFoundPage: React.FC = () => {
  return (
    <Container maxWidth="md">
      <Paper 
        elevation={2} 
        sx={{ 
          p: 5, 
          mt: 5,
          textAlign: 'center',
          borderRadius: 2
        }}
      >
        <SentimentDissatisfiedIcon sx={{ fontSize: 100, color: 'text.secondary', mb: 3 }} />
        
        <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
          Seite nicht gefunden
        </Typography>
        
        <Typography variant="body1" sx={{ mb: 4, fontSize: '1.1rem' }}>
          Die aufgerufene Seite existiert leider nicht. Möglicherweise haben Sie einen falschen Link verwendet oder die Seite wurde verschoben.
        </Typography>
        
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
          <Button 
            variant="contained" 
            color="primary" 
            size="large"
            component={RouterLink} 
            to="/"
            sx={{ fontSize: '1.1rem', px: 4 }}
          >
            Zur Startseite
          </Button>
          
          <Button 
            variant="text"
            component={RouterLink}
            to="/exercises"
            sx={{ fontSize: '1.1rem' }}
          >
            Zu den Übungen
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default NotFoundPage;
