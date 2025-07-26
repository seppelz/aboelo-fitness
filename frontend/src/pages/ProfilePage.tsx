import React, { useState, useContext, useEffect } from 'react';
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
  Switch
} from '@mui/material';
import { AuthContext } from '../contexts/AuthContext';
import { updateProfile } from '../services/authService';
import { resetUserProgress } from '../services/authService';
import LockIcon from '@mui/icons-material/Lock';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import WhatshotIcon from '@mui/icons-material/Whatshot';
import StarIcon from '@mui/icons-material/Star';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';

const ProfilePage: React.FC = () => {
  // In AuthContext ist setUser nicht Teil der öffentlichen Schnittstelle
  // Wir verwenden nur die Eigenschaften, die tatsächlich im Kontext verfügbar sind
  const { user } = useContext(AuthContext);
  
  // Calculate estimated exercises from points for data consistency
  const estimatedExercises = user ? Math.floor((user.points || 0) / 10) : 0;
  const actualExercises = user?.completedExercises?.length || user?.totalExercisesCompleted || 0;
  
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
  
  // Zustandsvariablen für den Bearbeitungsmodus und Feedback
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isResetting, setIsResetting] = useState(false);
  
  // Benutzerdaten in das Formular laden
  useEffect(() => {
    if (user) {
      setName(user.name);
      setEmail(user.email);
      setAge(user.age ? user.age.toString() : '');
      setHasTheraband(user.hasTheraband || false);
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
        newPassword: newPassword || undefined
      };
      
      // updateProfile aktualisiert bereits den Benutzer im localStorage
      await updateProfile(updatedData);
      
      // Erfolgsbenachrichtigung anzeigen und Bearbeitungsmodus deaktivieren
      setSuccess('Profil erfolgreich aktualisiert.');
      setIsEditing(false);
      
      // Optional: Seite neu laden, um aktualisierte Daten aus dem localStorage zu holen
      // window.location.reload();
      
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
                    Mitglied seit {new Date(user.createdAt).toLocaleDateString('de-DE')}
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
