import React, { useState, useEffect, useRef, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getThumbnailUrl, getVideoDetails } from '../components/exercises/exerciseUtils';
import { 
  Box, 
  Typography, 
  Button, 
  CircularProgress, 
  Alert, 
  Chip,
  Paper,
  Divider,
  Container
} from '@mui/material';
import { Grid } from '@mui/material';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { getExerciseById } from '../services/exerciseService';
import { saveProgress } from '../services/progressService';
import { AuthContext } from '../contexts/AuthContext';
import ExerciseVideo from '../components/exercises/ExerciseVideo';
import { Exercise } from '../types';
import CelebrationModal from '../components/gamification/CelebrationModal';
import MotivationalQuote from '../components/gamification/MotivationalQuote';
import { ProgressResponse } from '../types';

const ExerciseDetailPage: React.FC = () => {
  const { refreshUser } = useContext(AuthContext);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [videoStarted, setVideoStarted] = useState(false);
  const [isAborted, setIsAborted] = useState(false);
  const [progress, setProgress] = useState(0);
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [exercise, setExercise] = useState<Exercise | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [completed, setCompleted] = useState(false);
  const [watchStartTime, setWatchStartTime] = useState<number | null>(null);
  const [totalWatchDuration, setTotalWatchDuration] = useState<number>(0);
  const [isSaving, setIsSaving] = useState(false);
  const completionHandledRef = useRef(false);
  const [celebrationModalOpen, setCelebrationModalOpen] = useState(false);
  const [gamificationData, setGamificationData] = useState<any>(null);
  const [pointsEarned, setPointsEarned] = useState(0);
  
  // Dauer formatieren - show seconds if under 1 minute  
  const formatDuration = (seconds?: number): string => {
    if (!seconds || seconds <= 0 || isNaN(seconds)) return 'Keine Angabe';
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
  

  
  // Video-Element zum Vorberechnen der Dauer
  const durationVideoRef = useRef<HTMLVideoElement>(null);
  const [videoDuration, setVideoDuration] = useState<number | undefined>(undefined);

  // Übung vom Server laden
  useEffect(() => {
    const fetchExercise = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        const data = await getExerciseById(id);
        setExercise(data);
        
        // Video-Dauer vorberechnen
        if (data) {
          const videoElement = document.createElement('video');
          const videoDetails = getVideoDetails(data);
          if (videoDetails.type === 'video') {
            videoElement.src = videoDetails.source;
            videoElement.onloadedmetadata = () => {
              console.log('Video metadata loaded, duration:', videoElement.duration);
              if (videoElement.duration && videoElement.duration > 0) {
                setVideoDuration(videoElement.duration);
              }
            };
            videoElement.onerror = () => {
              console.error('Fehler beim Laden des Videos für Dauer-Berechnung');
            };
            // Load the video to get metadata
            videoElement.load();
            
            // Fallback timeout for metadata loading
            const timeout = setTimeout(() => {
              if (data.duration && data.duration > 0) {
                console.log('Using fallback duration from exercise data:', data.duration);
                setVideoDuration(data.duration);
              }
            }, 3000);
            
            return () => clearTimeout(timeout);
          } else if (data.duration) {
            // Fallback auf die Dauer aus den Metadaten
            setVideoDuration(data.duration);
          }
        }
      } catch (error) {
        console.error('Fehler beim Laden der Übung:', error);
        setError('Die Übung konnte nicht geladen werden. Bitte versuchen Sie es später erneut.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchExercise();
    
    return () => {
      // Cleanup
      if (durationVideoRef.current) {
        durationVideoRef.current.src = '';
      }
    };
  }, [id]);
  
  // Zurück zur Startseite
  const handleBackToList = () => {
    navigate('/');
  };
  
  // Übung als abgeschlossen markieren
  const handleExerciseComplete = async () => {
    if (!exercise || isSaving || completed || completionHandledRef.current) return; // Prevent duplicate calls
    completionHandledRef.current = true; // Mark as handled immediately
    
    setIsSaving(true);
    
    try {
      // Calculate total watch duration
      let finalWatchDuration = totalWatchDuration;
      if (watchStartTime && videoRef.current) {
        finalWatchDuration += (Date.now() - watchStartTime) / 1000;
      }
      
      // Save progress to backend
      const result: ProgressResponse = await saveProgress({
        exerciseId: exercise._id,
        completed: true,
        aborted: false,
        watchDuration: finalWatchDuration
      });
      
      console.log('Progress saved successfully:', result);
      setCompleted(true);
      
      // Show celebration modal with gamification data
      if (result.gamification) {
        setGamificationData(result.gamification);
        setPointsEarned(result.pointsEarned);
        setCelebrationModalOpen(true);
      }

      // Update user context with new points/level
      if (result.pointsEarned > 0) {
        // Refresh user context to get updated points/level
        await refreshUser();
      }
      
      if (videoRef.current) {
        videoRef.current.pause();
      }
      
      // Show success message briefly before navigating back to homepage
      setTimeout(() => {
        navigate('/');
      }, 3000);
      
    } catch (error: any) {
      console.error('Error saving progress:', error);
      
      // Check if it's a duplicate exercise error
      if (error.response?.status === 400 && error.response?.data?.alreadyCompleted) {
        setError('Diese Übung haben Sie heute bereits abgeschlossen! Versuchen Sie eine andere Übung.');
        setCompleted(true); // Show as completed since it was already done
        
        if (videoRef.current) {
          videoRef.current.pause();
        }
        
        // Navigate back to homepage after showing message
        setTimeout(() => {
          navigate('/');
        }, 3000);
      } else {
        setError('Fehler beim Speichern des Fortschritts. Bitte versuchen Sie es erneut.');
      }
    } finally {
      setIsSaving(false);
    }
  };

  // Video starten und Übungsdetails ausblenden
  const handleStartExercise = () => {
    console.log('Starting exercise...');
    setVideoStarted(true);
    setWatchStartTime(Date.now()); // Start tracking watch time
    completionHandledRef.current = false; // Reset completion flag for new exercise
    
    // Start the video manually when user clicks the button
    setTimeout(() => {
      if (videoRef.current) {
        console.log('Attempting to play video...', videoRef.current.src);
        console.log('Video readyState:', videoRef.current.readyState);
        console.log('Video paused:', videoRef.current.paused);
        
        // Ensure video is loaded before playing
        if (videoRef.current.readyState >= 2) { // HAVE_CURRENT_DATA
          videoRef.current.play()
            .then(() => {
              console.log('Video play successful');
            })
            .catch(err => {
              console.error('Error starting video:', err);
            });
        } else {
          // Wait for video to be ready
          const onCanPlay = () => {
            console.log('Video ready, now playing...');
            videoRef.current?.play()
              .then(() => console.log('Delayed play successful'))
              .catch(err => console.error('Delayed play error:', err));
            videoRef.current?.removeEventListener('canplay', onCanPlay);
          };
          videoRef.current.addEventListener('canplay', onCanPlay);
        }
      }
    }, 500); // Increased delay to ensure video element is fully ready
  };
  
  // Handle exercise abort with progress saving
  const handleAbortExercise = async () => {
    if (!exercise || isSaving) return;
    
    setIsSaving(true);
    
    try {
      // Calculate watch duration
      let finalWatchDuration = totalWatchDuration;
      if (watchStartTime) {
        finalWatchDuration += (Date.now() - watchStartTime) / 1000;
      }
      
      // Save aborted progress to backend
      await saveProgress({
        exerciseId: exercise._id,
        completed: false,
        aborted: true,
        watchDuration: finalWatchDuration
      });
      
      console.log('Aborted exercise progress saved');
      
      if (videoRef.current) {
        videoRef.current.pause();
      }
      setIsAborted(true);
      
    } catch (error) {
      console.error('Error saving abort progress:', error);
      // Still show as aborted even if saving failed
      if (videoRef.current) {
        videoRef.current.pause();
      }
      setIsAborted(true);
    } finally {
      setIsSaving(false);
    }
  };

  // Update video progress
  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const currentProgress = (videoRef.current.currentTime / videoRef.current.duration) * 100;
      setProgress(currentProgress);
    }
  };
  
  // Handle video pause/play to track watch duration
  const handleVideoPause = () => {
    if (watchStartTime) {
      const watchDuration = (Date.now() - watchStartTime) / 1000;
      setTotalWatchDuration(prev => prev + watchDuration);
      setWatchStartTime(null);
    }
  };
  
  const handleVideoPlay = () => {
    setWatchStartTime(Date.now());
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
            {/* Dauer anzeigen */}
            <Chip
              label={`Dauer: ${formatDuration(videoDuration && videoDuration > 0 ? videoDuration : exercise.duration)}`}
              color="primary"
              variant="outlined"
              size="small"
              sx={{ fontSize: '0.8rem', height: '24px' }}
            />
            <Chip 
              label={`${exercise.isSitting ? 'Sitzend' : 'Stehend'}`}
              color="secondary"
              variant="outlined"
              size="small"
              sx={{ fontSize: '0.8rem', height: '24px' }} 
            />
            <Chip 
              label={getCategoryText((exercise as any).category)}
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
                    <Chip 
              label={`Muskelgruppe: ${exercise.muscleGroup || 'Verschiedene'}`}
              color="secondary"
              variant="outlined"
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
        {exercise.tips && exercise.tips.trim() !== '' && (
          <Box sx={{ mb: 1.5 }}>
            <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 'bold', mb: 0.5 }}>
              Tipps:
            </Typography>

            <ul style={{ margin: 0, paddingLeft: '20px', listStyleType: 'disc' }}>
              <li>
                <Typography variant="body2" component="span" sx={{ display: 'block', mb: 0.5 }}>
                  {exercise.tips}
                </Typography>
              </li>
            </ul>
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
            mb: 1.5, // Reduzierter Abstand
            backgroundColor: 'white'
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
              objectFit: 'contain', // Show full image without cropping
              maxHeight: '320px', // Reduzierte Höhe
              backgroundColor: 'white' // White background for seamless video effect
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
            backgroundColor: 'white'
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
    <Box sx={{ minHeight: '100vh', backgroundColor: 'grey.50' }}>
      {/* Header mit Zurück-Button und Erfolgsanzeige - direkt unter der Navigationsleiste */}
      <Box sx={{ 
        mb: 1, 
        mt: 0.5,
        display: 'flex', 
        flexDirection: { xs: 'column', sm: 'row' }, 
        flexWrap: 'wrap',
        alignItems: { xs: 'flex-start', sm: 'center' }, 
        gap: 1
      }}>
        {/* Zurück-Button */}
        <Button 
          startIcon={<ArrowBackIcon />} 
          onClick={handleBackToList}
          variant="outlined"
          size="medium"
          sx={{ mb: { xs: 1, sm: 0 }, mr: { sm: 1 } }}
        >
          Zurück zu allen Übungen
        </Button>
        
        {/* Video-Steuerelemente in der oberen Navigationsleiste - nur Abbrechen/Abschließen, Play/Pause im VideoPlayer */}
        {videoStarted && !completed && (
          <Box sx={{ 
            display: 'flex', 
            flexWrap: 'wrap',
            gap: 1, 
            alignItems: 'center',
            ml: { xs: 0, sm: 1 }
          }}>
            {/* Abbrechen Button */}
            <Button
              variant="outlined" 
              color="secondary" 
              size="small"
              onClick={handleAbortExercise} 
              disabled={isAborted || isSaving}
              startIcon={<CancelIcon />}
              sx={{ fontSize: '0.85rem' }}
            >
              Abbrechen
            </Button>
            
            {/* Abschließen Button (nur wenn fast fertig) */}
            {progress >= 95 && progress < 100 && !isAborted && videoStarted && (
              <Button 
                variant="contained" 
                color="success"
                size="small" 
                onClick={handleExerciseComplete}
                disabled={isSaving}
                startIcon={isSaving ? <CircularProgress size={16} /> : <CheckCircleIcon />}
                sx={{ fontSize: '0.85rem', fontWeight: 'bold' }}
              >
                {isSaving ? 'Speichern...' : 'Abschließen'}
              </Button>
            )}
          </Box>
        )}
        
        {completed && (
          <Alert 
            icon={<CheckCircleIcon fontSize="inherit" />}
            severity="success"
            sx={{ ml: { xs: 0, sm: 2 } }}
          >
                              Übung erfolgreich abgeschlossen und gespeichert! +10 Punkte
          </Alert>
        )}
        
        {isAborted && (
          <Alert 
            icon={<CancelIcon fontSize="inherit" />}
            severity="warning"
            sx={{ ml: { xs: 0, sm: 2 } }}
          >
            Übung abgebrochen
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
              onVideoComplete={handleExerciseComplete}
              videoRef={videoRef}
              onTimeUpdate={handleTimeUpdate}
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
              onVideoComplete={handleExerciseComplete}
              videoRef={videoRef}
              onTimeUpdate={handleTimeUpdate}
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

      {/* Daily motivational quote */}
      {gamificationData?.motivationalQuote && (
        <Container maxWidth="lg" sx={{ py: 2 }}>
          <MotivationalQuote 
            quote={gamificationData.motivationalQuote}
            variant="inline"
          />
        </Container>
      )}

      {/* Celebration Modal */}
      <CelebrationModal
        open={celebrationModalOpen}
        onClose={() => setCelebrationModalOpen(false)}
        gamificationData={gamificationData || {
          achievements: [],
          streakInfo: null,
          weeklyGoal: null,
          motivationalQuote: ''
        }}
        pointsEarned={pointsEarned}
      />
    </Box>
  );
};

export default ExerciseDetailPage;