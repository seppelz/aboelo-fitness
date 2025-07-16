import React, { useState, useContext } from 'react';
import { 
  Box, 
  Typography, 
  TextField, 
  Button, 
  Paper, 
  Alert, 
  CircularProgress, 
  Link as MuiLink,
  Grid,
  FormControlLabel,
  Checkbox
} from '@mui/material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
// Kein direkter Import von authService nötig, da wir die register-Funktion aus dem AuthContext verwenden
import PersonAddIcon from '@mui/icons-material/PersonAdd';

const RegisterPage: React.FC = () => {
  const { register } = useContext(AuthContext);
  const navigate = useNavigate();
  
  // Formular-Zustände
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [age, setAge] = useState<string>('');
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const validateForm = () => {
    // Überprüfung der Eingaben
    if (!name || !email || !password || !confirmPassword) {
      setError('Bitte füllen Sie alle Pflichtfelder aus.');
      return false;
    }
    
    if (password !== confirmPassword) {
      setError('Die Passwörter stimmen nicht überein.');
      return false;
    }
    
    if (password.length < 6) {
      setError('Das Passwort muss mindestens 6 Zeichen lang sein.');
      return false;
    }
    
    // Einfache E-Mail-Validierung
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Bitte geben Sie eine gültige E-Mail-Adresse ein.');
      return false;
    }
    
    if (!agreeTerms) {
      setError('Sie müssen den Nutzungsbedingungen zustimmen, um fortzufahren.');
      return false;
    }
    
    return true;
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!validateForm()) {
      return;
    }
    
    try {
      setLoading(true);
      // register aus AuthContext aktualisiert bereits den User-Zustand im Context
      await register({
        name,
        email,
        password,
        age: age ? parseInt(age) : undefined,
        passwordConfirmation: confirmPassword,
        acceptTerms: agreeTerms
      });
      navigate('/');
    } catch (error: any) {
      console.error('Registrierungsfehler:', error);
      setError(
        error.response?.data?.message || 
        'Registrierung fehlgeschlagen. Bitte versuchen Sie es später erneut.'
      );
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Grid container justifyContent="center">
      <Grid size={{ xs: 12, sm: 10, md: 8, lg: 6 }}>
        <Paper elevation={3} sx={{ p: 4, mt: 4, mb: 4 }}>
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <PersonAddIcon sx={{ fontSize: 60, color: 'primary.main', mb: 1 }} />
            <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
              Registrieren
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Erstellen Sie ein Konto bei aboelo-fitness
            </Typography>
          </Box>
          
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}
          
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
            <Grid container spacing={2}>
              <Grid size={12}>
                <TextField
                  required
                  fullWidth
                  id="name"
                  label="Name"
                  name="name"
                  autoComplete="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  autoFocus
                  InputProps={{
                    sx: { fontSize: '1.1rem' }
                  }}
                  InputLabelProps={{
                    sx: { fontSize: '1.1rem' }
                  }}
                />
              </Grid>
              
              <Grid size={12}>
                <TextField
                  required
                  fullWidth
                  id="email"
                  label="E-Mail-Adresse"
                  name="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  InputProps={{
                    sx: { fontSize: '1.1rem' }
                  }}
                  InputLabelProps={{
                    sx: { fontSize: '1.1rem' }
                  }}
                />
              </Grid>
              
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  required
                  fullWidth
                  name="password"
                  label="Passwort"
                  type="password"
                  id="password"
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  InputProps={{
                    sx: { fontSize: '1.1rem' }
                  }}
                  InputLabelProps={{
                    sx: { fontSize: '1.1rem' }
                  }}
                />
              </Grid>
              
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  required
                  fullWidth
                  name="confirmPassword"
                  label="Passwort bestätigen"
                  type="password"
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  InputProps={{
                    sx: { fontSize: '1.1rem' }
                  }}
                  InputLabelProps={{
                    sx: { fontSize: '1.1rem' }
                  }}
                />
              </Grid>
              
              <Grid size={12}>
                <TextField
                  fullWidth
                  name="age"
                  label="Alter (optional)"
                  type="number"
                  id="age"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  InputProps={{
                    sx: { fontSize: '1.1rem' },
                    inputProps: { min: 1, max: 120 }
                  }}
                  InputLabelProps={{
                    sx: { fontSize: '1.1rem' }
                  }}
                />
              </Grid>
              
              <Grid size={12}>
                <FormControlLabel
                  control={
                    <Checkbox 
                      checked={agreeTerms} 
                      onChange={(e) => setAgreeTerms(e.target.checked)} 
                      color="primary" 
                      sx={{ '& .MuiSvgIcon-root': { fontSize: 28 } }}
                    />
                  }
                  label={
                    <Typography sx={{ fontSize: '1.1rem' }}>
                      Ich stimme den {' '}
                      <MuiLink component={RouterLink} to="/terms" sx={{ fontWeight: 'bold' }}>
                        Nutzungsbedingungen
                      </MuiLink>{' '}
                      und der {' '}
                      <MuiLink component={RouterLink} to="/privacy" sx={{ fontWeight: 'bold' }}>
                        Datenschutzerklärung
                      </MuiLink>{' '}
                      zu.
                    </Typography>
                  }
                />
              </Grid>
            </Grid>
            
            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={loading}
              sx={{ 
                mt: 3, 
                mb: 2, 
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
              ) : 'Registrieren'}
            </Button>
            
            <Box sx={{ mt: 3, textAlign: 'center' }}>
              <Typography variant="body1" sx={{ fontSize: '1.1rem' }}>
                Haben Sie bereits ein Konto?{' '}
                <MuiLink 
                  component={RouterLink} 
                  to="/login" 
                  sx={{ fontWeight: 'bold', fontSize: '1.1rem' }}
                >
                  Anmelden
                </MuiLink>
              </Typography>
            </Box>
          </Box>
        </Paper>
      </Grid>
    </Grid>
  );
};

export default RegisterPage;
