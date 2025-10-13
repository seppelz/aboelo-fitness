import React from 'react';
import { Container, Typography, Box, Paper, Divider } from '@mui/material';
import GavelIcon from '@mui/icons-material/Gavel';
import EmailIcon from '@mui/icons-material/Email';

const ImpressumPage: React.FC = () => {
  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper elevation={2} sx={{ p: 4 }}>
        {/* Header */}
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <GavelIcon sx={{ fontSize: 64, color: 'primary.main', mb: 2 }} />
          <Typography variant="h3" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main' }}>
            Impressum
          </Typography>
          <Typography variant="subtitle1" color="textSecondary">
            Angaben gemäß § 5 TMG
          </Typography>
        </Box>

        <Divider sx={{ mb: 4 }} />

        {/* Content */}
        <Box sx={{ '& > *': { mb: 4 } }}>
          <Box>
            <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main' }}>
              Anbieter
            </Typography>
            <Typography variant="body1" paragraph sx={{ fontFamily: 'monospace', bgcolor: 'grey.100', p: 3, borderRadius: 1 }}>
              aboelo-fitness<br />
              Fitness-App für Senioren
            </Typography>
          </Box>

          <Box>
            <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main' }}>
              Kontakt
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <EmailIcon color="primary" />
              <Typography variant="body1">
                E-Mail: <a href="mailto:info@aboelo.de" style={{ color: 'inherit', textDecoration: 'none', fontWeight: 'bold' }}>info@aboelo.de</a>
              </Typography>
            </Box>
          </Box>

          <Box>
            <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main' }}>
              Verantwortlich für den Inhalt
            </Typography>
            <Typography variant="body1" paragraph>
              Verantwortlich für den Inhalt nach § 55 Abs. 2 RStV:
            </Typography>
            <Typography variant="body1" paragraph sx={{ fontFamily: 'monospace', bgcolor: 'grey.100', p: 3, borderRadius: 1 }}>
              aboelo-fitness<br />
              info@aboelo.de
            </Typography>
          </Box>

          <Box>
            <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main' }}>
              Haftungsausschluss
            </Typography>
            
            <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
              Haftung für Inhalte
            </Typography>
            <Typography variant="body1" paragraph>
              Als Diensteanbieter sind wir gemäß § 7 Abs.1 TMG für eigene Inhalte auf diesen Seiten nach den 
              allgemeinen Gesetzen verantwortlich. Nach §§ 8 bis 10 TMG sind wir als Diensteanbieter jedoch nicht 
              verpflichtet, übermittelte oder gespeicherte fremde Informationen zu überwachen oder nach Umständen 
              zu forschen, die auf eine rechtswidrige Tätigkeit hinweisen.
            </Typography>
            <Typography variant="body1" paragraph>
              Verpflichtungen zur Entfernung oder Sperrung der Nutzung von Informationen nach den allgemeinen 
              Gesetzen bleiben hiervon unberührt. Eine diesbezügliche Haftung ist jedoch erst ab dem Zeitpunkt 
              der Kenntnis einer konkreten Rechtsverletzung möglich. Bei Bekanntwerden von entsprechenden 
              Rechtsverletzungen werden wir diese Inhalte umgehend entfernen.
            </Typography>

            <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
              Haftung für Links
            </Typography>
            <Typography variant="body1" paragraph>
              Unser Angebot enthält Links zu externen Websites Dritter, auf deren Inhalte wir keinen Einfluss haben. 
              Deshalb können wir für diese fremden Inhalte auch keine Gewähr übernehmen. Für die Inhalte der 
              verlinkten Seiten ist stets der jeweilige Anbieter oder Betreiber der Seiten verantwortlich.
            </Typography>

            <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
              Urheberrecht
            </Typography>
            <Typography variant="body1" paragraph>
              Die durch die Seitenbetreiber erstellten Inhalte und Werke auf diesen Seiten unterliegen dem 
              deutschen Urheberrecht. Die Vervielfältigung, Bearbeitung, Verbreitung und jede Art der Verwertung 
              außerhalb der Grenzen des Urheberrechtes bedürfen der schriftlichen Zustimmung des jeweiligen Autors 
              bzw. Erstellers.
            </Typography>
          </Box>

          <Box>
            <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main' }}>
              Hinweise zur Nutzung
            </Typography>
            <Typography variant="body1" paragraph>
              Diese Fitness-App wurde speziell für Senioren entwickelt. Die Übungen sind sorgfältig ausgewählt, 
              ersetzen jedoch keine medizinische Beratung. Bei gesundheitlichen Bedenken konsultieren Sie bitte 
              Ihren Arzt, bevor Sie mit dem Training beginnen.
            </Typography>
          </Box>
        </Box>

        <Divider sx={{ my: 4 }} />

        <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'grey.100', borderRadius: 2 }}>
          <Typography variant="body2" color="textSecondary">
            Stand: {new Date().toLocaleDateString('de-DE', { year: 'numeric', month: 'long', day: 'numeric' })}
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
};

export default ImpressumPage;
