import React, { useState, useContext, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  TextField, 
  Button, 
  Paper, 
  Alert, 
  CircularProgress, 
  Link as MuiLink,
  Grid
} from '@mui/material';
import { Link as RouterLink, useNavigate, useSearchParams } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
// Kein direkter Import von authService nötig, da wir login aus dem AuthContext verwenden
import LockOpenIcon from '@mui/icons-material/LockOpen';

const LoginPage: React.FC = () => {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  // Formular-Zustände
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sessionExpired, setSessionExpired] = useState(false);
  
  // Check if redirected due to expired session
  useEffect(() => {
    if (searchParams.get('expired') === 'true') {
      setSessionExpired(true);
    }
  }, [searchParams]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    // Einfache Validierung
    if (!email || !password) {
      setError('Bitte füllen Sie alle Felder aus.');
      return;
    }
    
    try {
      setLoading(true);
      // login aus AuthContext aktualisiert bereits den User-Zustand im Context
      await login({ email, password });
      navigate('/');
    } catch (error: any) {
      console.error('Login-Fehler:', error);
      setError(error.response?.data?.message || 'Anmeldung fehlgeschlagen. Bitte überprüfen Sie Ihre Zugangsdaten.');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Grid container justifyContent="center">
      <Grid size={{ xs: 12, sm: 8, md: 6, lg: 4 }}>
        <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <LockOpenIcon sx={{ fontSize: 60, color: 'primary.main', mb: 1 }} />
            <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
              Anmelden
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Willkommen zurück bei aboelo Fitness!
            </Typography>
          </Box>
          
          {sessionExpired && (
            <Alert severity="warning" sx={{ mb: 3 }} onClose={() => setSessionExpired(false)}>
              Ihre Sitzung ist abgelaufen. Bitte melden Sie sich erneut an.
            </Alert>
          )}
          
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}
          
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="E-Mail-Adresse"
              name="email"
              autoComplete="email"
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              InputProps={{
                sx: { fontSize: '1.1rem' }
              }}
              InputLabelProps={{
                sx: { fontSize: '1.1rem' }
              }}
              sx={{ mb: 3 }}
            />
            
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Passwort"
              type="password"
              id="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              InputProps={{
                sx: { fontSize: '1.1rem' }
              }}
              InputLabelProps={{
                sx: { fontSize: '1.1rem' }
              }}
              sx={{ mb: 3 }}
            />
            
            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={loading}
              sx={{ 
                mt: 2, 
                py: 1.5, 
                fontSize: '1.2rem',
                position: 'relative'
              }}
            >
              {loading ? (
                <CircularProgress 
                  size={24} 
                  color="inherit" 
                  sx={{ 
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    marginTop: '-12px',
                    marginLeft: '-12px'
                  }}
                />
              ) : 'Anmelden'}
            </Button>
            
            <Box sx={{ mt: 3, textAlign: 'center' }}>
              <Typography variant="body1" sx={{ fontSize: '1.1rem' }}>
                Noch kein Konto?{' '}
                <MuiLink 
                  component={RouterLink} 
                  to="/register" 
                  sx={{ fontWeight: 'bold', fontSize: '1.1rem' }}
                >
                  Jetzt registrieren
                </MuiLink>
              </Typography>
            </Box>
          </Box>
        </Paper>
        
        <Box sx={{ mt: 3, textAlign: 'center' }}>
          <MuiLink 
            component={RouterLink} 
            to="/forgot-password" 
            sx={{ fontSize: '1.1rem' }}
          >
            Passwort vergessen?
          </MuiLink>
        </Box>
      </Grid>
    </Grid>
  );
};

export default LoginPage;
