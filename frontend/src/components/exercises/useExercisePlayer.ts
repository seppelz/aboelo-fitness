import { useRef, useReducer, useEffect } from 'react';
import { Exercise } from '../../types';
import { saveProgress } from '../../services/progressService';

// 1. State-Definition
interface PlayerState {
  isPlaying: boolean;
  isLoading: boolean;
  isFinished: boolean;
  isAborted: boolean;
  isSubmitting: boolean;
  progress: number;
  watchDuration: number;
  videoDuration: number;
  error: string | null;
}

// 2. Action-Definitionen

type PlayerAction =
  | { type: 'PLAY' }
  | { type: 'PAUSE' }
  | { type: 'LOADED_METADATA'; payload: number }
  | { type: 'TIME_UPDATE'; payload: { time: number; duration: number } }
  | { type: 'ENDED' }
  | { type: 'ABORT' }
  | { type: 'SUBMIT_START' }
  | { type: 'SUBMIT_SUCCESS' }
  | { type: 'SUBMIT_ERROR'; payload: string }
  | { type: 'RESET' };

// 3. Initialer State
const initialState: PlayerState = {
  isPlaying: false,
  isLoading: true,
  isFinished: false,
  isAborted: false,
  isSubmitting: false,
  progress: 0,
  watchDuration: 0,
  videoDuration: 0,
  error: null,
};

// 4. Reducer-Funktion
const playerReducer = (state: PlayerState, action: PlayerAction): PlayerState => {
  switch (action.type) {
    case 'PLAY':
      return { ...state, isPlaying: true, isLoading: false, isFinished: false, isAborted: false, error: null };
    case 'PAUSE':
      return { ...state, isPlaying: false };
    case 'LOADED_METADATA':
      return { ...state, videoDuration: action.payload, isLoading: false };
    case 'TIME_UPDATE':
      return {
        ...state,
        watchDuration: Math.floor(action.payload.time),
        progress: Math.min(100, (action.payload.time / action.payload.duration) * 100),
      };
    case 'ENDED':
      return { ...state, isPlaying: false, isFinished: true, progress: 100 };
    case 'ABORT':
        return { ...state, isPlaying: false, isAborted: true };
    case 'SUBMIT_START':
      return { ...state, isSubmitting: true };
    case 'SUBMIT_SUCCESS':
      return { ...state, isSubmitting: false };
    case 'SUBMIT_ERROR':
      return { ...state, isSubmitting: false, error: action.payload };
    case 'RESET':
      return initialState;
    default:
      return state;
  }
};

// 5. Der Custom Hook
export const useExercisePlayer = (exercise: Exercise, onExerciseComplete: () => void) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [state, dispatch] = useReducer(playerReducer, initialState);

  // Effekt für die Fortschrittsspeicherung bei Abschluss oder Abbruch
  useEffect(() => {
    const submit = async (completed: boolean, aborted: boolean) => {
      dispatch({ type: 'SUBMIT_START' });
      try {
        await saveProgress({
          exerciseId: exercise._id,
          completed,
          aborted,
          watchDuration: state.watchDuration
        });
        dispatch({ type: 'SUBMIT_SUCCESS' });
        if (completed) {
          onExerciseComplete();
        }
      } catch (err) {
        console.error('Fehler beim Speichern des Fortschritts:', err);
        dispatch({ type: 'SUBMIT_ERROR', payload: 'Fortschritt konnte nicht gespeichert werden.' });
      }
    };

    if (state.isFinished && !state.isSubmitting) {
      submit(true, false);
    }
    if (state.isAborted && !state.isSubmitting) {
        submit(false, true);
    }
  }, [state.isFinished, state.isAborted, state.isSubmitting, state.watchDuration, exercise._id, onExerciseComplete]);

  // Public API des Hooks
  const controls = {
    start: () => dispatch({ type: 'PLAY' }),
    pause: () => dispatch({ type: 'PAUSE' }),
    abort: () => dispatch({ type: 'ABORT' }),
    reset: () => dispatch({ type: 'RESET' }),
    handleTimeUpdate: () => {
      if (videoRef.current) {
        dispatch({
          type: 'TIME_UPDATE',
          payload: { time: videoRef.current.currentTime, duration: videoRef.current.duration },
        });
      }
    },
    handleLoadedMetadata: () => {
      if (videoRef.current) {
        dispatch({ type: 'LOADED_METADATA', payload: videoRef.current.duration });
      }
    },
    handleEnded: () => dispatch({ type: 'ENDED' }),
    handleError: () => dispatch({ type: 'SUBMIT_ERROR', payload: 'Video konnte nicht geladen werden.' })
  };

  return { state, videoRef, controls };
};
