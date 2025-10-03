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
  CardMedia,
  useMediaQuery,
  useTheme
} from '@mui/material';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import StarIcon from '@mui/icons-material/Star';
import SelfImprovementIcon from '@mui/icons-material/SelfImprovement';
import DirectionsRunIcon from '@mui/icons-material/DirectionsRun';
import DirectionsWalkIcon from '@mui/icons-material/DirectionsWalk';
import AccessibilityNewIcon from '@mui/icons-material/AccessibilityNew';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import PersonIcon from '@mui/icons-material/Person';
import AccessibilityIcon from '@mui/icons-material/Accessibility';
import { AuthContext } from '../contexts/AuthContext';
import { getDailyProgress } from '../services/progressService';
import { getRecommendedExercises } from '../services/progressService';
import { getAllExercises } from '../services/exerciseService';
import { Exercise, MuscleGroup, DailyProgress } from '../types';
import { getThumbnailUrl, preloadThumbnails } from '../components/exercises/exerciseUtils';
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
    "Jeder Schritt zählt!",
    "Du schaffst das!",
    "Bleib dran und glaub an dich!",
    "Heute ist ein neuer Tag für neue Erfolge!",
    "Deine Gesundheit ist das wertvollste Gut!",
    "Kleine Schritte führen zu großen Veränderungen!",
    "Du bist stärker als du denkst!",
    "Jede Übung bringt dich deinem Ziel näher!",
    "Disziplin heute, Stolz morgen!",
    "Dein Körper dankt dir für jede Bewegung!",
    "Fortschritt ist besser als Perfektion!",
    "Du investierst in deine beste Version!",
    "Glaube an den Prozess!",
    "Motivation bringt dich zum Start, Gewohnheit zum Ziel!",
    "Heute ist der perfekte Tag zum Trainieren!"
  ];

  const today = new Date();
  const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / 24 / 60 / 60 / 1000);
  return quotes[dayOfYear % quotes.length];
};

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useContext(AuthContext);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [recommendedExercises, setRecommendedExercises] = useState<Exercise[]>([]);
  const [dailyProgress, setDailyProgress] = useState<DailyProgress | null>(null);
  const [loading, setLoading] = useState(true);


  useEffect(() => {
    const fetchData = async () => {
      if (isAuthenticated) {
        try {
          setLoading(true);
          
          // Parallel API calls for better performance
          const [recommendationsData, dailyProgressData] = await Promise.all([
            getRecommendedExercises(),
            getDailyProgress()
          ]);
          
          // Process recommendations
          const exercises = (recommendationsData as any).recommendations || [];
          setRecommendedExercises(exercises as Exercise[]);
          
          // Preload thumbnails for better UX (especially for seniors)
          if (exercises.length > 0) {
            preloadThumbnails(exercises.slice(0, 6));
          }
          
          // Process daily progress
          setDailyProgress(dailyProgressData as unknown as DailyProgress);
          
        } catch (error) {
          console.error('Fehler beim Laden der Daten:', error);
          // Senior-friendly error handling - don't break the UI
          setRecommendedExercises([]);
          setDailyProgress(null);
        } finally {
          setLoading(false);
        }
      } else {
        // For non-authenticated users, show some sample exercises
        try {
          console.log('🔍 [DEBUG] HomePage: Lade Übungen für nicht-authentifizierte Benutzer...');
          const allExercises = await getAllExercises();
          console.log(`✅ [DEBUG] HomePage: ${allExercises.length} Übungen geladen`);
          
          // Show a random selection of exercises for guests
          const shuffled = allExercises.sort(() => 0.5 - Math.random());
          const selectedExercises = shuffled.slice(0, 3);
          console.log(`🎯 [DEBUG] HomePage: ${selectedExercises.length} Übungen für Anzeige ausgewählt`);
          
          setRecommendedExercises(selectedExercises);
          
          if (allExercises.length > 0) {
            console.log('🖼️ [DEBUG] HomePage: Starte Thumbnail-Preloading...');
            preloadThumbnails(selectedExercises);
          }
        } catch (error) {
          console.error('❌ [DEBUG] HomePage: Fehler beim Laden der Übungen:', error);
        }
        setLoading(false);
      }
    };
    
    fetchData();
  }, [isAuthenticated]);
  
  // Muskelgruppen-Icons zuordnen
  const getMuscleGroupIcon = (muscleGroup: MuscleGroup): React.ReactElement => {
    const iconStyle = { fontSize: '2rem', color: 'primary.main' };
    
    const icons: Record<MuscleGroup, React.ReactElement> = {
      'Bauch': <SelfImprovementIcon sx={iconStyle} />,
      'Beine': <DirectionsRunIcon sx={iconStyle} />,
      'Po': <DirectionsWalkIcon sx={iconStyle} />,
      'Schulter': <AccessibilityNewIcon sx={iconStyle} />,
      'Brust': <FavoriteBorderIcon sx={iconStyle} />,
      'Nacken': <PersonIcon sx={iconStyle} />,
      'Rücken': <AccessibilityIcon sx={iconStyle} />
    };
    
    return icons[muscleGroup] || <FitnessCenterIcon sx={iconStyle} />;
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
    <Container 
      maxWidth="lg" 
      sx={{ 
        py: { xs: 2, sm: 4 },
        px: { xs: 1, sm: 3 }
      }}
    >
      {/* Hero Section - Senior Optimized */}
      <Paper
        sx={{
          background: 'linear-gradient(135deg, #2d7d7d 0%, #3fa3a3 100%)',
          color: 'white',
          p: { xs: 3, sm: 4 },
          mb: { xs: 3, sm: 4 },
          borderRadius: 3,
          boxShadow: 3
        }}
      >
        <Box sx={{ textAlign: 'center' }}>
          <Typography 
            variant={isMobile ? "h5" : "h4"} 
            component="h1" 
            sx={{ 
              fontWeight: 'bold', 
              mb: 2,
              fontSize: { xs: '1.75rem', sm: '2.125rem' },
              lineHeight: 1.3
            }}
          >
            Willkommen bei aboelo-fitness
          </Typography>
          <Typography 
            variant={isMobile ? "body1" : "h6"} 
            sx={{ 
              mb: 3, 
              opacity: 0.95,
              fontSize: { xs: '1.1rem', sm: '1.25rem' },
              lineHeight: 1.4,
              maxWidth: 500,
              mx: 'auto'
            }}
          >
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
                    sx={{ 
                      mt: 2, 
                      fontSize: { xs: '1.2rem', sm: '1.1rem' },
                      py: { xs: 1.5, sm: 1 },
                      fontWeight: 'bold',
                      borderWidth: 2,
                      '&:hover': { borderWidth: 2 }
                    }}
                    fullWidth
                    size={isMobile ? "large" : "medium"}
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
                    <Box sx={{ 
                      display: 'flex', 
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center', 
                      py: 4,
                      gap: 2
                    }}>
                      <CircularProgress 
                        size={isMobile ? 48 : 40}
                        thickness={4}
                        sx={{ color: 'primary.main' }}
                      />
                      <Typography 
                        variant="body1" 
                        color="text.secondary"
                        sx={{ fontSize: { xs: '1.1rem', sm: '1rem' } }}
                      >
                        Lade Ihren Fortschritt...
                      </Typography>
                    </Box>
                  ) : dailyProgress ? (
                    <Box>
                      <Typography variant="body1" sx={{ mb: 2 }}>
                        <strong>Übungen heute:</strong> {dailyProgress.totalExercisesCompleted || 0}
                      </Typography>
                      <Typography variant="body1" sx={{ mb: 2 }}>
                        <strong>Trainierte Muskelgruppen:</strong> {dailyProgress.muscleGroupsTrainedToday?.length || 0} von {dailyProgress.totalMuscleGroups}
                      </Typography>
                      
                      {/* Daily Muscle Group Challenge Progress */}
                      <Box sx={{ mt: 2, mb: 2 }}>
                        <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold' }}>
                          Tägliche Muskelgruppen-Challenge
                        </Typography>
                        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: 1 }}>
                          {['Bauch', 'Beine', 'Po', 'Schulter', 'Brust', 'Nacken', 'Rücken'].map((group: string) => {
                            const isTrained = dailyProgress.muscleGroupsTrainedToday?.includes(group as MuscleGroup);
                            return (
                              <Chip 
                                key={group}
                                icon={getMuscleGroupIcon(group as MuscleGroup)}
                                label={group}
                                size="small"
                                color={isTrained ? "success" : "default"}
                                variant={isTrained ? "filled" : "outlined"}
                                sx={{ 
                                  opacity: isTrained ? 1 : 0.6,
                                  fontWeight: isTrained ? 'bold' : 'normal'
                                }}
                              />
                            );
                          })}
                        </Box>
                        <LinearProgress 
                          variant="determinate" 
                          value={(dailyProgress.muscleGroupsTrainedToday?.length || 0) / 7 * 100}
                          sx={{ 
                            mt: 2, 
                            height: 8, 
                            borderRadius: 4,
                            backgroundColor: 'rgba(0,0,0,0.1)',
                            '& .MuiLinearProgress-bar': {
                              backgroundColor: dailyProgress.muscleGroupsTrainedToday?.length === 7 ? '#4caf50' : '#2196f3'
                            }
                          }}
                        />
                        <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                          {dailyProgress.muscleGroupsTrainedToday?.length === 7 
                            ? "Fantastisch! Alle Muskelgruppen trainiert!" 
                            : `Noch ${7 - (dailyProgress.muscleGroupsTrainedToday?.length || 0)} Muskelgruppen für die tägliche Challenge!`
                          }
                        </Typography>
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
                        sx={{ 
                          fontSize: { xs: '1.3rem', sm: '1.1rem' },
                          py: { xs: 2, sm: 1.5 },
                          px: { xs: 4, sm: 3 },
                          fontWeight: 'bold',
                          borderRadius: 3,
                          minHeight: { xs: 56, sm: 48 },
                          boxShadow: 3,
                          '&:hover': { boxShadow: 6 }
                        }}
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
        <Typography 
          variant={isMobile ? "h6" : "h5"} 
          sx={{ 
            fontWeight: 'bold', 
            mb: { xs: 2, sm: 3 }, 
            textAlign: 'center',
            fontSize: { xs: '1.5rem', sm: '1.75rem' },
            color: 'primary.main',
            lineHeight: 1.3
          }}
        >
          {isAuthenticated ? 'Empfohlene Übungen für Sie' : 'Unsere Übungen'}
        </Typography>
        
        {loading ? (
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center', 
            py: 6,
            gap: 3
          }}>
            <CircularProgress 
              size={isMobile ? 56 : 48}
              thickness={4}
              sx={{ color: 'primary.main' }}
            />
            <Typography 
              variant={isMobile ? "h6" : "body1"} 
              color="text.secondary"
              sx={{ 
                fontSize: { xs: '1.2rem', sm: '1rem' },
                textAlign: 'center',
                fontWeight: 500
              }}
            >
              Lade passende Übungen für Sie...
            </Typography>
          </Box>
        ) : recommendedExercises.length > 0 ? (
          <Box sx={{ 
            display: 'grid', 
            gridTemplateColumns: { 
              xs: '1fr', 
              sm: 'repeat(2, 1fr)', 
              md: 'repeat(2, 1fr)',
              lg: 'repeat(3, 1fr)' 
            }, 
            gap: { xs: 2, sm: 3 },
            px: { xs: 1, sm: 0 }
          }}>
            {recommendedExercises.slice(0, 6).map((exercise) => (
              <Card 
                key={(exercise as any)._id}
                sx={{ 
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  border: isMobile ? '2px solid transparent' : '1px solid transparent',
                  borderRadius: 3,
                  minHeight: isMobile ? 300 : 280,
                  '&:hover': {
                    transform: isMobile ? 'scale(1.02)' : 'translateY(-4px)',
                    boxShadow: isMobile ? 8 : 6,
                    borderColor: theme.palette.primary.main
                  },
                  '&:active': {
                    transform: 'scale(0.98)',
                    transition: 'transform 0.1s'
                  }
                }}
                onClick={() => navigate(`/exercises/${(exercise as any)._id}`)}
              >
                <CardMedia
                  component="img"
                  height={isMobile ? "140" : "180"}
                  image={getThumbnailUrl(exercise)}
                  alt={exercise.name}
                  sx={{ 
                    objectFit: 'contain',
                    borderRadius: '12px 12px 0 0'
                  }}
                />
                <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                  <Typography 
                    variant={isMobile ? "h6" : "h6"} 
                    sx={{ 
                      fontWeight: 'bold', 
                      mb: 2,
                      fontSize: { xs: '1.1rem', sm: '1.25rem' },
                      lineHeight: 1.3,
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden'
                    }}
                  >
                    {exercise.name}
                  </Typography>
                  <Box sx={{ 
                    display: 'flex', 
                    flexDirection: isMobile ? 'column' : 'row',
                    alignItems: isMobile ? 'stretch' : 'center', 
                    gap: 1,
                    mb: 2 
                  }}>
                    <Chip 
                      icon={getMuscleGroupIcon(exercise.muscleGroup)}
                      label={exercise.muscleGroup}
                      size={isMobile ? "medium" : "small"}
                      color="primary"
                      variant="outlined"
                      sx={{ 
                        fontWeight: 'bold',
                        fontSize: { xs: '0.9rem', sm: '0.75rem' },
                        height: { xs: 36, sm: 32 }
                      }}
                    />
                    <Chip 
                      label={formatDuration(exercise.duration)}
                      size={isMobile ? "medium" : "small"}
                      color="secondary"
                      variant="outlined"
                      sx={{ 
                        fontSize: { xs: '0.9rem', sm: '0.75rem' },
                        height: { xs: 36, sm: 32 }
                      }}
                    />
                  </Box>
                  <Typography 
                    variant="body2" 
                    color="text.secondary"
                    sx={{ 
                      fontSize: { xs: '1rem', sm: '0.875rem' },
                      fontWeight: 500
                    }}
                  >
                    {exercise.equipment?.includes('Theraband') ? 'Mit Theraband' : 'Ohne Geräte'}
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
            sx={{ 
              fontSize: { xs: '1.2rem', sm: '1.1rem' },
              py: { xs: 1.5, sm: 1 },
              px: { xs: 4, sm: 3 },
              fontWeight: 'bold',
              borderWidth: 2,
              borderRadius: 3,
              minHeight: { xs: 48, sm: 42 },
              '&:hover': { 
                borderWidth: 2,
                transform: 'translateY(-1px)',
                boxShadow: 4
              }
            }}
          >
            Alle Übungen anzeigen
          </Button>
        </Box>
      </Box>
    </Container>
  );
};

export default HomePage;
