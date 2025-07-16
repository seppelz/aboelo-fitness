import React from 'react';
import { Box, Container, Typography } from '@mui/material';
import ExerciseList from '../components/exercises/ExerciseList';

const ExerciseListPage: React.FC = () => {
  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <ExerciseList />
      </Box>
    </Container>
  );
};

export default ExerciseListPage;
