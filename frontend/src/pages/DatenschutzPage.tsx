import React from 'react';
import { Container, Typography, Box, Paper, Divider } from '@mui/material';
import PrivacyTipIcon from '@mui/icons-material/PrivacyTip';

const DatenschutzPage: React.FC = () => {
  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper elevation={2} sx={{ p: 4 }}>
        {/* Header */}
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <PrivacyTipIcon sx={{ fontSize: 64, color: 'primary.main', mb: 2 }} />
          <Typography variant="h3" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main' }}>
            Datenschutzerklärung
          </Typography>
          <Typography variant="subtitle1" color="textSecondary">
            Informationen zum Datenschutz bei aboelo-fitness
          </Typography>
        </Box>

        <Divider sx={{ mb: 4 }} />

        {/* Content */}
        <Box sx={{ '& > *': { mb: 3 } }}>
          <Box>
            <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main' }}>
              1. Datenschutz auf einen Blick
            </Typography>
            <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
              Allgemeine Hinweise
            </Typography>
            <Typography variant="body1" paragraph>
              Die folgenden Hinweise geben einen einfachen Überblick darüber, was mit Ihren personenbezogenen 
              Daten passiert, wenn Sie diese Website besuchen. Personenbezogene Daten sind alle Daten, mit 
              denen Sie persönlich identifiziert werden können.
            </Typography>
          </Box>

          <Box>
            <Typography variant="h6" gutterBottom>
              Datenerfassung auf dieser Website
            </Typography>
            <Typography variant="body1" paragraph>
              <strong>Wer ist verantwortlich für die Datenerfassung auf dieser Website?</strong>
            </Typography>
            <Typography variant="body1" paragraph>
              Die Datenverarbeitung auf dieser Website erfolgt durch den Websitebetreiber. Dessen Kontaktdaten 
              können Sie dem Impressum dieser Website entnehmen.
            </Typography>
          </Box>

          <Box>
            <Typography variant="h6" gutterBottom>
              Wie erfassen wir Ihre Daten?
            </Typography>
            <Typography variant="body1" paragraph>
              Ihre Daten werden zum einen dadurch erhoben, dass Sie uns diese mitteilen. Hierbei kann es sich 
              z.B. um Daten handeln, die Sie in ein Kontaktformular eingeben oder bei der Registrierung angeben.
            </Typography>
            <Typography variant="body1" paragraph>
              Andere Daten werden automatisch oder nach Ihrer Einwilligung beim Besuch der Website durch unsere 
              IT-Systeme erfasst. Das sind vor allem technische Daten (z.B. Internetbrowser, Betriebssystem oder 
              Uhrzeit des Seitenaufrufs).
            </Typography>
          </Box>

          <Box>
            <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main', mt: 4 }}>
              2. Hosting und Content Delivery Networks (CDN)
            </Typography>
            <Typography variant="body1" paragraph>
              Diese Website wird auf einem externen Server gehostet. Die personenbezogenen Daten, die auf dieser 
              Website erfasst werden, werden auf den Servern des Hosters gespeichert.
            </Typography>
          </Box>

          <Box>
            <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main', mt: 4 }}>
              3. Allgemeine Hinweise und Pflichtinformationen
            </Typography>
            <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
              Datenschutz
            </Typography>
            <Typography variant="body1" paragraph>
              Die Betreiber dieser Seiten nehmen den Schutz Ihrer persönlichen Daten sehr ernst. Wir behandeln 
              Ihre personenbezogenen Daten vertraulich und entsprechend den gesetzlichen Datenschutzvorschriften 
              sowie dieser Datenschutzerklärung.
            </Typography>
          </Box>

          <Box>
            <Typography variant="h6" gutterBottom>
              Hinweis zur verantwortlichen Stelle
            </Typography>
            <Typography variant="body1" paragraph>
              Die verantwortliche Stelle für die Datenverarbeitung auf dieser Website ist:
            </Typography>
            <Typography variant="body1" paragraph sx={{ fontFamily: 'monospace', bgcolor: 'grey.100', p: 2, borderRadius: 1 }}>
              aboelo-fitness<br />
              E-Mail: info@aboelo.de
            </Typography>
            <Typography variant="body1" paragraph>
              Verantwortliche Stelle ist die natürliche oder juristische Person, die allein oder gemeinsam mit 
              anderen über die Zwecke und Mittel der Verarbeitung von personenbezogenen Daten (z.B. Namen, 
              E-Mail-Adressen o. Ä.) entscheidet.
            </Typography>
          </Box>

          <Box>
            <Typography variant="h6" gutterBottom>
              Speicherdauer
            </Typography>
            <Typography variant="body1" paragraph>
              Soweit innerhalb dieser Datenschutzerklärung keine speziellere Speicherdauer genannt wurde, 
              verbleiben Ihre personenbezogenen Daten bei uns, bis der Zweck für die Datenverarbeitung entfällt.
            </Typography>
          </Box>

          <Box>
            <Typography variant="h6" gutterBottom>
              Widerruf Ihrer Einwilligung zur Datenverarbeitung
            </Typography>
            <Typography variant="body1" paragraph>
              Viele Datenverarbeitungsvorgänge sind nur mit Ihrer ausdrücklichen Einwilligung möglich. Sie können 
              eine bereits erteilte Einwilligung jederzeit widerrufen. Die Rechtmäßigkeit der bis zum Widerruf 
              erfolgten Datenverarbeitung bleibt vom Widerruf unberührt.
            </Typography>
          </Box>

          <Box>
            <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main', mt: 4 }}>
              4. Datenerfassung auf dieser Website
            </Typography>
            <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
              Kontaktformular
            </Typography>
            <Typography variant="body1" paragraph>
              Wenn Sie uns per Kontaktformular Anfragen zukommen lassen, werden Ihre Angaben aus dem 
              Anfrageformular inklusive der von Ihnen dort angegebenen Kontaktdaten zwecks Bearbeitung der 
              Anfrage und für den Fall von Anschlussfragen bei uns gespeichert.
            </Typography>
          </Box>

          <Box>
            <Typography variant="h6" gutterBottom>
              Registrierung auf dieser Website
            </Typography>
            <Typography variant="body1" paragraph>
              Sie können sich auf dieser Website registrieren, um zusätzliche Funktionen auf der Seite zu nutzen. 
              Die dazu eingegebenen Daten verwenden wir nur zum Zwecke der Nutzung des jeweiligen Angebotes oder 
              Dienstes, für den Sie sich registriert haben.
            </Typography>
          </Box>
        </Box>

        <Divider sx={{ my: 4 }} />

        <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'grey.100', borderRadius: 2 }}>
          <Typography variant="body2" color="textSecondary">
            Stand: {new Date().toLocaleDateString('de-DE', { year: 'numeric', month: 'long', day: 'numeric' })}
          </Typography>
          <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
            Bei Fragen zum Datenschutz kontaktieren Sie uns bitte unter: info@aboelo.de
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
};

export default DatenschutzPage;
