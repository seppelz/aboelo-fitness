import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  LinearProgress,
  Paper,
  IconButton,
  useTheme,
  useMediaQuery,
  Stack
} from '@mui/material';

import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import ScreenRotationIcon from '@mui/icons-material/ScreenRotation';

// Helper function to format time in MM:SS format
const formatTime = (seconds: number): string => {
  if (!seconds || isNaN(seconds) || seconds === Infinity) return '00:00';
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
};



interface VideoPlayerProps {
  src: string;
  poster?: string;
  compact?: boolean;
  onComplete?: () => void;
  onTimeUpdate?: () => void;
  autoplay?: boolean;
  onPlay?: () => void;
  onPause?: () => void;
}

const VideoPlayer = React.forwardRef<HTMLVideoElement, VideoPlayerProps>((props, ref) => {
  const { 
    src, compact = false, onComplete, onTimeUpdate, autoplay = false, onPlay, onPause
  } = props;
  
  const videoRef = React.useRef<HTMLVideoElement>(null);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'lg'));
  const isPortrait = useMediaQuery('(orientation: portrait)');
  const [isPaused, setIsPaused] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Simple setup - only run once when component mounts
    if (videoRef.current) {
      const video = videoRef.current;
      
      // Set up event listeners
      const updateProgress = () => {
        if (onTimeUpdate) onTimeUpdate();
        const current = video.currentTime || 0;
        const total = video.duration || 0;
        setCurrentTime(current);
        if (total > 0) {
          setProgress((current / total) * 100);
        }
      };
      
      const handleEnded = () => {
        if (onComplete) onComplete();
      };
      
      const handleLoadedData = () => {
        setIsPaused(video.paused);
        // Check duration when data is loaded
        const duration = video.duration;
        if (duration && duration !== Infinity && !isNaN(duration)) {
          console.log('Duration from loadeddata event:', Math.round(duration), 'seconds');
        }
      };
      
      video.addEventListener('timeupdate', updateProgress);
      video.addEventListener('ended', handleEnded);
      video.addEventListener('loadeddata', handleLoadedData);
      
      // Add additional event listeners for duration detection
      video.addEventListener('loadedmetadata', () => {
        const videoDuration = video.duration;
        if (videoDuration && videoDuration !== Infinity && !isNaN(videoDuration)) {
          console.log('Duration from loadedmetadata listener:', Math.round(videoDuration), 'seconds');
          setDuration(videoDuration);
        }
      });
      
      video.addEventListener('durationchange', () => {
        const videoDuration = video.duration;
        if (videoDuration && videoDuration !== Infinity && !isNaN(videoDuration)) {
          console.log('Duration changed to:', Math.round(videoDuration), 'seconds');
          setDuration(videoDuration);
        }
      });
      
      // Load the video once
      video.load();
      
      // Cleanup function
      return () => {
          video.removeEventListener('timeupdate', updateProgress);
          video.removeEventListener('ended', handleEnded);
          video.removeEventListener('loadeddata', handleLoadedData);
          // Note: loadedmetadata and durationchange listeners will be cleaned up automatically
        };
    }
  }, []); // Empty dependency array - only run once
  
  // Handle autoplay in a separate effect
  useEffect(() => {
    if (autoplay && videoRef.current) {
      const timer = setTimeout(() => {
        if (videoRef.current) {
          console.log('VideoPlayer: Attempting autoplay');
          videoRef.current.play()
            .then(() => console.log('VideoPlayer: Autoplay successful'))
            .catch(err => console.error('VideoPlayer: Autoplay failed:', err));
        }
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [autoplay]);

  // Pass the ref to parent component via forwardRef
  React.useImperativeHandle(ref, () => videoRef.current as HTMLVideoElement);

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
            backgroundColor: 'white',
          position: 'relative',
            aspectRatio: '4/3',  // Standard video aspect ratio
          width: '100%',
          height: 'auto',
            minHeight: compact ? '300px' : '400px'
        }}
      >
        {/* Das Video-Element */}
        <Box
          sx={{ 
            width: '100%',
            height: '100%',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: 'white'
          }}
        >
          <video
            ref={videoRef}
            src={src}
            playsInline
            tabIndex={0}
            preload="metadata"
            aria-label="Übungsvideo"
            onTimeUpdate={onTimeUpdate}
            onEnded={() => {
              if (onComplete) onComplete();
            }}
            onPlay={() => {
              console.log('Video started playing');
              setIsPaused(false);
              if (onPlay) onPlay();
            }}
            onPause={() => {
              console.log('Video paused');
              setIsPaused(true);
              if (onPause) onPause();
            }}
            onError={(e) => {
              console.error('Video error:', e);
              console.error('Video source:', src);
            }}
            onLoadStart={() => {
              // console.log('Video loading started:', src);
            }}
            onCanPlay={() => {
              console.log('Video can play - ready to start');
            }}
            onLoadedMetadata={() => {
              const duration = videoRef.current?.duration;
              console.log('Video metadata loaded, duration:', duration);
              if (duration && duration !== Infinity && !isNaN(duration)) {
                console.log('Valid duration detected:', Math.round(duration), 'seconds');
              } else {
                console.log('Duration not ready yet, will wait for durationchange event');
              }
            }}
            onDurationChange={() => {
              const duration = videoRef.current?.duration;
              if (duration && duration !== Infinity && !isNaN(duration)) {
                console.log('Duration updated via durationchange:', Math.round(duration), 'seconds');
              }
            }}
            style={{ 
              width: '100%', 
              height: '100%',
              objectFit: 'contain',  // Show full video content, pad if needed
              maxHeight: '100%',
              display: 'block'
            }}
          />
        </Box>

        {isPortrait && !isMobile && (
          <Box 
            sx={{ 
              position: 'absolute', 
              top: 10, 
              right: 10, 
              backgroundColor: 'rgba(0,0,0,0.5)', 
              color: 'white',
              p: 1,
              borderRadius: 1,
              display: 'flex',
              alignItems: 'center',
              gap: 1
            }}
            role="alert"
          >
            <ScreenRotationIcon />
            <Typography variant="caption">
              Drehen Sie Ihr Gerät für eine bessere Ansicht
            </Typography>
          </Box>
        )}

        {/* Minimale Steuerelemente für kompaktes Layout */}
        {compact && (
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'center', 
            p: 1,
            backgroundColor: 'white'
          }}>
            <IconButton 
              color="primary" 
              onClick={() => {
                if (videoRef.current) {
                  if (videoRef.current.paused) {
                    videoRef.current.play()
                      .catch(err => console.error('Play error:', err));
                  } else {
                    videoRef.current.pause();
                  }
                }
              }}
            >
              {isPaused ? <PlayArrowIcon /> : <PauseIcon />}
            </IconButton>
          </Box>
        )}
      </Paper>

      {/* Fortschrittsanzeige und Steuerelemente */}
      <Paper elevation={2} sx={{ mt: 1.5, p: { xs: 1.5, sm: 2 }, borderRadius: 2 }}>
        {/* Fortschrittsbalken */}
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
          <Box sx={{ mt: 2, px: { xs: 1, sm: 2 } }}>
            <LinearProgress 
              variant="determinate" 
              value={progress} 
              sx={{ 
                height: 10, 
                borderRadius: 4,
                backgroundColor: '#e0e0e0',
                '& .MuiLinearProgress-bar': {
                  backgroundColor: theme.palette.primary.main,
                  borderRadius: 4
                }
              }}
              role="progressbar"
              aria-valuenow={Math.round(progress)}
              aria-valuemin={0}
              aria-valuemax={100}
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
              {`${formatTime(currentTime)} / ${formatTime(duration)}`}
            </Typography>
          </Box>
        </Box>

        {/* Steuerelemente - Play/Pause Button */}
        <Stack 
          direction={{ xs: 'column', sm: 'row' }}
          spacing={1}
          justifyContent="center"
          alignItems="center"
          sx={{ mt: 2, width: '100%', maxWidth: '100%', overflow: 'hidden' }}
        >
          {/* Play/Pause Button */}
          <Button
            variant="contained"
            color="primary"
            size="large"
            startIcon={isPaused ? <PlayArrowIcon /> : <PauseIcon />}
            onClick={() => {
              if (videoRef.current) {
                console.log('Play/Pause clicked, video paused:', videoRef.current.paused);
                console.log('Video src:', videoRef.current.src);
                console.log('Video readyState:', videoRef.current.readyState);
                
                if (videoRef.current.paused) {
                  videoRef.current.play()
                    .then(() => {
                      console.log('Play button: Video started successfully');
                    })
                    .catch(err => {
                      console.error('Play button: Play error:', err);
                    });
                } else {
                  videoRef.current.pause();
                  console.log('Video paused by user');
                }
              }
            }}
            sx={{ 
              fontSize: { xs: '1rem', sm: '1.1rem' },
              py: 1,
              px: { xs: 2, sm: 3 },
              width: { xs: '100%', sm: 'auto' },
              minWidth: { sm: '160px' },
              maxWidth: { sm: '200px' }
            }}
          >
            {isPaused ? 'Fortsetzen' : 'Pausieren'}
          </Button>
        </Stack>
      </Paper>
    </Box>
  );
});

export default VideoPlayer;
