import React, { useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  TextField,
  Button,
  Alert,
  CircularProgress,
  Divider
} from '@mui/material';
import ContactMailIcon from '@mui/icons-material/ContactMail';
import SendIcon from '@mui/icons-material/Send';
import EmailIcon from '@mui/icons-material/Email';
import PersonIcon from '@mui/icons-material/Person';
import MessageIcon from '@mui/icons-material/Message';

const ContactPage: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      // Create mailto link
      const mailtoLink = `mailto:info@aboelo.de?subject=${encodeURIComponent(formData.subject)}&body=${encodeURIComponent(
        `Name: ${formData.name}\nE-Mail: ${formData.email}\n\nNachricht:\n${formData.message}`
      )}`;

      // Open default email client
      window.location.href = mailtoLink;

      // Show success message
      setSuccess(true);
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: ''
      });
    } catch (err) {
      setError('Es gab ein Problem beim Senden Ihrer Nachricht. Bitte versuchen Sie es erneut.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper elevation={2} sx={{ p: 4 }}>
        {/* Header */}
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <ContactMailIcon sx={{ fontSize: 64, color: 'primary.main', mb: 2 }} />
          <Typography variant="h3" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main' }}>
            Kontakt
          </Typography>
          <Typography variant="h6" color="textSecondary">
            Wir freuen uns auf Ihre Nachricht!
          </Typography>
        </Box>

        <Divider sx={{ mb: 4 }} />

        {/* Contact Info */}
        <Box sx={{ mb: 4, p: 3, bgcolor: 'primary.light', borderRadius: 2, color: 'white' }}>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
            Kontaktinformationen
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 2 }}>
            <EmailIcon />
            <Typography variant="body1">
              E-Mail: <strong>info@aboelo.de</strong>
            </Typography>
          </Box>
          <Typography variant="body2" sx={{ mt: 2, opacity: 0.9 }}>
            Wir antworten in der Regel innerhalb von 24-48 Stunden.
          </Typography>
        </Box>

        {/* Success Message */}
        {success && (
          <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess(false)}>
            Ihr E-Mail-Programm wurde geöffnet. Bitte senden Sie die Nachricht ab.
          </Alert>
        )}

        {/* Error Message */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        {/* Contact Form */}
        <Box component="form" onSubmit={handleSubmit}>
          <Box sx={{ mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <PersonIcon color="primary" />
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                Ihr Name *
              </Typography>
            </Box>
            <TextField
              fullWidth
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Max Mustermann"
              required
              variant="outlined"
              sx={{ bgcolor: 'background.paper' }}
            />
          </Box>

          <Box sx={{ mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <EmailIcon color="primary" />
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                Ihre E-Mail-Adresse *
              </Typography>
            </Box>
            <TextField
              fullWidth
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="ihre.email@beispiel.de"
              required
              variant="outlined"
              sx={{ bgcolor: 'background.paper' }}
            />
          </Box>

          <Box sx={{ mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <MessageIcon color="primary" />
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                Betreff *
              </Typography>
            </Box>
            <TextField
              fullWidth
              name="subject"
              value={formData.subject}
              onChange={handleChange}
              placeholder="Worum geht es?"
              required
              variant="outlined"
              sx={{ bgcolor: 'background.paper' }}
            />
          </Box>

          <Box sx={{ mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <MessageIcon color="primary" />
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                Ihre Nachricht *
              </Typography>
            </Box>
            <TextField
              fullWidth
              name="message"
              value={formData.message}
              onChange={handleChange}
              placeholder="Schreiben Sie uns Ihre Nachricht..."
              required
              multiline
              rows={6}
              variant="outlined"
              sx={{ bgcolor: 'background.paper' }}
            />
          </Box>

          <Box sx={{ textAlign: 'center', mt: 4 }}>
            <Button
              type="submit"
              variant="contained"
              size="large"
              disabled={loading}
              startIcon={loading ? <CircularProgress size={20} /> : <SendIcon />}
              sx={{
                px: 6,
                py: 1.5,
                fontSize: '1.1rem',
                fontWeight: 'bold'
              }}
            >
              {loading ? 'Wird gesendet...' : 'Nachricht senden'}
            </Button>
          </Box>

          <Typography variant="body2" color="textSecondary" sx={{ mt: 3, textAlign: 'center' }}>
            * Pflichtfelder
          </Typography>
        </Box>

        <Divider sx={{ my: 4 }} />

        {/* Additional Info */}
        <Box sx={{ p: 3, bgcolor: 'grey.100', borderRadius: 2 }}>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
            Hinweis
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Durch Klicken auf "Nachricht senden" wird Ihr Standard-E-Mail-Programm geöffnet. 
            Ihre Nachricht wird an <strong>info@aboelo.de</strong> gesendet. Bitte stellen Sie sicher, 
            dass Ihr E-Mail-Programm korrekt konfiguriert ist.
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
};

export default ContactPage;
