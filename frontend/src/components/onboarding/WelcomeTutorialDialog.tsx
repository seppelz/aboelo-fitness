import React, { useContext, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControlLabel,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Stack,
  Typography,
} from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import AirlineSeatReclineNormalIcon from '@mui/icons-material/AirlineSeatReclineNormal';
import Diversity3Icon from '@mui/icons-material/Diversity3';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../contexts/AuthContext';
import { updateProfile } from '../../services/authService';

const WelcomeTutorialDialog: React.FC = () => {
  const { user, loading, updateUserLocally, refreshUser } = useContext(AuthContext);
  const [open, setOpen] = useState(false);
  const [showOnLaunch, setShowOnLaunch] = useState(true);
  const [reminderState, setReminderState] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [reminderError, setReminderError] = useState<string | null>(null);
  const navigate = useNavigate();

  const storageKey = useMemo(() => (user ? `aboelo_show_welcome_${user._id}` : null), [user]);

  useEffect(() => {
    if (!user || loading) {
      return;
    }
    if (!storageKey) {
      return;
    }
    const stored = localStorage.getItem(storageKey);
    const shouldShow = stored === null ? true : stored !== 'false';
    setShowOnLaunch(shouldShow);
    if (shouldShow) {
      setOpen(true);
    }
  }, [user, loading, storageKey]);

  const handleClose = () => {
    if (storageKey) {
      localStorage.setItem(storageKey, showOnLaunch ? 'true' : 'false');
    }
    setOpen(false);
  };

  const handleEnableReminder = async () => {
    if (!user) {
      return;
    }
    setReminderState('loading');
    setReminderError(null);
    try {
      const updatedUser = await updateProfile({
        reminderSettings: {
          enabled: true,
          intervalMinutes: 60,
        },
      });
      updateUserLocally(updatedUser);
      await refreshUser();
      setReminderState('success');
    } catch (error: any) {
      setReminderState('error');
      setReminderError(error?.response?.data?.message || 'Erinnerung konnte nicht aktiviert werden. Bitte versuchen Sie es erneut.');
    }
  };

  const reminderAlreadyActive = Boolean(user?.reminderSettings?.enabled && user.reminderSettings.intervalMinutes === 60);

  if (!user) {
    return null;
  }

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: 700 }}>Willkommen bei aboelo-fitness</DialogTitle>
      <DialogContent dividers>
        <Stack spacing={3}>
          <Typography>
            Schön, dass Sie da sind! In wenigen Schritten erfahren Sie, wie Sie Ihr Training optimal nutzen und an Ihre Bedürfnisse anpassen.
          </Typography>

          <List disablePadding>
            <ListItem>
              <ListItemIcon>
                <FitnessCenterIcon color="primary" />
              </ListItemIcon>
              <ListItemText
                primary="Trainieren Sie im Stehen oder Sitzen"
                secondary="Jede Übung ist sowohl für stehende als auch sitzende Ausführung geeignet – ganz nach Ihrem Wohlbefinden."
              />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <Diversity3Icon color="primary" />
              </ListItemIcon>
              <ListItemText
                primary="Kraft und Mobilität kombinieren"
                secondary="Wechseln Sie flexibel zwischen Kräftigungs- und Mobilitätsübungen, um Ihren Tagesplan abwechslungsreich zu gestalten."
              />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <AirlineSeatReclineNormalIcon color="primary" />
              </ListItemIcon>
              <ListItemText
                primary="Mit oder ohne Theraband"
                secondary="Aktivieren Sie in den Einstellungen das Theraband, um zusätzliche Varianten freizuschalten. Ohne Theraband erhalten Sie passende Alternativen."
              />
            </ListItem>
          </List>

          <Divider />

          <Stack spacing={2}>
            <Typography variant="h6">Erinnerungsfunktion testen</Typography>
            <Typography>
              Bleiben Sie mit kurzen Aktivpausen am Ball. Aktivieren Sie bei Bedarf den standardmäßigen 60-Minuten-Reminder in den Einstellungen.
            </Typography>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <Button
                variant="outlined"
                startIcon={<AccessTimeIcon />}
                onClick={handleEnableReminder}
                disabled={reminderState === 'loading' || reminderAlreadyActive}
              >
                {reminderAlreadyActive ? '60-Minuten-Erinnerung aktiv' : '60-Minuten-Erinnerung aktivieren'}
              </Button>
              <Button variant="contained" onClick={() => navigate('/app/settings')}>
                Zu Profil & Einstellungen
              </Button>
            </Stack>
            {reminderState === 'success' && (
              <Alert severity="success">Erinnerung ist aktiviert. Sie können sie jederzeit in den Einstellungen anpassen.</Alert>
            )}
            {reminderState === 'error' && reminderError && <Alert severity="error">{reminderError}</Alert>}
          </Stack>
        </Stack>
      </DialogContent>
      <DialogActions sx={{ flexDirection: { xs: 'column', sm: 'row' }, alignItems: { xs: 'stretch', sm: 'center' }, gap: 1 }}>
        <Box sx={{ flexGrow: 1 }}>
          <FormControlLabel
            control={
              <Checkbox
                checked={showOnLaunch}
                onChange={(event) => setShowOnLaunch(event.target.checked)}
              />
            }
            label="Willkommensanleitung beim Start anzeigen"
          />
        </Box>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ width: { xs: '100%', sm: 'auto' } }}>
          <Button
            variant="text"
            onClick={() => {
              navigate('/app');
              handleClose();
            }}
          >
            Weitere Inhalte entdecken
          </Button>
          <Button variant="contained" onClick={handleClose} startIcon={<CheckCircleOutlineIcon />}>
            Los geht&apos;s
          </Button>
        </Stack>
      </DialogActions>
    </Dialog>
  );
};

export default WelcomeTutorialDialog;
