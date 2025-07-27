import React, { useState, useEffect, useContext } from 'react';
import { 
  Box, 
  Card, 
  CardContent,
  CardMedia, 
  CardActions,
  Button,
  Grid,
  Typography,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Alert,
  CircularProgress,
  SelectChangeEvent,
  Divider as MuiDivider
} from '@mui/material';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import { useNavigate } from 'react-router-dom';
import { getAllExercises } from '../../services/exerciseService';
import { Exercise, MuscleGroup, ExerciseType, ExerciseCategory, Equipment } from '../../types';
import { getThumbnailUrl } from './exerciseUtils';
import { AuthContext } from '../../contexts/AuthContext';

// Schwierigkeitsgrad-Text
const getDifficultyText = (difficulty: number): string => {
  switch (difficulty) {
    case 1:
      return 'Sehr leicht';
    case 2:
      return 'Leicht';
    case 3:
      return 'Mittel';
    case 4:
      return 'Schwer';
    case 5:
      return 'Sehr schwer';
    default:
      return 'Mittel';
  }
};

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
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [filteredExercises, setFilteredExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Suchbegriff
  const [searchTerm, setSearchTerm] = useState('');
  
  // Filter-Zustände
  const [muscleGroup, setMuscleGroup] = useState<MuscleGroup | 'all'>('all');
  const [category, setCategory] = useState<ExerciseCategory | 'all'>('all');
  const [difficulty, setDifficulty] = useState<number | 'all'>('all');
  
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
    navigate(`/exercises/${id}`);
  };
  
  // Zurücksetzen aller Filter
  const resetFilters = () => {
    setSearchTerm('');
    setMuscleGroup('all');
    setCategory('all');
    setDifficulty('all');
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
  

  // Laden oder Fehler anzeigen
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress size={60} />
      </Box>
    );
  }
  
  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error" sx={{ mt: 4 }}>
          {error}
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Übungsübersicht
      </Typography>
      
      <Typography variant="body1" paragraph>
        Wähle aus {exercises.length} Übungen für verschiedene Muskelgruppen. 
        Nutze die Filter, um die passenden Übungen zu finden.
      </Typography>
      
      {/* Filter-Menü */}
      <Box 
        sx={{ 
          mb: 4, 
          p: 3, 
          borderRadius: 2, 
          bgcolor: '#f8f9fa',
          border: '1px solid #e0e0e0',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        
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
                <MenuItem value="Beine">Beine</MenuItem>
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
        
        <Typography variant="subtitle1" sx={{ mt: 2, mb: 1 }}>Erweiterte Filter</Typography>
        
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
        
        <Button 
          variant="outlined" 
          color="secondary" 
          onClick={resetFilters}
          sx={{ mt: 2, alignSelf: 'flex-end' }}
        >
          Filter zurücksetzen
        </Button>
      </Box>
      
      {/* Ergebniszähler */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6">
          {filteredExercises.length} Übungen gefunden
        </Typography>
      </Box>
      
      {/* Übungsliste */}
      {filteredExercises.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="h6">
            Keine Übungen gefunden, die den Filterkriterien entsprechen.
          </Typography>
          <Button 
            variant="contained" 
            onClick={resetFilters}
            sx={{ mt: 2, fontSize: '1.1rem' }}
          >
            Filter zurücksetzen
          </Button>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {filteredExercises.map(exercise => (
            <Grid sx={{ gridColumn: { xs: 'span 12', sm: 'span 6', md: 'span 4' } }} key={(exercise as any)._id}>
              <Card 
                sx={{ 
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  '&:hover': {
                    boxShadow: 6
                  }
                }}
              >
                <Box onClick={() => navigateToDetail((exercise as any)._id)} sx={{ cursor: 'pointer' }}>
                  <CardMedia
                    component="img"
                    height="180"
                    image={getThumbnailUrl(exercise)}
                    alt={exercise.name}
                    sx={{ 
                      objectFit: 'contain' // Stellt sicher, dass das gesamte Bild sichtbar ist und sein Seitenverhältnis beibehält
                    }}
                  />
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography variant="h6" component="div" gutterBottom sx={{ fontWeight: 'bold' }}>
                      {exercise.name}
                    </Typography>
                    
                    <Box sx={{ mb: 2, display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      <Chip 
                        label={exercise.muscleGroup} 
                        color="primary" 
                        size="small" 
                        sx={{ fontSize: '0.8rem', height: '24px' }}
                      />
                      <Chip 
                        label={getCategoryText((exercise as any).category)} 
                        color="secondary" 
                        size="small" 
                        sx={{ fontSize: '0.8rem', height: '24px' }}
                      />
                      <Chip 
                        label={`${(exercise as any).isSitting ? 'Sitzend' : 'Stehend'}`}
                        color="secondary"
                        variant="outlined"
                        size="small" 
                        sx={{ fontSize: '0.8rem', height: '24px' }}
                      />
                      <Chip 
                        label={`${(exercise as any).usesTheraband ? 'Mit Theraband' : 'Ohne Theraband'}`}
                        color="secondary"
                        variant="outlined"
                        size="small" 
                        sx={{ fontSize: '0.8rem', height: '24px' }}
                      />
                      <Chip 
                        label={`Dauer: ${formatDuration(exercise.duration)}`}
                        color="primary"
                        variant="outlined"
                        size="small" 
                        sx={{ fontSize: '0.8rem', height: '24px' }}
                      />
                    </Box>
                    
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      {exercise.description && exercise.description.length > 100 
                        ? exercise.description.substring(0, 100) + '...' 
                        : exercise.description}
                    </Typography>
                  </CardContent>
                </Box>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
};

export default ExerciseList;
