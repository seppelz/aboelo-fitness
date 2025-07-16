import React, { ReactElement, useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  LinearProgress,
  Paper,
  Alert,
  IconButton,
  useTheme,
  useMediaQuery,
  Stack
} from '@mui/material';

import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import ReplayIcon from '@mui/icons-material/Replay';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import ScreenRotationIcon from '@mui/icons-material/ScreenRotation';
import { Exercise } from '../../types';
import { formatTime } from './exerciseUtils';

// Hilfsfunktion zum Rendern von Inhalten (z.B. Anleitungen)
const renderContent = (content: string | string[] | undefined): ReactElement | null => {
  if (!content) return null;
  const contentArray = Array.isArray(content) ? content : [content];
  return (
    <>
      {contentArray.map((item, index) => (
        <React.Fragment key={index}>
          {item}
          {index < contentArray.length - 1 && <br />}
        </React.Fragment>
      ))}
    </>
  );
};

interface VideoPlayerProps {
  exercise: Exercise;
  videoUrl: string;
  posterUrl: string;
  videoRef: React.RefObject<HTMLVideoElement | null>;
  progress: number;
  watchDuration: number;
  videoDuration: number;
  isFinished: boolean;
  isAborted: boolean;
  error: string | null;
  controls: {
    start: () => void;
    pause: () => void;
    abort: () => void;
    reset: () => void;
    handleTimeUpdate: () => void;
    handleLoadedMetadata: () => void;
    handleEnded: () => void;
    handleError: () => void;
  };
  onBackToPreview: () => void;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = (props) => {
  const { 
    exercise, videoUrl, posterUrl, videoRef, progress, watchDuration, videoDuration, 
    isFinished, isAborted, error, controls, onBackToPreview 
  } = props;

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'lg'));
  const isPortrait = useMediaQuery('(orientation: portrait)');
  const [isPaused, setIsPaused] = useState(false);
  
  // Video abspielen/pausieren Funktionen
  const handlePlayPause = () => {
    if (!videoRef.current) return;
    
    if (videoRef.current.paused) {
      videoRef.current.play();
      setIsPaused(false);
      controls.start(); // State aktualisieren
    } else {
      videoRef.current.pause();
      setIsPaused(true);
      controls.pause(); // State aktualisieren
    }
  };

  // Übung abschließen - erst ab 95% ermöglichen
  const completeEnabled = progress >= 95 && !isFinished && !isAborted;

  return (
    <Box sx={{
      maxWidth: '100%',
      width: { xs: '100%', sm: '90%', md: '85%' },
      mx: 'auto',
      mb: 2 // Reduzierter Abstand nach unten
    }}>
      {/* Video Container mit optimiertem Seitenverhältnis */}
      <Paper 
        elevation={3} 
        sx={{ 
          overflow: 'hidden', 
          borderRadius: 2, 
          backgroundColor: 'black',
          position: 'relative',
          maxHeight: isMobile ? '40vh' : '50vh' // Begrenzte Höhe für den Container
        }}
      >
        {/* Das Video-Element */}
        <Box
          sx={{ 
            width: '100%',
            height: '100%',
            display: 'flex',
            justifyContent: 'center', 
            backgroundColor: 'black'
          }}
        >
          <video
            ref={videoRef}
            src={videoUrl}
            poster={posterUrl}
            width="auto"
            height="auto"
            autoPlay
            playsInline
            controls={false} /* Keine nativen Browser-Steuerelemente */
            tabIndex={0}
            autoFocus
            aria-label="Übungsvideo"
            onTimeUpdate={controls.handleTimeUpdate}
            onLoadedMetadata={controls.handleLoadedMetadata}
            onEnded={controls.handleEnded}
            onError={controls.handleError}
            style={{ 
              aspectRatio: '576/720',
              objectFit: 'cover',
              height: isMobile ? '35vh' : '45vh', /* Feste Höhe statt maxHeight */
              maxWidth: '100%',
              margin: '0 auto' /* Zentrieren des Videos */
            }}
          />
        </Box>

        {/* Overlay mit Play/Pause-Button */}
        <Box 
          sx={{ 
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            opacity: isPaused ? 1 : 0,
            transition: 'opacity 0.3s',
            '&:hover': {
              opacity: 1,
              cursor: 'pointer',
              backgroundColor: 'rgba(0,0,0,0.3)'
            }
          }}
          onClick={handlePlayPause}
        >
          <IconButton 
            size="large"
            sx={{ 
              backgroundColor: 'rgba(255,255,255,0.2)', 
              '&:hover': { backgroundColor: 'rgba(255,255,255,0.4)' },
              p: 3
            }}
          >
            {isPaused ? 
              <PlayArrowIcon sx={{ fontSize: '4rem', color: 'white' }} /> : 
              <PauseIcon sx={{ fontSize: '4rem', color: 'white' }} />}
          </IconButton>
        </Box>

        {isMobile && isPortrait && (
          <Alert severity="info" icon={<ScreenRotationIcon />} sx={{ borderRadius: 0, m: 1, position: 'absolute', top: 0, left: 0, right: 0, zIndex: 1 }}>
            Für die beste Ansicht, drehe bitte dein Gerät ins Querformat.
          </Alert>
        )}

        <IconButton 
          onClick={onBackToPreview} 
          sx={{ 
            position: 'absolute', 
            top: 16, 
            left: 16, 
            color: 'white', 
            backgroundColor: 'rgba(0,0,0,0.5)',
            '&:hover': { backgroundColor: 'rgba(0,0,0,0.7)' }
          }}
          aria-label="Zurück zur Übersicht"
        >
          <ArrowBackIcon />
        </IconButton>
      </Paper>

      {/* Fortschrittsanzeige und Steuerelemente */}
      <Paper elevation={2} sx={{ mt: 1.5, p: { xs: 1.5, sm: 2 }, borderRadius: 2 }}>
        {/* Fortschrittsanzeige */}
        <Box sx={{ mb: 3 }}>
          <Typography 
            variant="subtitle1" 
            sx={{ 
              mb: 0.5, 
              textAlign: 'center', 
              fontWeight: 'bold', 
              fontSize: isMobile ? '1rem' : '1.1rem'
            }}
          >
            Übungsfortschritt
          </Typography>
          
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <LinearProgress 
              variant="determinate" 
              value={progress} 
              sx={{ 
                flexGrow: 1, 
                height: 12, 
                borderRadius: 6, 
                backgroundColor: '#e0e0e0', 
                '& .MuiLinearProgress-bar': { backgroundColor: theme.palette.primary.main }
              }}
              aria-label="Fortschritt Video"
            />
          </Box>
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
              {Math.round(progress)}%
            </Typography>
            <Typography 
              variant="body2" 
              sx={{ 
                fontWeight: 'bold', 
                fontSize: isMobile ? '0.9rem' : '1.1rem'
              }}
            >
              {formatTime(watchDuration)} / {formatTime(videoDuration)}
            </Typography>
          </Box>
        </Box>

        {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

        {/* Status-Anzeigen */}
        {isFinished ? (
          <Alert 
            severity="success" 
            icon={<CheckCircleIcon fontSize="large" />} 
            sx={{ 
              mb: 3, 
              fontSize: isMobile ? '1.1rem' : '1.3rem', 
              fontWeight: 'bold', 
              border: '2px solid #388e3c', 
              borderRadius: 2, 
              backgroundColor: '#e8f5e9' 
            }}
            role="status"
            aria-live="polite"
          >
            Super! Übung abgeschlossen.
          </Alert>
        ) : isAborted ? (
          <Alert 
            severity="warning" 
            icon={<CancelIcon fontSize="large" />} 
            sx={{ 
              mb: 3, 
              fontSize: isMobile ? '1.1rem' : '1.3rem', 
              fontWeight: 'bold', 
              border: '2px solid #ffa726', 
              borderRadius: 2, 
              backgroundColor: '#fff8e1' 
            }}
            role="status"
            aria-live="assertive"
          >
            Übung wurde abgebrochen.
          </Alert>
        ) : null}

        {/* Steuerelemente */}
        <Stack 
          direction={{ xs: 'column', sm: 'row' }}
          spacing={2}
          justifyContent="center"
          alignItems="center"
          sx={{ mt: 2 }}
        >
          {/* Play/Pause Button */}
          <Button
            variant="contained"
            color="primary"
            size="large"
            startIcon={isPaused ? <PlayArrowIcon /> : <PauseIcon />}
            onClick={handlePlayPause}
            disabled={isFinished || isAborted}
            sx={{ 
              fontSize: '1.2rem',
              py: 1.5,
              px: 4,
              width: { xs: '100%', sm: 'auto' },
              minWidth: { sm: '180px' }
            }}
          >
            {isPaused ? 'Fortsetzen' : 'Pausieren'}
          </Button>

          {/* Abbrechen Button */}
          <Button 
            variant="outlined" 
            color="secondary" 
            size="large"
            onClick={controls.abort} 
            disabled={isFinished || isAborted}
            sx={{ 
              fontSize: '1.1rem',
              py: 1.5,
              px: 4,
              width: { xs: '100%', sm: 'auto' },
              minWidth: { sm: '180px' }
            }}
          >
            Übung abbrechen
          </Button>
          
          {/* Übung abschließen Button */}
          <Button 
            variant="contained" 
            color="success"
            size="large" 
            onClick={controls.handleEnded} 
            disabled={!completeEnabled}
            sx={{ 
              fontSize: '1.3rem',
              fontWeight: 'bold',
              py: 1.8,
              px: 4,
              width: { xs: '100%', sm: 'auto' },
              minWidth: { sm: '200px' },
              backgroundColor: completeEnabled ? '#4caf50' : undefined
            }}
          >
            Übung abschließen
            {!completeEnabled && progress < 95 && !isFinished && !isAborted && (
              <Typography variant="caption" sx={{ display: 'block', mt: 0.5 }}>
                (ab 95% verfügbar)
              </Typography>
            )}
          </Button>
          
          {/* Wiederholen Button */}
          {(isFinished || isAborted) && (
            <Button 
              variant="outlined" 
              color="info" 
              size="large"
              startIcon={<ReplayIcon />}
              onClick={controls.reset} 
              sx={{ 
                fontSize: '1.1rem',
                py: 1.5,
                px: 4,
                width: { xs: '100%', sm: 'auto' },
                minWidth: { sm: '180px' }
              }}
            >
              Nochmal
            </Button>
          )}
        </Stack>
      </Paper>
    </Box>
  );
};
