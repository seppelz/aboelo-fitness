import React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import WbSunnyIcon from '@mui/icons-material/WbSunny';
import FavoriteIcon from '@mui/icons-material/Favorite';
import SelfImprovementIcon from '@mui/icons-material/SelfImprovement';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';

// Array of motivational quotes (module scoped to keep reference stable)
const motivationalQuotes = [
  {
    text: "Bewegung ist die beste Medizin - und sie ist kostenlos!",
    icon: <FavoriteIcon sx={{ fontSize: 40 }} />,
  },
  {
    text: "Jeder Schritt zählt, jede Bewegung macht Sie stärker!",
    icon: <SelfImprovementIcon sx={{ fontSize: 40 }} />,
  },
  {
    text: "Sie sind nie zu alt, um fit zu bleiben!",
    icon: <EmojiEventsIcon sx={{ fontSize: 40 }} />,
  },
  {
    text: "Ihr Körper dankt Ihnen für jede Übung!",
    icon: <FavoriteIcon sx={{ fontSize: 40 }} />,
  },
  {
    text: "Kleine Schritte führen zu großen Veränderungen!",
    icon: <SelfImprovementIcon sx={{ fontSize: 40 }} />,
  },
  {
    text: "Heute ist ein guter Tag für Bewegung!",
    icon: <WbSunnyIcon sx={{ fontSize: 40 }} />,
  },
  {
    text: "Gesundheit ist Reichtum - investieren Sie täglich!",
    icon: <FavoriteIcon sx={{ fontSize: 40 }} />,
  },
  {
    text: "Bleiben Sie aktiv, bleiben Sie jung!",
    icon: <SelfImprovementIcon sx={{ fontSize: 40 }} />,
  },
  {
    text: "Ihre Fitness-Reise beginnt mit einem einzigen Schritt!",
    icon: <EmojiEventsIcon sx={{ fontSize: 40 }} />,
  },
  {
    text: "Bewegung bringt Lebensfreude!",
    icon: <WbSunnyIcon sx={{ fontSize: 40 }} />,
  },
  {
    text: "Stark bleiben bedeutet, jeden Tag etwas zu tun!",
    icon: <SelfImprovementIcon sx={{ fontSize: 40 }} />,
  },
  {
    text: "Ihr Wohlbefinden liegt in Ihren Händen!",
    icon: <FavoriteIcon sx={{ fontSize: 40 }} />,
  },
  {
    text: "Regelmäßigkeit schlägt Intensität!",
    icon: <EmojiEventsIcon sx={{ fontSize: 40 }} />,
  },
  {
    text: "Bewegen Sie sich heute für ein besseres Morgen!",
    icon: <WbSunnyIcon sx={{ fontSize: 40 }} />,
  },
  {
    text: "Jede Übung ist ein Geschenk an Ihren Körper!",
    icon: <FavoriteIcon sx={{ fontSize: 40 }} />,
  },
  {
    text: "Fitness kennt kein Alter!",
    icon: <SelfImprovementIcon sx={{ fontSize: 40 }} />,
  },
  {
    text: "Bleiben Sie in Bewegung, bleiben Sie glücklich!",
    icon: <WbSunnyIcon sx={{ fontSize: 40 }} />,
  },
  {
    text: "Ihr Körper kann mehr, als Sie denken!",
    icon: <EmojiEventsIcon sx={{ fontSize: 40 }} />,
  },
  {
    text: "Gesundheit ist die Grundlage für alles!",
    icon: <FavoriteIcon sx={{ fontSize: 40 }} />,
  },
  {
    text: "Heute trainieren, morgen profitieren!",
    icon: <SelfImprovementIcon sx={{ fontSize: 40 }} />,
  },
];

const MorningMotivation: React.FC = () => {
  // Get quote of the day (changes daily)
  const today = new Date();
  const dayOfYear = Math.floor(
    (today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) /
      (1000 * 60 * 60 * 24)
  );
  const quoteOfTheDay = motivationalQuotes[dayOfYear % motivationalQuotes.length];

  return (
    <Paper
      elevation={3}
      sx={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        p: 3,
        borderRadius: 3,
        mb: 3,
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Decorative background circles */}
      <Box
        sx={{
          position: 'absolute',
          top: -20,
          right: -20,
          width: 100,
          height: 100,
          borderRadius: '50%',
          background: 'rgba(255, 255, 255, 0.1)',
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          bottom: -30,
          left: -30,
          width: 120,
          height: 120,
          borderRadius: '50%',
          background: 'rgba(255, 255, 255, 0.1)',
        }}
      />

      <Box sx={{ position: 'relative', zIndex: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <Box
            sx={{
              bgcolor: 'rgba(255, 255, 255, 0.2)',
              borderRadius: '50%',
              p: 1.5,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            {quoteOfTheDay.icon}
          </Box>
          <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
            Motivation des Tages
          </Typography>
        </Box>

        <Typography
          variant="h6"
          sx={{
            fontStyle: 'italic',
            lineHeight: 1.6,
            textShadow: '0 2px 4px rgba(0,0,0,0.2)'
          }}
        >
          "{quoteOfTheDay.text}"
        </Typography>
      </Box>
    </Paper>
  );
};

export default MorningMotivation;
