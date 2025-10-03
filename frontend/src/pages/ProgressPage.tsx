import React, { useState, useEffect, useContext } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Grid,
  CircularProgress, 
  Alert, 
  Divider,
  Card,
  CardContent,
  Tabs,
  Tab,
  LinearProgress,
  useTheme,
  Chip
} from '@mui/material';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import WhatshotIcon from '@mui/icons-material/Whatshot';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import SelfImprovementIcon from '@mui/icons-material/SelfImprovement';
import DirectionsRunIcon from '@mui/icons-material/DirectionsRun';
import DirectionsWalkIcon from '@mui/icons-material/DirectionsWalk';
import AccessibilityNewIcon from '@mui/icons-material/AccessibilityNew';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import PersonIcon from '@mui/icons-material/Person';
import AccessibilityIcon from '@mui/icons-material/Accessibility';
import { 
  getDailyProgress, 
  getWeeklyProgress, 
  getMonthlyProgress 
} from '../services/progressService';
import { AuthContext } from '../contexts/AuthContext';

// Importiere die Typen aus der zentralen types.ts
import { MuscleGroup } from '../types';

interface DailyProgress {
  date: string;
  totalExercisesCompleted: number;
  targetExercisesPerDay: number;
  dailyStreak: number;
  totalPoints: number;
  level: number;
  exercisesCompletedToday: {
    title: string;
    muscleGroup: string;
    type: string;
    category: string;
    pointsEarned: number;
  }[];
  muscleGroupsTrainedToday: string[];
  nextLevelPoints: number;
  levelProgress: number;
}

interface WeeklyProgress {
  weekStartDate: string;
  weekEndDate: string;
  totalExercisesThisWeek: number;
  totalPointsThisWeek: number;
  daysWithActivityThisWeek: number;
  activityByDay: {
    day: number;
    exercisesCompleted: number;
    pointsEarned: number;
    muscleGroupsTrained: string[];
  }[];
  dailyActivitySummary: {
    dayOfWeek: number;
    exercisesCompleted: number;
  }[];
  muscleGroupStats: {
    muscleGroup: string;
    count: number;
    percentage: number;
  }[];
  muscleGroupsTrainedThisWeek: string[];
}

