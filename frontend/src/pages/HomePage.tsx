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
  Stack,
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
import MorningMotivation from '../components/gamification/MorningMotivation';
import { alpha } from '@mui/material/styles';

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
    "Sie schaffen das!",
    "Bleiben Sie dran und glauben Sie an sich!",
    "Heute ist ein neuer Tag für neue Erfolge!",
    "Ihre Gesundheit ist das wertvollste Gut!",
    "Kleine Schritte führen zu großen Veränderungen!",
    "Sie sind stärker als Sie denken!",
    "Jede Übung bringt Sie Ihrem Ziel näher!",
    "Disziplin heute, Stolz morgen!",
    "Ihr Körper dankt Ihnen für jede Bewegung!",
    "Fortschritt ist besser als Perfektion!",
    "Sie investieren in Ihre beste Version!",
    "Glauben Sie an den Prozess!",
    "Motivation bringt Sie zum Start, Gewohnheit zum Ziel!",
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
  
  // Helper function to get display name for muscle groups
  const getMuscleGroupDisplayName = (muscleGroup: MuscleGroup): string => {
    if (muscleGroup === 'Schulter') return 'Schulter/Arme';
    return muscleGroup;
  };

  // Muskelgruppen-Icons zuordnen
  const getMuscleGroupIcon = (muscleGroup: MuscleGroup): React.ReactElement => {
    const iconStyle = { fontSize: '2rem', color: 'primary.main' };
    
    const icons: Record<MuscleGroup, React.ReactElement> = {
      'Bauch': <SelfImprovementIcon sx={iconStyle} />,
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
          <Card
            sx={{
              height: '100%',
              background: `linear-gradient(165deg, ${alpha('#0d1b1b', 0.82)} 0%, ${alpha('#133333', 0.94)} 100%)`,
              border: `1px solid ${alpha('#3fa3a3', 0.4)}`,
              boxShadow: '0 16px 32px rgba(5, 20, 20, 0.55)',
              color: '#e6f7f7',
              backdropFilter: 'blur(8px)'
            }}
          >
            <CardContent sx={{ pb: 3 }}>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1, letterSpacing: 0.5 }}>
                <EmojiEventsIcon color="primary" />
                Deine Fortschritte
              </Typography>
              
              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 2 }}>
                <Box
                  sx={{
                    textAlign: 'center',
                    p: 2,
                    borderRadius: 3,
                    background: `linear-gradient(140deg, ${alpha('#2d7d7d', 0.75)} 0%, ${alpha('#3fa3a3', 0.45)} 100%)`,
                    border: `1px solid ${alpha('#ffffff', 0.15)}`,
                    boxShadow: '0 6px 16px rgba(21, 56, 56, 0.45)'
                  }}
                >
                  <Typography variant="h4" fontWeight="bold" sx={{ color: '#f4ffff' }}>
                    {user?.points || 0}
                  </Typography>
                  <Typography variant="caption" sx={{ color: alpha('#ffffff', 0.8), letterSpacing: 1 }}>
                    Punkte
                  </Typography>
                </Box>
                
                <Box
                  sx={{
                    textAlign: 'center',
                    p: 2,
                    borderRadius: 3,
                    background: `linear-gradient(140deg, ${alpha('#ff8a65', 0.65)} 0%, ${alpha('#f06292', 0.55)} 100%)`,
                    border: `1px solid ${alpha('#ffffff', 0.18)}`,
                    boxShadow: '0 6px 16px rgba(88, 26, 26, 0.38)'
                  }}
                >
                  <Typography variant="h4" fontWeight="bold" sx={{ color: '#fff8f3' }}>
                    {user?.level || 1}
                  </Typography>
                  <Typography variant="caption" sx={{ color: alpha('#ffffff', 0.8), letterSpacing: 1 }}>
                    Level
                  </Typography>
                </Box>
                
                <Box
                  sx={{
                    textAlign: 'center',
                    p: 2,
                    borderRadius: 3,
                    background: `linear-gradient(140deg, ${alpha('#4caf50', 0.7)} 0%, ${alpha('#81c784', 0.48)} 100%)`,
                    border: `1px solid ${alpha('#ffffff', 0.12)}`,
                    boxShadow: '0 6px 16px rgba(26, 58, 34, 0.45)'
                  }}
                >
                  <Typography variant="h4" fontWeight="bold" sx={{ color: '#f0fff3' }}>
                    {user?.completedExercises?.length || 0}
                  </Typography>
                  <Typography variant="caption" sx={{ color: alpha('#ffffff', 0.8), letterSpacing: 1 }}>
                    Übungen
                  </Typography>
                </Box>
                
                <Box
                  sx={{
                    textAlign: 'center',
                    p: 2,
                    borderRadius: 3,
                    background: `linear-gradient(140deg, ${alpha('#ffa726', 0.7)} 0%, ${alpha('#ffcc80', 0.48)} 100%)`,
                    border: `1px solid ${alpha('#ffffff', 0.12)}`,
                    boxShadow: '0 6px 16px rgba(79, 46, 4, 0.35)'
                  }}
                >
                  <Typography variant="h4" fontWeight="bold" sx={{ color: '#fff5e6' }}>
                    {user?.achievements?.length || 0}
                  </Typography>
                  <Typography variant="caption" sx={{ color: alpha('#ffffff', 0.8), letterSpacing: 1 }}>
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
                  `Fantastisch! Sie trainieren seit ${user.dailyStreak} Tagen kontinuierlich!` :
                  "Starten Sie heute Ihren Streak! Jeder Tag zählt.",
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
    <Box
      sx={{
        minHeight: '100%',
        background: `radial-gradient(120% 120% at 50% 0%, ${alpha(theme.palette.primary.main, 0.12)} 0%, transparent 55%), linear-gradient(180deg, ${alpha('#1f5f5f', 0.85)} 0%, ${alpha('#0f1f1f', 0.92)} 65%, ${alpha('#0a1414', 0.98)} 100%)`,
        pt: { xs: 2, sm: 4 },
        pb: { xs: 6, md: 10 },
      }}
    >
      <Container 
        maxWidth="lg" 
        sx={{ 
          px: { xs: 1.5, sm: 3 },
          display: 'flex',
          flexDirection: 'column',
          gap: { xs: 3, md: 4 }
        }}
      >
      {/* Hero Section - Gamified Experience */}
      <Paper
        sx={{
          position: 'relative',
          overflow: 'hidden',
          color: 'white',
          p: { xs: 3.5, sm: 5 },
          borderRadius: 4,
          background: 'linear-gradient(135deg, #1f5f5f 0%, #2d7d7d 55%, #3fa3a3 100%)',
          boxShadow: '0 18px 40px rgba(15, 31, 31, 0.45)',
          border: `1px solid ${alpha('#ffffff', 0.18)}`,
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            pointerEvents: 'none',
            background: 'radial-gradient(circle at 20% 20%, rgba(255,255,255,0.35) 0%, transparent 55%), radial-gradient(circle at 80% 10%, rgba(255,220,180,0.45) 0%, transparent 50%)'
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            top: '-40%',
            left: '-30%',
            width: '80%',
            height: '80%',
            background: 'linear-gradient(120deg, rgba(255, 183, 77, 0.25) 0%, rgba(255, 138, 101, 0.45) 100%)',
            transform: 'rotate(18deg)',
            filter: 'blur(60px)',
            pointerEvents: 'none',
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            bottom: '-30%',
            right: '-10%',
            width: '55%',
            height: '55%',
            background: 'linear-gradient(120deg, rgba(63, 163, 163, 0.4) 0%, rgba(45, 125, 125, 0.7) 100%)',
            transform: 'rotate(-14deg)',
            filter: 'blur(50px)',
            pointerEvents: 'none',
          }}
        />
        {isAuthenticated && user && (
          <Box
            sx={{
              position: 'absolute',
              top: { xs: 20, sm: 24 },
              right: { xs: 20, sm: 28 },
              px: 2.5,
              py: 1.2,
              borderRadius: 999,
              background: 'linear-gradient(135deg, rgba(255,255,255,0.26) 0%, rgba(255,255,255,0.1) 100%)',
              border: `1px solid ${alpha('#ffffff', 0.35)}`,
              backdropFilter: 'blur(16px)',
              boxShadow: '0 12px 24px rgba(0,0,0,0.22)',
              textAlign: 'center',
            }}
          >
            <Typography sx={{ fontSize: '0.75rem', letterSpacing: 1.8, textTransform: 'uppercase', color: alpha('#ffffff', 0.75) }}>
              Aktuelles Ziel
            </Typography>
            <Typography sx={{ fontSize: '1.05rem', fontWeight: 700, color: '#ffffff' }}>
              {dailyProgress?.totalExercisesCompleted && dailyProgress.totalExercisesCompleted >= 3
                ? 'Sprint: Bleib im Flow!'
                : 'Warm-up: 3 Übungen abschließen'}
            </Typography>
          </Box>
        )}
        <Stack spacing={3.5} position="relative">
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} alignItems={{ xs: 'flex-start', sm: 'center' }}>
            <Chip
              icon={<StarIcon sx={{ color: '#ffd54f' }} />}
              label="Tägliche Quest aktiv"
              sx={{
                bgcolor: alpha('#ffffff', 0.12),
                color: 'white',
                fontWeight: 600,
                letterSpacing: 0.5,
                px: 1.5,
                py: 0.5,
                borderRadius: 999,
              }}
            />
            {isAuthenticated && user && (
              <Chip
                icon={<EmojiEventsIcon sx={{ color: '#ffab91' }} />}
                label={`Level ${user.level} • ${user.points} Punkte`}
                sx={{
                  bgcolor: alpha('#ffffff', 0.12),
                  color: 'white',
                  fontWeight: 600,
                  px: 1.5,
                  py: 0.5,
                  borderRadius: 999,
                }}
              />
            )}
          </Stack>

          <Stack spacing={2}>
            <Typography
              variant={isMobile ? 'h4' : 'h3'}
              component="h1"
              sx={{
                fontWeight: 800,
                lineHeight: 1.15,
                textTransform: 'uppercase',
                letterSpacing: { xs: 1.5, sm: 2 },
              }}
            >
              Willkommen zu deinem Trainingsabenteuer
            </Typography>
            <Typography
              variant="h6"
              sx={{
                maxWidth: 620,
                lineHeight: 1.6,
                color: alpha('#ffffff', 0.85),
              }}
            >
              Sammle Punkte, meistere Quests und bleib mit motivierenden Aktivpausen in Bewegung. Jeder Tag bringt dich näher zu mehr Mobilität, Stabilität und Lebensfreude.
            </Typography>
          </Stack>

          {isAuthenticated && user ? (
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2.5} alignItems="stretch">
              {[
                {
                  label: 'Aktiver Streak',
                  value: `${user.dailyStreak} Tage`,
                  icon: <TrendingUpIcon sx={{ fontSize: 36, color: '#fff8e1' }} />,
                  description: 'Halte deinen Rhythmus für Bonus-Punkte',
                },
                {
                  label: 'Freigeschaltete Erfolge',
                  value: `${user.achievements?.length ?? 0}`,
                  icon: <EmojiEventsIcon sx={{ fontSize: 36, color: '#ffe0b2' }} />,
                  description: 'Neue Herausforderungen warten auf dich',
                },
                {
                  label: 'Heute absolvierte Übungen',
                  value: `${dailyProgress?.totalExercisesCompleted ?? 0}`,
                  icon: <FitnessCenterIcon sx={{ fontSize: 36, color: '#b2ebf2' }} />,
                  description: 'Sichere dir den Perfekten Tag mit 6 Muskelgruppen',
                },
              ].map((stat) => (
                <Box
                  key={stat.label}
                  sx={{
                    flex: 1,
                    bgcolor: alpha('#0d1b1b', 0.35),
                    border: `1px solid ${alpha('#ffffff', 0.18)}`,
                    borderRadius: 3,
                    px: 3,
                    py: 2.5,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                    boxShadow: '0 12px 28px rgba(8, 16, 16, 0.45)',
                    backdropFilter: 'blur(12px)',
                  }}
                >
                  <Box
                    sx={{
                      width: 56,
                      height: 56,
                      borderRadius: '50%',
                      bgcolor: alpha('#ffffff', 0.12),
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {stat.icon}
                  </Box>
                  <Box>
                    <Typography sx={{ fontSize: '0.85rem', letterSpacing: 1.2, textTransform: 'uppercase', color: alpha('#ffffff', 0.65) }}>
                      {stat.label}
                    </Typography>
                    <Typography sx={{ fontSize: '1.6rem', fontWeight: 800, color: 'white', lineHeight: 1.2 }}>
                      {stat.value}
                    </Typography>
                    <Typography sx={{ fontSize: '0.9rem', color: alpha('#ffffff', 0.7) }}>
                      {stat.description}
                    </Typography>
                  </Box>
                </Box>
              ))}
            </Stack>
          ) : (
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <Button
                variant="contained"
                size="large"
                onClick={() => navigate('/register')}
                sx={{
                  background: 'linear-gradient(135deg, #ff8a65 0%, #ff7043 100%)',
                  color: '#fff',
                  fontWeight: 700,
                  px: 4,
                  py: 1.5,
                  borderRadius: 3,
                  boxShadow: '0 12px 24px rgba(255, 138, 101, 0.45)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #ff7043 0%, #ff5722 100%)',
                    boxShadow: '0 14px 28px rgba(255, 112, 67, 0.45)',
                  },
                }}
              >
                Jetzt kostenlos starten
              </Button>
              <Button
                variant="outlined"
                size="large"
                onClick={() => navigate('/login')}
                sx={{
                  borderColor: alpha('#ffffff', 0.45),
                  color: '#fff',
                  fontWeight: 600,
                  px: 4,
                  py: 1.5,
                  borderWidth: 2,
                  borderRadius: 3,
                  '&:hover': {
                    borderColor: '#fff',
                    backgroundColor: alpha('#ffffff', 0.12),
                  },
                }}
              >
                Bereits Mitglied? Anmelden
              </Button>
            </Stack>
          )}

          {isAuthenticated && (
            <Button
              variant="contained"
              color="secondary"
              size="large"
              onClick={() => navigate('/app/exercises')}
              sx={{
                alignSelf: { xs: 'stretch', sm: 'flex-start' },
                fontWeight: 700,
                px: { xs: 3, sm: 4 },
                py: 1.4,
                borderRadius: 3,
                textTransform: 'none',
                boxShadow: '0 12px 20px rgba(255, 138, 101, 0.35)',
                '&:hover': {
                  boxShadow: '0 16px 26px rgba(255, 138, 101, 0.4)',
                },
              }}
            >
              Training starten
            </Button>
          )}
        </Stack>
      </Paper>

      {/* Morning Motivation */}
      {isAuthenticated && <MorningMotivation />}

      {/* Weekly Training Plan Guidance */}
      {isAuthenticated && dailyProgress && (
        <Paper
          elevation={0}
          sx={{
            position: 'relative',
            overflow: 'hidden',
            p: { xs: 3, md: 4 },
            borderRadius: 4,
            border: `1px solid ${alpha('#3fa3a3', 0.35)}`,
            background: `linear-gradient(135deg, ${alpha('#123333', 0.92)} 0%, ${alpha('#1f5f5f', 0.88)} 70%, ${alpha('#224747', 0.95)} 100%)`,
            boxShadow: '0 18px 32px rgba(9, 18, 18, 0.45)'
          }}
        >
          <Box
            sx={{
              position: 'absolute',
              inset: 0,
              pointerEvents: 'none',
              background: 'radial-gradient(circle at 15% 20%, rgba(63, 163, 163, 0.35) 0%, transparent 45%), radial-gradient(circle at 85% 15%, rgba(255, 138, 101, 0.3) 0%, transparent 55%)'
            }}
          />
          <Typography variant="h5" gutterBottom sx={{ fontWeight: 700, color: '#e0f7f9', mb: 2, letterSpacing: 0.6 }}>
            📅 Dein Trainingsplan
          </Typography>
          <Typography variant="body1" paragraph sx={{ fontSize: '1.1rem', lineHeight: 1.6 }}>
            <strong>Basis-Training:</strong> Trainieren Sie jede Muskelgruppe mindestens einmal pro Tag. 
            Das gibt Ihrem Körper eine ausgewogene Grundlage.
          </Typography>
          <Typography variant="body1" paragraph sx={{ fontSize: '1.1rem', lineHeight: 1.6 }}>
            <strong>Fokus-Training:</strong> Danach können Sie zusätzliche Übungen für Ihre Lieblingsmuskelgruppen machen 
            und erhalten Bonus-Punkte!
          </Typography>
          <Box sx={{ mt: 2, p: 2.5, borderRadius: 3, background: alpha('#4caf50', 0.16), border: `1px dashed ${alpha('#81c784', 0.6)}`, color: '#c8f8d2' }}>
            <Typography variant="body1" sx={{ fontWeight: 700 }}>
              💡 Tipp: Trainiere alle 6 Muskelgruppen für einen "Perfekten Tag" und kassiere +50 Bonus-Punkte!
            </Typography>
          </Box>
        </Paper>
      )}

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
                    onClick={() => navigate('/app/profile')}
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
                          {['Bauch', 'Po', 'Schulter', 'Brust', 'Nacken', 'Rücken'].map((group: string) => {
                            const isTrained = dailyProgress.muscleGroupsTrainedToday?.includes(group as MuscleGroup);
                            return (
                              <Chip 
                                key={group}
                                icon={getMuscleGroupIcon(group as MuscleGroup)}
                                label={getMuscleGroupDisplayName(group as MuscleGroup)}
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
                          value={(dailyProgress.muscleGroupsTrainedToday?.length || 0) / (dailyProgress.totalMuscleGroups || 6) * 100}
                          sx={{ 
                            mt: 2, 
                            height: 8, 
                            borderRadius: 4,
                            backgroundColor: 'rgba(0,0,0,0.1)',
                            '& .MuiLinearProgress-bar': {
                              backgroundColor: dailyProgress.muscleGroupsTrainedToday?.length === (dailyProgress.totalMuscleGroups || 6) ? '#4caf50' : '#2196f3'
                            }
                          }}
                        />
                        <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                          {dailyProgress.muscleGroupsTrainedToday?.length === (dailyProgress.totalMuscleGroups || 6) 
                            ? "Fantastisch! Alle Muskelgruppen trainiert!" 
                            : `Noch ${(dailyProgress.totalMuscleGroups || 6) - (dailyProgress.muscleGroupsTrainedToday?.length || 0)} Muskelgruppen für die tägliche Challenge!`
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
                        onClick={() => navigate('/app/exercises')}
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
            {recommendedExercises.slice(0, 6).map((exercise) => {
              const durationLabel = exercise.duration && exercise.duration > 0 ? formatDuration(exercise.duration) : null;
              const categoryLabel = exercise.category === 'Kraft' ? 'Kräftigend' : 'Mobilisierend';
              const postureLabel = exercise.isSitting ? 'Sitzend' : 'Stehend';
              const therabandLabel = exercise.usesTheraband ? 'Mit Theraband' : 'Ohne Theraband';
              const displayName = exercise.name || (exercise as any).title || 'Übung';
              const overlayText = exercise.goal && exercise.goal.trim().length > 0 ? exercise.goal.trim() : displayName;
              const description = exercise.description && exercise.description.trim().length > 0 ? exercise.description.trim() : null;

              return (
                <Card 
                  key={exercise._id}
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
                  onClick={() => navigate(`/app/exercises/${exercise._id}`)}
                >
                  <Box>
                    {overlayText && (
                      <Box
                        sx={{
                          bgcolor: theme.palette.primary.main,
                          color: theme.palette.primary.contrastText,
                          py: 1,
                          px: 1.5,
                          textAlign: 'center',
                          borderRadius: '12px 12px 0 0'
                        }}
                      >
                        <Typography
                          variant={isMobile ? 'subtitle1' : 'h6'}
                          sx={{
                            fontWeight: 'bold',
                            fontSize: { xs: '1rem', sm: '1.2rem' },
                            lineHeight: 1.2,
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden'
                          }}
                        >
                          {overlayText}
                        </Typography>
                      </Box>
                    )}
                    <CardMedia
                      component="img"
                      height={isMobile ? "160" : "200"}
                      image={getThumbnailUrl(exercise)}
                      alt={overlayText}
                      sx={{
                        objectFit: 'contain',
                        borderRadius: overlayText ? '0' : '12px 12px 0 0',
                        bgcolor: '#f5f5f5'
                      }}
                    />
                  </Box>
                  <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                    <Box sx={{ 
                      display: 'flex', 
                      flexWrap: 'wrap',
                      gap: 1,
                      mb: 2 
                    }}>
                      <Chip 
                        icon={getMuscleGroupIcon(exercise.muscleGroup)}
                        label={getMuscleGroupDisplayName(exercise.muscleGroup)}
                        size={isMobile ? "medium" : "small"}
                        color="primary"
                        variant="outlined"
                        sx={{ 
                          fontWeight: 'bold',
                          fontSize: { xs: '0.9rem', sm: '0.75rem' },
                          height: { xs: 36, sm: 32 }
                        }}
                      />
                      {durationLabel && (
                        <Chip 
                          label={`Dauer: ${durationLabel}`}
                          size={isMobile ? "medium" : "small"}
                          color="secondary"
                          variant="outlined"
                          sx={{ 
                            fontSize: { xs: '0.9rem', sm: '0.75rem' },
                            height: { xs: 36, sm: 32 }
                          }}
                        />
                      )}
                      <Chip 
                        label={categoryLabel}
                        size={isMobile ? "medium" : "small"}
                        color="secondary"
                        variant="outlined"
                        sx={{ 
                          fontSize: { xs: '0.9rem', sm: '0.75rem' },
                          height: { xs: 36, sm: 32 }
                        }}
                      />
                      <Chip 
                        label={postureLabel}
                        size={isMobile ? "medium" : "small"}
                        variant="outlined"
                        sx={{ 
                          fontSize: { xs: '0.9rem', sm: '0.75rem' },
                          height: { xs: 36, sm: 32 }
                        }}
                      />
                      <Chip 
                        label={therabandLabel}
                        size={isMobile ? "medium" : "small"}
                        color={exercise.usesTheraband ? 'success' : 'default'}
                        variant={exercise.usesTheraband ? 'filled' : 'outlined'}
                        sx={{ 
                          fontSize: { xs: '0.9rem', sm: '0.75rem' },
                          height: { xs: 36, sm: 32 }
                        }}
                      />
                    </Box>
                    {description && (
                      <Typography 
                        variant="body2" 
                        color="text.secondary"
                        sx={{ 
                          fontSize: { xs: '1rem', sm: '0.875rem' },
                          fontWeight: 500,
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden'
                        }}
                      >
                        {description.length > 140 ? `${description.slice(0, 140)}…` : description}
                      </Typography>
                    )}
                  </CardContent>
                </Card>
              );
            })}
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
            onClick={() => navigate('/app/exercises')}
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
  </Box>
);
};

export default HomePage;
