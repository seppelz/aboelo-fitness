import React, { useEffect } from 'react';
import { Box, Container, Typography, Button, Stack, Chip, Card, CardContent, CardMedia, Accordion, AccordionSummary, AccordionDetails, Divider, IconButton, Link as MuiLink } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import { Link as RouterLink } from 'react-router-dom';

const palette = {
  background: '#f0f7f7',
  heroGradient: 'linear-gradient(140deg, #1f5f5f 0%, #2d7d7d 50%, #3fa3a3 100%)',
  heroOverlay: 'rgba(31, 95, 95, 0.35)',
  cardBorder: 'rgba(255,255,255,0.32)',
  neutralSurface: 'rgba(255,255,255,0.85)',
  neutralGradient: 'linear-gradient(145deg, rgba(255,255,255,0.95) 0%, rgba(224,242,241,0.9) 100%)',
  darkSurface: 'linear-gradient(155deg, rgba(22,69,69,0.92) 0%, rgba(15,56,56,0.9) 100%)',
  accent: '#3fa3a3',
  accentSoft: 'rgba(63, 163, 163, 0.16)',
  primaryText: '#1f5f5f',
  secondaryText: '#3a6a6a',
  glassShadow: '0 24px 48px rgba(22, 69, 69, 0.25)'
};

const layout = {
  section: {
    width: '100%',
    maxWidth: '1200px',
    mx: 'auto',
    px: { xs: 2.5, md: 4 }
  }
};

interface PageContent {
  metaTitle: string;
  metaDescription: string;
  heroBadge: string;
  heroTitle: string;
  heroSubtitle: string;
  heroPrimaryCta: string;
  heroSecondaryCta: string;
  stats: { value: string; label: string }[];
  featureHeading: string;
  features: { title: string; description: string }[];
  seniorsHeading: string;
  seniorsPoints: string[];
  corporateHeading: string;
  corporateSubtitle: string;
  corporateBenefits: string[];
  medicalHeading: string;
  medicalSubtitle: string;
  medicalBenefits: string[];
  faqHeading: string;
  faqs: { question: string; answer: string }[];
  finalCtaHeading: string;
  finalCtaText: string;
  finalPrimaryCta: string;
  finalSecondaryCta?: string;
  faqId: string;
  seniorsId: string;
  corporateId: string;
  medicalId: string;
  heroCtaHref: string;
  officeImageAlt: string;
  seniorImageAlt: string;
  contactCta: string;
}

