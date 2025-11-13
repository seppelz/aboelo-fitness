import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Slide,
  Chip,
  LinearProgress,
  useTheme,
  Alert,
  Stack
} from '@mui/material';
import { TransitionProps } from '@mui/material/transitions';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import FlashOnIcon from '@mui/icons-material/FlashOn';
import StarIcon from '@mui/icons-material/Star';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import { GamificationData } from '../../types';
import { alpha } from '@mui/material/styles';

const Transition = React.forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement<any, any>;
  },
  ref: React.Ref<unknown>,
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

interface CelebrationModalProps {
  open: boolean;
  onClose: () => void;
  gamificationData: GamificationData;
  pointsEarned: number;
}

const getRarityColor = (rarity: string) => {
  switch (rarity) {
    case 'common': return '#9e9e9e';
    case 'rare': return '#2196f3';
    case 'epic': return '#9c27b0';
    case 'legendary': return '#ff9800';
    default: return '#9e9e9e';
  }
};

const CelebrationModal: React.FC<CelebrationModalProps> = ({
  open,
  onClose,
  gamificationData,
  pointsEarned
}) => {
  const theme = useTheme();
  const [showConfetti, setShowConfetti] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);

  const newAchievements = gamificationData.achievements.filter(a => a.isNew);
  const totalSlides = newAchievements.length + (pointsEarned > 0 ? 1 : 0) + 
                    (gamificationData.streakInfo ? 1 : 0) + 
                    (gamificationData.weeklyGoal?.completed ? 1 : 0) + 
                    (gamificationData.perfectDay?.isPerfectDay ? 1 : 0);
  const slideProgress = totalSlides > 0 ? ((currentSlide + 1) / totalSlides) * 100 : 0;

  useEffect(() => {
    if (open && (newAchievements.length > 0 || gamificationData.weeklyGoal?.completed)) {
      setShowConfetti(true);
      const timer = setTimeout(() => setShowConfetti(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [open, newAchievements.length, gamificationData.weeklyGoal?.completed]);

  const renderPointsSlide = () => (
    <Stack spacing={2.5} alignItems="center" textAlign="center">
      <Box
        sx={{
          width: 96,
          height: 96,
          borderRadius: '50%',
          background: `linear-gradient(145deg, ${alpha(theme.palette.primary.main, 0.15)}, ${alpha(theme.palette.primary.main, 0.35)})`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <TrendingUpIcon sx={{ fontSize: 46, color: theme.palette.primary.main }} />
      </Box>
      <Chip
        label={`+${pointsEarned} Punkte`}
        color="primary"
        size="medium"
        sx={{
          px: 2.5,
          py: 1,
          borderRadius: 3,
          fontSize: '1rem',
          fontWeight: 700
        }}
      />
      <Typography variant="h5" sx={{ fontWeight: 700 }}>
        Großartig gemacht!
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 420 }}>
        Deine konsequenten Aktivpausen zahlen sich aus. Weiter so – jede Übung bringt dich deinem Ziel näher.
      </Typography>
    </Stack>
  );

  const renderStreakSlide = () => (
    <Stack spacing={2.5} alignItems="center" textAlign="center">
      <Box
        sx={{
          width: 96,
          height: 96,
          borderRadius: '50%',
          background: `linear-gradient(145deg, ${alpha('#ff6b35', 0.18)}, ${alpha('#ff6b35', 0.32)})`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <FlashOnIcon sx={{ fontSize: 46, color: '#ff6b35' }} />
      </Box>
      <Typography variant="h5" sx={{ fontWeight: 700 }}>
        {gamificationData.streakInfo?.currentStreak} Tage in Folge aktiv!
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 420 }}>
        {gamificationData.streakInfo?.message}
      </Typography>
      {!gamificationData.streakInfo?.streakBroken && gamificationData.streakInfo?.protectionUsed && (
        <Alert 
          severity="info" 
          sx={{ mb: 1, display: 'inline-flex', textAlign: 'left' }}
          icon={<FlashOnIcon fontSize="small" />}
        >
          {gamificationData.streakInfo?.protectionMessage || '🛡️ Streak-Schutz aktiv: Wir haben Ihren Streak für Sie geschützt!'}
        </Alert>
      )}
      <LinearProgress 
        variant="determinate" 
        value={Math.min(100, (gamificationData.streakInfo?.currentStreak || 0) * 10)} 
        sx={{
          height: 10,
          borderRadius: 5,
          width: '100%',
          maxWidth: 360,
          backgroundColor: alpha('#ff6b35', 0.18),
          '& .MuiLinearProgress-bar': {
            backgroundColor: '#ff6b35'
          }
        }}
      />
    </Stack>
  );

  const renderWeeklyGoalSlide = () => (
    <Stack spacing={2.5} alignItems="center" textAlign="center">
      <Box
        sx={{
          width: 96,
          height: 96,
          borderRadius: '50%',
          background: `linear-gradient(145deg, ${alpha('#ffd700', 0.18)}, ${alpha('#ffd700', 0.32)})`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <StarIcon sx={{ fontSize: 46, color: '#ffd700' }} />
      </Box>
      <Typography variant="h5" sx={{ fontWeight: 700 }}>
        Wochenziel erreicht! 🎉
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 420 }}>
        {gamificationData.weeklyGoal?.message}
      </Typography>
      <Chip 
        label={`${gamificationData.weeklyGoal?.progress}/${gamificationData.weeklyGoal?.target} Übungen`} 
        color="success" 
        size="medium"
        sx={{ px: 2, py: 0.75, borderRadius: 2 }}
      />
    </Stack>
  );

  const renderPerfectDaySlide = () => (
    <Stack spacing={2.5} alignItems="center" textAlign="center">
      <Box sx={{ fontSize: 66, mb: 0.5 }}>✨</Box>
      <Typography variant="h5" sx={{ fontWeight: 700 }}>
        Perfekter Tag! 🎉
      </Typography>
      <Typography variant="subtitle1" sx={{ color: theme.palette.success.main, fontWeight: 700 }}>
        Alle 6 Muskelgruppen trainiert!
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 420 }}>
        {gamificationData.perfectDay?.message}
      </Typography>
      <Chip 
        label={`+${gamificationData.perfectDay?.bonusPoints} Bonus-Punkte`} 
        color="success" 
        size="medium"
        sx={{ fontSize: '1.05rem', fontWeight: 700, px: 2.5, py: 0.75, borderRadius: 2 }}
      />
    </Stack>
  );

  const renderAchievementSlide = (achievement: any, index: number) => (
    <Stack spacing={2.5} alignItems="center" textAlign="center" key={index}>
      <Box
        sx={{
          fontSize: 86,
          mb: 0.5,
          filter: showConfetti ? 'drop-shadow(0 0 14px rgba(255,215,0,0.65))' : 'none',
          transition: 'all 0.3s ease'
        }}
      >
        {achievement.achievement.icon}
      </Box>
      <Typography variant="h5" sx={{ fontWeight: 700 }}>
        Neues Achievement
      </Typography>
      <Typography variant="h6" sx={{ fontWeight: 700 }}>
        {achievement.achievement.title}
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 420 }}>
        {achievement.achievement.description}
      </Typography>
      <Chip 
        label={achievement.achievement.rarity.toUpperCase()} 
        sx={{ 
          backgroundColor: getRarityColor(achievement.achievement.rarity),
          color: 'white',
          fontWeight: 700,
          px: 2,
          py: 0.75,
          borderRadius: 2
        }}
      />
    </Stack>
  );

  const handleNext = () => {
    if (currentSlide < totalSlides - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      onClose();
    }
  };

  const handleSkip = () => {
    onClose();
  };

  const getCurrentSlide = () => {
    let slideIndex = 0;
    
    // Points slide first if points earned
    if (pointsEarned > 0) {
      if (currentSlide === slideIndex) return renderPointsSlide();
      slideIndex++;
    }
    
    // Streak slide
    if (gamificationData.streakInfo && gamificationData.streakInfo.currentStreak > 1) {
      if (currentSlide === slideIndex) return renderStreakSlide();
      slideIndex++;
    }
    
    // Weekly goal slide
    if (gamificationData.weeklyGoal?.completed) {
      if (currentSlide === slideIndex) return renderWeeklyGoalSlide();
      slideIndex++;
    }
    
    // Perfect Day slide
    if (gamificationData.perfectDay?.isPerfectDay) {
      if (currentSlide === slideIndex) return renderPerfectDaySlide();
      slideIndex++;
    }
    
    // Achievement slides
    for (let i = 0; i < newAchievements.length; i++) {
      if (currentSlide === slideIndex) return renderAchievementSlide(newAchievements[i], i);
      slideIndex++;
    }
    
    return null;
  };

  if (!open || totalSlides === 0) return null;

  return (
    <>
      {/* Confetti Effect */}
      {showConfetti && (
        <Box
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            pointerEvents: 'none',
            zIndex: 9999,
            background: 'radial-gradient(circle, rgba(255,215,0,0.3) 0%, transparent 70%)',
            animation: 'sparkle 3s ease-out'
          }}
        />
      )}
      
      <Dialog
        open={open}
        TransitionComponent={Transition}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 4,
            background: `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${theme.palette.background.default} 100%)`,
            overflow: 'hidden',
            boxShadow: '0 24px 48px rgba(17,63,103,0.18)'
          }
        }}
      >
        <DialogTitle sx={{ textAlign: 'center', pb: 1.5 }}>
          <Stack spacing={1} alignItems="center">
            <EmojiEventsIcon sx={{ fontSize: 34, color: theme.palette.primary.main }} />
            <Typography variant="h5" sx={{ fontWeight: 800 }}>
              Glückwunsch!
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              Hier ist dein Fortschritt auf einen Blick
            </Typography>
          </Stack>
        </DialogTitle>
        
        <DialogContent
          sx={{
            minHeight: 320,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            py: 4,
            px: { xs: 3, sm: 4 }
          }}
        >
          <Box sx={{ flexGrow: 1, width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {getCurrentSlide()}
          </Box>
          {totalSlides > 0 && (
            <Stack
              direction="row"
              spacing={2}
              alignItems="center"
              sx={{ width: '100%', mt: 4 }}
            >
              <LinearProgress
                variant="determinate"
                value={slideProgress}
                sx={{
                  flexGrow: 1,
                  height: 10,
                  borderRadius: 5,
                  backgroundColor: alpha(theme.palette.primary.main, 0.12),
                  '& .MuiLinearProgress-bar': {
                    borderRadius: 5,
                    background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`
                  }
                }}
              />
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {currentSlide + 1}/{totalSlides}
              </Typography>
            </Stack>
          )}
        </DialogContent>
        
        <DialogActions
          sx={{
            justifyContent: 'space-between',
            px: 3.5,
            pb: 3,
            pt: 2,
            backgroundColor: alpha(theme.palette.background.default, 0.6)
          }}
        >
          <Typography variant="body2" color="text.secondary">
            Weiter so – du bist auf einem tollen Weg!
          </Typography>
          <Box>
            {totalSlides > 1 && (
              <Button onClick={handleSkip} sx={{ mr: 1.5 }}>
                Überspringen
              </Button>
            )}
            <Button onClick={handleNext} variant="contained">
              {currentSlide < totalSlides - 1 ? 'Weiter' : 'Fertig'}
            </Button>
          </Box>
        </DialogActions>
      </Dialog>
      
      <style>
        {`
          @keyframes sparkle {
            0% { opacity: 0; transform: scale(0.5); }
            50% { opacity: 1; transform: scale(1.1); }
            100% { opacity: 0; transform: scale(1); }
          }
        `}
      </style>
    </>
  );
};

export default CelebrationModal; 