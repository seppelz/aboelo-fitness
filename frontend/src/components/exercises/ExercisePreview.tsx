import React from 'react';
import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  Button,
  Box,
} from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import { Exercise } from '../../types';

interface ExercisePreviewProps {
  exercise: Exercise;
  posterUrl: string;
  onStart: () => void;
}

export const ExercisePreview: React.FC<ExercisePreviewProps> = ({ exercise, posterUrl, onStart }) => {
  return (
    <Card sx={{ maxWidth: 600, margin: 'auto', boxShadow: 3, borderRadius: 2 }}>
      <CardMedia
        component="img"
        height="300"
        image={posterUrl || '/placeholder.jpg'} // Fallback-Bild
        alt={`Vorschaubild für die Übung ${exercise.name}`}
        sx={{ objectFit: 'cover' }}
      />
      <CardContent sx={{ textAlign: 'center' }}>
        <Typography gutterBottom variant="h4" component="div" sx={{ fontWeight: 'bold' }}>
          {exercise.name}
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          {exercise.goal}
        </Typography>
        <Box>
          <Button
            variant="contained"
            color="primary"
            size="large"
            startIcon={<PlayArrowIcon />}
            onClick={onStart}
            sx={{ 
              minWidth: '200px', 
              minHeight: '50px', 
              fontSize: '1.2rem',
              borderRadius: '50px',
            }}
          >
            Übung starten
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
};
