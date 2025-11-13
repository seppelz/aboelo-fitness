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
  Container,
  useMediaQuery,
  useTheme
} from '@mui/material';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import TrackChangesIcon from '@mui/icons-material/TrackChanges';
import BuildIcon from '@mui/icons-material/Build';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import TipsAndUpdatesIcon from '@mui/icons-material/TipsAndUpdates';
import EventSeatIcon from '@mui/icons-material/EventSeat';
import DirectionsWalkIcon from '@mui/icons-material/DirectionsWalk';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
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
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
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
    if (!id) {
      return () => {};
    }

    let metadataTimeout: ReturnType<typeof setTimeout> | null = null;
    let tempVideoElement: HTMLVideoElement | null = null;

    const fetchExercise = async () => {
      try {
        setLoading(true);
        const data = await getExerciseById(id);
        setExercise(data);

        if (data) {
          const videoDetails = getVideoDetails(data);
          if (videoDetails.type === 'video') {
            tempVideoElement = document.createElement('video');
            durationVideoRef.current = tempVideoElement;

            tempVideoElement.src = videoDetails.source;
            tempVideoElement.onloadedmetadata = () => {
              console.log('Video metadata loaded, duration:', tempVideoElement?.duration);
              if (tempVideoElement?.duration && tempVideoElement.duration > 0) {
                setVideoDuration(tempVideoElement.duration);
              }
            };
            tempVideoElement.onerror = () => {
              console.error('Fehler beim Laden des Videos für Dauer-Berechnung');
            };
            tempVideoElement.load();

            metadataTimeout = window.setTimeout(() => {
              if (data.duration && data.duration > 0) {
                console.log('Using fallback duration from exercise data:', data.duration);
                setVideoDuration(data.duration);
              }
            }, 3000);
          } else if (data.duration) {
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

    const durationVideoEl = durationVideoRef.current;

    return () => {
      if (metadataTimeout) {
        clearTimeout(metadataTimeout);
      }
      if (durationVideoEl) {
        durationVideoEl.src = '';
      }
      durationVideoRef.current = null;
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
  
  const getExerciseDisplayName = () => {
    if (!exercise) return 'Übung';
    const goalText = exercise.goal && exercise.goal.trim().length > 0 ? exercise.goal : null;
    return goalText || exercise.name || (exercise as any)?.title || 'Übung';
  };

  // Kompakte Übungsdetails rendern - Optimized for readability
  const renderExerciseDetails = () => {
    if (!exercise) return null;
    
    return (
      <Box>
        
        <Divider sx={{ mb: 2, mx: 'auto', width: { xs: '100%', sm: '80%', md: '70%' } }} />
        
        {/* Charakteristiken der Übung - Senior-friendly chips */}
        <Box sx={{ mb: 2.5 }}>
          <Typography 
            variant="subtitle1" 
            sx={{ 
              fontWeight: 'bold', 
              mb: 1,
              fontSize: { md: '1.05rem', lg: '1.1rem' }
            }}
          >
            Charakteristiken:
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {/* Dauer anzeigen */}
            <Chip
              label={`Dauer: ${formatDuration(videoDuration && videoDuration > 0 ? videoDuration : exercise.duration)}`}
              color="primary"
              variant="outlined"
              size="medium"
              sx={{ 
                fontSize: { md: '0.9rem', lg: '0.95rem' },
                height: { md: '30px', lg: '32px' },
                fontWeight: 600
              }}
            />
            <Chip 
              label={`Muskelgruppe: ${exercise.muscleGroup || 'Verschiedene'}`}
              color="primary"
              size="medium"
              sx={{ 
                fontSize: { md: '0.9rem', lg: '0.95rem' },
                height: { md: '30px', lg: '32px' },
                fontWeight: 600
              }}
            />
          </Box>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
            <Chip 
              label={`${exercise.isSitting ? 'Sitzend' : 'Stehend'}`}
              color="secondary"
              variant="outlined"
              size="medium"
              sx={{ fontSize: { md: '0.85rem', lg: '0.9rem' }, height: { md: '30px', lg: '32px' } }} 
            />
            <Chip 
              label={getCategoryText((exercise as any).category)}
              color="secondary"
              variant="outlined"
              size="medium"
              sx={{ fontSize: { md: '0.85rem', lg: '0.9rem' }, height: { md: '30px', lg: '32px' } }} 
            />
            <Chip 
              label={`${exercise.usesTheraband ? 'Mit Theraband' : 'Ohne Theraband'}`}
              color="secondary"
              variant="outlined"
              size="medium"
              sx={{ fontSize: { md: '0.85rem', lg: '0.9rem' }, height: { md: '30px', lg: '32px' } }} 
            />
            {exercise.isDynamic !== undefined && (
              <Chip 
                label={`${exercise.isDynamic ? 'Dynamisch' : 'Statisch'}`}
                color="secondary"
                variant="outlined"
                size="medium"
                sx={{ fontSize: { md: '0.85rem', lg: '0.9rem' }, height: { md: '30px', lg: '32px' } }} 
              />
            )}
            {exercise.isUnilateral !== undefined && (
              <Chip 
                label={`${exercise.isUnilateral ? 'Einseitig' : 'Beidseitig'}`}
                color="secondary"
                variant="outlined"
                size="medium"
                sx={{ fontSize: { md: '0.85rem', lg: '0.9rem' }, height: { md: '30px', lg: '32px' } }} 
              />
            )}
          </Box>
        </Box>
      
        {/* Ziel der Übung */}
        {exercise.goal && (
          <Box sx={{ mb: 2 }}>
            <Typography 
              variant="subtitle1" 
              gutterBottom 
              sx={{ 
                fontWeight: 'bold', 
                mb: 1,
                fontSize: { md: '1.05rem', lg: '1.1rem' },
                color: 'primary.dark'
              }}
            >
              <TrackChangesIcon sx={{ fontSize: '1.3rem', mr: 0.5, verticalAlign: 'middle' }} /> Ziel der Übung:
            </Typography>
            <Typography 
              variant="body1"
              sx={{ 
                fontSize: { md: '0.95rem', lg: '1rem' },
                lineHeight: 1.6
              }}
            >
              {exercise.goal}
            </Typography>
          </Box>
        )}

        {/* Vorbereitung */}
        {exercise.preparation && (
          <Box sx={{ mb: 2 }}>
            <Typography 
              variant="subtitle1" 
              gutterBottom 
              sx={{ 
                fontWeight: 'bold', 
                mb: 1,
                fontSize: { md: '1.05rem', lg: '1.1rem' },
                color: 'primary.dark'
              }}
            >
              <BuildIcon sx={{ fontSize: '1.3rem', mr: 0.5, verticalAlign: 'middle' }} /> Vorbereitung:
            </Typography>
            <Typography 
              variant="body1"
              sx={{ 
                fontSize: { md: '0.95rem', lg: '1rem' },
                lineHeight: 1.6
              }}
            >
              {exercise.preparation}
            </Typography>
          </Box>
        )}

        {/* Durchführung */}
        {exercise.execution && (
          <Box sx={{ mb: 2 }}>
            <Typography 
              variant="subtitle1" 
              gutterBottom 
              sx={{ 
                fontWeight: 'bold', 
                mb: 1,
                fontSize: { md: '1.05rem', lg: '1.1rem' },
                color: 'primary.dark'
              }}
            >
              <PlayArrowIcon sx={{ fontSize: '1.3rem', mr: 0.5, verticalAlign: 'middle' }} /> Durchführung:
            </Typography>
            <Typography 
              variant="body1"
              sx={{ 
                fontSize: { md: '0.95rem', lg: '1rem' },
                lineHeight: 1.6
              }}
            >
              {exercise.execution}
            </Typography>
          </Box>
        )}

        {/* Hinweise */}
        {exercise.tips && exercise.tips.trim() !== '' && (
          <Box sx={{ mb: 2 }}>
            <Typography 
              variant="subtitle1" 
              gutterBottom 
              sx={{ 
                fontWeight: 'bold', 
                mb: 1,
                fontSize: { md: '1.05rem', lg: '1.1rem' },
                color: 'primary.dark'
              }}
            >
              <TipsAndUpdatesIcon sx={{ fontSize: '1.3rem', mr: 0.5, verticalAlign: 'middle' }} /> Hinweise:
            </Typography>
            <Box 
              sx={{ 
                pl: 2,
                borderLeft: 3,
                borderColor: 'primary.light',
                bgcolor: 'grey.50',
                p: 1.5,
                borderRadius: 1
              }}
            >
              <Typography 
                variant="body1"
                sx={{ 
                  fontSize: { md: '0.95rem', lg: '1rem' },
                  lineHeight: 1.6
                }}
              >
                {exercise.tips}
              </Typography>
            </Box>
          </Box>
        )}
      </Box>
    );
  };

  // Video-Vorschau für ungestartete Übung - Optimized for space
  const renderVideoPreview = () => {
    if (!exercise) return null;
    
    const thumbnailUrl = getThumbnailUrl(exercise);

    return (
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column',
        height: '100%',
        justifyContent: 'center',
        maxWidth: '100%',
        width: { xs: '100%', sm: '90%', md: '85%' },
        mx: 'auto'
      }}>
        {/* Video-Container mit Thumbnail - matches VideoPlayer dimensions */}
        <Paper 
          elevation={3}
          sx={{ 
            overflow: 'hidden',
            borderRadius: 2,
            mb: 2,
            backgroundColor: 'white',
            position: 'relative',
            aspectRatio: '4/3',  // Match video aspect ratio
            width: '100%',
            height: 'auto',
            minHeight: '400px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <Box 
            component="img"
            src={thumbnailUrl}
            alt={`Vorschaubild für ${getExerciseDisplayName()}`}
            sx={{ 
              width: '100%', 
              height: '100%',
              display: 'block',
              objectFit: 'contain',  // Show full image content, pad if needed
              maxHeight: '100%'
            }}
          />
        </Paper>
        
        {/* Compact Informationsbox */}
        <Paper 
          elevation={1}
          sx={{ 
            p: 2,
            borderRadius: 2,
            backgroundColor: 'white'
          }}
        >
          <Typography 
            variant="h6" 
            sx={{ 
              mb: 1.5, 
              fontWeight: 'bold',
              fontSize: { md: '1.15rem', lg: '1.25rem' }
            }}
          >
            Bereit für die Übung?
          </Typography>
          <Box 
            sx={{ 
              mb: 1.5,
              fontSize: { md: '0.95rem', lg: '1rem' },
              lineHeight: 1.5,
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              gap: 1
            }}
          >
            {exercise.isSitting ? (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <EventSeatIcon sx={{ fontSize: '1.2rem' }} />
                <Typography variant="body2" sx={{ fontSize: { md: '0.95rem', lg: '1rem' } }}>
                  Diese Übung wird im Sitzen durchgeführt.
                </Typography>
              </Box>
            ) : (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <DirectionsWalkIcon sx={{ fontSize: '1.2rem' }} />
                <Typography variant="body2" sx={{ fontSize: { md: '0.95rem', lg: '1rem' } }}>
                  Diese Übung wird im Stehen durchgeführt.
                </Typography>
              </Box>
            )}
            {exercise.usesTheraband && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <FitnessCenterIcon sx={{ fontSize: '1.2rem' }} />
                <Typography variant="body2" sx={{ fontSize: { md: '0.95rem', lg: '1rem' } }}>
                  Sie benötigen ein Theraband.
                </Typography>
              </Box>
            )}
          </Box>
          <Button
            variant="contained"
            size="large"
            fullWidth
            onClick={handleStartExercise}
            sx={{ 
              fontSize: { md: '1rem', lg: '1.1rem' },
              py: 1.5,
              fontWeight: 600
            }}
            disabled={completed}
          >
            Übung jetzt starten
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
    <Container 
      maxWidth="xl" 
      sx={{ 
        minHeight: '100vh',
        py: { xs: 1, md: 2 },
        px: { xs: 1, md: 2 }
      }}
    >
      <Box sx={{ textAlign: 'center', mb: { xs: 2, md: 3 } }}>
        <Typography
          variant={isMobile ? 'h5' : 'h4'}
          component="h1"
          sx={{
            fontWeight: 'bold',
            color: 'primary.main',
            fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2rem' },
            lineHeight: 1.3,
            mb: { xs: 1, md: 1.5 }
          }}
        >
          {getExerciseDisplayName()}
        </Typography>
      </Box>

      {/* Compact Header - Back button and status */}
      <Box sx={{ 
        mb: { xs: 1, md: 1.5 },
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
              onPause={handleVideoPause}
              onPlay={handleVideoPlay}
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

      {/* Desktop Layout: Optimized viewport-aware layout */}
      <Box 
        sx={{ 
          display: { xs: 'none', md: 'flex' },
          gap: 2,
          height: 'calc(100vh - 180px)', // Account for navbar + header + padding
          maxHeight: 'calc(100vh - 180px)',
          overflow: 'hidden'
        }}
      >
        {/* Video Section - 55% width for better video visibility */}
        <Box sx={{ 
          width: '55%', 
          display: 'flex', 
          flexDirection: 'column',
          minHeight: 0 // Important for flexbox scrolling
        }}>
          {videoStarted ? (
            <Box sx={{ 
              flex: '1 1 auto',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              maxHeight: '100%'
            }}>
              <ExerciseVideo
                exercise={exercise}
                onVideoComplete={handleExerciseComplete}
                videoRef={videoRef}
                onTimeUpdate={handleTimeUpdate}
                onPause={handleVideoPause}
                onPlay={handleVideoPlay}
              />
            </Box>
          ) : (
            renderVideoPreview()
          )}
        </Box>
        
        {/* Details Section - 45% width with scrollable content */}
        <Box sx={{ 
          width: '45%',
          display: 'flex',
          flexDirection: 'column',
          minHeight: 0 // Important for flexbox scrolling
        }}>
          <Paper 
            elevation={2} 
            sx={{ 
              p: 2.5, 
              height: '100%',
              overflow: 'auto', // Enable scrolling for details
              display: 'flex',
              flexDirection: 'column',
              '&::-webkit-scrollbar': {
                width: '8px'
              },
              '&::-webkit-scrollbar-track': {
                background: '#f1f1f1',
                borderRadius: '4px'
              },
              '&::-webkit-scrollbar-thumb': {
                background: theme.palette.primary.main,
                borderRadius: '4px',
                '&:hover': {
                  background: theme.palette.primary.dark
                }
              }
            }}
          >
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
    </Container>
  );
};

export default ExerciseDetailPage;