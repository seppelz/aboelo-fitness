import React, { useContext, useEffect, useMemo, useState, useCallback } from 'react';
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
import InstallMobileIcon from '@mui/icons-material/InstallMobile';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../contexts/AuthContext';
import { updateProfile } from '../../services/authService';
import { useActivityReminder } from '../../hooks/useActivityReminder';
import { useInstallPrompt } from '../../hooks/useInstallPrompt';

const WelcomeTutorialDialog: React.FC = () => {
  const { user, loading, updateUserLocally, refreshUser } = useContext(AuthContext);
  const [open, setOpen] = useState(false);
  const [showOnLaunch, setShowOnLaunch] = useState(true);
  const [reminderState, setReminderState] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [reminderError, setReminderError] = useState<string | null>(null);
  const [installFeedback, setInstallFeedback] = useState<{ type: 'success' | 'info' | 'error'; message: string } | null>(null);
  const navigate = useNavigate();

  const storageKey = useMemo(() => (user ? `aboelo_show_welcome_${user._id}` : null), [user]);

  const reminderEnabled = Boolean(user?.reminderSettings?.enabled);
  const reminderInterval = user?.reminderSettings?.intervalMinutes ?? 60;

  const {
    supportsNotifications,
    requestPermission,
    subscribeToPush,
    isSubscribed,
  } = useActivityReminder({
    enabled: reminderEnabled,
    intervalMinutes: reminderInterval,
  });

  const { canInstall, promptInstall, isInstalled } = useInstallPrompt();

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

    if (!supportsNotifications) {
      setReminderState('error');
      setReminderError('Push-Benachrichtigungen werden von diesem Gerät oder Browser nicht unterstützt.');
      return;
    }

    setReminderState('loading');
    setReminderError(null);
    try {
      const permissionResult = await requestPermission();
      if (permissionResult !== 'granted') {
        setReminderState('error');
        setReminderError('Bitte erlaube Browser-Benachrichtigungen im angezeigten Dialog, um Erinnerungen zu aktivieren.');
        return;
      }

      const subscribed = await subscribeToPush();
      if (!subscribed) {
        setReminderState('error');
        setReminderError('Push-Benachrichtigungen konnten nicht aktiviert werden. Bitte versuche es erneut.');
        return;
      }

      const updatedUser = await updateProfile({
        reminderSettings: {
          enabled: true,
          intervalMinutes: reminderInterval,
        },
      });
      updateUserLocally(updatedUser);
      await refreshUser();
      setReminderState('success');
      setReminderError(null);
    } catch (error: any) {
      setReminderState('error');
      setReminderError(error?.response?.data?.message || 'Erinnerung konnte nicht aktiviert werden. Bitte versuchen Sie es erneut.');
    }
  };

  const handleInstallApp = useCallback(async () => {
    setInstallFeedback(null);
    try {
      const result = await promptInstall();
      if (result) {
        setInstallFeedback({ type: 'success', message: 'Installation gestartet. Folge den Browser-Hinweisen, um die App hinzuzufügen.' });
      } else {
        setInstallFeedback({ type: 'info', message: 'Installation wurde abgebrochen. Du kannst sie später jederzeit erneut starten.' });
      }
    } catch (error: any) {
      setInstallFeedback({ type: 'error', message: error?.message || 'Installation konnte nicht gestartet werden.' });
    }
  }, [promptInstall]);

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
                secondary="Für das Training der verschiedenen Muskelgruppen können Sie zwischen Übungen im Stehen oder Sitzen wählen."             />
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
                disabled={reminderState === 'loading' || (reminderAlreadyActive && isSubscribed)}
              >
                {reminderAlreadyActive ? '60-Minuten-Erinnerung aktiv' : '60-Minuten-Erinnerung aktivieren'}
              </Button>
              <Button variant="contained" onClick={() => navigate('/app/settings')}>
                Zu Profil & Einstellungen
              </Button>
              {canInstall && !isInstalled && (
                <Button
                  variant="outlined"
                  startIcon={<InstallMobileIcon />}
                  onClick={handleInstallApp}
                >
                  App installieren
                </Button>
              )}
            </Stack>
            {reminderState === 'success' && (
              <Alert severity="success">Erinnerung ist aktiviert. Sie können sie jederzeit in den Einstellungen anpassen.</Alert>
            )}
            {reminderState === 'error' && reminderError && <Alert severity="error">{reminderError}</Alert>}
            {installFeedback && <Alert severity={installFeedback.type}>{installFeedback.message}</Alert>}
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
