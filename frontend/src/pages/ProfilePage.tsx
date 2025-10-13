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
  
  // Calculate estimated exercises from points for data consistency
  const estimatedExercises = user ? Math.floor((user.points || 0) / 10) : 0;
  const actualExercises = user?.completedExercises?.length || 0;
  
  // Use the higher value to show more accurate count until data is consistent
  const displayExercises = Math.max(estimatedExercises, actualExercises);
  
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
  
  // Zustandsvariablen für den Bearbeitungsmodus und Feedback
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isResetting, setIsResetting] = useState(false);

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
    supportsNotifications, 
    permission, 
    requestPermission, 
    triggerTestReminder,
    permissionRequested,
    permissionMessage
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
  
  // Passwort ändern validieren
  const validatePasswordChange = (): boolean => {
    if (newPassword !== confirmPassword) {
      setError('Die neuen Passwörter stimmen nicht überein');
      return false;
    }
    if (newPassword.length < 6) {
      setError('Das neue Passwort muss mindestens 6 Zeichen lang sein');
      return false;
    }
    return true;
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
    if (checked && permission !== 'granted') {
      const result = await requestPermission();
      if (result !== 'granted') {
        setReminderEnabled(false);
        return;
      }
    }
    setReminderEnabled(checked);
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
  
  return (
    <Container maxWidth="lg">
      <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold', mb: 4 }}>
        Mein Profil
      </Typography>
      
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
                      disabled={!isEditing || isSubmitting}
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
                    disabled={!isEditing || isSubmitting || !reminderEnabled}
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
                    disabled={reminderEnabled === false || isSubmitting}
                  >
                    Erinnerung testen
                  </Button>
                </Stack>
                <Typography variant="body2" color={permission === 'granted' ? 'success.main' : 'text.secondary'}>
                  {permissionMessage}
                </Typography>
                {permission === 'granted' && (
                  <Typography variant="body2" color="success.main" sx={{ mt: 1 }}>
                    🎉 Du wirst jetzt an deine Aktivpausen erinnert. Du kannst den Rhythmus jederzeit anpassen.
                  </Typography>
                )}
                {permissionRequested && permission === 'default' && (
                  <Typography variant="body2" color="warning.main" sx={{ mt: 1 }}>
                    Bitte bestätige das Browser-Popup, um Benachrichtigungen zu erlauben.
                  </Typography>
                )}
              </Box>
              
              {/* Passwort-Änderung (nur im Bearbeitungsmodus) */}
              {isEditing && (
                <Box sx={{ mt: 3 }}>
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                    Passwort ändern (optional)
                  </Typography>
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
                        {displayExercises} Übungen
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