const pageContent: PageContent = {
  metaTitle: 'aboelo Fitness | Digitale Bewegungslösungen für Senioren, Unternehmen und Gesundheitspartner',
  metaDescription: 'aboelo Fitness kombiniert evidenzbasierte Trainingsprogramme, Videoanleitungen und Analytics für Senioren, Mitarbeitende und Pflegeeinrichtungen. Jetzt informieren und registrieren.',
  heroBadge: 'Ganzheitliche Bewegungslösungen',
  heroTitle: 'Digitale Fitness, die Menschen bewegt – zuhause, im Büro und in der Pflege',
  heroSubtitle: 'aboelo Fitness verbindet evidenzbasierte Mikro-Pausen von 1–2 Minuten mit klaren Videoanleitungen und intelligenten Erinnerungen. Wir helfen dabei, alle 60 Minuten aufzustehen und das 6-Übungen-pro-Tag-Ziel locker zu erreichen – ganz ohne Live-Coachings.',
  heroPrimaryCta: 'Jetzt registrieren',
  heroSecondaryCta: 'Programm entdecken',
  stats: [
    { value: '6 Übungen', label: 'Kurze Aktivpausen pro Tag – flexibel abrufbar für jeden Alltag.' },
    { value: '1–2 Min.', label: 'Dauer je Einheit – ideal für Meetings, Pflege und Zuhause.' },
    { value: '60+ Videos', label: 'Geführte Bewegungen für Arbeitsplatz, Wohnzimmer und Pflegeeinrichtungen.' }
  ],
  featureHeading: 'Warum aboelo Fitness begeistert',
  features: [
    {
      title: 'Geführte Mikro-Pausen',
      description: '1–2-minütige Bewegungsblöcke mit seniorengerechten Videoinstruktionen – perfekt für den Schreibtisch, fürs Wohnzimmer oder die Pflegeeinrichtung.'
    },
    {
      title: 'Transparenter Fortschritt',
      description: 'Wöchentliche und monatliche Übersichten machen jede absolvierte Übung sichtbar und fördern Motivation sowie Compliance.'
    },
    {
      title: 'Intelligente Erinnerungen',
      description: 'Individuell planbare Browser-Reminder, die an die nächste Aktivpause erinnern und Teams synchron aktiv halten.'
    }
  ],
  seniorsHeading: 'Aktiv & selbstbestimmt im besten Alter',
  seniorsPoints: [
    'Schonende Mobilisation, Sturzprävention und kräftigende Kurzprogramme für Zuhause',
    'Großzügige Schriften, kontrastreiche Darstellung und optionale Audios unterstützen jede Bewegung',
    'Motivationsimpulse über Streaks, Wochenziele und geteilte Erfolgsmeldungen mit Angehörigen'
  ],
  corporateHeading: 'Fit im Büro und im Schichtdienst',
  corporateSubtitle: 'Jede Stunde 1–2 Minuten Bewegung: stärkt Konzentration, reduziert Ausfälle und zeigt Fürsorge am Arbeitsplatz.',
  corporateBenefits: [
    'Sechs geführte Aktivpausen pro Arbeitstag – flexibel abrufbar und jederzeit wiederholbar',
    'In Kürze: Browser-Erinnerungen, die Teams automatisch an die nächste Pause erinnern',
    'Kompakte Ergonomie-Impulse, Schulteröffner und Augen-Reset für produktive Meetings'
  ],
  medicalHeading: 'Für Ärzte,Therapeuten und Pflegeeinrichtungen',
  medicalSubtitle: 'Strukturierte Aktivierung ohne Zusatzaufwand – ideal für Tagespflege, betreutes Wohnen und Ambulanz.',
  medicalBenefits: [
    'Automatisierte Dokumentation von Teilnahme und Fortschritt',
    'Gemeinsame Zieldefinition mit klaren Wochenempfehlungen (6 Übungen pro Tag)',
    'Infomaterialien für Pflegekräfte und Angehörige zur sicheren Durchführung'
  ],
  faqHeading: 'Häufige Fragen',
  faqs: [
    {
      question: 'Wie häufig sollte ich die Übungen machen?',
      answer: 'Wir empfehlen sechs Aktivpausen pro Tag – jeweils 1–2 Minuten. Das entspricht einer kurzen Bewegung pro Stunde im Büro oder Zuhause.'
    },
    {
      question: 'Gibt es Live-Coachings?',
      answer: 'Nein. aboelo Fitness setzt auf leicht verständliche Videos und Schritt-für-Schritt-Anleitungen, damit jede Person selbstständig trainieren kann. Wir helfen dabei, alle 60 Minuten aufzustehen und das 6-Übungen-pro-Tag-Ziel locker zu erreichen – ganz ohne Live-Coachings.'
    },
    {
      question: 'Welche Erinnerungen erhalte ich?',
      answer: 'Aktuell gibt es feste Tagesziele und Streak-Hinweise. Bald können Browser-Erinnerungen individuell pro Uhrzeit oder Rhythmus eingestellt werden.'
    },
    {
      question: 'Welche Daten werden gespeichert?',
      answer: 'Wir speichern nur trainingsrelevante Informationen wie absolvierte Übungen, Dauer und persönliche Ziele. Alle Daten werden DSGVO-konform verarbeitet.'
    }
  ],
  finalCtaHeading: 'Bereit für gesunde Routinen?',
  finalCtaText: 'aboelo Fitness motiviert zu sechs kurzen Aktivpausen pro Tag. Starten Sie jetzt Ihren kostenlosen Zugang und erleben Sie die Plattform live.',
  finalPrimaryCta: 'Kostenlos starten',
  finalSecondaryCta: undefined,
  faqId: 'faq',
  seniorsId: 'senioren',
  corporateId: 'unternehmen',
  medicalId: 'partner',
  heroCtaHref: '/register',
  officeImageAlt: 'Team macht aktive Pause im Büro',
  seniorImageAlt: 'Seniorin trainiert mit Tablet',
  contactCta: 'Kontakt aufnehmen'
};

