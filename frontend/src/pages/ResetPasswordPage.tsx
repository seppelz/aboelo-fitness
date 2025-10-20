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
import LockResetIcon from '@mui/icons-material/LockReset';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { resetPasswordWithToken } from '../services/authService';

const ResetPasswordPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const token = searchParams.get('token') || '';

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    if (!token) {
      setError('Dieser Link ist ungültig oder abgelaufen.');
      return;
    }

    if (!password || !passwordConfirmation) {
      setError('Bitte füllen Sie alle Felder aus.');
      return;
    }

    if (password !== passwordConfirmation) {
      setError('Die Passwörter stimmen nicht überein.');
      return;
    }

    try {
      setSubmitting(true);
      await resetPasswordWithToken(token, password, passwordConfirmation);
      setSuccess(true);
      setTimeout(() => navigate('/app'), 2000);
    } catch (err: any) {
      console.error('Passwort-Zurücksetzung fehlgeschlagen:', err);
      setError(err?.response?.data?.message || 'Die Zurücksetzung konnte nicht abgeschlossen werden. Bitte versuchen Sie es erneut.');
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
              Neues Passwort festlegen
            </Typography>
            <Typography color="text.secondary">
              Wählen Sie ein sicheres Passwort. Nach dem Speichern werden Sie automatisch angemeldet.
            </Typography>
          </Box>

          {success && (
            <Alert severity="success">
              Passwort erfolgreich aktualisiert! Sie werden gleich zum Dashboard weitergeleitet.
            </Alert>
          )}

          {error && !success && (
            <Alert severity="error">{error}</Alert>
          )}

          <Box component="form" onSubmit={handleSubmit}>
            <TextField
              label="Neues Passwort"
              type="password"
              fullWidth
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="new-password"
              disabled={submitting}
              sx={{ mb: 3 }}
              InputProps={{ sx: { fontSize: '1.05rem' } }}
              InputLabelProps={{ sx: { fontSize: '1.05rem' } }}
            />

            <TextField
              label="Neues Passwort bestätigen"
              type="password"
              fullWidth
              required
              value={passwordConfirmation}
              onChange={(event) => setPasswordConfirmation(event.target.value)}
              autoComplete="new-password"
              disabled={submitting}
              sx={{ mb: 3 }}
              InputProps={{ sx: { fontSize: '1.05rem' } }}
              InputLabelProps={{ sx: { fontSize: '1.05rem' } }}
            />

            <Button
              type="submit"
              variant="contained"
              size="large"
              startIcon={!submitting ? <LockResetIcon /> : undefined}
              disabled={submitting}
            >
              {submitting ? <CircularProgress size={24} color="inherit" /> : 'Passwort speichern'}
            </Button>
          </Box>
        </Stack>
      </Paper>
    </Box>
  );
};

export default ResetPasswordPage;
