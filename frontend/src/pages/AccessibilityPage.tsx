import React from 'react';
import { Container, Typography, Box, List, ListItem, ListItemText, Link } from '@mui/material';

const AccessibilityPage: React.FC = () => {
  return (
    <Container maxWidth="md" sx={{ py: { xs: 4, sm: 6 } }}>
      <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 'bold', mb: 4 }}>
        Barrierefreiheitserklärung
      </Typography>

      <Box sx={{ mb: 4 }}>
        <Typography variant="body1" paragraph>
          Wir möchten sicherstellen, dass alle Menschen, unabhängig von ihren Fähigkeiten, Zugang zu aboelo-fitness haben. Diese Erklärung beschreibt den aktuellen Stand der Barrierefreiheit unseres Angebots sowie unsere geplanten Verbesserungen.
        </Typography>
      </Box>

      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" component="h2" gutterBottom>
          Geltungsbereich
        </Typography>
        <Typography variant="body1" paragraph>
          Diese Erklärung zur Barrierefreiheit gilt für die Website und die Web-Anwendung von aboelo-fitness unter www.aboelo-fitness.de.
        </Typography>
      </Box>

      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" component="h2" gutterBottom>
          Stand der Vereinbarkeit mit den Anforderungen
        </Typography>
        <Typography variant="body1" paragraph>
          Unsere Website ist teilweise mit den Anforderungen der Barrierefreie-Informationstechnik-Verordnung (
          BITV 2.0) vereinbar. Wir arbeiten daran, verbleibende Barrieren zu identifizieren und zu beheben.
        </Typography>
      </Box>

      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" component="h2" gutterBottom>
          Barrierefreie Funktionen
        </Typography>
        <List>
          <ListItem disableGutters>
            <ListItemText primary="Klare Navigation mit gut lesbaren Schriftgrößen und Kontrasten" />
          </ListItem>
          <ListItem disableGutters>
            <ListItemText primary="Responsives Design für Desktop, Tablet und Smartphone" />
          </ListItem>
          <ListItem disableGutters>
            <ListItemText primary="Videoplayer mit Tastatursteuerung, visueller Fortschrittsanzeige und Untertitelfunktion" />
          </ListItem>
          <ListItem disableGutters>
            <ListItemText primary="Alt-Texte für Bilder und eindeutige Beschriftungen von Bedienelementen" />
          </ListItem>
        </List>
      </Box>

      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" component="h2" gutterBottom>
          Geplante Verbesserungen
        </Typography>
        <List>
          <ListItem disableGutters>
            <ListItemText primary="Erweiterte Unterstützung für Screenreader und Braillezeilen" />
          </ListItem>
          <ListItem disableGutters>
            <ListItemText primary="Ausbau der Tastaturnavigation in allen Interaktionsbereichen" />
          </ListItem>
          <ListItem disableGutters>
            <ListItemText primary="Zusätzliche Untertitel und Audiobeschreibungen für Übungsvideos" />
          </ListItem>
        </List>
      </Box>

      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" component="h2" gutterBottom>
          Feedback und Kontakt
        </Typography>
        <Typography variant="body1" paragraph>
          Sie haben Barrieren entdeckt oder benötigen Unterstützung? Bitte melden Sie sich bei uns, damit wir gemeinsam eine Lösung finden.
        </Typography>
        <Typography variant="body1">
          E-Mail: <Link href="mailto:barrierefreiheit@aboelo-fitness.de">barrierefreiheit@aboelo-fitness.de</Link>
        </Typography>
        <Typography variant="body1">
          Telefon: <Link href="tel:+491234567890">+49 123 456 7890</Link>
        </Typography>
      </Box>

      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" component="h2" gutterBottom>
          Durchsetzungsverfahren
        </Typography>
        <Typography variant="body1" paragraph>
          Sollten Sie mit der Antwort auf Ihr Feedback nicht zufrieden sein, können Sie sich an die Durchsetzungsstelle des jeweiligen Bundeslandes wenden. Informationen dazu finden Sie auf der Website der Beauftragten der Bundesregierung für die Belange von Menschen mit Behinderungen.
        </Typography>
      </Box>

      <Typography variant="body2" color="text.secondary">
        Stand dieser Erklärung: 12. Oktober 2025
      </Typography>
    </Container>
  );
};

export default AccessibilityPage;