interface MonthlyProgress {
  month: number;
  year: number;
  totalExercisesThisMonth: number;
  totalPointsThisMonth: number;
  daysWithActivityThisMonth: number;
  activityByDate: {
    date: string;
    exercisesCompleted: number;
    pointsEarned: number;
    muscleGroupsTrained: string[];
  }[];
  mostTrainedMuscleGroups: {
    muscleGroup: string;
    count: number;
    percentage: number;
  }[];
  activityByWeek: {
    weekStart: string;
    exercisesCompleted: number;
    pointsEarned: number;
  }[];
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel = (props: TabPanelProps) => {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`progress-tabpanel-${index}`}
      aria-labelledby={`progress-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: { xs: 2, md: 3 } }}>
          {children}
        </Box>
      )}
    </div>
  );
};

const ProgressPage: React.FC = () => {
  const { user } = useContext(AuthContext);
  const theme = useTheme();
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dailyProgress, setDailyProgress] = useState<DailyProgress | null>(null);
  const [weeklyProgress, setWeeklyProgress] = useState<WeeklyProgress | null>(null);
  const [monthlyProgress, setMonthlyProgress] = useState<MonthlyProgress | null>(null);
  
  // Laden des Fortschritts beim ersten Rendern
  useEffect(() => {
    const loadProgressData = async () => {
      try {
        setLoading(true);
        
        // Laden der Fortschrittsdaten für verschiedene Zeiträume
        const dailyData: any = await getDailyProgress();
        const weeklyData: any = await getWeeklyProgress();
        const monthlyData: any = await getMonthlyProgress();
        
        // Da es Unterschiede zwischen den Interface-Definitionen und den API-Rückgabedaten gibt,
        // verwenden wir einen sicheren Typumwandlungsansatz
        setDailyProgress(dailyData as unknown as DailyProgress);
        setWeeklyProgress(weeklyData as unknown as WeeklyProgress);
        setMonthlyProgress(monthlyData as unknown as MonthlyProgress);
        
        setError(null);
      } catch (err) {
        console.error('Fehler beim Laden der Fortschrittsdaten:', err);
        setError('Die Fortschrittsdaten konnten nicht geladen werden. Bitte versuchen Sie es später erneut.');
      } finally {
        setLoading(false);
      }
    };
    
    loadProgressData();
  }, []);
  
  // Tab-Wechsel-Handler
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };
  
  // Hilfsfunktion für Muskelgruppen-Icons
  const getMuscleGroupIcon = (group: string): React.ReactElement => {
    const iconStyle = { fontSize: '1.5rem', color: 'primary.main' };
    
    switch (group) {
      case 'Bauch': return <SelfImprovementIcon sx={iconStyle} />;
      case 'Beine': return <DirectionsRunIcon sx={iconStyle} />;
      case 'Po': return <DirectionsWalkIcon sx={iconStyle} />;
      case 'Schulter': return <AccessibilityNewIcon sx={iconStyle} />;
      case 'Brust': return <FavoriteBorderIcon sx={iconStyle} />;
      case 'Nacken': return <PersonIcon sx={iconStyle} />;
      case 'Rücken': return <AccessibilityIcon sx={iconStyle} />;
      default: return <FitnessCenterIcon sx={iconStyle} />;
    }
  };
  
  // Hilfsfunktion zum Formatieren von Wochentagen
  const formatDay = (dayOfWeek: number): string => {
    const days = ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'];
    return days[dayOfWeek] || '';
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress size={60} />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ m: 2 }}>
        {error}
      </Alert>
    );
  }

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', p: { xs: 2, sm: 3 } }}>
      <Typography variant="h4" component="h1" sx={{ mb: 4, fontWeight: 'bold', textAlign: 'center' }}>
        Mein Fortschritt
      </Typography>
      
      {/* Fortschritts-Übersicht */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 6, sm: 3 }}>
          <Paper 
            elevation={2} 
            sx={{ 
              p: 3, 
              textAlign: 'center',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <FitnessCenterIcon sx={{ fontSize: 40, mb: 1 }} />
            <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
              {dailyProgress?.totalExercisesCompleted || 0}
            </Typography>
            <Typography variant="body1">Übungen gesamt</Typography>
          </Paper>
        </Grid>
        
        <Grid size={{ xs: 6, sm: 3 }}>
          <Paper 
            elevation={2} 
            sx={{ 
              p: 3, 
              textAlign: 'center',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <EmojiEventsIcon sx={{ fontSize: 40, mb: 1 }} />
            <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
              {user?.points || 0}
            </Typography>
            <Typography variant="body1">Punkte gesamt</Typography>
          </Paper>
        </Grid>
        
        <Grid size={{ xs: 6, sm: 3 }}>
          <Paper 
            elevation={2} 
            sx={{ 
              p: 3, 
              textAlign: 'center',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <WhatshotIcon sx={{ fontSize: 40, mb: 1 }} />
            <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
              {dailyProgress?.dailyStreak || 0}
            </Typography>
            <Typography variant="body1">Tage in Folge</Typography>
          </Paper>
        </Grid>
        
        <Grid size={{ xs: 6, sm: 3 }}>
          <Paper 
            elevation={2} 
            sx={{ 
              p: 3, 
              textAlign: 'center',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: theme.palette.primary.light,
              color: theme.palette.primary.contrastText
            }}
          >
            <CalendarTodayIcon sx={{ fontSize: 40, mb: 1 }} />
            <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
              {user?.level || 1}
            </Typography>
            <Typography variant="body1">Aktuelles Level</Typography>
          </Paper>
        </Grid>
      </Grid>
      
      {/* Tabs für verschiedene Zeiträume */}
      <Paper elevation={2} sx={{ mb: 4 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs 
            value={tabValue} 
            onChange={handleTabChange} 
            aria-label="Zeitraum-Tabs"
            variant="fullWidth"
            sx={{ 
              '& .MuiTab-root': {
                fontSize: '1.1rem',
                py: 2
              }
            }}
          >
            <Tab label="Heute" id="tab-0" aria-controls="tabpanel-0" />
            <Tab label="Diese Woche" id="tab-1" aria-controls="tabpanel-1" />
            <Tab label="Dieser Monat" id="tab-2" aria-controls="tabpanel-2" />
          </Tabs>
        </Box>
        
        {/* Täglicher Fortschritt */}
        <TabPanel value={tabValue} index={0}>
          {dailyProgress ? (
            <Box>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
                Trainierte Muskelgruppen heute
              </Typography>
              
              <Grid container spacing={2} sx={{ mb: 4 }}>
                {['Bauch', 'Beine', 'Po', 'Schulter', 'Brust', 'Nacken', 'Rücken'].map((group) => {
                  const muscleGroup = group as MuscleGroup;
                  const isTrained = dailyProgress.muscleGroupsTrainedToday.indexOf(muscleGroup) !== -1;
                  
                  return (
                    <Grid size={{ xs: 6, sm: 4, md: 3 }} key={group}>
                      <Card 
                        sx={{ 
                          bgcolor: isTrained ? 'success.light' : 'grey.100',
                          color: isTrained ? 'white' : 'text.primary',
                          height: '100%'
                        }}
                      >
                        <CardContent sx={{ textAlign: 'center', py: 2 }}>
                          <Box sx={{ fontSize: '2rem', mb: 1 }}>
                            {getMuscleGroupIcon(muscleGroup)}
                          </Box>
                          <Typography variant="body1" sx={{ fontWeight: isTrained ? 'bold' : 'normal' }}>
                            {group}
                          </Typography>
                          <Typography variant="body2" sx={{ mt: 1 }}>
                            {isTrained ? 'Trainiert' : 'Nicht trainiert'}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                  );
                })}
              </Grid>
              
              <Divider sx={{ my: 3 }} />
              
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
                Heutige Übungen
              </Typography>
              
              {(dailyProgress as any).progress?.filter((p: any) => p.completed).length > 0 ? (
                (dailyProgress as any).progress.filter((p: any) => p.completed).map((progressItem: any, index: number) => (
                  <Card key={index} sx={{ mb: 2, p: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Box sx={{ mr: 2, fontSize: '1.5rem' }}>
                        {getMuscleGroupIcon(progressItem.exercise?.muscleGroup || 'Bauch')}
                      </Box>
                      <Box sx={{ flexGrow: 1 }}>
                        <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                          {progressItem.exercise?.title || 'Übung'}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {progressItem.exercise?.muscleGroup} • {progressItem.exercise?.type} • {progressItem.exercise?.category}
                        </Typography>
                      </Box>
                      <Typography variant="body2" color="text.secondary">
                        +{progressItem.pointsEarned || 0} Punkte
                      </Typography>
                    </Box>
                  </Card>
                ))
              ) : (
                <Alert severity="info">
                  Sie haben heute noch keine Übungen absolviert.
                </Alert>
              )}
              
              {dailyProgress && (
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Übungen heute
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <FitnessCenterIcon sx={{ mr: 1 }} />
                        <Typography variant="h4">
                          {dailyProgress.totalExercisesCompleted || 0}
                        </Typography>
                      </Box>
                      <LinearProgress 
                        variant="determinate" 
                        value={(dailyProgress.totalExercisesCompleted / (dailyProgress.targetExercisesPerDay || 1)) * 100} 
                        sx={{ height: 10, borderRadius: 5 }}
                      />
                      <Typography variant="body2" sx={{ mt: 1, color: 'text.secondary' }}>
                        Ziel: {dailyProgress.targetExercisesPerDay || 3} Übungen pro Tag
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              )}
            </Box>
          ) : (
            <Alert severity="info">
              Keine Daten für heute verfügbar.
            </Alert>
          )}
        </TabPanel>
        
        {/* Wöchentlicher Fortschritt */}
        <TabPanel value={tabValue} index={1}>
          {weeklyProgress ? (
            <Box>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 'bold' }}>
                Aktivität diese Woche
              </Typography>
              
              <Box sx={{ mb: 4 }}>
                {weeklyProgress.dailyActivitySummary && weeklyProgress.dailyActivitySummary.map((day: { dayOfWeek: number; exercisesCompleted: number }, index: number) => (
                  <Box key={index} sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body1" sx={{ fontWeight: day.exercisesCompleted > 0 ? 'bold' : 'normal' }}>
                        {formatDay(day.dayOfWeek)}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {day.exercisesCompleted} Übungen
                      </Typography>
                    </Box>
                    <LinearProgress 
                      variant="determinate" 
                      value={Math.min(100, (day.exercisesCompleted / 8) * 100)} 
                      sx={{ 
                        height: 10, 
                        borderRadius: 5,
                        bgcolor: 'grey.200',
                        '& .MuiLinearProgress-bar': {
                          bgcolor: day.exercisesCompleted > 0 ? 'success.main' : 'grey.400'
                        }
                      }} 
                    />
                  </Box>
                ))}
              </Box>
              
              <Divider sx={{ my: 3 }} />
              
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
                Wöchentliche Statistiken
              </Typography>
              
              <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <Card>
                    <CardContent sx={{ textAlign: 'center' }}>
                      <FitnessCenterIcon sx={{ fontSize: 36, mb: 1, color: 'primary.main' }} />
                      <Typography variant="h5" gutterBottom>
                        {weeklyProgress.totalExercisesThisWeek}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Übungen diese Woche
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                
                <Grid size={{ xs: 12, sm: 4 }}>
                  <Card>
                    <CardContent sx={{ textAlign: 'center' }}>
                      <EmojiEventsIcon sx={{ fontSize: 36, mb: 1, color: 'primary.main' }} />
                      <Typography variant="h5" gutterBottom>
                        {weeklyProgress.totalPointsThisWeek}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Punkte diese Woche
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                
                <Grid size={{ xs: 12, sm: 4 }}>
                  <Card>
                    <CardContent sx={{ textAlign: 'center' }}>
                      <CalendarTodayIcon sx={{ fontSize: 36, mb: 1, color: 'primary.main' }} />
                      <Typography variant="h5" gutterBottom>
                        {weeklyProgress.daysWithActivityThisWeek} / 7
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Aktive Tage
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
              
              <Divider sx={{ my: 3 }} />
              
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
                Tägliche Aktivität dieser Woche
              </Typography>
              
              {weeklyProgress.dailyActivitySummary && weeklyProgress.dailyActivitySummary.length > 0 ? (
                <Box sx={{ mb: 4 }}>
                  {weeklyProgress.dailyActivitySummary.map((day: { dayOfWeek: number; exercisesCompleted: number }, index: number) => (
                    <Box key={index} sx={{ mb: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body1" sx={{ fontWeight: day.exercisesCompleted > 0 ? 'bold' : 'normal' }}>
                          {['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'][day.dayOfWeek]}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {day.exercisesCompleted} Übungen
                        </Typography>
                      </Box>
                      <LinearProgress 
                        variant="determinate" 
                        value={Math.min(100, (day.exercisesCompleted / 8) * 100)} 
                        sx={{ 
                          height: 10, 
                          borderRadius: 5,
                          bgcolor: 'grey.200',
                          '& .MuiLinearProgress-bar': {
                            bgcolor: day.exercisesCompleted > 0 ? 'success.main' : 'grey.400'
                          }
                        }} 
                      />
                    </Box>
                  ))}
                </Box>
              ) : (
                <Alert severity="info">
                  Keine täglichen Aktivitätsdaten verfügbar.
                </Alert>
              )}
              
              <Divider sx={{ my: 3 }} />
              
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
                Trainierte Muskelgruppen diese Woche
              </Typography>
              
              {weeklyProgress.muscleGroupStats && weeklyProgress.muscleGroupStats.length > 0 ? (
                <Grid container spacing={2} sx={{ mb: 4 }}>
                  {weeklyProgress.muscleGroupStats.map((stat: { muscleGroup: string; count: number; percentage: number }, index: number) => (
                    <Grid size={{ xs: 12, sm: 6, md: 4 }} key={stat.muscleGroup}>
                      <Card sx={{ height: '100%' }}>
                        <CardContent>
                          <Typography variant="subtitle1" gutterBottom>
                            {stat.muscleGroup} {getMuscleGroupIcon(stat.muscleGroup)}
                          </Typography>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                            <Typography variant="body2" color="text.secondary">
                              {stat.count}x trainiert
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {Math.round(stat.percentage)}%
                            </Typography>
                          </Box>
                          <LinearProgress 
                            variant="determinate" 
                            value={stat.percentage} 
                            sx={{ height: 6, borderRadius: 3 }}
                          />
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              ) : (
                <Alert severity="info">
                  Keine Muskelgruppen-Statistiken für diese Woche verfügbar.
                </Alert>
              )}
            </Box>
          ) : (
            <Alert severity="info">
              Keine Daten für diese Woche verfügbar.
            </Alert>
          )}
        </TabPanel>
        
        {/* Monatlicher Fortschritt */}
        <TabPanel value={tabValue} index={2}>
          {monthlyProgress ? (
            <Box>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 'bold' }}>
                Übersicht für {new Date(monthlyProgress.year, monthlyProgress.month - 1).toLocaleString('de-DE', { month: 'long' })} {monthlyProgress.year}
              </Typography>
              
              <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <Card>
                    <CardContent sx={{ textAlign: 'center' }}>
                      <FitnessCenterIcon sx={{ fontSize: 36, mb: 1, color: 'primary.main' }} />
                      <Typography variant="h5" gutterBottom>
                        {monthlyProgress.totalExercisesThisMonth}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Übungen diesen Monat
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                
                <Grid size={{ xs: 12, sm: 4 }}>
                  <Card>
                    <CardContent sx={{ textAlign: 'center' }}>
                      <EmojiEventsIcon sx={{ fontSize: 36, mb: 1, color: 'primary.main' }} />
                      <Typography variant="h5" gutterBottom>
                        {monthlyProgress.totalPointsThisMonth}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Punkte diesen Monat
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                
                <Grid size={{ xs: 12, sm: 4 }}>
                  <Card>
                    <CardContent sx={{ textAlign: 'center' }}>
                      <CalendarTodayIcon sx={{ fontSize: 36, mb: 1, color: 'primary.main' }} />
                      <Typography variant="h5" gutterBottom>
                        {monthlyProgress.daysWithActivityThisMonth}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Aktive Tage
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
              
              <Divider sx={{ my: 3 }} />
              
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
                Wöchentliche Aktivität
              </Typography>
              
              {monthlyProgress.activityByDate && monthlyProgress.activityByDate.length > 0 ? (
                <Box sx={{ mb: 4 }}>
                  {monthlyProgress.activityByDate.map((dayActivity: any, index: number) => (
                    dayActivity.exercisesCompleted > 0 && (
                      <Box key={index} sx={{ mb: 3 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                          <Typography variant="body1">
                            {new Date(dayActivity.date).toLocaleDateString('de-DE', { weekday: 'long', day: 'numeric', month: 'numeric' })}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {dayActivity.exercisesCompleted} Übungen
                          </Typography>
                        </Box>
                        <LinearProgress 
                          variant="determinate" 
                          value={Math.min(100, (dayActivity.exercisesCompleted / 5) * 100)} 
                          sx={{ height: 10, borderRadius: 5 }}
                        />
                        <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                          {dayActivity.pointsEarned} Punkte
                        </Typography>
                      </Box>
                    )
                  ))}
                </Box>
              ) : (
                <Alert severity="info">
                  Keine Aktivitäten in diesem Monat aufgezeichnet.
                </Alert>
              )}
            </Box>
          ) : (
            <Alert severity="info">
              Keine Daten für diesen Monat verfügbar.
            </Alert>
          )}
        </TabPanel>
      </Paper>
    </Box>
  );
};

export default ProgressPage;
