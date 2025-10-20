import React, { useState } from 'react';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SendIcon from '@mui/icons-material/Send';
import { Link as RouterLink } from 'react-router-dom';
import { requestPasswordReset } from '../services/authService';

const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    if (!email) {
      setError('Bitte geben Sie Ihre E-Mail-Adresse ein.');
      return;
    }

    try {
      setSubmitting(true);
      await requestPasswordReset(email);
      setSuccess(true);
    } catch (err: any) {
      console.error('Passwort-Reset-Anfrage fehlgeschlagen:', err);
      setError(err?.response?.data?.message || 'Die Anfrage konnte nicht verarbeitet werden. Bitte versuchen Sie es erneut.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4, px: 2 }}>
      <Paper elevation={3} sx={{ p: 4, maxWidth: 520, width: '100%' }}>
        <Stack spacing={3}>
          <Box>
            <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold', mb: 1 }}>
              Passwort vergessen
            </Typography>
            <Typography color="text.secondary">
              Wir senden Ihnen einen sicheren Link zum Zurücksetzen Ihres Passworts. Prüfen Sie bitte auch Ihren Spam-Ordner.
            </Typography>
          </Box>

          {success && (
            <Alert severity="success">
              Wenn ein Konto mit dieser E-Mail-Adresse existiert, erhalten Sie gleich eine Nachricht mit weiteren Schritten.
            </Alert>
          )}

          {error && !success && (
            <Alert severity="error">{error}</Alert>
          )}

          <Box component="form" onSubmit={handleSubmit}>
            <TextField
              label="E-Mail-Adresse"
              type="email"
              fullWidth
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="email"
              autoFocus
              disabled={submitting}
              sx={{ mb: 3 }}
              InputProps={{ sx: { fontSize: '1.05rem' } }}
              InputLabelProps={{ sx: { fontSize: '1.05rem' } }}
            />

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ xs: 'stretch', sm: 'center' }}>
              <Button
                component={RouterLink}
                to="/login"
                variant="outlined"
                startIcon={<ArrowBackIcon />}
                disabled={submitting}
              >
                Zurück zum Login
              </Button>
              <Button
                type="submit"
                variant="contained"
                endIcon={!submitting ? <SendIcon /> : undefined}
                disabled={submitting}
              >
                {submitting ? <CircularProgress size={24} color="inherit" /> : 'Reset-Link senden'}
              </Button>
            </Stack>
          </Box>
        </Stack>
      </Paper>
    </Box>
  );
};

export default ForgotPasswordPage;
