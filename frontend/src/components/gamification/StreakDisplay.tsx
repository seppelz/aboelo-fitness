import React from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  LinearProgress,
  Chip,
  useTheme
} from '@mui/material';
import FlashOnIcon from '@mui/icons-material/FlashOn';
import { StreakInfo } from '../../types';

interface StreakDisplayProps {
  streakInfo: StreakInfo;
  compact?: boolean;
}

const StreakDisplay: React.FC<StreakDisplayProps> = ({ 
  streakInfo, 
  compact = false 
}) => {
  const theme = useTheme();

  const getStreakColor = (streak: number) => {
    if (streak >= 30) return '#ff9800'; // Orange for legendary streaks
    if (streak >= 14) return '#9c27b0'; // Purple for epic streaks
    if (streak >= 7) return '#2196f3';  // Blue for weekly streaks
    if (streak >= 3) return '#4caf50';  // Green for good streaks
    return '#757575'; // Gray for starting streaks
  };

  const getNextMilestone = (streak: number) => {
    if (streak < 3) return 3;
    if (streak < 7) return 7;
    if (streak < 14) return 14;
    if (streak < 30) return 30;
    return Math.ceil(streak / 10) * 10; // Next 10-day milestone
  };

  const nextMilestone = getNextMilestone(streakInfo.currentStreak);
  const progressToNext = (streakInfo.currentStreak / nextMilestone) * 100;

  if (compact) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <FlashOnIcon sx={{ 
          color: getStreakColor(streakInfo.currentStreak),
          fontSize: 20
        }} />
        <Typography variant="body2" fontWeight="bold">
          {streakInfo.currentStreak} Tage
        </Typography>
        {streakInfo.streakBroken && (
          <Chip 
            label="Neu gestartet" 
            size="small" 
            color="warning"
            sx={{ fontSize: '0.7rem', height: 20 }}
          />
        )}
      </Box>
    );
  }

  return (
    <Card
      sx={{
        background: `linear-gradient(135deg, ${getStreakColor(streakInfo.currentStreak)}20 0%, ${getStreakColor(streakInfo.currentStreak)}10 100%)`,
        border: `2px solid ${getStreakColor(streakInfo.currentStreak)}40`,
        borderRadius: 3
      }}
    >
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <FlashOnIcon sx={{ 
              color: getStreakColor(streakInfo.currentStreak),
              fontSize: 28
            }} />
            <Typography variant="h6" fontWeight="bold">
              Streak
            </Typography>
          </Box>
          
          <Box sx={{ textAlign: 'right' }}>
            <Typography variant="h4" fontWeight="bold" color={getStreakColor(streakInfo.currentStreak)}>
              {streakInfo.currentStreak}
            </Typography>
            <Typography variant="caption" color="textSecondary">
              Tage in Folge
            </Typography>
          </Box>
        </Box>

        <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
          {streakInfo.message}
        </Typography>

        {!streakInfo.streakBroken && streakInfo.currentStreak < nextMilestone && (
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="caption" color="textSecondary">
                Nächstes Ziel: {nextMilestone} Tage
              </Typography>
              <Typography variant="caption" color="textSecondary">
                {nextMilestone - streakInfo.currentStreak} Tage übrig
              </Typography>
            </Box>
            <LinearProgress 
              variant="determinate" 
              value={progressToNext}
              sx={{ 
                height: 8, 
                borderRadius: 4,
                backgroundColor: getStreakColor(streakInfo.currentStreak) + '30',
                '& .MuiLinearProgress-bar': {
                  backgroundColor: getStreakColor(streakInfo.currentStreak)
                }
              }}
            />
          </Box>
        )}

        {streakInfo.longestStreak > streakInfo.currentStreak && (
          <Box sx={{ mt: 2, p: 1, backgroundColor: theme.palette.background.default, borderRadius: 1 }}>
            <Typography variant="caption" color="textSecondary">
              Persönlicher Rekord: {streakInfo.longestStreak} Tage
            </Typography>
          </Box>
        )}

        {streakInfo.streakBroken && (
          <Chip 
            label="Streak unterbrochen - Neustart!" 
            color="warning" 
            sx={{ mt: 1 }}
            icon={<FlashOnIcon />}
          />
        )}
      </CardContent>
    </Card>
  );
};

export default StreakDisplay; 