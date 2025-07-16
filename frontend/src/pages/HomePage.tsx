import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Box, 
  Typography, 
  Grid, 
  Card, 
  CardContent, 
  Button, 
  CircularProgress,
  CardActionArea,
  Divider,
  Paper,
  Avatar
} from '@mui/material';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import { AuthContext } from '../contexts/AuthContext';
import { getDailyProgress } from '../services/progressService';
import { getRecommendedExercises } from '../services/progressService';
import { Exercise, MuscleGroup, DailyProgress } from '../types';

// Dauer-Text formatieren
const formatDuration = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes} Min ${remainingSeconds} Sek`;
};

// YouTube Thumbnail URL erstellen
const getYouTubeThumbnail = (videoUrl: string): string => {
  const videoId = videoUrl.split('v=')[1]?.split('&')[0];
  return videoId ? `https://img.youtube.com/vi/${videoId}/mqdefault.jpg` : '';
};

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useContext(AuthContext);
  const [recommendedExercises, setRecommendedExercises] = useState<Exercise[]>([]);
  const [dailyProgress, setDailyProgress] = useState<DailyProgress | null>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchData = async () => {
      if (isAuthenticated) {
        try {
          setLoading(true);
          // Empfehlungen und Fortschritt laden
          // API-Antworten mit expliziter Typumwandlung, um Typ-Inkompatibilitäten zu beheben
          const recommendationsData = await getRecommendedExercises();
          const dailyProgressData = await getDailyProgress();
          
          // Typumwandlung für RecommendedExercises
          const exercises = (recommendationsData as any).recommendations || [];
          setRecommendedExercises(exercises as Exercise[]);
          
          // Typumwandlung für DailyProgress
          // Wir gehen davon aus, dass die API-Antwort die erwarteten Felder enthält
          setDailyProgress(dailyProgressData as unknown as DailyProgress);
        } catch (error) {
          console.error('Fehler beim Laden der Daten:', error);
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [isAuthenticated]);
  
  // Muskelgruppen-Icons zuordnen
  const getMuscleGroupIcon = (muscleGroup: MuscleGroup): string => {
    const icons: Record<MuscleGroup, string> = {
      'Bauch': '💪',
      'Beine': '🦵',
      'Po': '🍑',
      'Schulter': '💪',
      
      'Brust': '💪',
      'Nacken': '🧠',
      'Rücken': '🔄'
    };
    
    return icons[muscleGroup] || '💪';
  };
  
  return (
    <Box>
      {/* Willkommensbereich */}
      <Box sx={{ mb: 5, textAlign: 'center' }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold', mb: 2 }}>
          Willkommen bei aboelo-fitness
        </Typography>
        <Typography variant="h6" sx={{ color: 'text.secondary', mb: 3 }}>
          Ihr tägliches Fitness-Programm für mehr Beweglichkeit und Kraft
        </Typography>
      </Box>
      
      {isAuthenticated && user ? (
        <Box sx={{ mb: 5 }}>
          {/* Benutzer-Dashboard */}
          <Grid container spacing={3} sx={{ mb: 5 }}>
            {/* Begrüßungskarte */}
            <Grid size={{ xs: 12, md: 4 }}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Avatar sx={{ width: 60, height: 60, bgcolor: 'primary.main', fontSize: '1.5rem', mr: 2 }}>
                      {user.name.charAt(0).toUpperCase()}
                    </Avatar>
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                        Hallo, {user.name}!
                      </Typography>
                      <Typography variant="body1" color="text.secondary">
                        Level {user.level}
                      </Typography>
                    </Box>
                  </Box>
                  
                  <Divider sx={{ my: 2 }} />
                  
                  <Typography variant="body1" sx={{ mb: 1 }}>
                    <strong>Punkte:</strong> {user.points}
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 1 }}>
                    <strong>Tagesstreak:</strong> {user.dailyStreak} Tage
                  </Typography>
                  <Typography variant="body1">
                    <strong>Erfolge:</strong> {user.achievements.length}
                  </Typography>
                  
                  <Button 
                    variant="outlined" 
                    onClick={() => navigate('/profile')}
                    sx={{ mt: 2, fontSize: '1.1rem' }}
                    fullWidth
                  >
                    Zum Profil
                  </Button>
                </CardContent>
              </Card>
            </Grid>
            
            {/* Tagesfortschritt */}
            <Grid size={{ xs: 12, md: 8 }}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <TrendingUpIcon sx={{ fontSize: 40, color: 'primary.main', mr: 2 }} />
                    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                      Tagesfortschritt
                    </Typography>
                  </Box>
                  
                  <Divider sx={{ my: 2 }} />
                  
                  {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                      <CircularProgress />
                    </Box>
                  ) : dailyProgress ? (
                    <Box>
                      <Typography variant="body1" sx={{ mb: 2 }}>
                        <strong>Trainierte Muskelgruppen heute:</strong> {(dailyProgress as any).muscleGroupsTrainedToday?.length || 0} von {(dailyProgress as any).totalMuscleGroups || 8}
                      </Typography>
                      
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 3 }}>
                        {['Bauch', 'Beine', 'Po', 'Schulter', 'Brust', 'Nacken', 'Rücken'].map((group) => {
                          // Typumwandlung um auf die Eigenschaft zuzugreifen, die im Interface nicht definiert ist
                          const muscleGroupsTrainedToday = (dailyProgress as any).muscleGroupsTrainedToday || [];
                          const isTrained = muscleGroupsTrainedToday.includes(group as MuscleGroup);
                          return (
                            <Paper
                              key={group}
                              sx={{
                                px: 2,
                                py: 1,
                                display: 'flex',
                                alignItems: 'center',
                                bgcolor: isTrained ? 'success.light' : 'grey.100',
                                color: isTrained ? 'white' : 'text.primary',
                              }}
                            >
                              <Box component="span" sx={{ mr: 1, fontSize: '1.2rem' }}>
                                {getMuscleGroupIcon(group as MuscleGroup)}
                              </Box>
                              <Typography variant="body2">{group}</Typography>
                            </Paper>
                          );
                        })}
                      </Box>
                      
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Button 
                          variant="contained" 
                          onClick={() => navigate('/exercises')}
                          startIcon={<FitnessCenterIcon />}
                          sx={{ fontSize: '1.1rem' }}
                        >
                          Weiter trainieren
                        </Button>
                        <Button 
                          variant="outlined" 
                          onClick={() => navigate('/progress')}
                          startIcon={<TrendingUpIcon />}
                          sx={{ fontSize: '1.1rem' }}
                        >
                          Fortschritt ansehen
                        </Button>
                      </Box>
                    </Box>
                  ) : (
                    <Box sx={{ textAlign: 'center', py: 2 }}>
                      <Typography variant="body1" sx={{ mb: 2 }}>
                        Beginnen Sie Ihr Training für heute!
                      </Typography>
                      <Button 
                        variant="contained" 
                        onClick={() => navigate('/exercises')}
                        startIcon={<FitnessCenterIcon />}
                        size="large"
                        sx={{ fontSize: '1.1rem' }}
                      >
                        Übungen entdecken
                      </Button>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>
          </Grid>
          
          {/* Empfohlene Übungen */}
          <Box sx={{ mb: 5 }}>
            <Typography variant="h5" sx={{ mb: 3, fontWeight: 'bold' }}>
              Empfohlene Übungen für heute
            </Typography>
            
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress />
              </Box>
            ) : recommendedExercises.length > 0 ? (
              <Grid container spacing={3}>
                {recommendedExercises.map((exercise) => (
                  <Grid size={{ xs: 12, sm: 6, md: 4 }} key={(exercise as any)._id}>
                    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                      <CardActionArea 
                        onClick={() => navigate(`/exercises/${(exercise as any)._id}`)}
                        sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}
                      >
                        <Box sx={{ position: 'relative' }}>
                          <Box 
                            component="img"
                            src={exercise.thumbnailUrl || getYouTubeThumbnail(exercise.youtubeVideoId)}
                            alt={exercise.name}
                            sx={{ 
                              width: '100%',
                              height: 180,
                              objectFit: 'cover'
                            }}
                          />
                          <Box 
                            sx={{ 
                              position: 'absolute',
                              top: 10,
                              left: 10,
                              bgcolor: 'primary.main',
                              color: 'white',
                              py: 0.5,
                              px: 1.5,
                              borderRadius: 1,
                              display: 'flex',
                              alignItems: 'center'
                            }}
                          >
                            <Box component="span" sx={{ mr: 0.5, fontSize: '1.2rem' }}>
                              {getMuscleGroupIcon(exercise.muscleGroup)}
                            </Box>
                            <Typography variant="body2">{exercise.muscleGroup}</Typography>
                          </Box>
                          <Box 
                            sx={{ 
                              position: 'absolute',
                              bottom: 10,
                              right: 10,
                              bgcolor: 'rgba(0, 0, 0, 0.6)',
                              color: 'white',
                              py: 0.5,
                              px: 1,
                              borderRadius: 1
                            }}
                          >
                            <Typography variant="body2">{exercise.duration ? formatDuration(exercise.duration) : ''}</Typography>
                          </Box>
                        </Box>
                        <CardContent sx={{ flexGrow: 1 }}>
                          <Typography variant="h6" sx={{ mb: 1, fontWeight: 'bold' }}>
                            {exercise.name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                            {(exercise as any).type} • {(exercise as any).category}
                          </Typography>
                        </CardContent>
                      </CardActionArea>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            ) : (
              <Box sx={{ textAlign: 'center', p: 3, bgcolor: '#f5f5f5', borderRadius: 2 }}>
                <Typography variant="body1" sx={{ mb: 2 }}>
                  Sie haben bereits alle Muskelgruppen für heute trainiert!
                </Typography>
                <EmojiEventsIcon sx={{ fontSize: 60, color: 'gold', mb: 2 }} />
                <Typography variant="body1" sx={{ mb: 2 }}>
                  Fantastische Arbeit! Kommen Sie morgen wieder für neue Übungen.
                </Typography>
              </Box>
            )}
          </Box>
        </Box>
      ) : (
        <Box>
          {/* Anmeldungs-/Registrierungsaufforderung für nicht angemeldete Benutzer */}
          <Grid container spacing={4} sx={{ mb: 6 }}>
            <Grid size={{ xs: 12, md: 6 }}>
              <Box sx={{ textAlign: 'center' }}>
                <img 
                  src="/fitness-senior.jpg" 
                  alt="Seniorin macht Fitnessübungen"
                  style={{ 
                    maxWidth: '100%', 
                    height: 'auto',
                    borderRadius: '12px',
                    boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
                  }}
                />
              </Box>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Typography variant="h5" sx={{ mb: 2, fontWeight: 'bold' }}>
                Bleiben Sie aktiv und gesund
              </Typography>
              <Typography variant="body1" paragraph sx={{ fontSize: '1.1rem' }}>
                Mit aboelo-fitness erhalten Sie ein speziell für Senioren entwickeltes Trainingsprogramm, 
                das Ihnen hilft, Ihre Beweglichkeit zu verbessern und Ihre Muskeln zu stärken.
              </Typography>
              <Typography variant="body1" paragraph sx={{ fontSize: '1.1rem' }}>
                Unsere Übungen können im Sitzen oder Stehen durchgeführt werden und sind für alle Fitnesslevel geeignet.
              </Typography>
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3, gap: 2 }}>
                <Button 
                  variant="contained" 
                  color="primary" 
                  onClick={() => navigate('/login')}
                  size="large"
                  sx={{ fontSize: '1.1rem', py: 1.5, px: 3 }}
                >
                  Anmelden
                </Button>
                <Button 
                  variant="outlined" 
                  color="primary" 
                  onClick={() => navigate('/register')}
                  size="large"
                  sx={{ fontSize: '1.1rem', py: 1.5, px: 3 }}
                >
                  Registrieren
                </Button>
              </Box>
            </Grid>
          </Grid>
          
          {/* Funktionen der App */}
          <Box sx={{ mb: 6 }}>
            <Typography variant="h5" sx={{ mb: 4, textAlign: 'center', fontWeight: 'bold' }}>
              Was bietet aboelo-fitness?
            </Typography>
            <Grid container spacing={4}>
              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <Card sx={{ height: '100%', p: 2 }}>
                  <CardContent>
                    <Box sx={{ textAlign: 'center', mb: 2 }}>
                      <FitnessCenterIcon sx={{ fontSize: 60, color: 'primary.main' }} />
                    </Box>
                    <Typography variant="h6" sx={{ mb: 1, textAlign: 'center' }}>
                      Vielfältige Übungen
                    </Typography>
                    <Typography>
                      Über 60 Übungen für verschiedene Muskelgruppen, sowohl im Sitzen als auch im Stehen durchführbar.
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <Card sx={{ height: '100%', p: 2 }}>
                  <CardContent>
                    <Box sx={{ textAlign: 'center', mb: 2 }}>
                      <TrendingUpIcon sx={{ fontSize: 60, color: 'primary.main' }} />
                    </Box>
                    <Typography variant="h6" sx={{ mb: 1, textAlign: 'center' }}>
                      Fortschrittsverfolgung
                    </Typography>
                    <Typography>
                      Verfolgen Sie Ihren Trainingsfortschritt und sehen Sie, wie sich Ihre Fitness verbessert.
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <Card sx={{ height: '100%', p: 2 }}>
                  <CardContent>
                    <Box sx={{ textAlign: 'center', mb: 2 }}>
                      <EmojiEventsIcon sx={{ fontSize: 60, color: 'primary.main' }} />
                    </Box>
                    <Typography variant="h6" sx={{ mb: 1, textAlign: 'center' }}>
                      Spielerische Elemente
                    </Typography>
                    <Typography>
                      Sammeln Sie Punkte, erreichen Sie neue Level und verdienen Sie sich Abzeichen für Ihre Erfolge.
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Box>
          
          {/* Call-to-Action */}
          <Box sx={{ textAlign: 'center', p: 4, bgcolor: '#f5f5f5', borderRadius: 2 }}>
            <Typography variant="h5" sx={{ mb: 2, fontWeight: 'bold' }}>
              Starten Sie noch heute mit Ihrem Training!
            </Typography>
            <Typography variant="body1" sx={{ mb: 3, maxWidth: '600px', mx: 'auto' }}>
              Melden Sie sich an, um Zugriff auf alle Übungen zu erhalten und Ihren Fortschritt zu verfolgen.
            </Typography>
            <Button 
              variant="contained" 
              color="primary" 
              onClick={() => navigate('/register')}
              size="large"
              sx={{ fontSize: '1.2rem', py: 1.5, px: 4 }}
            >
              Jetzt kostenlos registrieren
            </Button>
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default HomePage;
