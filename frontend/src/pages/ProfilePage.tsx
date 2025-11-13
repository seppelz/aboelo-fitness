import React, { useState, useContext, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Avatar,
  Button,
  TextField,
  Alert,
  Snackbar,
  CircularProgress,
  Divider,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Container,
  FormControlLabel,
  Switch,
  Stack
} from '@mui/material';
import { AuthContext } from '../contexts/AuthContext';
import { updateProfile } from '../services/authService';
import { resetUserProgress } from '../services/authService';
import { getDailyProgress, getRecommendedExercises } from '../services/progressService';
import LockIcon from '@mui/icons-material/Lock';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import WhatshotIcon from '@mui/icons-material/Whatshot';
import StarIcon from '@mui/icons-material/Star';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import { useActivityReminder } from '../hooks/useActivityReminder';
import { Exercise } from '../types';

const ProfilePage: React.FC = () => {
  // In AuthContext ist setUser nicht Teil der öffentlichen Schnittstelle
  // Wir verwenden nur die Eigenschaften, die tatsächlich im Kontext verfügbar sind
  const { user, refreshUser, updateUserLocally } = useContext(AuthContext);
  
  // Zustandsvariablen für das Formular
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [age, setAge] = useState<string>('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [hasTheraband, setHasTheraband] = useState(user?.hasTheraband || false);
  const [reminderEnabled, setReminderEnabled] = useState<boolean>(user?.reminderSettings?.enabled ?? true);
  const [reminderInterval, setReminderInterval] = useState<number>(user?.reminderSettings?.intervalMinutes ?? 60);
  const [weeklyGoal, setWeeklyGoal] = useState<number>(user?.weeklyGoal?.exercisesTarget ?? 5);
  
  // Zustandsvariablen für den Bearbeitungsmodus und Feedback
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [reminderFeedback, setReminderFeedback] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);
  const [isResetting, setIsResetting] = useState(false);
  const [isReminderUpdating, setIsReminderUpdating] = useState(false);

  const fetchNextExerciseForReminder = useCallback(async () => {
    try {
      const [dailyProgressData, recommendationsData] = await Promise.all([
        getDailyProgress().catch(() => null),
        getRecommendedExercises().catch(() => null)
      ]);

      const muscleGroupsOrder = ['Bauch', 'Po', 'Schulter', 'Brust', 'Nacken', 'Rücken'];
      const trainedToday = new Set<string>(
        Array.isArray((dailyProgressData as any)?.muscleGroupsTrainedToday)
          ? (dailyProgressData as any).muscleGroupsTrainedToday
          : []
      );
      const targetGroup = muscleGroupsOrder.find(group => !trainedToday.has(group));

      const recommendationsList: Exercise[] = Array.isArray((recommendationsData as any)?.recommendations)
        ? (recommendationsData as any).recommendations
        : Array.isArray((recommendationsData as any)?.recommendedExercises)
          ? (recommendationsData as any).recommendedExercises
          : [];

      let nextExercise: Exercise | undefined = targetGroup
        ? recommendationsList.find(exercise => exercise.muscleGroup === targetGroup)
        : undefined;

      if (!nextExercise) {
        nextExercise = recommendationsList[0];
      }

      if (!nextExercise) {
        return null;
      }

      const origin = typeof window !== 'undefined' ? window.location.origin : '';

      return {
        title: nextExercise.name || (nextExercise as any).title || 'Übung',
        url: `${origin}/app/exercises/${nextExercise._id}`,
        muscleGroup: nextExercise.muscleGroup,
      };
    } catch (error) {
      console.error('[Reminder] Failed to determine next exercise', error);
      return null;
    }
  }, []);

  const {
    permission,
    requestPermission,
    triggerTestReminder,
    permissionRequested,
    permissionMessage,
    subscriptionStatus,
    isSubscribed,
    subscribeToPush,
    unsubscribeFromPush,
  } = useActivityReminder({ enabled: reminderEnabled, intervalMinutes: reminderInterval, fetchNextExercise: fetchNextExerciseForReminder });
  
  // Benutzerdaten in das Formular laden
  useEffect(() => {
    if (user) {
      setName(user.name);
      setEmail(user.email);
      setAge(user.age ? user.age.toString() : '');
      setHasTheraband(user.hasTheraband || false);
      setReminderEnabled(user.reminderSettings?.enabled ?? true);
      setReminderInterval(user.reminderSettings?.intervalMinutes ?? 60);
      setWeeklyGoal(user.weeklyGoal?.exercisesTarget ?? 5);
    }
  }, [user]);
  
  // Profil bearbeiten
  const handleEditToggle = () => {
    setIsEditing(!isEditing);
    setError(null);
    setSuccess(null);
    
    // Formular zurücksetzen, wenn Bearbeitung abgebrochen wird
    if (isEditing && user) {
      setName(user.name);
      setEmail(user.email);
      setAge(user.age ? user.age.toString() : '');
      setHasTheraband(user.hasTheraband || false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setReminderEnabled(user.reminderSettings?.enabled ?? true);
      setReminderInterval(user.reminderSettings?.intervalMinutes ?? 60);
      setWeeklyGoal(user.weeklyGoal?.exercisesTarget ?? 5);
    }
  };
  
  // Formularvalidierung
  const validateForm = () => {
    if (!name.trim()) {
      setError('Name darf nicht leer sein.');
      return false;
    }
    
    // Prüfen, ob ein Passwort geändert werden soll
    if (newPassword) {
      if (!currentPassword) {
        setError('Bitte geben Sie Ihr aktuelles Passwort ein, um ein neues Passwort festzulegen.');
        return false;
      }
      
      if (newPassword.length < 6) {
        setError('Das neue Passwort muss mindestens 6 Zeichen lang sein.');
        return false;
      }
      
      if (newPassword !== confirmPassword) {
        setError('Die Passwörter stimmen nicht überein.');
        return false;
      }
    }
    
    return true;
  };
  
  // Profiländerungen speichern
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    
    if (!validateForm()) return;
    
    try {
      setIsSubmitting(true);
      
      const updatedData = {
        name,
        age: age ? parseInt(age) : undefined,
        hasTheraband,
        currentPassword: currentPassword || undefined,
        newPassword: newPassword || undefined,
        reminderSettings: {
          enabled: reminderEnabled,
          intervalMinutes: reminderInterval
        },
        weeklyGoal: {
          exercisesTarget: weeklyGoal
        }
      };
      
      // updateProfile aktualisiert bereits den Benutzer im localStorage
      const updatedUser = await updateProfile(updatedData);
      updateUserLocally(updatedUser);
      await refreshUser();
      
      // Erfolgsbenachrichtigung anzeigen und Bearbeitungsmodus deaktivieren
      setSuccess('Profil erfolgreich aktualisiert.');
      setIsEditing(false);
      
      // Passwortfelder zurücksetzen
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      console.error('Fehler beim Aktualisieren des Profils:', error);
      setError(error.response?.data?.message || 'Beim Aktualisieren des Profils ist ein Fehler aufgetreten.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Reset progress handler
  const handleResetProgress = async () => {
    if (!window.confirm('Sind Sie sicher, dass Sie Ihren gesamten Fortschritt zurücksetzen möchten? Diese Aktion kann nicht rückgängig gemacht werden.')) {
      return;
    }
    
    setIsResetting(true);
    setError(null);
    setSuccess(null);
    
    try {
      const result = await resetUserProgress();
      console.log('Progress reset successful:', result);
      setSuccess('Fortschritt erfolgreich zurückgesetzt! Die Seite wird neu geladen...');
      
      // Refresh the page after a short delay
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (error: any) {
      console.error('Error resetting progress:', error);
      setError('Fehler beim Zurücksetzen des Fortschritts: ' + (error.message || 'Unbekannter Fehler'));
    } finally {
      setIsResetting(false);
    }
  };

  const handleReminderToggle = async (checked: boolean) => {
    setReminderFeedback(null);
    setIsReminderUpdating(true);
    if (checked) {
      try {
        const result = await requestPermission();
        if (result !== 'granted') {
          setReminderEnabled(false);
          setReminderFeedback({ type: 'error', message: 'Benachrichtigungen wurden blockiert. Bitte erlaube sie in den Browser-Einstellungen.' });
          return;
        }

        const subscribed = await subscribeToPush();
        if (!subscribed) {
          setReminderEnabled(false);
          setReminderFeedback({ type: 'error', message: 'Push-Benachrichtigungen konnten nicht aktiviert werden. Bitte versuche es später erneut.' });
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

        setReminderEnabled(true);
        setReminderFeedback({ type: 'success', message: 'Push-Benachrichtigungen aktiviert. Du erhältst Erinnerungen auch ohne offenen Tab.' });
      } catch (error: any) {
        console.error('[Reminder] Failed to enable reminders', error);
        setReminderEnabled(false);
        setReminderFeedback({ type: 'error', message: error?.response?.data?.message || 'Aktivierung fehlgeschlagen. Bitte später erneut versuchen.' });
      } finally {
        setIsReminderUpdating(false);
      }
      return;
    }

    try {
      await unsubscribeFromPush();
      const updatedUser = await updateProfile({
        reminderSettings: {
          enabled: false,
          intervalMinutes: reminderInterval,
        },
      });
      updateUserLocally(updatedUser);
      await refreshUser();

      setReminderEnabled(false);
      setReminderFeedback({ type: 'info', message: 'Push-Benachrichtigungen wurden deaktiviert.' });
    } catch (error: any) {
      console.error('[Reminder] Failed to disable reminders', error);
      setReminderFeedback({ type: 'error', message: error?.response?.data?.message || 'Deaktivierung fehlgeschlagen. Bitte versuche es erneut.' });
    } finally {
      setIsReminderUpdating(false);
    }
  };

  const handleReminderIntervalChange = (value: string) => {
    const parsed = parseInt(value, 10);
    if (!Number.isNaN(parsed)) {
      setReminderInterval(Math.max(1, parsed));
    } else if (value === '') {
      setReminderInterval(1);
    }
  };

  const handleTestReminder = async () => {
    await triggerTestReminder();
  };

  if (!user) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <CircularProgress size={60} />
      </Box>
    );
  }
  
  const dismissReminderFeedback = () => setReminderFeedback(null);

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {reminderFeedback && (
        <Snackbar
          open={!!reminderFeedback}
          autoHideDuration={6000}
          onClose={dismissReminderFeedback}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert severity={reminderFeedback.type} sx={{ width: '100%' }}>
            {reminderFeedback.message}
          </Alert>
        </Snackbar>
      )}
      <Grid container spacing={4}>
        {/* Profil-Informationen */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Paper elevation={2} sx={{ p: 3 }}>
            {/* Fehlermeldungen & Erfolgsmeldungen */}
            {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
            {success && <Alert severity="success" sx={{ mb: 3 }}>{success}</Alert>}
            
            {/* Profilbearbeitung */}
            <Box 
              component="form" 
              onSubmit={handleSubmit}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <Avatar 
                  sx={{ 
                    width: 80, 
                    height: 80, 
                    bgcolor: 'primary.main',
                    fontSize: '2rem',
                    mr: 2
                  }}
                >
                  {user.name.charAt(0).toUpperCase()}
                </Avatar>
                <Box>
                  {!isEditing ? (
                    <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                      {user.name}
                    </Typography>
                  ) : (
                    <TextField
                      label="Name"
                      variant="outlined"
                      fullWidth
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      disabled={isSubmitting}
                      sx={{ mb: 2 }}
                      InputProps={{
                        sx: { fontSize: '1.1rem' }
                      }}
                      InputLabelProps={{
                        sx: { fontSize: '1.1rem' }
                      }}
                    />
                  )}
                  <Typography variant="body1" color="text.secondary">
                    Aktiver Benutzer
                  </Typography>
                </Box>
              </Box>
              
              <Divider sx={{ my: 3 }} />
              
              {/* Persönliche Informationen */}
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                Persönliche Informationen
              </Typography>
              
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    label="E-Mail"
                    variant="outlined"
                    fullWidth
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={true} // E-Mail kann nicht geändert werden
                    sx={{ mb: 2 }}
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
                    label="Alter (optional)"
                    variant="outlined"
                    fullWidth
                    type="number"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    disabled={!isEditing || isSubmitting}
                    InputProps={{
                      sx: { fontSize: '1.1rem' },
                      inputProps: { min: 1, max: 120 }
                    }}
                    InputLabelProps={{
                      sx: { fontSize: '1.1rem' }
                    }}
                  />
                </Grid>
              </Grid>
              
              {/* Training Preferences */}
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', mt: 3 }}>
                Training Einstellungen
              </Typography>
              
              <FormControlLabel
                control={
                  <Switch
                    checked={hasTheraband}
                    onChange={(e) => setHasTheraband(e.target.checked)}
                    disabled={!isEditing || isSubmitting}
                    color="primary"
                  />
                }
                label={
                  <Box>
                    <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                      Theraband verfügbar
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Aktivieren Sie diese Option, wenn Sie ein Theraband besitzen. Dies beeinflusst Ihre Übungsempfehlungen.
                    </Typography>
                  </Box>
                }
                sx={{ 
                  alignItems: 'flex-start',
                  mt: 1,
                  mb: 2
                }}
              />

              {/* Weekly Goal Setting */}
              <Box sx={{ mt: 3, mb: 3 }}>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                  Wochenziel
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Legen Sie fest, wie viele Übungen Sie pro Woche absolvieren möchten. Standard sind 5 Übungen (ideal für Montag-Freitag).
                </Typography>
                <TextField
                  fullWidth
                  type="number"
                  label="Übungen pro Woche"
                  value={weeklyGoal}
                  onChange={(e) => setWeeklyGoal(Math.max(1, Math.min(50, parseInt(e.target.value) || 1)))}
                  disabled={!isEditing || isSubmitting}
                  inputProps={{
                    min: 1,
                    max: 50,
                    step: 1
                  }}
                  helperText={`Empfehlung: 5 Übungen/Woche (Mo-Fr) oder 42 Übungen/Woche (6/Tag × 7 Tage)`}
                  sx={{ maxWidth: 400 }}
                />
              </Box>

              <Box sx={{ mt: 3 }}>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                  Aktivpausen-Erinnerung
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Standardmäßig wirst du alle 60 Minuten an eine 1–2-minütige Bewegung erinnert. Wir zeigen vor der Systemabfrage, warum sich die Aktivierung lohnt.
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2, bgcolor: 'action.hover', p: 2, borderRadius: 2 }}>
                  <strong>Warum erlauben?</strong> Du erhältst motivierende Erinnerungen zu deinen Aktivpausen. Benachrichtigungen lassen sich jederzeit in den Browser-Einstellungen deaktivieren.
                </Typography>
                <FormControlLabel
                  control={
                    <Switch
                      checked={reminderEnabled}
                      onChange={(e) => handleReminderToggle(e.target.checked)}
                      disabled={isSubmitting || isReminderUpdating}
                      color="primary"
                    />
                  }
                  label={
                    <Box>
                      <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                        Erinnerungen aktivieren
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Wenn aktiviert, erhältst du Browser-Benachrichtigungen für Aktivpausen.
                      </Typography>
                    </Box>
                  }
                  sx={{ alignItems: 'flex-start', mb: 2 }}
                />

                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ xs: 'stretch', sm: 'center' }} sx={{ mb: 1 }}>
                  <TextField
                    label="Intervall (Minuten)"
                    type="number"
                    variant="outlined"
                    value={reminderInterval}
                    onChange={(e) => handleReminderIntervalChange(e.target.value)}
                    disabled={!isEditing || isSubmitting || !reminderEnabled || isReminderUpdating}
                    InputProps={{
                      inputProps: { min: 1 },
                      sx: { fontSize: '1.1rem' }
                    }}
                    InputLabelProps={{
                      sx: { fontSize: '1.1rem' }
                    }}
                    sx={{ width: { xs: '100%', sm: 220 } }}
                  />
                  <Button
                    variant="outlined"
                    onClick={handleTestReminder}
                    disabled={!reminderEnabled || isSubmitting || isReminderUpdating || subscriptionStatus === 'missing-key' || subscriptionStatus === 'unsupported'}
                  >
                    Erinnerung testen
                  </Button>
                </Stack>
                <Typography variant="body2" color={permission === 'granted' ? 'success.main' : 'text.secondary'}>
                  {permissionMessage}
                </Typography>
                <Typography variant="body2" sx={{ mt: 1 }} color={isSubscribed ? 'success.main' : 'text.secondary'}>
                  {subscriptionStatus === 'missing-key' && 'Push-Benachrichtigungen sind derzeit nicht konfiguriert. Bitte versuche es später erneut.'}
                  {subscriptionStatus === 'unsupported' && 'Dieser Browser unterstützt keine Push-Benachrichtigungen.'}
                  {subscriptionStatus === 'ready' && isSubscribed && '🎉 Push-Benachrichtigungen sind aktiv. Du erhältst Erinnerungen auch ohne geöffneten Tab.'}
                  {subscriptionStatus === 'ready' && !isSubscribed && permission === 'granted' && 'Benachrichtigungen erlaubt. Klicke auf "Erinnerungen aktivieren", um Push-Benachrichtigungen zu starten.'}
                </Typography>
                {permissionRequested && permission === 'default' && (
                  <Typography variant="body2" color="warning.main" sx={{ mt: 1 }}>
                    Bitte bestätige das Browser-Popup, um Benachrichtigungen zu erlauben.
                  </Typography>
                )}
              </Box>

              {/* Passwort-Änderung (nur im Bearbeitungsmodus) */}
              {isEditing && (
                <Box sx={{ mt: 3 }}>
                  <Grid container spacing={2}>
                    <Grid size={{ xs: 12 }}>
                      <TextField
                        label="Aktuelles Passwort"
                        variant="outlined"
                        fullWidth
                        type="password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        disabled={isSubmitting}
                        sx={{ mb: 2 }}
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
                        label="Neues Passwort"
                        variant="outlined"
                        fullWidth
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        disabled={isSubmitting}
                        sx={{ mb: 2 }}
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
                        label="Neues Passwort bestätigen"
                        variant="outlined"
                        fullWidth
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        disabled={isSubmitting}
                        InputProps={{
                          sx: { fontSize: '1.1rem' }
                        }}
                        InputLabelProps={{
                          sx: { fontSize: '1.1rem' }
                        }}
                      />
                    </Grid>
                  </Grid>
                </Box>
              )}
              
              {/* Aktions-Buttons */}
              <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                {isEditing ? (
                  <>
                    <Button 
                      variant="outlined" 
                      onClick={handleEditToggle}
                      disabled={isSubmitting}
                      size="large"
                      sx={{ fontSize: '1.1rem' }}
                    >
                      Abbrechen
                    </Button>
                    <Button 
                      type="submit" 
                      variant="contained" 
                      disabled={isSubmitting}
                      size="large"
                      sx={{ 
                        fontSize: '1.1rem',
                        position: 'relative'
                      }}
                    >
                      {isSubmitting ? (
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
                      ) : 'Speichern'}
                    </Button>
                  </>
                ) : (
                  <Button 
                    variant="contained" 
                    onClick={handleEditToggle}
                    startIcon={<LockIcon />}
                    size="large"
                    sx={{ fontSize: '1.1rem' }}
                  >
                    Profil bearbeiten
                  </Button>
                )}
              </Box>
            </Box>
          </Paper>
        </Grid>
        
        {/* Statistiken & Erfolge */}
        <Grid size={{ xs: 12, md: 4 }}>
          {/* Statistiken */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center' }}>
                <FitnessCenterIcon sx={{ mr: 1 }} /> Statistiken
              </Typography>
              
              <List>
                <ListItem>
                  <ListItemIcon>
                    <EmojiEventsIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                        Level {user.level || 1}
                      </Typography>
                    }
                    secondary={`${user.points || 0} Punkte gesammelt`}
                  />
                </ListItem>
                
                <ListItem>
                  <ListItemIcon>
                    <WhatshotIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                        {user.dailyStreak || 0} Tage in Folge
                      </Typography>
                    }
                    secondary="Tägliches Training"
                  />
                </ListItem>
                
                <ListItem>
                  <ListItemIcon>
                    <FitnessCenterIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                        {user?.completedExercises?.length || 0} Übungen
                      </Typography>
                    }
                    secondary="Abgeschlossen"
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>
          
          {/* Erfolge & Abzeichen */}
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center' }}>
                <StarIcon sx={{ mr: 1 }} /> Meine Erfolge
              </Typography>
              
              {user.achievements && user.achievements.length > 0 ? (
                <List>
                  {user.achievements.map((achievement, index) => (
                    <ListItem key={index}>
                      <ListItemIcon>
                        <StarIcon color="secondary" />
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                            {achievement.title}
                          </Typography>
                        }
                        secondary={achievement.description}
                      />
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Typography variant="body1" color="text.secondary" sx={{ py: 2, textAlign: 'center' }}>
                  Sie haben noch keine Erfolge erzielt. Trainieren Sie regelmäßig, um Abzeichen zu sammeln!
                </Typography>
              )}
              
              <Button 
                variant="outlined" 
                fullWidth
                onClick={() => window.location.href = '/progress'}
                sx={{ mt: 2, fontSize: '1.1rem' }}
              >
                Zum Fortschritt
              </Button>
              
              <Button 
                variant="outlined" 
                color="error"
                fullWidth
                onClick={handleResetProgress}
                disabled={isResetting}
                sx={{ mt: 2, fontSize: '1.1rem' }}
              >
                {isResetting ? (
                  <CircularProgress size={20} sx={{ mr: 1 }} />
                ) : null}
                {isResetting ? 'Zurücksetzen...' : 'Fortschritt zurücksetzen'}
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default ProfilePage;
