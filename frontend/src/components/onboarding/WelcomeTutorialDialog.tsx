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
import { useInstallPromptContext } from '../../contexts/InstallPromptContext';

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

  const { canInstall, promptInstall, isInstalled } = useInstallPromptContext();

  const baseActionButtonSx = {
    width: '100%',
    minHeight: 62,
    px: { xs: 2.5, md: 3 },
    borderRadius: 2,
    fontWeight: 600,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 1.25,
    textAlign: 'center',
    textTransform: 'none',
    letterSpacing: 0,
    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
    '&:hover': {
      transform: { md: 'translateY(-2px)' },
    },
    '& .MuiButton-startIcon': {
      margin: 0,
      '& > *:nth-of-type(1)': {
        fontSize: '1.4rem',
      },
    },
  } as const;

  const infoListItemSx = {
    alignItems: 'flex-start',
    gap: 2,
    px: 0,
  } as const;

  const dialogPaperSx = {
    width: { xs: '100%', sm: 760 },
    borderRadius: 3,
    boxShadow: '0px 16px 40px rgba(0, 0, 0, 0.18)',
  } as const;

  const sectionTitleSx = {
    fontWeight: 700,
    fontSize: { xs: '1.15rem', sm: '1.25rem' },
  } as const;

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
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      PaperProps={{ sx: dialogPaperSx }}
    >
      <DialogTitle sx={{ fontWeight: 800, fontSize: { xs: '1.35rem', sm: '1.5rem' }, pb: 2 }}>
        Willkommen bei aboelo Fitness
      </DialogTitle>
      <DialogContent dividers sx={{ px: { xs: 3, sm: 4 }, py: { xs: 3, sm: 4 } }}>
        <Stack spacing={3.5}>
          <Stack spacing={1.5}>
            <Typography variant="subtitle1" sx={{ color: 'text.secondary', lineHeight: 1.6 }}>
              Schön, dass Sie da sind! In wenigen Schritten erfahren Sie, wie Sie Ihr Training optimal nutzen und an Ihre Bedürfnisse anpassen.
            </Typography>

            <List disablePadding sx={{ display: 'grid', gap: 2 }}>
              <ListItem sx={infoListItemSx}>
                <ListItemIcon sx={{ minWidth: 36, mt: 0.5 }}>
                  <FitnessCenterIcon color="primary" />
                </ListItemIcon>
                <ListItemText
                  primaryTypographyProps={{ fontWeight: 600, fontSize: '1rem' }}
                  secondaryTypographyProps={{ color: 'text.secondary' }}
                  primary="Trainieren Sie im Stehen oder Sitzen"
                  secondary="Für das Training der verschiedenen Muskelgruppen können Sie zwischen Übungen im Stehen oder Sitzen wählen."
                />
              </ListItem>
              <ListItem sx={infoListItemSx}>
                <ListItemIcon sx={{ minWidth: 36, mt: 0.5 }}>
                  <Diversity3Icon color="primary" />
                </ListItemIcon>
                <ListItemText
                  primaryTypographyProps={{ fontWeight: 600, fontSize: '1rem' }}
                  secondaryTypographyProps={{ color: 'text.secondary' }}
                  primary="Kraft und Mobilität kombinieren"
                  secondary="Wechseln Sie flexibel zwischen Kräftigungs- und Mobilitätsübungen, um Ihren Tagesplan abwechslungsreich zu gestalten."
                />
              </ListItem>
              <ListItem sx={infoListItemSx}>
                <ListItemIcon sx={{ minWidth: 36, mt: 0.5 }}>
                  <AirlineSeatReclineNormalIcon color="primary" />
                </ListItemIcon>
                <ListItemText
                  primaryTypographyProps={{ fontWeight: 600, fontSize: '1rem' }}
                  secondaryTypographyProps={{ color: 'text.secondary' }}
                  primary="Mit oder ohne Theraband"
                  secondary="Aktivieren Sie in den Einstellungen das Theraband, um zusätzliche Varianten freizuschalten. Ohne Theraband erhalten Sie passende Alternativen."
                />
              </ListItem>
            </List>
          </Stack>

          <Divider />

          <Stack spacing={2.5}>
            <Typography sx={sectionTitleSx}>Erinnerungsfunktion testen</Typography>
            <Typography sx={{ color: 'text.secondary', lineHeight: 1.6 }}>
              Bleiben Sie mit kurzen Aktivpausen am Ball. Aktivieren Sie bei Bedarf den standardmäßigen 60-Minuten-Reminder in den Einstellungen.
            </Typography>
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: {
                  xs: '1fr',
                  sm: 'repeat(auto-fit, minmax(220px, 1fr))',
                },
                gap: { xs: 1.5, md: 2 },
                width: '100%',
              }}
            >
              <Button
                variant="outlined"
                startIcon={<AccessTimeIcon />}
                onClick={handleEnableReminder}
                disabled={reminderState === 'loading' || (reminderAlreadyActive && isSubscribed)}
                sx={{
                  ...baseActionButtonSx,
                  boxShadow: '0px 6px 14px rgba(45, 125, 125, 0.08)',
                  borderWidth: 2,
                  borderColor: 'primary.main',
                  color: 'primary.main',
                  backgroundColor: 'common.white',
                  '&:hover': {
                    ...baseActionButtonSx['&:hover'],
                    borderColor: 'primary.dark',
                    boxShadow: '0px 10px 20px rgba(45, 125, 125, 0.12)',
                    backgroundColor: 'common.white',
                  },
                }}
              >
                {reminderAlreadyActive ? '60-Minuten-Erinnerung aktiv' : '60-Minuten-Erinnerung aktivieren'}
              </Button>
              <Button
                variant="contained"
                onClick={() => navigate('/app/settings')}
                sx={{
                  ...baseActionButtonSx,
                  boxShadow: '0px 12px 24px rgba(45, 125, 125, 0.22)',
                  '&:hover': {
                    ...baseActionButtonSx['&:hover'],
                    boxShadow: '0px 16px 28px rgba(45, 125, 125, 0.26)',
                  },
                }}
              >
                Zu Profil & Einstellungen
              </Button>
              {canInstall && !isInstalled && (
                <Button
                  variant="outlined"
                  startIcon={<InstallMobileIcon />}
                  onClick={handleInstallApp}
                  sx={{
                    ...baseActionButtonSx,
                    boxShadow: '0px 6px 14px rgba(45, 125, 125, 0.08)',
                    borderWidth: 2,
                    borderColor: 'primary.main',
                    color: 'primary.main',
                    backgroundColor: 'common.white',
                    '&:hover': {
                      ...baseActionButtonSx['&:hover'],
                      borderColor: 'primary.dark',
                      boxShadow: '0px 10px 20px rgba(45, 125, 125, 0.12)',
                      backgroundColor: 'common.white',
                    },
                  }}
                >
                  App installieren
                </Button>
              )}
            </Box>
            {reminderState === 'success' && (
              <Alert severity="success">Erinnerung ist aktiviert. Sie können sie jederzeit in den Einstellungen anpassen.</Alert>
            )}
            {reminderState === 'error' && reminderError && <Alert severity="error">{reminderError}</Alert>}
            {installFeedback && <Alert severity={installFeedback.type}>{installFeedback.message}</Alert>}
          </Stack>
        </Stack>
      </DialogContent>
      <DialogActions
        sx={{
          flexDirection: { xs: 'column', sm: 'row' },
          alignItems: { xs: 'stretch', sm: 'center' },
          gap: { xs: 2, sm: 1.5 },
          px: { xs: 3, sm: 4 },
          py: { xs: 2.5, sm: 3 },
          backgroundColor: 'background.default',
        }}
      >
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
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={1.5}
          sx={{ width: { xs: '100%', sm: 'auto' }, justifyContent: 'flex-end', flexWrap: 'wrap' }}
        >
          <Button
            variant="contained"
            color="primary"
            onClick={handleClose}
            startIcon={<CheckCircleOutlineIcon />}
            sx={{ px: { xs: 2.5, sm: 3 }, py: 1.25, borderRadius: 1.5, fontWeight: 700 }}
          >
            Los geht&apos;s
          </Button>
        </Stack>
      </DialogActions>
    </Dialog>
  );
};

export default WelcomeTutorialDialog;
