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
  Stack,
  Card,
  CardContent,
  useTheme
} from '@mui/material';
import { TransitionProps } from '@mui/material/transitions';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import FlashOnIcon from '@mui/icons-material/FlashOn';
import StarIcon from '@mui/icons-material/Star';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import { GamificationData } from '../../types';

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

  useEffect(() => {
    if (open && (newAchievements.length > 0 || gamificationData.weeklyGoal?.completed)) {
      setShowConfetti(true);
      const timer = setTimeout(() => setShowConfetti(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [open, newAchievements.length, gamificationData.weeklyGoal?.completed]);

  const renderPointsSlide = () => (
    <Box textAlign="center" py={2}>
      <TrendingUpIcon sx={{ fontSize: 64, color: theme.palette.primary.main, mb: 2 }} />
      <Typography variant="h4" gutterBottom>
        +{pointsEarned} Punkte!
      </Typography>
      <Typography variant="body1" color="textSecondary">
        Großartige Leistung! Du sammelst fleißig Punkte.
      </Typography>
    </Box>
  );

  const renderStreakSlide = () => (
    <Box textAlign="center" py={2}>
      <FlashOnIcon sx={{ fontSize: 64, color: '#ff6b35', mb: 2 }} />
      <Typography variant="h4" gutterBottom>
        {gamificationData.streakInfo?.currentStreak} Tage Streak!
      </Typography>
      <Typography variant="body1" color="textSecondary" sx={{ mb: 2 }}>
        {gamificationData.streakInfo?.message}
      </Typography>
      <LinearProgress 
        variant="determinate" 
        value={Math.min(100, (gamificationData.streakInfo?.currentStreak || 0) * 10)} 
        sx={{ height: 8, borderRadius: 4 }}
      />
    </Box>
  );

  const renderWeeklyGoalSlide = () => (
    <Box textAlign="center" py={2}>
      <StarIcon sx={{ fontSize: 64, color: '#ffd700', mb: 2 }} />
      <Typography variant="h4" gutterBottom>
        Wochenziel erreicht! 🎉
      </Typography>
      <Typography variant="body1" color="textSecondary" sx={{ mb: 2 }}>
        {gamificationData.weeklyGoal?.message}
      </Typography>
             <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
         <Chip 
           label={`${gamificationData.weeklyGoal?.progress}/${gamificationData.weeklyGoal?.target} Übungen`} 
           color="success" 
           size="medium"
         />
       </Box>
    </Box>
  );

  const renderPerfectDaySlide = () => (
    <Box textAlign="center" py={2}>
      <Box sx={{ fontSize: 64, mb: 2 }}>✨</Box>
      <Typography variant="h4" gutterBottom>
        Perfekter Tag! 🎉
      </Typography>
      <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold', color: theme.palette.success.main }}>
        Alle 6 Muskelgruppen trainiert!
      </Typography>
      <Typography variant="body1" color="textSecondary" sx={{ mb: 2 }}>
        {gamificationData.perfectDay?.message}
      </Typography>
      <Chip 
        label={`+${gamificationData.perfectDay?.bonusPoints} Bonus-Punkte`} 
        color="success" 
        size="medium"
        sx={{ fontSize: '1.1rem', fontWeight: 'bold' }}
      />
    </Box>
  );

  const renderAchievementSlide = (achievement: any, index: number) => (
    <Box textAlign="center" py={2} key={index}>
      <Box
        sx={{
          fontSize: 80,
          mb: 2,
          filter: showConfetti ? 'drop-shadow(0 0 10px gold)' : 'none',
          transition: 'all 0.3s ease'
        }}
      >
        {achievement.achievement.icon}
      </Box>
      <Typography variant="h4" gutterBottom>
        Neues Achievement!
      </Typography>
      <Typography variant="h5" sx={{ mb: 1, fontWeight: 'bold' }}>
        {achievement.achievement.title}
      </Typography>
      <Typography variant="body1" color="textSecondary" sx={{ mb: 2 }}>
        {achievement.achievement.description}
      </Typography>
      <Chip 
        label={achievement.achievement.rarity.toUpperCase()} 
        sx={{ 
          backgroundColor: getRarityColor(achievement.achievement.rarity),
          color: 'white',
          fontWeight: 'bold'
        }}
      />
    </Box>
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
            borderRadius: 3,
            background: `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${theme.palette.background.default} 100%)`,
            overflow: 'hidden'
          }
        }}
      >
        <DialogTitle sx={{ textAlign: 'center', pb: 1 }}>
          <EmojiEventsIcon sx={{ fontSize: 32, color: theme.palette.primary.main }} />
        </DialogTitle>
        
        <DialogContent sx={{ minHeight: 300, display: 'flex', alignItems: 'center' }}>
          {getCurrentSlide()}
        </DialogContent>
        
        <DialogActions sx={{ justifyContent: 'space-between', px: 3, pb: 3 }}>
          <Typography variant="caption" color="textSecondary">
            {currentSlide + 1} von {totalSlides}
          </Typography>
          
          <Box>
            {totalSlides > 1 && (
              <Button onClick={handleSkip} sx={{ mr: 1 }}>
                Alle anzeigen
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