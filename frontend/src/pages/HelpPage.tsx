import React from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Card,
  CardContent
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import FlashOnIcon from '@mui/icons-material/FlashOn';
import StarIcon from '@mui/icons-material/Star';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import InfoIcon from '@mui/icons-material/Info';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';
import SelfImprovementIcon from '@mui/icons-material/SelfImprovement';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import InstallMobileIcon from '@mui/icons-material/InstallMobile';

const HelpPage: React.FC = () => {
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <Typography variant="h3" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main' }}>
          Hilfe & Anleitung
        </Typography>
        <Typography variant="h6" color="textSecondary">
          Alles, was Sie über Ihre Fitness-App wissen müssen
        </Typography>
      </Box>

      {/* Quick Overview Cards */}
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3, mb: 4 }}>
        <Box sx={{ flex: 1 }}>
          <Card sx={{ height: '100%', bgcolor: 'primary.light', color: 'white' }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <FitnessCenterIcon sx={{ fontSize: 48, mb: 1 }} />
              <Typography variant="h6" gutterBottom>
                6 Muskelgruppen
              </Typography>
              <Typography variant="body2">
                Trainieren Sie täglich alle Muskelgruppen für optimale Fitness
              </Typography>
            </CardContent>
          </Card>
        </Box>
        <Box sx={{ flex: 1 }}>
          <Card sx={{ height: '100%', bgcolor: 'success.light', color: 'white' }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <TrendingUpIcon sx={{ fontSize: 48, mb: 1 }} />
              <Typography variant="h6" gutterBottom>
                Punkte & Level
              </Typography>
              <Typography variant="body2">
                Sammeln Sie Punkte und steigen Sie in Levels auf
              </Typography>
            </CardContent>
          </Card>
        </Box>
        <Box sx={{ flex: 1 }}>
          <Card sx={{ height: '100%', bgcolor: 'warning.light', color: 'white' }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <EmojiEventsIcon sx={{ fontSize: 48, mb: 1 }} />
              <Typography variant="h6" gutterBottom>
                Achievements
              </Typography>
              <Typography variant="body2">
                Schalten Sie besondere Erfolge frei
              </Typography>
            </CardContent>
          </Card>
        </Box>
      </Box>

      {/* Detailed Help Sections */}
      <Paper elevation={2} sx={{ p: 3 }}>
        
        {/* Section 1: Getting Started */}
        <Accordion defaultExpanded>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h5" sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1 }}>
              <InfoIcon color="primary" /> Erste Schritte
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography variant="body1" paragraph>
              Willkommen bei Ihrer persönlichen Fitness-App für Senioren! Diese App wurde speziell entwickelt, 
              um Ihnen zu helfen, fit und gesund zu bleiben.
            </Typography>
            <List>
              <ListItem>
                <ListItemIcon><CheckCircleIcon color="success" /></ListItemIcon>
                <ListItemText 
                  primary="Übungen auswählen" 
                  secondary="Auf der Startseite sehen Sie empfohlene Übungen für noch nicht trainierte Muskelgruppen"
                />
              </ListItem>
              <ListItem>
                <ListItemIcon><CheckCircleIcon color="success" /></ListItemIcon>
                <ListItemText 
                  primary="Anleitung lesen" 
                  secondary="Lesen Sie vor jeder Übung die Vorbereitung, Durchführung und Tipps aufmerksam durch"
                />
              </ListItem>
              <ListItem>
                <ListItemIcon><CheckCircleIcon color="success" /></ListItemIcon>
                <ListItemText 
                  primary="Übung starten" 
                  secondary="Klicken Sie auf 'Übung starten' und folgen Sie dem Video"
                />
              </ListItem>
              <ListItem>
                <ListItemIcon><CheckCircleIcon color="success" /></ListItemIcon>
                <ListItemText 
                  primary="Abschließen" 
                  secondary="Schließen Sie die Übung ab, um Punkte zu sammeln"
                />
              </ListItem>
            </List>
          </AccordionDetails>
        </Accordion>

        {/* Section 2: Muscle Groups */}
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h5" sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1 }}>
              <SelfImprovementIcon color="primary" /> Die 6 Muskelgruppen
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography variant="body1" paragraph>
              Für eine ausgewogene Fitness sollten Sie alle 6 Muskelgruppen regelmäßig trainieren:
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
              {[
                { name: 'Bauch', desc: 'Stärkt die Körpermitte und Haltung' },
                { name: 'Po', desc: 'Wichtig für Stabilität und Beweglichkeit' },
                { name: 'Schulter/Arme', desc: 'Für Alltagsbewegungen und Kraft' },
                { name: 'Brust', desc: 'Unterstützt Atmung und Oberkörper' },
                { name: 'Nacken', desc: 'Reduziert Verspannungen' },
                { name: 'Rücken', desc: 'Basis für gute Haltung' }
              ].map((group) => (
                <Box key={group.name} sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 8px)' } }}>
                  <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                      {group.name}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      {group.desc}
                    </Typography>
                  </Paper>
                </Box>
              ))}
            </Box>
            <Box sx={{ mt: 3, p: 2, bgcolor: 'info.light', borderRadius: 2 }}>
              <Typography variant="body1" sx={{ fontWeight: 'bold', mb: 1 }}>
                💡 Tipp: Perfekter Tag
              </Typography>
              <Typography variant="body2">
                Wenn Sie alle 6 Muskelgruppen an einem Tag trainieren, erhalten Sie einen 
                <strong> Perfekten Tag</strong> mit <strong>+50 Bonus-Punkten</strong>!
              </Typography>
            </Box>
          </AccordionDetails>
        </Accordion>

        {/* Section 3: Points System */}
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h5" sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1 }}>
              <TrendingUpIcon color="primary" /> Punkte-System
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', mt: 2 }}>
              Basis-Punkte
            </Typography>
            <List>
              <ListItem>
                <ListItemText 
                  primary="10 Punkte" 
                  secondary="Für jede abgeschlossene Übung"
                  primaryTypographyProps={{ fontWeight: 'bold', color: 'success.main' }}
                />
              </ListItem>
              <ListItem>
                <ListItemText 
                  primary="+5 Punkte pro Schwierigkeitsstufe" 
                  secondary="Schwierigere Übungen bringen mehr Punkte"
                  primaryTypographyProps={{ fontWeight: 'bold', color: 'success.main' }}
                />
              </ListItem>
            </List>

            <Divider sx={{ my: 2 }} />

            <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
              Extra-Übungen Bonus
            </Typography>
            <Typography variant="body1" paragraph>
              Trainieren Sie eine Muskelgruppe mehrmals am Tag? Sie erhalten Bonus-Punkte!
            </Typography>
            <List>
              <ListItem>
                <ListItemText 
                  primary="1. Übung einer Muskelgruppe" 
                  secondary="10 Punkte (Basis)"
                  primaryTypographyProps={{ fontWeight: 'bold' }}
                />
              </ListItem>
              <ListItem>
                <ListItemText 
                  primary="2. Übung derselben Muskelgruppe" 
                  secondary="10 + 5 Bonus = 15 Punkte"
                  primaryTypographyProps={{ fontWeight: 'bold', color: 'primary.main' }}
                />
              </ListItem>
              <ListItem>
                <ListItemText 
                  primary="3.+ Übung derselben Muskelgruppe" 
                  secondary="10 + 3 Bonus = 13 Punkte"
                  primaryTypographyProps={{ fontWeight: 'bold', color: 'primary.main' }}
                />
              </ListItem>
            </List>

            <Divider sx={{ my: 2 }} />

            <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
              Perfekter Tag Bonus
            </Typography>
            <Box sx={{ p: 2, bgcolor: 'success.light', borderRadius: 2, color: 'white' }}>
              <Typography variant="body1" sx={{ fontWeight: 'bold', mb: 1 }}>
                ✨ Alle 6 Muskelgruppen an einem Tag trainiert
              </Typography>
              <Typography variant="body2" sx={{ mb: 1 }}>
                Ein "Perfekter Tag" bedeutet, dass Sie an einem Kalendertag je eine Übung für Bauch, Po, Schulter, Brust, Nacken und Rücken abschließen.
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                +50 Bonus-Punkte!
              </Typography>
            </Box>

            <Box sx={{ mt: 3, p: 2, bgcolor: 'grey.100', borderRadius: 2 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
                📊 Beispiel-Rechnung:
              </Typography>
              <Typography variant="body2" component="div">
                • 6 Übungen (je 1 pro Muskelgruppe): 6 × 10 = <strong>60 Punkte</strong><br />
                • Perfekter Tag Bonus (einmal pro Tag): <strong>+50 Punkte</strong><br />
                • <strong>Gesamt: 110 Punkte</strong> = Level-Aufstieg! 🎉
              </Typography>
            </Box>
          </AccordionDetails>
        </Accordion>

        {/* Section 4: Erinnerungen & Installation */}
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h5" sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1 }}>
              <NotificationsActiveIcon color="primary" /> Aktivpausen-Erinnerungen & App-Installation
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography variant="body1" paragraph>
              Damit Sie auch ohne geöffneten Browser an Ihre Aktivpausen erinnert werden, aktivieren Sie die Push-Benachrichtigungen.
            </Typography>
            <List>
              <ListItem>
                <ListItemIcon><NotificationsActiveIcon color="success" /></ListItemIcon>
                <ListItemText
                  primary="Push-Erinnerungen aktivieren"
                  secondary={'Öffnen Sie das Willkommensfenster oder die Profilseite und tippen Sie auf "Erinnerungen aktivieren". Bestätigen Sie anschließend die Browser-Abfrage.'}
                />
              </ListItem>
              <ListItem>
                <ListItemIcon><NotificationsActiveIcon color="success" /></ListItemIcon>
                <ListItemText
                  primary="Rhythmus anpassen"
                  secondary="Im Profil können Sie das Intervall jederzeit ändern oder Erinnerungen vorübergehend deaktivieren."
                />
              </ListItem>
            </List>
            <Divider sx={{ my: 2 }} />
            <Typography variant="body1" paragraph>
              Installieren Sie die App auf Ihrem Startbildschirm, um schneller darauf zuzugreifen und Push-Benachrichtigungen auf Mobilgeräten freizuschalten.
            </Typography>
            <List>
              <ListItem>
                <ListItemIcon><InstallMobileIcon color="primary" /></ListItemIcon>
                <ListItemText
                  primary="Installation aus dem Willkommensdialog"
                  secondary={'Im Willkommensdialog finden Sie die Schaltfläche "App installieren". Folgen Sie anschließend den Browser-Hinweisen.'}
                />
              </ListItem>
              <ListItem>
                <ListItemIcon><InstallMobileIcon color="primary" /></ListItemIcon>
                <ListItemText
                  primary="Installation über Browser-Menü"
                  secondary={'Alternativ können Sie über das Browser-Menü (z. B. Chrome: Drei-Punkte-Menü → "App installieren") die Anwendung hinzufügen.'}
                />
              </ListItem>
            </List>
            <Box sx={{ mt: 3, p: 2, bgcolor: 'info.light', borderRadius: 2 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
                💡 Tipp
              </Typography>
              <Typography variant="body2">
                Sobald die App installiert und Benachrichtigungen erlaubt sind, erreichen Sie Ihre Aktivpausen-Erinnerungen auch mit geschlossenem Tab – sowohl auf dem Desktop als auch auf dem Smartphone.
              </Typography>
            </Box>
          </AccordionDetails>
        </Accordion>

        {/* Section 5: Levels */}
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h5" sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1 }}>
              <StarIcon color="primary" /> Level-System
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography variant="body1" paragraph>
              Ihr Level steigt mit Ihren gesammelten Punkten:
            </Typography>
            <List>
              <ListItem>
                <ListItemText 
                  primary="Level 1" 
                  secondary="0-99 Punkte"
                />
              </ListItem>
              <ListItem>
                <ListItemText 
                  primary="Level 2" 
                  secondary="100-199 Punkte"
                />
              </ListItem>
              <ListItem>
                <ListItemText 
                  primary="Level 3" 
                  secondary="200-299 Punkte"
                />
              </ListItem>
              <ListItem>
                <ListItemText 
                  primary="..." 
                  secondary="Und so weiter - alle 100 Punkte ein neues Level!"
                />
              </ListItem>
            </List>
            <Box sx={{ p: 2, bgcolor: 'info.light', borderRadius: 2, mt: 2 }}>
              <Typography variant="body2">
                <strong>Formel:</strong> Level = (Gesamtpunkte ÷ 100) + 1
              </Typography>
            </Box>
          </AccordionDetails>
        </Accordion>

        {/* Section 5: Streaks */}
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h5" sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1 }}>
              <FlashOnIcon color="primary" /> Streak-System
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography variant="body1" paragraph>
              Ein <strong>Streak</strong> zeigt, wie viele Tage in Folge Sie trainiert haben.
            </Typography>
            <List>
              <ListItem>
                <ListItemIcon><LocalFireDepartmentIcon sx={{ color: 'orange' }} /></ListItemIcon>
                <ListItemText 
                  primary="Tägliches Training" 
                  secondary="Trainieren Sie jeden Tag mindestens eine Übung, um Ihren Streak zu erhalten"
                />
              </ListItem>
              <ListItem>
                <ListItemIcon><LocalFireDepartmentIcon sx={{ color: 'orange' }} /></ListItemIcon>
                <ListItemText 
                  primary="Streak-Belohnungen" 
                  secondary="Erreichen Sie Meilensteine wie 3, 7 oder 30 Tage für besondere Achievements"
                />
              </ListItem>
              <ListItem>
                <ListItemIcon><LocalFireDepartmentIcon sx={{ color: 'orange' }} /></ListItemIcon>
                <ListItemText 
                  primary="Längster Streak" 
                  secondary="Ihr persönlicher Rekord wird gespeichert"
                />
              </ListItem>
            </List>

            <Box sx={{ mt: 3, p: 2, bgcolor: 'info.light', borderRadius: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
                🛡️ Streak-Schutz
              </Typography>
              <Typography variant="body1" paragraph>
                Das Leben ist manchmal unvorhersehbar! Deshalb haben Sie <strong>einmal pro Woche</strong> einen 
                automatischen Streak-Schutz.
              </Typography>
              <Typography variant="body2">
                <strong>Wie funktioniert es?</strong>
              </Typography>
              <Typography variant="body2" component="div" sx={{ mt: 1 }}>
                • Wenn Sie einen Tag verpassen, wird Ihr Streak automatisch geschützt<br />
                • Sobald der Schutz greift, sehen Sie den Hinweis <strong>"Streak-Schutz aktiv: Wir haben Ihren Streak für Sie geschützt!"</strong><br />
                • Der Schutz erneuert sich jede Woche<br />
                • So können Sie ohne Stress trainieren, auch wenn mal etwas dazwischen kommt
              </Typography>
            </Box>

            <Box sx={{ mt: 2, p: 2, bgcolor: 'success.light', borderRadius: 2, color: 'white' }}>
              <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                💡 Wo sehe ich meinen Streak?
              </Typography>
              <Typography variant="body2" sx={{ mt: 1 }}>
                Ihr aktueller Streak wird auf der Startseite angezeigt. Sie sehen dort auch Ihren längsten Streak 
                und ob Ihr Streak-Schutz verfügbar ist.
              </Typography>
            </Box>
          </AccordionDetails>
        </Accordion>

        {/* Section 6: Achievements */}
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h5" sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1 }}>
              <EmojiEventsIcon color="primary" /> Achievements (Erfolge)
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography variant="body1" paragraph>
              Schalten Sie besondere Erfolge frei, indem Sie verschiedene Ziele erreichen:
            </Typography>
            
            <Typography variant="h6" gutterBottom sx={{ mt: 2, fontWeight: 'bold' }}>
              Kategorien:
            </Typography>
            
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
              <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 8px)' } }}>
                <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
                  <Chip label="COMMON" size="small" sx={{ mb: 1, bgcolor: '#9e9e9e', color: 'white' }} />
                  <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                    Meilensteine
                  </Typography>
                  <Typography variant="body2">
                    Erste Übung, 10 Übungen, 500 Punkte, etc.
                  </Typography>
                </Paper>
              </Box>
              <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 8px)' } }}>
                <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
                  <Chip label="RARE" size="small" sx={{ mb: 1, bgcolor: '#2196f3', color: 'white' }} />
                  <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                    Streaks
                  </Typography>
                  <Typography variant="body2">
                    3, 7 oder 30 Tage in Folge trainiert
                  </Typography>
                </Paper>
              </Box>
              <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 8px)' } }}>
                <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
                  <Chip label="EPIC" size="small" sx={{ mb: 1, bgcolor: '#9c27b0', color: 'white' }} />
                  <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                    Perfekte Tage
                  </Typography>
                  <Typography variant="body2">
                    1, 10 oder 30 perfekte Tage erreicht
                  </Typography>
                </Paper>
              </Box>
              <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 8px)' } }}>
                <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
                  <Chip label="LEGENDARY" size="small" sx={{ mb: 1, bgcolor: '#ff9800', color: 'white' }} />
                  <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                    Besondere Erfolge
                  </Typography>
                  <Typography variant="body2">
                    100 perfekte Tage, 30-Tage-Streak, etc.
                  </Typography>
                </Paper>
              </Box>
            </Box>
          </AccordionDetails>
        </Accordion>

        {/* Section 7: Weekly Goals */}
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h5" sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1 }}>
              <StarIcon color="primary" /> Wochenziele
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography variant="body1" paragraph>
              Setzen Sie sich wöchentliche Ziele und verfolgen Sie Ihren Fortschritt:
            </Typography>
            <List>
              <ListItem>
                <ListItemText 
                  primary="Standard-Ziel: 5 Übungen pro Woche" 
                  secondary="Ein erreichbares Ziel für regelmäßiges Training"
                />
              </ListItem>
              <ListItem>
                <ListItemText 
                  primary="Automatische Zurücksetzung" 
                  secondary="Jede Woche beginnt Ihr Fortschritt von vorne"
                />
              </ListItem>
              <ListItem>
                <ListItemText 
                  primary="Belohnung bei Zielerreichung" 
                  secondary="Erhalten Sie eine besondere Nachricht, wenn Sie Ihr Wochenziel erreichen"
                />
              </ListItem>
            </List>
          </AccordionDetails>
        </Accordion>

        {/* Section 8: Progress Tracking */}
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h5" sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1 }}>
              <TrendingUpIcon color="primary" /> Fortschrittsverfolgung
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography variant="body1" paragraph>
              Verfolgen Sie Ihren Fortschritt auf der Fortschritts-Seite:
            </Typography>
            <List>
              <ListItem>
                <ListItemText 
                  primary="Täglicher Fortschritt" 
                  secondary="Sehen Sie, welche Muskelgruppen Sie heute trainiert haben"
                />
              </ListItem>
              <ListItem>
                <ListItemText 
                  primary="Wöchentliche Übersicht" 
                  secondary="Aktivität pro Tag, trainierte Muskelgruppen und Punkte"
                />
              </ListItem>
              <ListItem>
                <ListItemText 
                  primary="Monatliche Statistiken" 
                  secondary="Gesamtübersicht über Ihre Aktivität im Monat"
                />
              </ListItem>
              <ListItem>
                <ListItemText 
                  primary="Achievements" 
                  secondary="Alle freigeschalteten Erfolge in der Übersicht"
                />
              </ListItem>
            </List>
          </AccordionDetails>
        </Accordion>

        {/* Section 9: Tips */}
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h5" sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1 }}>
              <InfoIcon color="primary" /> Tipps für optimales Training
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <List>
              <ListItem>
                <ListItemIcon><CheckCircleIcon color="success" /></ListItemIcon>
                <ListItemText 
                  primary="Regelmäßigkeit ist wichtiger als Intensität" 
                  secondary="Trainieren Sie lieber täglich kurz als einmal pro Woche lang"
                />
              </ListItem>
              <ListItem>
                <ListItemIcon><CheckCircleIcon color="success" /></ListItemIcon>
                <ListItemText 
                  primary="Lesen Sie die Anleitungen sorgfältig" 
                  secondary="Achten Sie besonders auf Vorbereitung und Tipps für korrekte Ausführung"
                />
              </ListItem>
              <ListItem>
                <ListItemIcon><CheckCircleIcon color="success" /></ListItemIcon>
                <ListItemText 
                  primary="Trainieren Sie alle Muskelgruppen" 
                  secondary="Für einen Perfekten Tag und ausgewogene Fitness"
                />
              </ListItem>
              <ListItem>
                <ListItemIcon><CheckCircleIcon color="success" /></ListItemIcon>
                <ListItemText 
                  primary="Nutzen Sie die Empfehlungen" 
                  secondary="Die App schlägt Ihnen automatisch noch nicht trainierte Muskelgruppen vor"
                />
              </ListItem>
              <ListItem>
                <ListItemIcon><CheckCircleIcon color="success" /></ListItemIcon>
                <ListItemText 
                  primary="Bauen Sie einen Streak auf" 
                  secondary="Tägliches Training hilft Ihnen, eine Routine zu entwickeln"
                />
              </ListItem>
            </List>
          </AccordionDetails>
        </Accordion>

      </Paper>

      {/* Footer */}
      <Box sx={{ mt: 4, p: 3, bgcolor: 'primary.light', borderRadius: 2, textAlign: 'center', color: 'white' }}>
        <Typography variant="h6" gutterBottom>
          Viel Erfolg bei Ihrem Training! 💪
        </Typography>
        <Typography variant="body1">
          Bei Fragen oder Problemen wenden Sie sich bitte an Ihren Betreuer.
        </Typography>
      </Box>
    </Container>
  );
};

export default HelpPage;
