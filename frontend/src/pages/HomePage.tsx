import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Box, 
  Typography, 
  Card, 
  CardContent, 
  Button, 
  CircularProgress,
  Paper,
  Avatar,
  Chip,
  Container,
  LinearProgress,
  CardMedia
} from '@mui/material';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import StarIcon from '@mui/icons-material/Star';
import { AuthContext } from '../contexts/AuthContext';
import { getDailyProgress } from '../services/progressService';
import { getRecommendedExercises } from '../services/progressService';
import { Exercise, MuscleGroup, DailyProgress } from '../types';
import { getThumbnailUrl } from '../components/exercises/exerciseUtils';
import StreakDisplay from '../components/gamification/StreakDisplay';
import MotivationalQuote from '../components/gamification/MotivationalQuote';

// Dauer formatieren - show seconds if under 1 minute  
const formatDuration = (seconds?: number): string => {
  if (!seconds || seconds <= 0) return 'Keine Angabe';
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.round(seconds % 60);
  
  if (minutes === 0) {
    return `${remainingSeconds} Sek.`;
  } else if (remainingSeconds === 0) {
    return `${minutes} Min.`;
  } else {
    return `${minutes} Min. ${remainingSeconds} Sek.`;
  }
};

// Kategorie-Text formatieren
const getMotivationalQuote = (): string => {
  const quotes = [
    "Jeder Schritt zählt! 💪",
    "Du schaffst das! 🌟",
    "Bleib dran und glaub an dich! 🔥",
    "Heute ist ein neuer Tag für neue Erfolge! ⚡",
    "Deine Gesundheit ist das wertvollste Gut! 💎",
    "Kleine Schritte führen zu großen Veränderungen! 🚀",
    "Du bist stärker als du denkst! 💪",
    "Jede Übung bringt dich deinem Ziel näher! 🎯",
    "Disziplin heute, Stolz morgen! 👑",
    "Dein Körper dankt dir für jede Bewegung! 🌈",
    "Fortschritt ist besser als Perfektion! ✨",
    "Du investierst in deine beste Version! 🌟",
    "Glaube an den Prozess! 🔥",
    "Motivation bringt dich zum Start, Gewohnheit zum Ziel! ⚡",
    "Heute ist der perfekte Tag zum Trainieren! 💎"
  ];

  const today = new Date();
  const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / 24 / 60 / 60 / 1000);
  return quotes[dayOfYear % quotes.length];
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

  const renderGamificationSection = () => (
    <Box sx={{ mb: 4 }}>
      {/* Daily Motivational Quote */}
      <Box sx={{ mb: 3 }}>
        <MotivationalQuote quote={getMotivationalQuote()} />
      </Box>
      
      {/* User Stats and Streak Row */}
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3, mb: 3 }}>
        {/* User Stats Overview */}
        <Box sx={{ flex: 1 }}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <EmojiEventsIcon color="primary" />
                Deine Fortschritte
              </Typography>
              
              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 2 }}>
                <Box sx={{ textAlign: 'center', p: 2, backgroundColor: 'primary.light', borderRadius: 2 }}>
                  <Typography variant="h4" fontWeight="bold" color="primary.contrastText">
                    {user?.points || 0}
                  </Typography>
                  <Typography variant="caption" color="primary.contrastText">
                    Punkte
                  </Typography>
                </Box>
                
                <Box sx={{ textAlign: 'center', p: 2, backgroundColor: 'secondary.light', borderRadius: 2 }}>
                  <Typography variant="h4" fontWeight="bold" color="secondary.contrastText">
                    {user?.level || 1}
                  </Typography>
                  <Typography variant="caption" color="secondary.contrastText">
                    Level
                  </Typography>
                </Box>
                
                <Box sx={{ textAlign: 'center', p: 2, backgroundColor: 'success.light', borderRadius: 2 }}>
                  <Typography variant="h4" fontWeight="bold" color="success.contrastText">
                    {user?.completedExercises?.length || 0}
                  </Typography>
                  <Typography variant="caption" color="success.contrastText">
                    Übungen
                  </Typography>
                </Box>
                
                <Box sx={{ textAlign: 'center', p: 2, backgroundColor: 'warning.light', borderRadius: 2 }}>
                  <Typography variant="h4" fontWeight="bold" color="warning.contrastText">
                    {user?.achievements?.length || 0}
                  </Typography>
                  <Typography variant="caption" color="warning.contrastText">
                    Achievements
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Box>
        
        {/* Streak Display */}
        <Box sx={{ flex: 1 }}>
          {user?.dailyStreak !== undefined && (
            <StreakDisplay 
              streakInfo={{
                currentStreak: user.dailyStreak,
                longestStreak: user.longestStreak || user.dailyStreak,
                message: user.dailyStreak > 0 ? 
                  `Fantastisch! Du trainierst seit ${user.dailyStreak} Tagen kontinuierlich!` :
                  "Starte heute deine Streak! Jeder Tag zählt.",
                streakBroken: false
              }}
            />
          )}
        </Box>
      </Box>
      
      {/* Recent Achievements */}
      {user?.achievements && user.achievements.length > 0 && (
        <Box sx={{ mb: 3 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <EmojiEventsIcon color="primary" />
                Deine Achievements
              </Typography>
              
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(3, 1fr)', md: 'repeat(6, 1fr)' }, gap: 2 }}>
                {user.achievements.slice(-6).map((achievement, index) => (
                  <Card 
                    key={index}
                    sx={{ 
                      textAlign: 'center', 
                      p: 2,
                      background: `linear-gradient(135deg, ${
                        achievement.rarity === 'legendary' ? '#ff9800' :
                        achievement.rarity === 'epic' ? '#9c27b0' :
                        achievement.rarity === 'rare' ? '#2196f3' : '#9e9e9e'
                      }20 0%, transparent 100%)`,
                      border: `1px solid ${
                        achievement.rarity === 'legendary' ? '#ff9800' :
                        achievement.rarity === 'epic' ? '#9c27b0' :
                        achievement.rarity === 'rare' ? '#2196f3' : '#9e9e9e'
                      }40`
                    }}
                  >
                    <Typography variant="h4" sx={{ mb: 1 }}>
                      {achievement.icon}
                    </Typography>
                    <Typography variant="caption" fontWeight="bold" display="block">
                      {achievement.title}
                    </Typography>
                    <Chip 
                      label={achievement.rarity.toUpperCase()} 
                      size="small"
                      sx={{ 
                        mt: 1,
                        backgroundColor: achievement.rarity === 'legendary' ? '#ff9800' :
                          achievement.rarity === 'epic' ? '#9c27b0' :
                          achievement.rarity === 'rare' ? '#2196f3' : '#9e9e9e',
                        color: 'white',
                        fontSize: '0.6rem'
                      }}
                    />
                  </Card>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Box>
      )}
      
      {/* Weekly Goal Progress */}
      {user?.weeklyGoal && (
        <Box>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <StarIcon color="primary" />
                Wochenziel
              </Typography>
              
              <Box sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">
                    {user.weeklyGoal.currentProgress}/{user.weeklyGoal.exercisesTarget} Übungen
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    {Math.round((user.weeklyGoal.currentProgress / user.weeklyGoal.exercisesTarget) * 100)}%
                  </Typography>
                </Box>
                <LinearProgress 
                  variant="determinate" 
                  value={(user.weeklyGoal.currentProgress / user.weeklyGoal.exercisesTarget) * 100}
                  sx={{ height: 8, borderRadius: 4 }}
                />
              </Box>
              
              {user.weeklyGoal.currentProgress >= user.weeklyGoal.exercisesTarget ? (
                <Chip 
                  label="🎉 Wochenziel erreicht!" 
                  color="success" 
                  sx={{ fontWeight: 'bold' }}
                />
              ) : (
                <Typography variant="body2" color="textSecondary">
                  Noch {user.weeklyGoal.exercisesTarget - user.weeklyGoal.currentProgress} Übungen bis zum Wochenziel
                </Typography>
              )}
            </CardContent>
          </Card>
        </Box>
      )}
    </Box>
  );

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Hero Section */}
      <Paper
        sx={{
          background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
          color: 'white',
          p: 4,
          mb: 4,
          borderRadius: 3
        }}
      >
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold', mb: 2 }}>
            Willkommen bei aboelo-fitness
          </Typography>
          <Typography variant="h6" sx={{ mb: 3, opacity: 0.9 }}>
            Ihr tägliches Fitness-Programm für mehr Beweglichkeit und Kraft
          </Typography>
        </Box>
      </Paper>

      {/* Gamification Section */}
      {isAuthenticated && user && renderGamificationSection()}

      {/* Main Content */}
      {isAuthenticated && user ? (
        <Box sx={{ mb: 5 }}>
          {/* Mein Account & Tagesfortschritt */}
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3 }}>
            {/* Account-Übersicht */}
            <Box sx={{ flex: { xs: 1, md: '0 0 300px' } }}>
              <Card sx={{ height: '100%', textAlign: 'center' }}>
                <CardContent>
                  <Avatar 
                    sx={{ 
                      mx: 'auto', 
                      mb: 2, 
                      width: 80, 
                      height: 80, 
                      bgcolor: 'primary.main',
                      fontSize: '2rem'
                    }}
                  >
                    {user.name.charAt(0).toUpperCase()}
                  </Avatar>
                  
                  <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 2 }}>
                    {user.name}
                  </Typography>
                  
                  <Typography variant="body1" sx={{ mb: 1 }}>
                    <strong>Level:</strong> {user.level}
                  </Typography>
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
            </Box>
            
            {/* Tagesfortschritt */}
            <Box sx={{ flex: 1 }}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <TrendingUpIcon sx={{ fontSize: 40, color: 'primary.main', mr: 2 }} />
                    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                      Tagesfortschritt
                    </Typography>
                  </Box>
                  
                  {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                      <CircularProgress />
                    </Box>
                  ) : dailyProgress ? (
                    <Box>
                      <Typography variant="body1" sx={{ mb: 2 }}>
                        <strong>Übungen heute:</strong> {dailyProgress.totalExercisesCompleted || 0}
                      </Typography>
                      <Typography variant="body1" sx={{ mb: 2 }}>
                        <strong>Trainierte Muskelgruppen:</strong> {dailyProgress.muscleGroupsTrainedToday?.length || 0} von {dailyProgress.totalMuscleGroups}
                      </Typography>
                      
                      {dailyProgress.muscleGroupsTrainedToday && dailyProgress.muscleGroupsTrainedToday.length > 0 && (
                        <Box sx={{ mt: 2 }}>
                          <Typography variant="subtitle2" sx={{ mb: 1 }}>
                            Trainierte Bereiche:
                          </Typography>
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                            {dailyProgress.muscleGroupsTrainedToday.map((group: MuscleGroup) => (
                              <Chip 
                                key={group}
                                label={`${getMuscleGroupIcon(group)} ${group}`}
                                size="small"
                                color="primary"
                                variant="outlined"
                              />
                            ))}
                          </Box>
                        </Box>
                      )}
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
            </Box>
          </Box>
        </Box>
      ) : (
        <Box sx={{ mt: 5, textAlign: 'center', color: 'text.secondary' }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Bitte melden Sie sich an, um Ihren Fortschritt zu verfolgen
          </Typography>
        </Box>
      )}

      {/* Empfohlene Übungen */}
      <Box sx={{ mb: 5 }}>
        <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 3, textAlign: 'center' }}>
          {isAuthenticated ? 'Empfohlene Übungen für Sie' : 'Unsere Übungen'}
        </Typography>
        
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : recommendedExercises.length > 0 ? (
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' }, gap: 3 }}>
            {recommendedExercises.slice(0, 6).map((exercise) => (
              <Card 
                key={(exercise as any)._id}
                sx={{ 
                  cursor: 'pointer',
                  transition: 'transform 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 6
                  }
                }}
                onClick={() => navigate(`/exercises/${(exercise as any)._id}`)}
              >
                <CardMedia
                  component="img"
                  height="180"
                  image={getThumbnailUrl(exercise)}
                  alt={exercise.name}
                  sx={{ objectFit: 'contain' }}
                />
                <CardContent>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
                    {exercise.name}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Chip 
                      label={`${getMuscleGroupIcon(exercise.muscleGroup)} ${exercise.muscleGroup}`}
                      size="small"
                      color="primary"
                      variant="outlined"
                      sx={{ mr: 1 }}
                    />
                    <Chip 
                      label={formatDuration(exercise.duration)}
                      size="small"
                      color="secondary"
                      variant="outlined"
                    />
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    {exercise.equipment?.includes('Theraband') ? '🎯 Mit Theraband' : '🏃‍♂️ Ohne Geräte'}
                  </Typography>
                </CardContent>
              </Card>
            ))}
          </Box>
        ) : (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="body1" color="text.secondary">
              Keine Übungen verfügbar
            </Typography>
          </Box>
        )}
        
        <Box sx={{ textAlign: 'center', mt: 4 }}>
          <Button 
            variant="outlined" 
            onClick={() => navigate('/exercises')}
            size="large"
            sx={{ fontSize: '1.1rem' }}
          >
            Alle Übungen anzeigen
          </Button>
        </Box>
      </Box>
    </Container>
  );
};

export default HomePage;
