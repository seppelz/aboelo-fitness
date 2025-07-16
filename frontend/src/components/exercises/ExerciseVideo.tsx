import React from 'react';
import { Box, Alert, Skeleton } from '@mui/material';

import { Exercise } from '../../types';
import { getVideoDetails } from './exerciseUtils';
import { useExercisePlayer } from './useExercisePlayer';
import { ExercisePreview } from './ExercisePreview';
import { VideoPlayer } from './VideoPlayer';

interface ExerciseVideoProps {
  exercise: Exercise;
  onExerciseComplete: () => void;
  videoRef?: React.RefObject<HTMLVideoElement | null>;
}

const ExerciseVideo: React.FC<ExerciseVideoProps> = ({ exercise, onExerciseComplete, videoRef: externalVideoRef }) => {
  const videoDetails = getVideoDetails(exercise);
  const { state, videoRef: internalVideoRef, controls } = useExercisePlayer(exercise, onExerciseComplete);
  const refToUse = externalVideoRef || internalVideoRef;

  // Fall 1: Kein Video verfügbar
  if (videoDetails.type === 'none') {
    return (
      <Box sx={{ my: 4, maxWidth: 800, mx: 'auto', p: 2, display: 'flex', justifyContent: 'center', alignItems: 'center', border: '1px dashed grey', borderRadius: 2, minHeight: '300px' }}>
        <Alert severity="info">Für diese Übung ist leider kein Video verfügbar.</Alert>
      </Box>
    );
  }

  // Fall 2: Video ist verfügbar. Wir rendern den VideoPlayer mit angepassten Kontrollen.
  const adaptedControls = {
    ...controls,
    // Mapping von start zu play für die VideoPlayer Komponente
    play: controls.start
  };

  return (
    // Kein extra Box-Container und Margins mehr, da diese bereits im VideoPlayer definiert sind
    <VideoPlayer
      exercise={exercise}
      videoUrl={videoDetails.source}
      posterUrl={videoDetails.poster}
      videoRef={refToUse}
      progress={state.progress}
      watchDuration={state.watchDuration}
      videoDuration={state.videoDuration}
      isFinished={state.isFinished}
      isAborted={state.isAborted}
      error={state.error}
      controls={adaptedControls}
      onBackToPreview={() => controls.pause()} // Zurück-Funktion
    />
  );
};

export default ExerciseVideo;
