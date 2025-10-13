import React, { useState, useEffect, useContext } from 'react';
import { 
  Box, 
  Card, 
  CardContent,
  CardMedia, 
  Button,
  Grid,
  Typography,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  SelectChangeEvent,
  Container,
  Paper,
  useMediaQuery,
  useTheme
} from '@mui/material';
import FilterListIcon from '@mui/icons-material/FilterList';
import TuneIcon from '@mui/icons-material/Tune';
import { useNavigate } from 'react-router-dom';
import { getAllExercises } from '../../services/exerciseService';
import { Exercise, MuscleGroup, ExerciseType, ExerciseCategory, Equipment } from '../../types';
import { getThumbnailUrl } from './exerciseUtils';
import { AuthContext } from '../../contexts/AuthContext';



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
const getCategoryText = (category: string): string => {
  return category === 'Kraft' ? 'Kräftigend' : 'Mobilisierend';
};

const ExerciseList: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [filteredExercises, setFilteredExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filter-Zustände
  const [muscleGroup, setMuscleGroup] = useState<MuscleGroup | 'all'>('all');
  const [category, setCategory] = useState<ExerciseCategory | 'all'>('all');
  
  // Boolean Filter mit String-Repräsentation für die UI
  const [isSitting, setIsSitting] = useState<boolean | 'all'>('all');
  const [usesTheraband, setUsesTheraband] = useState<boolean | 'all'>('all');
  const [isDynamic, setIsDynamic] = useState<boolean | 'all'>('all');
  const [isUnilateral, setIsUnilateral] = useState<boolean | 'all'>('all');
  
  // Kompatibilitätsvariablen für ältere Komponenten
  const [type, setType] = useState<ExerciseType | 'all'>('all');
  const [equipment, setEquipment] = useState<Equipment | 'all'>('all');
  
  // Navigation zur Detailseite
  const navigateToDetail = (id: string) => {
    navigate(`/app/exercises/${id}`);
  };
  
  // Zurücksetzen aller Filter
  const resetFilters = () => {
    setMuscleGroup('all');
    setCategory('all');
    setIsSitting('all');
    setUsesTheraband('all');
    setIsDynamic('all');
    setIsUnilateral('all');
    setType('all');
    setEquipment('all');
  };
  

  
  // Helper-Funktion für String-Konvertierung der booleschen Filter
  const getBooleanFilterValue = (value: boolean | 'all', trueValue: string, falseValue: string): string => {
    if (value === true) return trueValue;
    if (value === false) return falseValue;
    return 'all';
  };
  
  // Helper-Funktion zum Umwandeln von String-Werten in boolesche Werte
  const handleBooleanFilterChange = (
    value: string,
    trueValue: string,
    falseValue: string,
    setter: (value: boolean | 'all') => void
  ): void => {
    if (value === trueValue) {
      setter(true);
    } else if (value === falseValue) {
      setter(false);
    } else {
      setter('all');
    }
  };
  
  // Übungen vom Server laden
  useEffect(() => {
    const fetchExercises = async () => {
      try {
        const data = await getAllExercises();
        setExercises(data);
        setFilteredExercises(data);
        setLoading(false);
      } catch (err) {
        setError('Fehler beim Laden der Übungen. Bitte versuche es später erneut.');
        setLoading(false);
        console.error('Error fetching exercises:', err);
      }
    };
    
    fetchExercises();
  }, []);
  
  // Filter anwenden
  useEffect(() => {
    let result = exercises;
    
    // Apply user's theraband preference if user doesn't have theraband
    // This will filter out theraband exercises for users without theraband
    // Users with theraband can see all exercises (with and without theraband)
    if (user && !user.hasTheraband) {
      result = result.filter(exercise => !(exercise as any).usesTheraband);
    }
    
    if (muscleGroup !== 'all') {
      result = result.filter(exercise => exercise.muscleGroup === muscleGroup);
    }
    
    if (category !== 'all') {
      // Typprüfung mit explizitem Type-Cast für die Kategorie
      result = result.filter(exercise => (exercise as any).category === category);
    }
    
    // Neue Boolean-Filter mit expliziten Type-Casts
    if (isSitting !== 'all') {
      result = result.filter(exercise => (exercise as any).isSitting === isSitting);
    }
    
    if (usesTheraband !== 'all') {
      result = result.filter(exercise => (exercise as any).usesTheraband === usesTheraband);
    }
    
    if (isDynamic !== 'all') {
      result = result.filter(exercise => (exercise as any).isDynamic === isDynamic);
    }
    
    if (isUnilateral !== 'all') {
      result = result.filter(exercise => (exercise as any).isUnilateral === isUnilateral);
    }
    
    // Kompatibilitätsfilter für ältere Komponenten
    if (type !== 'all') {
      // Wenn type gesetzt ist, Mapping zur neuen isSitting-Eigenschaft
      const sitzend = type === 'sitzend' as ExerciseType ? true : false;
      result = result.filter(exercise => (exercise as any).isSitting === sitzend);
    }
    
    if (equipment !== 'all') {
      // Wenn equipment gesetzt ist, Mapping zur neuen usesTheraband-Eigenschaft
      const usesTheraBand = equipment === 'Theraband';
      result = result.filter(exercise => (exercise as any).usesTheraband === usesTheraBand);
    }
    
    setFilteredExercises(result);
  }, [exercises, muscleGroup, category, isSitting, usesTheraband, isDynamic, isUnilateral, type, equipment, user]);
  

  // Laden oder Fehler anzeigen - Senior-friendly mit Beschreibung
  if (loading) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column',
          alignItems: 'center', 
          justifyContent: 'center',
          minHeight: '60vh',
          gap: 3
        }}>
          <CircularProgress size={isMobile ? 60 : 80} thickness={4} />
          <Typography 
            variant={isMobile ? "h6" : "h5"} 
            color="primary" 
            sx={{ 
              fontWeight: 'bold',
              fontSize: { xs: '1.25rem', sm: '1.5rem' }
            }}
          >
            Übungen werden geladen...
          </Typography>
          <Typography 
            variant="body1" 
            color="text.secondary"
            sx={{ fontSize: { xs: '1rem', sm: '1.1rem' } }}
          >
            Einen Moment bitte
          </Typography>
        </Box>
      </Container>
    );
  }
  
  if (error) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ py: { xs: 2, sm: 4 }, px: { xs: 1, sm: 3 } }}>
          <Alert 
            severity="error" 
            sx={{ 
              mt: 4, 
              fontSize: { xs: '1rem', sm: '1.1rem' },
              '& .MuiAlert-message': {
                fontSize: 'inherit'
              }
            }}
          >
            {error}
          </Alert>
          <Box sx={{ textAlign: 'center', mt: 4 }}>
            <Button 
              variant="contained" 
              onClick={() => window.location.reload()}
              sx={{ 
                fontSize: { xs: '1rem', sm: '1.1rem' },
                minHeight: 48,
                px: 4
              }}
            >
              Seite neu laden
            </Button>
          </Box>
        </Box>
      </Container>
    );
  }

  return (
    <Container 
      maxWidth="lg" 
      sx={{ 
        py: { xs: 2, sm: 4 },
        px: { xs: 1, sm: 3 }
      }}
    >
      {/* Header Section - Senior-friendly Typography */}
      <Box sx={{ mb: 4 }}>
        <Typography 
          variant={isMobile ? "h5" : "h4"} 
          component="h1" 
          gutterBottom
          sx={{ 
            fontWeight: 'bold',
            fontSize: { xs: '1.75rem', sm: '2.125rem' },
            mb: 2
          }}
        >
          Alle Übungen
        </Typography>
        
        <Typography 
          variant="body1" 
          paragraph
          sx={{ 
            fontSize: { xs: '1.05rem', sm: '1.15rem' },
            lineHeight: 1.6,
            color: 'text.secondary'
          }}
        >
          Wähle aus <strong>{exercises.length} Übungen</strong> für verschiedene Muskelgruppen. 
          Nutze die Filter, um die passenden Übungen zu finden.
        </Typography>
      </Box>
      
      {/* Filter-Menü - Senior-friendly Design */}
      <Paper 
        elevation={2}
        sx={{ 
          mb: 4, 
          p: { xs: 2, sm: 3 }, 
          borderRadius: 2,
          bgcolor: 'background.paper'
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
          <FilterListIcon color="primary" sx={{ fontSize: '1.75rem' }} />
          <Typography 
            variant="h6" 
            sx={{ 
              fontWeight: 'bold',
              fontSize: { xs: '1.15rem', sm: '1.25rem' }
            }}
          >
            Filter anwenden
          </Typography>
        </Box>
        
        <Grid container spacing={2}>
          {/* Muskelgruppen-Filter */}
          <Grid sx={{ gridColumn: { xs: 'span 12', sm: 'span 6', md: 'span 3' } }}>
            <FormControl fullWidth size="medium" sx={{ mb: 2 }}>
              <InputLabel id="muscle-group-label">Muskelgruppe</InputLabel>
              <Select
                labelId="muscle-group-label"
                id="muscle-group"
                value={muscleGroup}
                label="Muskelgruppe"
                onChange={(e: SelectChangeEvent<string>) => setMuscleGroup(e.target.value as MuscleGroup | 'all')}
              >
                <MenuItem value="all">Alle Muskelgruppen</MenuItem>
                <MenuItem value="Bauch">Bauch</MenuItem>
                <MenuItem value="Po">Po</MenuItem>
                <MenuItem value="Schulter">Schulter</MenuItem>
                
                <MenuItem value="Brust">Brust</MenuItem>
                <MenuItem value="Nacken">Nacken</MenuItem>
                <MenuItem value="Rücken">Rücken</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          {/* Kategorie-Filter */}
          <Grid sx={{ gridColumn: { xs: 'span 12', sm: 'span 6', md: 'span 3' } }}>
            <FormControl fullWidth size="medium" sx={{ mb: 2 }}>
              <InputLabel id="category-label">Kategorie</InputLabel>
              <Select
                labelId="category-label"
                id="category"
                value={category}
                label="Kategorie"
                onChange={(e: SelectChangeEvent<string>) => setCategory(e.target.value as ExerciseCategory | 'all')}
              >
                <MenuItem value="all">Alle Kategorien</MenuItem>
                <MenuItem value="Mobilisation">Mobilisierend</MenuItem>
                <MenuItem value="Kraft">Kräftigend</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
        
        {/* Advanced Filters Section */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 4, mb: 2 }}>
          <TuneIcon color="action" sx={{ fontSize: '1.5rem' }} />
          <Typography 
            variant="subtitle1" 
            sx={{ 
              fontWeight: 600,
              fontSize: { xs: '1.05rem', sm: '1.1rem' }
            }}
          >
            Erweiterte Filter
          </Typography>
        </Box>
        
        <Grid container spacing={2}>
          {/* Position (sitzend/stehend) */}
          <Grid sx={{ gridColumn: { xs: 'span 12', sm: 'span 6', md: 'span 4' } }}>
            <FormControl fullWidth variant="outlined" sx={{ mb: 2 }}>
              <InputLabel>Position</InputLabel>
              <Select
                value={getBooleanFilterValue(isSitting, 'sitzend', 'stehend')}
                onChange={(e: SelectChangeEvent<string>) => {
                  handleBooleanFilterChange(
                    e.target.value,
                    'sitzend',
                    'stehend',
                    setIsSitting
                  );
                  // Kompatibilität mit älterem type-Feld
                  if (e.target.value === 'sitzend') {
                    setType('sitting' as ExerciseType);
                  } else if (e.target.value === 'stehend') {
                    setType('standing' as ExerciseType);
                  } else {
                    setType('all');
                  }
                }}
                label="Position"
              >
                <MenuItem value="all">Alle</MenuItem>
                <MenuItem value="sitzend">Sitzend</MenuItem>
                <MenuItem value="stehend">Stehend</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          {/* Theraband */}
          <Grid sx={{ gridColumn: { xs: 'span 12', sm: 'span 6', md: 'span 4' } }}>
            <FormControl fullWidth variant="outlined" sx={{ mb: 2 }}>
              <InputLabel>Theraband</InputLabel>
              <Select
                value={getBooleanFilterValue(usesTheraband, 'mit', 'ohne')}
                onChange={(e: SelectChangeEvent<string>) => {
                  handleBooleanFilterChange(
                    e.target.value,
                    'mit',
                    'ohne',
                    setUsesTheraband
                  );
                  // Kompatibilität mit älterem equipment-Feld
                  if (e.target.value === 'mit') {
                    setEquipment('Theraband' as Equipment);
                  } else {
                    setEquipment('all');
                  }
                }}
                label="Theraband"
              >
                <MenuItem value="all">Alle</MenuItem>
                <MenuItem value="mit">Mit Theraband</MenuItem>
                <MenuItem value="ohne">Ohne Theraband</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          {/* Bewegungstyp (dynamisch/statisch) */}
          <Grid sx={{ gridColumn: { xs: 'span 12', sm: 'span 6', md: 'span 4' } }}>
            <FormControl fullWidth variant="outlined" sx={{ mb: 2 }}>
              <InputLabel>Bewegungstyp</InputLabel>
              <Select
                value={getBooleanFilterValue(isDynamic, 'dynamisch', 'statisch')}
                onChange={(e: SelectChangeEvent<string>) => {
                  handleBooleanFilterChange(
                    e.target.value,
                    'dynamisch',
                    'statisch',
                    setIsDynamic
                  );
                }}
                label="Bewegungstyp"
              >
                <MenuItem value="all">Alle</MenuItem>
                <MenuItem value="dynamisch">Dynamisch</MenuItem>
                <MenuItem value="statisch">Statisch</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          {/* Ausführung (einseitig/beidseitig) */}
          <Grid sx={{ gridColumn: { xs: 'span 12', sm: 'span 6', md: 'span 4' } }}>
            <FormControl fullWidth variant="outlined" sx={{ mb: 2 }}>
              <InputLabel>Ausführung</InputLabel>
              <Select
                value={getBooleanFilterValue(isUnilateral, 'einseitig', 'beidseitig')}
                onChange={(e: SelectChangeEvent<string>) => {
                  handleBooleanFilterChange(
                    e.target.value,
                    'einseitig',
                    'beidseitig',
                    setIsUnilateral
                  );
                }}
                label="Ausführung"
              >
                <MenuItem value="all">Alle</MenuItem>
                <MenuItem value="einseitig">Einseitig</MenuItem>
                <MenuItem value="beidseitig">Beidseitig</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
        
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
          <Button 
            variant="outlined" 
            color="secondary" 
            onClick={resetFilters}
            size="large"
            sx={{ 
              minHeight: 48,
              px: 3,
              fontSize: { xs: '0.95rem', sm: '1rem' },
              fontWeight: 600
            }}
          >
            Alle Filter zurücksetzen
          </Button>
        </Box>
      </Paper>
      
      {/* Ergebniszähler - Senior-friendly */}
      <Paper 
        elevation={1}
        sx={{ 
          mb: 3, 
          p: 2,
          bgcolor: 'primary.light',
          color: 'primary.contrastText',
          borderRadius: 2
        }}
      >
        <Typography 
          variant="h6"
          sx={{ 
            fontWeight: 'bold',
            fontSize: { xs: '1.1rem', sm: '1.25rem' },
            textAlign: 'center'
          }}
        >
          {filteredExercises.length} {filteredExercises.length === 1 ? 'Übung' : 'Übungen'} gefunden
        </Typography>
      </Paper>
      
      {/* Übungsliste */}
      {filteredExercises.length === 0 ? (
        <Paper 
          elevation={2}
          sx={{ 
            textAlign: 'center', 
            py: { xs: 6, sm: 8 },
            px: 3,
            bgcolor: 'background.paper',
            borderRadius: 2
          }}
        >
          <Typography 
            variant="h5" 
            gutterBottom
            sx={{ 
              fontWeight: 600,
              fontSize: { xs: '1.3rem', sm: '1.5rem' },
              mb: 2
            }}
          >
            Keine passenden Übungen gefunden
          </Typography>
          <Typography 
            variant="body1" 
            color="text.secondary"
            sx={{ 
              mb: 4,
              fontSize: { xs: '1rem', sm: '1.1rem' }
            }}
          >
            Versuche es mit anderen Filtereinstellungen oder setze alle Filter zurück.
          </Typography>
          <Button 
            variant="contained" 
            onClick={resetFilters}
            size="large"
            sx={{ 
              minHeight: 56,
              px: 4,
              fontSize: { xs: '1rem', sm: '1.1rem' },
              fontWeight: 600
            }}
          >
            Alle Filter zurücksetzen
          </Button>
        </Paper>
      ) : (
        <Grid container spacing={{ xs: 2, sm: 3 }}>
          {filteredExercises.map(exercise => {
            const displayName = exercise.name || (exercise as any).title || 'Übung';
            const overlayText = (exercise.goal && exercise.goal.trim().length > 0) ? exercise.goal : displayName;
            return (
              <Grid sx={{ gridColumn: { xs: 'span 12', sm: 'span 6', md: 'span 6', lg: 'span 4' } }} key={(exercise as any)._id}>
                <Card 
                  sx={{ 
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      boxShadow: 8,
                      transform: 'translateY(-4px)'
                    },
                    '&:active': {
                      transform: 'translateY(-2px)'
                    }
                  }}
                  onClick={() => navigateToDetail((exercise as any)._id)}
                >
                  <Box sx={{ position: 'relative' }}>
                    <CardMedia
                      component="img"
                      height={isMobile ? "180" : "220"}
                      image={getThumbnailUrl(exercise)}
                      alt={overlayText}
                      sx={{ 
                        objectFit: 'contain',
                        bgcolor: '#f5f5f5'
                      }}
                    />
                    {overlayText && (
                      <Box
                        sx={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          width: '100%',
                          bgcolor: theme.palette.primary.main,
                          color: theme.palette.primary.contrastText,
                          py: 1,
                          px: 2,
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
                  </Box>
                  <CardContent sx={{ flexGrow: 1, p: { xs: 2, sm: 2.5 } }}>
                    <Box sx={{ mb: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      <Chip 
                        label={exercise.muscleGroup} 
                        color="primary" 
                        size="medium"
                        sx={{ 
                          fontSize: { xs: '0.9rem', sm: '0.95rem' },
                          height: { xs: '30px', sm: '32px' },
                          fontWeight: 600
                        }}
                      />
                      <Chip 
                        label={getCategoryText((exercise as any).category)} 
                        color="secondary" 
                        size="medium"
                        sx={{ 
                          fontSize: { xs: '0.9rem', sm: '0.95rem' },
                          height: { xs: '30px', sm: '32px' },
                          fontWeight: 600
                        }}
                      />
                      <Chip 
                        label={`${(exercise as any).isSitting ? 'Sitzend' : 'Stehend'}`}
                        color="secondary"
                        variant="outlined"
                        size="medium"
                        sx={{ 
                          fontSize: { xs: '0.85rem', sm: '0.9rem' },
                          height: { xs: '30px', sm: '32px' }
                        }}
                      />
                      <Chip 
                        label={`${(exercise as any).usesTheraband ? 'Mit Theraband' : 'Ohne Theraband'}`}
                        color="secondary"
                        variant="outlined"
                        size="medium"
                        sx={{ 
                          fontSize: { xs: '0.85rem', sm: '0.9rem' },
                          height: { xs: '30px', sm: '32px' }
                        }}
                      />
                      {exercise.duration && exercise.duration > 0 && (
                        <Chip 
                          label={`Dauer: ${formatDuration(exercise.duration)}`}
                          color="primary"
                          variant="outlined"
                          size="medium"
                          sx={{ 
                            fontSize: { xs: '0.85rem', sm: '0.9rem' },
                            height: { xs: '30px', sm: '32px' }
                          }}
                        />
                      )}
                    </Box>
                    <Typography 
                      variant="body2" 
                      color="text.secondary" 
                      sx={{ 
                        mb: 1,
                        fontSize: { xs: '0.95rem', sm: '1rem' },
                        lineHeight: 1.5
                      }}
                    >
                      {exercise.description && exercise.description.length > 100 
                        ? exercise.description.substring(0, 100) + '...' 
                        : exercise.description}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}
    </Container>
  );
};

export default ExerciseList;