const WelcomePage: React.FC = () => {
  useEffect(() => {
    document.title = pageContent.metaTitle;
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', pageContent.metaDescription);
    } else {
      const meta = document.createElement('meta');
      meta.setAttribute('name', 'description');
      meta.setAttribute('content', pageContent.metaDescription);
      document.head.appendChild(meta);
    }
    document.documentElement.lang = 'de';
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.id = 'aboelo-structured-data';
    const jsonLd = {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: 'aboelo-fitness',
      url: 'https://www.aboelo-fitness.de/',
      inLanguage: 'de-DE',
      description: pageContent.metaDescription,
      potentialAction: {
        '@type': 'RegisterAction',
        target: 'https://www.aboelo-fitness.de/register',
        name: 'Jetzt registrieren'
      },
      publisher: {
        '@type': 'Organization',
        name: 'aboelo-fitness'
      }
    };
    script.textContent = JSON.stringify(jsonLd);
    const existingScript = document.getElementById('aboelo-structured-data');
    if (existingScript) {
      existingScript.remove();
    }
    document.head.appendChild(script);
    return () => {
      const cleanupScript = document.getElementById('aboelo-structured-data');
      if (cleanupScript) {
        cleanupScript.remove();
      }
    };
  }, []);

  useEffect(() => {
    document.body.style.background = palette.background;
    return () => {
      document.body.style.background = '';
    };
  }, []);

  return (
    <Box sx={{ background: palette.background }}>
      <Box
        component="header"
        sx={{
          backgroundColor: '#ffffff',
          borderBottom: '1px solid rgba(31,95,95,0.12)',
          position: 'relative',
          zIndex: 2
        }}
      >
        <Container maxWidth="lg" sx={{ py: { xs: 2.5, md: 3 } }}>
          <Stack
            direction={{ xs: 'column', md: 'row' }}
            alignItems={{ xs: 'flex-start', md: 'center' }}
            justifyContent="space-between"
            spacing={{ xs: 2, md: 4 }}
          >
            <Stack direction="row" spacing={2} alignItems="center">
              <Box
                component="a"
                href="https://aboelo.de"
                target="_blank"
                rel="noopener"
                sx={{ display: 'inline-flex', alignItems: 'center', textDecoration: 'none' }}
              >
                <Box
                  component="img"
                  src="/aboeloLogo.png"
                  alt="aboelo Logo"
                  sx={{ height: 36, width: 'auto' }}
                />
              </Box>
              <MuiLink
                href="https://fitness.aboelo.de"
                target="_blank"
                rel="noopener"
                underline="none"
                sx={{
                  fontWeight: 700,
                  letterSpacing: 0.5,
                  color: palette.primaryText,
                  fontSize: '1.15rem',
                  '&:hover': { color: palette.primaryText, opacity: 0.8 }
                }}
              >
                Fitness
              </MuiLink>
            </Stack>
          </Stack>
        </Container>
      </Box>

      <Box
        sx={{
          position: 'relative',
          overflow: 'hidden',
          background: palette.heroGradient,
          color: '#ffffff',
          pt: { xs: 12, md: 14 },
          pb: { xs: 10, md: 14 }
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            background: 'radial-gradient(circle at top right, rgba(255,255,255,0.18) 0%, transparent 55%)'
          }}
        />
        <Container maxWidth={false} sx={{ ...layout.section, position: 'relative' }}>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={{ xs: 6, md: 10 }} alignItems="stretch">
            <Stack spacing={{ xs: 3, md: 3.5 }} flex={1} justifyContent="center" sx={{ maxWidth: { md: 540 } }}>
              <Chip 
                label={pageContent.heroBadge} 
                color="default" 
                sx={{ 
                  alignSelf: { xs: 'flex-start', md: 'center' },
                  backgroundColor: palette.heroOverlay,
                  color: '#fff', 
                  fontSize: '0.95rem', 
                  letterSpacing: 0.5,
                  px: 2.5, 
                  py: 2,
                  borderRadius: 999,
                  backdropFilter: 'blur(12px)',
                  border: '1px solid rgba(255,255,255,0.25)'
                }} 
              />
              <Typography
                variant="h2"
                sx={{
                  fontWeight: 800,
                  lineHeight: 1.04,
                  fontSize: { xs: '2.8rem', sm: '3.2rem', md: '3.75rem' },
                  textAlign: { xs: 'left', md: 'center' },
                  textShadow: '0 12px 30px rgba(0,0,0,0.25)'
                }}
              >
                {pageContent.heroTitle}
              </Typography>
              <Typography
                variant="h6"
                sx={{
                  opacity: 0.9,
                  fontWeight: 500,
                  fontSize: { xs: '1.12rem', md: '1.22rem' },
                  textAlign: { xs: 'left', md: 'center' },
                  maxWidth: { md: 520 },
                  mx: { md: 'auto' },
                  lineHeight: 1.6
                }}
              >
                {pageContent.heroSubtitle}
              </Typography>
              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                spacing={2}
                alignItems={{ xs: 'stretch', sm: 'center' }}
                justifyContent={{ sm: 'center' }}
              >
                <Button
                  component={RouterLink}
                  to={pageContent.heroCtaHref}
                  size="large"
                  variant="contained"
                  color="primary"
                  endIcon={<ArrowForwardIcon />}
                  sx={{ fontSize: '1.08rem', py: 1.5, px: 4, borderRadius: 999, boxShadow: palette.glassShadow }}
                >
                  {pageContent.heroPrimaryCta}
                </Button>
                <Button
                  href="#explore"
                  size="large"
                  variant="outlined"
                  endIcon={<ArrowDownwardIcon />}
                  sx={{ fontSize: '1.03rem', py: 1.5, px: 3.75, borderColor: 'rgba(255,255,255,0.55)', color: '#fff', borderRadius: 999, backdropFilter: 'blur(6px)', textAlign: 'center' }}
                >
                  {pageContent.heroSecondaryCta}
                </Button>
              </Stack>
              <Box
                sx={{
                  pt: 4,
                  display: 'grid',
                  gap: { xs: 2.5, md: 3.5 },
                  gridTemplateColumns: {
                    xs: 'repeat(1, minmax(0, 1fr))',
                    sm: 'repeat(2, minmax(0, 1fr))',
                    md: 'repeat(3, minmax(0, 1fr))'
                  }
                }}
              >
                {pageContent.stats.map((item) => (
                  <Box 
                    key={item.value} 
                    sx={{ 
                      background: palette.neutralSurface,
                      borderRadius: 3,
                      p: { xs: 2.5, md: 3 },
                      minHeight: { xs: 140, md: 160 },
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'center',
                      gap: 1,
                      boxShadow: '0 18px 38px rgba(22,69,69,0.12)',
                      border: '1px solid rgba(255,255,255,0.28)'
                    }}
                  >
                    <Typography variant="h4" sx={{ fontWeight: 700, color: palette.primaryText }}>{item.value}</Typography>
                    <Typography variant="body1" sx={{ color: 'rgba(31,95,95,0.78)', lineHeight: 1.65 }}>{item.label}</Typography>
                  </Box>
                ))}
              </Box>
            </Stack>
            <Card
              sx={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                borderRadius: 5,
                overflow: 'hidden',
                background: 'linear-gradient(180deg, rgba(255,255,255,0.22) 0%, rgba(31,95,95,0.18) 100%)',
                border: '1px solid rgba(255,255,255,0.32)',
                boxShadow: palette.glassShadow,
                minHeight: { xs: 360, md: 500 }
              }}
            >
              <Box
                sx={{
                  position: 'relative',
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  p: { xs: 3, md: 4 },
                  background: 'linear-gradient(160deg, rgba(255,255,255,0.92) 0%, rgba(146,209,204,0.35) 65%, rgba(31,95,95,0.25) 100%)'
                }}
              >
                <Box
                  component="img"
                  src="/aboelo-fitness-uebungen.png"
                  alt={pageContent.seniorImageAlt}
                  sx={{
                    width: '100%',
                    maxWidth: { xs: 260, md: 360 },
                    height: 'auto',
                    filter: 'drop-shadow(0 18px 28px rgba(22,69,69,0.25))'
                  }}
                />
                <Box
                  aria-hidden
                  sx={{
                    position: 'absolute',
                    inset: 0,
                    borderRadius: 5,
                    border: '1px solid rgba(255,255,255,0.25)'
                  }}
                />
              </Box>
              <CardContent sx={{ color: '#fff', p: { xs: 3, md: 4 } }}>
                <Typography variant="subtitle1" sx={{ opacity: 0.85, lineHeight: 1.6 }}>
                  Geführte Video-Routinen, alltagstaugliche Übungen und motivierende Gamification.
                </Typography>
              </CardContent>
            </Card>
          </Stack>
        </Container>
      </Box>

      <Box id="explore">
        <Container maxWidth={false} sx={{ ...layout.section, py: { xs: 8, md: 12 } }}>
          <Stack spacing={4} alignItems="center">
            <Typography variant="h4" sx={{ fontWeight: 800, textAlign: 'center', maxWidth: 720, color: palette.primaryText }}>
              {pageContent.featureHeading}
            </Typography>
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' },
                gap: { xs: 3, md: 4 },
                width: '100%'
              }}
            >
              {pageContent.features.map((feature) => (
                <Card 
                  key={feature.title} 
                  sx={{ 
                    height: '100%', 
                    display: 'flex',
                    flexDirection: 'column',
                    borderRadius: 4, 
                    boxShadow: '0 22px 40px rgba(12,28,61,0.12)',
                    background: palette.neutralGradient,
                    border: '1px solid rgba(12,28,61,0.05)'
                  }}
                >
                  <CardContent sx={{ p: { xs: 3, md: 4 }, display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <IconButton size="large" disabled sx={{ backgroundColor: palette.accentSoft, mb: 2 }}>
                      <CheckCircleOutlineIcon sx={{ color: palette.accent }} />
                    </IconButton>
                    <Typography variant="h5" sx={{ fontWeight: 700, mb: 2, color: palette.primaryText }}>
                      {feature.title}
                    </Typography>
                    <Typography variant="body1" sx={{ color: palette.secondaryText, lineHeight: 1.75 }}>
                      {feature.description}
                    </Typography>
                  </CardContent>
                </Card>
              ))}
            </Box>
          </Stack>
        </Container>
      </Box>

      <Box id={pageContent.seniorsId} sx={{ background: 'linear-gradient(135deg, #ffffff 0%, #e3f4f2 100%)' }}>
        <Container maxWidth={false} sx={{ ...layout.section, py: { xs: 8, md: 10 } }}>
          <Box
            sx={{
              display: 'grid',
              gap: 6,
              alignItems: 'center',
              gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }
            }}
          >
            <CardMedia
              component="img"
              image="/aboelo-fitness-progress.png"
              alt={pageContent.officeImageAlt}
              sx={{ borderRadius: 4, boxShadow: '0 28px 52px rgba(22,69,69,0.2)' }}
            />
            <Stack spacing={3}>
              <Chip label="Senioren" color="primary" sx={{ alignSelf: 'flex-start', fontWeight: 600 }} />
              <Typography variant="h4" sx={{ fontWeight: 800, color: palette.primaryText }}>{pageContent.seniorsHeading}</Typography>
              <Stack spacing={2}>
                {pageContent.seniorsPoints.map((point) => (
                  <Stack key={point} direction="row" spacing={2} alignItems="flex-start">
                    <CheckCircleOutlineIcon color="primary" sx={{ mt: 0.5 }} />
                    <Typography variant="body1" sx={{ lineHeight: 1.75, color: palette.secondaryText }}>{point}</Typography>
                  </Stack>
                ))}
              </Stack>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <Button component={RouterLink} to="/register" variant="contained" color="primary" size="large" endIcon={<ArrowForwardIcon />}
                  sx={{ borderRadius: 3 }}>
                  {pageContent.heroPrimaryCta}
                </Button>
                <Button component={RouterLink} to="/kontakt" variant="outlined" size="large" sx={{ borderRadius: 3 }}>
                  {pageContent.contactCta}
                </Button>
              </Stack>
            </Stack>
          </Box>
        </Container>
      </Box>

      <Box id={pageContent.corporateId} sx={{ background: palette.darkSurface, color: '#fff' }}>
        <Container maxWidth={false} sx={{ ...layout.section, py: { xs: 8, md: 10 } }}>
          <Box
            sx={{
              display: 'grid',
              gap: 6,
              alignItems: 'center',
              gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }
            }}
          >
            <Stack spacing={3}>
              <Chip label="Unternehmen" color="default" sx={{ backgroundColor: 'rgba(255,255,255,0.2)', alignSelf: 'flex-start' }} />
              <Typography variant="h4" sx={{ fontWeight: 800 }}>{pageContent.corporateHeading}</Typography>
              <Typography variant="h6" sx={{ opacity: 0.88 }}>{pageContent.corporateSubtitle}</Typography>
              <Stack spacing={2}>
                {pageContent.corporateBenefits.map((benefit) => (
                  <Stack key={benefit} direction="row" spacing={2} alignItems="flex-start">
                    <CheckCircleOutlineIcon sx={{ color: '#41b3a3', mt: 0.5 }} />
                    <Typography variant="body1" sx={{ lineHeight: 1.7 }}>{benefit}</Typography>
                  </Stack>
                ))}
              </Stack>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <Button component={RouterLink} to="/register" variant="contained" size="large" color="secondary" endIcon={<ArrowForwardIcon />} sx={{ borderRadius: 3 }}>
                  {pageContent.heroPrimaryCta}
                </Button>
                {pageContent.finalSecondaryCta && (
                  <Button component={RouterLink} to="/kontakt" variant="outlined" size="large" sx={{ borderRadius: 3, borderColor: 'rgba(255,255,255,0.6)', color: '#fff' }}>
                    {pageContent.finalSecondaryCta}
                  </Button>
                )}
              </Stack>
            </Stack>
            <Card sx={{ backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 4, boxShadow: '0 20px 40px rgba(0,0,0,0.35)' }}>
              <CardMedia
                component="img"
                image="/aboelo-fitness-uebungen.png"
                alt="Team Session"
                sx={{ borderTopLeftRadius: 16, borderTopRightRadius: 16, height: { xs: 260, md: 360 }, objectFit: 'cover' }}
              />
              <CardContent sx={{ color: '#fff' }}>
                <Typography variant="subtitle1" sx={{ opacity: 0.85 }}>
                  Geführte Active Breaks steigern Produktivität und Wohlbefinden innerhalb weniger Wochen.
                </Typography>
              </CardContent>
            </Card>
          </Box>
        </Container>
      </Box>

      <Box id={pageContent.medicalId} sx={{ background: 'linear-gradient(135deg, #ffffff 0%, #f2f7ff 100%)' }}>
        <Container maxWidth={false} sx={{ ...layout.section, py: { xs: 8, md: 10 } }}>
          <Box
            sx={{
              display: 'grid',
              gap: 6,
              alignItems: 'center',
              gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }
            }}
          >
            <Stack spacing={3}>
              <Chip label="Medizin & Pflege" color="primary" sx={{ alignSelf: 'flex-start' }} />
              <Typography variant="h4" sx={{ fontWeight: 800, color: palette.primaryText }}>{pageContent.medicalHeading}</Typography>
              <Typography variant="h6" sx={{ color: palette.secondaryText }}>{pageContent.medicalSubtitle}</Typography>
              <Stack spacing={2}>
                {pageContent.medicalBenefits.map((benefit) => (
                  <Stack key={benefit} direction="row" spacing={2} alignItems="flex-start">
                    <CheckCircleOutlineIcon color="primary" sx={{ mt: 0.5 }} />
                    <Typography variant="body1" sx={{ lineHeight: 1.75, color: palette.secondaryText }}>{benefit}</Typography>
                  </Stack>
                ))}
              </Stack>
            </Stack>
            <Card sx={{ borderRadius: 4, boxShadow: '0 25px 45px rgba(17,63,103,0.2)' }}>
              <CardContent sx={{ p: 4 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
                  Einsatzmöglichkeiten
                </Typography>
                <Stack spacing={2}>
                  <Stack direction="row" spacing={2} alignItems="center">
                    <PlayArrowIcon color="primary" />
                    <Typography variant="body1">Tele-Reha und Nachsorge mit klaren Protokollen</Typography>
                  </Stack>
                  <Stack direction="row" spacing={2} alignItems="center">
                    <PlayArrowIcon color="primary" />
                    <Typography variant="body1">Aktivierungsprogramme in Tagespflege und betreutem Wohnen</Typography>
                  </Stack>
                  <Stack direction="row" spacing={2} alignItems="center">
                    <PlayArrowIcon color="primary" />
                    <Typography variant="body1">Case-Management mit 360° Compliance-Übersicht</Typography>
                  </Stack>
                </Stack>
              </CardContent>
            </Card>
          </Box>
        </Container>
      </Box>

      <Box id={pageContent.faqId} sx={{ backgroundColor: '#ffffff' }}>
        <Container maxWidth={false} sx={{ ...layout.section, maxWidth: '840px', py: { xs: 8, md: 10 } }}>
          <Stack spacing={4} alignItems="center">
            <Typography variant="h4" sx={{ fontWeight: 800, color: palette.primaryText }}>{pageContent.faqHeading}</Typography>
            <Divider sx={{ width: '100%', maxWidth: 240 }} />
            <Stack spacing={2} width="100%">
              {pageContent.faqs.map((item, index) => (
                <Accordion key={item.question} defaultExpanded={index === 0} sx={{ borderRadius: 3, boxShadow: '0 10px 25px rgba(17,63,103,0.08)' }}>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography variant="h6" sx={{ fontWeight: 600, color: palette.primaryText }}>{item.question}</Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Typography variant="body1" sx={{ lineHeight: 1.8, color: palette.secondaryText }}>{item.answer}</Typography>
                  </AccordionDetails>
                </Accordion>
              ))}
            </Stack>
          </Stack>
        </Container>
      </Box>

      <Box sx={{ background: 'linear-gradient(140deg, #1f5f5f 0%, #2d7d7d 50%, #3fa3a3 100%)', color: '#fff' }}>
        <Container maxWidth={false} sx={{ ...layout.section, maxWidth: '840px', py: { xs: 8, md: 10 } }}>
          <Stack spacing={4.5} alignItems="center" textAlign="center">
            <Typography variant="h3" sx={{ fontWeight: 800 }}>{pageContent.finalCtaHeading}</Typography>
            <Typography variant="h6" sx={{ maxWidth: 640, opacity: 0.92, lineHeight: 1.7 }}>{pageContent.finalCtaText}</Typography>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <Button component={RouterLink} to="/register" variant="contained" color="secondary" size="large" endIcon={<ArrowForwardIcon />} sx={{ borderRadius: 3 }}>
                {pageContent.finalPrimaryCta}
              </Button>
            </Stack>
          </Stack>
        </Container>
      </Box>

      <Box component="footer" sx={{ backgroundColor: '#ffffff', color: palette.primaryText, borderTop: '1px solid rgba(31,95,95,0.12)' }}>
        <Container maxWidth="lg" sx={{ py: { xs: 4, md: 5 } }}>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            justifyContent="space-between"
            alignItems={{ xs: 'flex-start', sm: 'center' }}
            spacing={2}
          >
            <Stack direction="row" spacing={1.5} alignItems="center">
              <Box component="img" src="/aboeloLogo.png" alt="aboelo Logo" sx={{ height: 24, width: 'auto' }} />
              <Typography variant="body2" sx={{ opacity: 0.7 }}>
                © {new Date().getFullYear()} aboelo Fitness
              </Typography>
            </Stack>
            <Stack direction="row" spacing={3}>
              <MuiLink href="https://aboelo.de/impressum" target="_blank" rel="noopener" underline="none" sx={{ color: palette.primaryText, opacity: 0.8, '&:hover': { opacity: 1 } }}>
                Impressum
              </MuiLink>
              <MuiLink href="https://aboelo.de/datenschutz" target="_blank" rel="noopener" underline="none" sx={{ color: palette.primaryText, opacity: 0.8, '&:hover': { opacity: 1 } }}>
                Datenschutz
              </MuiLink>
            </Stack>
          </Stack>
        </Container>
      </Box>
    </Box>
  );
};

export default WelcomePage;
