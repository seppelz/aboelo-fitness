import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getThumbnailUrl } from '../components/exercises/exerciseUtils';
import { 
  Box, 
  Typography, 
  Button, 
  CircularProgress, 
  Alert, 
  Chip,
  Paper,
  Divider
} from '@mui/material';
import { Grid } from '@mui/material';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { getExerciseById } from '../services/exerciseService';
import ExerciseVideo from '../components/exercises/ExerciseVideo';
import { Exercise } from '../types';

const ExerciseDetailPage: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoStarted, setVideoStarted] = useState(false);
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [exercise, setExercise] = useState<Exercise | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [completed, setCompleted] = useState<boolean>(false);
  
  // Dauer formatieren
  const formatDuration = (seconds?: number): string => {
    if (!seconds || isNaN(seconds)) return 'Keine Angabe';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes} Minuten ${remainingSeconds} Sekunden`;
  };
  
  // Schwierigkeitsgrad-Text
  const getDifficultyText = (difficulty: number): string => {
    switch (difficulty) {
      case 1: return 'Sehr leicht';
      case 2: return 'Leicht';
      case 3: return 'Mittel';
      case 4: return 'Fortgeschritten';
      case 5: return 'Herausfordernd';
      default: return 'Unbekannt';
    }
  };
  
  // Übung vom Server laden
  useEffect(() => {
    const fetchExercise = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        const data = await getExerciseById(id);
        setExercise(data);
      } catch (error) {
        console.error('Fehler beim Laden der Übung:', error);
        setError('Die Übung konnte nicht geladen werden. Bitte versuchen Sie es später erneut.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchExercise();
  }, [id]);
  
  // Zurück zur Übungsliste
  const handleBackToList = () => {
    navigate('/exercises');
  };
  
  // Übung als abgeschlossen markieren
  const handleExerciseComplete = () => {
    setCompleted(true);
    setTimeout(() => {
      navigate('/exercises');
    }, 3000);
  };

  // Übung starten
  const handleStartExercise = () => {
    setVideoStarted(true);
    setTimeout(() => videoRef.current?.focus(), 200);
  };

  // Kompakte Übungsdetails rendern
  const renderExerciseDetails = () => {
    if (!exercise) return null;
    
    return (
      <Box>
        <Typography variant="h6" sx={{ mb: 1 }}>{exercise.name}</Typography>
        <Divider sx={{ mb: 1 }} />
        
        {/* Charakteristiken der Übung in kompakterer Darstellung */}
        <Box sx={{ mb: 1.5 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 0.5 }}>
            Charakteristiken:
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 0.5 }}>
            <Chip 
              label={`${exercise.isSitting ? 'Sitzend' : 'Stehend'}`}
              color="secondary"
              variant="outlined"
              size="small"
              sx={{ fontSize: '0.8rem', height: '24px' }} 
            />
            <Chip 
              label={`${exercise.category === 'kräftigend' ? 'Kräftigend' : 'Mobilisierend'}`}
              color="secondary"
              variant="outlined"
              size="small"
              sx={{ fontSize: '0.8rem', height: '24px' }} 
            />
            <Chip 
              label={`${exercise.usesTheraband ? 'Mit Theraband' : 'Ohne Theraband'}`}
              color="secondary"
              variant="outlined"
              size="small"
              sx={{ fontSize: '0.8rem', height: '24px' }} 
            />
            {exercise.isDynamic !== undefined && (
              <Chip 
                label={`${exercise.isDynamic ? 'Dynamisch' : 'Statisch'}`}
                color="secondary"
                variant="outlined"
                size="small"
                sx={{ fontSize: '0.8rem', height: '24px' }} 
              />
            )}
            {exercise.isUnilateral !== undefined && (
              <Chip 
                label={`${exercise.isUnilateral ? 'Einseitig' : 'Beidseitig'}`}
                color="secondary"
                variant="outlined"
                size="small"
                sx={{ fontSize: '0.8rem', height: '24px' }} 
              />
            )}
          </Box>
        </Box>
        
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 1.5 }}>
          <Chip 
            label={`Dauer: ${formatDuration(exercise.duration)}`}
            size="small" 
            sx={{ fontSize: '0.8rem', height: '24px' }} 
          />
          <Chip 
            label={`Schwierigkeit: ${getDifficultyText(exercise.difficulty)}`} 
            size="small"
            sx={{ fontSize: '0.8rem', height: '24px' }} 
          />
          <Chip 
            label={`Muskelgruppe: ${exercise.muscleGroup || 'Verschiedene'}`}
            size="small"
            sx={{ fontSize: '0.8rem', height: '24px' }} 
          />
        </Box>
        
        {/* Ziel der Übung */}
        {exercise.goal && (
          <Box sx={{ mb: 1.5 }}>
            <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 'bold', mb: 0.5 }}>
              Ziel der Übung:
            </Typography>
            <Typography variant="body2">{exercise.goal}</Typography>
          </Box>
        )}

        {/* Vorbereitung */}
        {exercise.preparation && (
          <Box sx={{ mb: 1.5 }}>
            <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 'bold', mb: 0.5 }}>
              Vorbereitung:
            </Typography>
            <Typography variant="body2">{exercise.preparation}</Typography>
          </Box>
        )}

        {/* Durchführung */}
        {exercise.execution && (
          <Box sx={{ mb: 1.5 }}>
            <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 'bold', mb: 0.5 }}>
              Durchführung:
            </Typography>
            <Typography variant="body2">{exercise.execution}</Typography>
          </Box>
        )}

        {/* Tipps */}
        {exercise.tips && Array.isArray(exercise.tips) && exercise.tips.length > 0 && (
          <Box sx={{ mb: 1.5 }}>
            <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 'bold', mb: 0.5 }}>
              Tipps:
            </Typography>
            <Typography component="ul" sx={{ pl: 2, mt: 0 }}>
              {exercise.tips.map((tip: string, index: number) => (
                <Typography component="li" key={index} variant="body2" sx={{ mb: 0.5 }}>
                  {tip}
                </Typography>
              ))}
            </Typography>
          </Box>
        )}
      </Box>
    );
  };

  // Video-Vorschau für ungestartete Übung
  const renderVideoPreview = () => {
    if (!exercise) return null;
    
    // Cloudinary-Thumbnail aus exerciseUtils verwenden
    const thumbnailUrl = getThumbnailUrl(exercise);

    return (
      <Box>
        {/* Video-Container mit Thumbnail */}
        <Paper 
          elevation={2}
          sx={{ 
            overflow: 'hidden',
            borderRadius: 2,
            mb: 1.5 // Reduzierter Abstand
          }}
        >
          {/* Das Video wird als statisches Bild angezeigt */}
          <Box 
            component="img"
            src={thumbnailUrl}
            alt={`Vorschaubild für ${exercise.name}`}
            sx={{ 
              width: '100%', 
              height: 'auto',
              display: 'block',
              objectFit: 'cover',
              maxHeight: '320px' // Reduzierte Höhe
            }}
          />
        </Paper>
        
        {/* Informationsbox unter dem Video */}
        <Paper 
          elevation={1}
          sx={{ 
            p: 2, // Weniger Padding 
            mb: 2, // Reduzierter Abstand
            borderRadius: 2,
            backgroundColor: theme => theme.palette.background.default
          }}
        >
          <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 'bold' }}>
            Bereit für die Übung?
          </Typography>
          <Typography variant="body2" sx={{ mb: 1 }}>
            {exercise.isSitting ? 'Diese Übung wird im Sitzen durchgeführt.' : 'Diese Übung wird im Stehen durchgeführt.'}
            {exercise.usesTheraband && ' Sie benötigen ein Theraband.'}
          </Typography>
          <Typography variant="body2" sx={{ mb: 1.5 }}>
            Lesen Sie zuerst die Anleitung rechts durch und starten Sie dann die Übung.
          </Typography>
          <Button
            variant="contained"
            size="medium" // Kleinerer Button
            onClick={handleStartExercise}
            sx={{ fontSize: '1rem', py: 1, px: 3 }}
            disabled={completed}
          >
            Übung starten
          </Button>
        </Paper>
      </Box>
    );
  };

  // Loading State
  if (loading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '30vh' /* Reduzierte Höhe */ 
      }}>  
        <CircularProgress size={60} />
      </Box>
    );
  }
  
  // Error State
  if (error || !exercise) {
    return (
      <Box sx={{ maxWidth: '1200px', mx: 'auto', p: 2 }}>
        <Button 
          startIcon={<ArrowBackIcon />} 
          onClick={handleBackToList}
          variant="outlined"
          size="large"
          sx={{ mb: 3 }}
        >
          Zurück zu allen Übungen
        </Button>
        
        <Alert severity="error">
          {error || 'Die Übung wurde nicht gefunden.'}
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: '1400px', mx: 'auto', px: { xs: 1, sm: 2 }, mt: 0 }}>
      {/* Header mit Zurück-Button und Erfolgsanzeige - direkt unter der Navigationsleiste */}
      <Box sx={{ 
        mb: 1, 
        mt: 0.5,
        display: 'flex', 
        flexDirection: { xs: 'column', sm: 'row' }, 
        alignItems: { xs: 'flex-start', sm: 'center' }, 
        justifyContent: 'space-between' 
      }}>
        <Button 
          startIcon={<ArrowBackIcon />} 
          onClick={handleBackToList}
          variant="outlined"
          size="medium" // Kleinerer Button
          sx={{ mb: { xs: 1, sm: 0 } }}
        >
          Zurück zu allen Übungen
        </Button>
        
        {completed && (
          <Alert 
            icon={<CheckCircleIcon fontSize="inherit" />}
            severity="success"
            sx={{ ml: { xs: 0, sm: 2 } }}
          >
            Übung erfolgreich abgeschlossen!
          </Alert>
        )}
      </Box>

      {/* Start-Button für Mobile (nur wenn Video noch nicht gestartet) */}
      {!videoStarted && !completed && (
        <Box sx={{ 
          textAlign: 'center', 
          mb: 2, 
          display: { xs: 'block', md: 'none' } 
        }}>
          <Typography variant="body1" sx={{ mb: 1.5, fontSize: '1.1rem' }}>
            Bitte lesen Sie zuerst die Anleitung aufmerksam durch.
          </Typography>
          <Button
            variant="contained"
            size="large"
            onClick={handleStartExercise}
            sx={{ fontSize: '1.1rem', py: 1, px: 3 }}
          >
            Übung starten
          </Button>
        </Box>
      )}

      {/* Mobile Layout: Accordion-basiert */}
      <Box sx={{ display: { xs: 'block', md: 'none' } }}>
        {/* Video (nur wenn gestartet) */}
        {videoStarted && (
          <Box sx={{ mb: 2 }}> {/* Reduzierter Abstand */}
            <ExerciseVideo
              exercise={exercise}
              onExerciseComplete={handleExerciseComplete}
              videoRef={videoRef}
            />
          </Box>
        )}
        
        {/* Übungsdetails in Accordion */}
        <Accordion defaultExpanded={true}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ py: 0.5 }}> {/* Kompakteres Accordion */}
            <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
              Anleitung & Details
            </Typography>
          </AccordionSummary>
          <AccordionDetails sx={{ py: 1 }}>
            {renderExerciseDetails()}
          </AccordionDetails>
        </Accordion>
      </Box>

      {/* Desktop Layout: Grid mit Video links, Details rechts */}
      <Box 
        sx={{ 
          display: { xs: 'none', md: 'flex' },
          gap: 2,
          mt: 2
        }}
      >
        <Box sx={{ width: '50%' }}>
          {videoStarted ? (
            <ExerciseVideo
              exercise={exercise}
              onExerciseComplete={handleExerciseComplete}
              videoRef={videoRef}
            />
          ) : (
            renderVideoPreview()
          )}
        </Box>
        
        <Box sx={{ width: '50%' }}>
          <Paper elevation={1} sx={{ p: 2, height: '100%' }}> {/* height:100% für gleiche Höhe */}
            {renderExerciseDetails()}
          </Paper>
        </Box>
      </Box>
    </Box>
  );
};

export default ExerciseDetailPage;