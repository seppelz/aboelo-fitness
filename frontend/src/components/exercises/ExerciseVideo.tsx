import React from 'react';
import VideoPlayer from './VideoPlayer';
import { Exercise } from '../../types';
import { getVideoDetails } from './exerciseUtils';
import { Box, Alert } from '@mui/material';

interface ExerciseVideoProps {
  exercise: Exercise;
  onVideoComplete?: () => void;
  compact?: boolean;
  videoRef?: React.RefObject<HTMLVideoElement | null>;
  onTimeUpdate?: () => void;
  onPlay?: () => void;
  onPause?: () => void;
  autoplay?: boolean;
}

const ExerciseVideo: React.FC<ExerciseVideoProps> = ({ exercise, onVideoComplete, compact = false, videoRef, onTimeUpdate, onPlay, onPause, autoplay = false }) => {
  // Memoize video details to prevent recalculation and re-renders
  const videoDetails = React.useMemo(() => getVideoDetails(exercise), [exercise]);

  const handleVideoComplete = () => {
    if (onVideoComplete) {
      onVideoComplete();
    }
  };

  // Fall 1: Kein Video verfügbar
  if (videoDetails.type === 'none') {
    return (
      <Box sx={{ my: 4, maxWidth: 800, mx: 'auto', p: 2, display: 'flex', justifyContent: 'center', alignItems: 'center', border: '1px dashed grey', borderRadius: 2, minHeight: '300px' }}>
        <Alert severity="info">Für diese Übung ist leider kein Video verfügbar.</Alert>
      </Box>
    );
  }

  return (
    <VideoPlayer
      src={videoDetails.source}
      poster={videoDetails.type === 'video' ? videoDetails.poster : ''}
      onComplete={handleVideoComplete}
      compact={compact}
      ref={videoRef}
      onTimeUpdate={onTimeUpdate}
      onPlay={onPlay}
      onPause={onPause}
      autoplay={autoplay}
    />
  );
};

export default ExerciseVideo;
