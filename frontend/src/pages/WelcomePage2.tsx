import React, { useEffect } from 'react';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  Card,
  CardContent,
  CardMedia,
  Chip,
  Container,
  Divider,
  IconButton,
  Link as MuiLink,
  Stack,
  Typography,
  useMediaQuery
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import { Link as RouterLink } from 'react-router-dom';
import { useTheme } from '@mui/material/styles';

const palette = {
  pageBackground: '#f2f7f7',
  heroGradient: 'linear-gradient(115deg, #0f3d3d 0%, #1f5f5f 40%, #3fa3a3 100%)',
  heroGlass: 'linear-gradient(160deg, rgba(255,255,255,0.94) 0%, rgba(225,243,241,0.88) 55%, rgba(216,238,236,0.75) 100%)',
  neutral: '#ffffff',
  neutralMuted: 'rgba(255,255,255,0.75)',
  borderSoft: 'rgba(255,255,255,0.35)',
  textPrimary: '#0f3d3d',
  textSecondary: '#285c5c',
  accent: '#2d7d7d',
  accentSoft: 'rgba(45, 125, 125, 0.12)',
  highlight: '#3fa3a3',
  shadow: '0 28px 46px rgba(15,63,63,0.25)'
};

const layout = {
  maxWidth: 'lg' as const,
  section: {
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
  metaTitle: 'aboelo Fitness | Bewegungslösungen für Senioren, Unternehmen und Gesundheitspartner',
  metaDescription:
    'aboelo Fitness kombiniert evidenzbasierte Trainingsprogramme, Videoanleitungen und Analytics für Senioren, Mitarbeitende und Pflegeeinrichtungen. Jetzt informieren und registrieren.',
  heroBadge: 'Ganzheitliche Bewegungslösungen',
  heroTitle: 'Fitness, die Menschen bewegt – zuhause, im Büro und in der Pflege',
  heroSubtitle:
    'aboelo Fitness verbindet evidenzbasierte Mikro-Pausen von 1–2 Minuten mit klaren Videoanleitungen und intelligenten Erinnerungen. Wir helfen dabei, alle 60 Minuten aufzustehen und das 6-Übungen-pro-Tag-Ziel locker zu erreichen – ganz ohne Live-Coachings.',
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
      description:
        '1–2-minütige Bewegungsblöcke mit seniorengerechten Videoinstruktionen – perfekt für den Schreibtisch, fürs Wohnzimmer oder die Pflegeeinrichtung.'
    },
    {
      title: 'Transparenter Fortschritt',
      description:
        'Wöchentliche und monatliche Übersichten machen jede absolvierte Übung sichtbar und fördern Motivation sowie Compliance.'
    },
    {
      title: 'Intelligente Erinnerungen',
      description:
        'Individuell planbare Browser-Reminder, die an die nächste Aktivpause erinnern und Teams synchron aktiv halten.'
    }
  ],
  seniorsHeading: 'Aktiv & selbstbestimmt im besten Alter',
  seniorsPoints: [
    'Schonende Mobilisation, Sturzprävention und kräftigende Kurzprogramme für Zuhause',
    'Großzügige Schriften, kontrastreiche Darstellung und optionale Audios unterstützen jede Bewegung',
    'Motivationsimpulse über Streaks, Wochenziele und geteilte Erfolgsmeldungen mit Angehörigen'
  ],
  corporateHeading: 'Fit im Büro und im Schichtdienst',
  corporateSubtitle:
    'Jede Stunde 1–2 Minuten Bewegung: stärkt Konzentration, reduziert Ausfälle und zeigt Fürsorge am Arbeitsplatz.',
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
      answer:
        'Wir empfehlen sechs Aktivpausen pro Tag – jeweils 1–2 Minuten. Das entspricht einer kurzen Bewegung pro Stunde im Büro oder Zuhause.'
    },
    {
      question: 'Gibt es Live-Coachings?',
      answer:
        'Nein. aboelo Fitness setzt auf leicht verständliche Videos und Schritt-für-Schritt-Anleitungen, damit jede Person selbstständig trainieren kann. Wir helfen dabei, alle 60 Minuten aufzustehen und das 6-Übungen-pro-Tag-Ziel locker zu erreichen – ganz ohne Live-Coachings.'
    },
    {
      question: 'Welche Erinnerungen erhalte ich?',
      answer:
        'Aktuell gibt es feste Tagesziele und Streak-Hinweise. Bald können Browser-Erinnerungen individuell pro Uhrzeit oder Rhythmus eingestellt werden.'
    },
    {
      question: 'Welche Daten werden gespeichert?',
      answer:
        'Wir speichern nur trainingsrelevante Informationen wie absolvierte Übungen, Dauer und persönliche Ziele. Alle Daten werden DSGVO-konform verarbeitet.'
    }
  ],
  finalCtaHeading: 'Bereit für gesunde Routinen?',
  finalCtaText:
    'aboelo Fitness motiviert zu sechs kurzen Aktivpausen pro Tag. Starten Sie jetzt Ihren kostenlosen Zugang und erleben Sie die Plattform live.',
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

const WelcomePage2: React.FC = () => {
  const theme = useTheme();
  const isMdUp = useMediaQuery(theme.breakpoints.up('md'));

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
    document.body.style.background = palette.pageBackground;
    return () => {
      document.body.style.background = '';
    };
  }, []);

  return (
    <Box sx={{ background: palette.pageBackground }}>
      <Box
        component="header"
        sx={{
          backgroundColor: palette.neutral,
          borderBottom: '1px solid rgba(15,63,63,0.08)',
          position: 'relative',
          zIndex: 3
        }}
      >
        <Container maxWidth="lg" sx={{ py: { xs: 2.5, md: 3 } }}>
          <Stack
            direction={{ xs: 'column', md: 'row' }}
            alignItems={{ xs: 'flex-start', md: 'center' }}
            justifyContent="space-between"
            spacing={{ xs: 2, md: 4 }}
          >
            <Stack direction="row" spacing={2.5} alignItems="center">
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
                  sx={{ height: 40, width: 'auto' }}
                />
              </Box>
              <MuiLink
                href="https://fitness.aboelo.de"
                target="_blank"
                rel="noopener"
                underline="none"
                sx={{
                  fontWeight: 700,
                  letterSpacing: 0.6,
                  color: palette.textPrimary,
                  fontSize: '1.18rem',
                  '&:hover': { color: palette.accent }
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
          backgroundColor: palette.pageBackground,
          pt: { xs: 10, md: 12 },
          pb: { xs: 6, md: 8 },
          px: { xs: 2.5, md: 4 }
        }}
      >
        <Box
          sx={{
            position: 'relative',
            overflow: 'hidden',
            background: palette.heroGradient,
            color: '#ffffff',
            borderRadius: { xs: 4, md: 6 },
            maxWidth: 1180,
            mx: 'auto',
            px: { xs: 3, sm: 4, md: 6 },
            py: { xs: 6, md: 8 },
            boxShadow: '0 40px 80px rgba(15,63,63,0.28)'
          }}
        >
          <Box
            sx={{
              position: 'absolute',
              inset: 0,
              background:
                'radial-gradient(circle at 15% 20%, rgba(255,255,255,0.22) 0%, transparent 55%), radial-gradient(circle at 85% 30%, rgba(255,255,255,0.18) 0%, transparent 55%)',
              pointerEvents: 'none'
            }}
          />
          <Stack
            direction={{ xs: 'column', md: 'row' }}
            spacing={{ xs: 6, md: 10 }}
            alignItems={{ xs: 'flex-start', md: 'center' }}
            sx={{ position: 'relative', zIndex: 1 }}
          >
            <Stack spacing={{ xs: 3.5, md: 4.5 }} flex={1} maxWidth={{ md: 520 }}>
              <Chip
                label={pageContent.heroBadge}
                sx={{
                  alignSelf: 'flex-start',
                  backgroundColor: 'rgba(255,255,255,0.2)',
                  color: '#fff',
                  fontSize: '0.95rem',
                  letterSpacing: 0.5,
                  px: 2.75,
                  py: 2,
                  borderRadius: 999,
                  backdropFilter: 'blur(6px)',
                  border: '1px solid rgba(255,255,255,0.3)'
                }}
              />
              <Stack spacing={{ xs: 2.5, md: 3 }}>
                <Typography
                  variant="h2"
                  sx={{
                    fontWeight: 800,
                    lineHeight: 1.05,
                    fontSize: { xs: '2.7rem', sm: '3.1rem', md: '3.85rem' },
                    textShadow: '0 15px 40px rgba(0,0,0,0.3)'
                  }}
                >
                  {pageContent.heroTitle}
                </Typography>
                <Typography
                  variant="h6"
                  sx={{
                    opacity: 0.92,
                    fontWeight: 500,
                    fontSize: { xs: '1.13rem', md: '1.24rem' },
                    lineHeight: 1.68
                  }}
                >
                  {pageContent.heroSubtitle}
                </Typography>
              </Stack>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: 2, sm: 2.5 }} alignItems={{ xs: 'stretch', sm: 'center' }}>
                <Button
                  component={RouterLink}
                  to={pageContent.heroCtaHref}
                  size="large"
                  variant="contained"
                  color="primary"
                  endIcon={<ArrowForwardIcon />}
                  sx={{
                    fontSize: '1.06rem',
                    py: 1.6,
                    px: 4.2,
                    borderRadius: 18,
                    boxShadow: palette.shadow
                  }}
                >
                  {pageContent.heroPrimaryCta}
                </Button>
                <Button
                  href="#explore"
                  size="large"
                  variant="outlined"
                  endIcon={<ArrowDownwardIcon />}
                  sx={{
                    fontSize: '1.03rem',
                    py: 1.6,
                    px: 3.9,
                    color: '#fff',
                    borderColor: 'rgba(255,255,255,0.55)',
                    borderRadius: 18,
                    backdropFilter: 'blur(6px)',
                    textAlign: 'center'
                  }}
                >
                  {pageContent.heroSecondaryCta}
                </Button>
              </Stack>
            </Stack>
            <Box
              sx={{
                flex: 1,
                width: { xs: '100%', md: 'auto' },
                display: 'flex',
                justifyContent: 'center',
                position: 'relative'
              }}
            >
              <Box
                sx={{
                  position: 'absolute',
                  inset: 'auto',
                  top: { xs: '8%', md: '12%' },
                  width: { xs: '68%', md: '62%' },
                  height: { xs: '68%', md: '64%' },
                  borderRadius: '50%',
                  background: 'radial-gradient(circle, rgba(255,255,255,0.35) 0%, transparent 70%)',
                  filter: 'blur(28px)',
                  opacity: 0.9,
                  zIndex: 0
                }}
              />
              <Box
                sx={{
                  position: 'relative',
                  background: palette.heroGlass,
                  borderRadius: { xs: 5, md: 6 },
                  border: `1px solid ${palette.borderSoft}`,
                  boxShadow: '0 38px 60px rgba(0,0,0,0.32)',
                  px: { xs: 3.2, sm: 3.8, md: 4.5 },
                  py: { xs: 3.2, sm: 3.8, md: 4.5 },
                  maxWidth: { xs: 360, sm: 380, md: 420 },
                  width: '100%',
                  zIndex: 1
                }}
              >
                <Stack spacing={3} alignItems="center">
                  <Box
                    component="img"
                    src="/buero-uebung-aboelo.png"
                    alt={pageContent.officeImageAlt}
                    sx={{
                      width: '100%',
                      height: 'auto',
                      borderRadius: 4,
                      boxShadow: '0 24px 48px rgba(15,63,63,0.22)'
                    }}
                  />
                  <Typography
                    variant="subtitle1"
                    sx={{
                      color: palette.textPrimary,
                      opacity: 0.95,
                      textAlign: 'center',
                      lineHeight: 1.58
                    }}
                  >
                    Geführte Video-Routinen, alltagstaugliche Übungen und motivierende Gamification.
                  </Typography>
                </Stack>
              </Box>
            </Box>
          </Stack>
        </Box>
      </Box>

      <Container
        maxWidth={layout.maxWidth}
        sx={{
          ...layout.section,
          mt: { xs: -4, md: -6 },
          position: 'relative',
          zIndex: 2
        }}
      >
        <Box
          sx={{
            background: palette.neutral,
            borderRadius: { xs: 4, md: 5 },
            boxShadow: '0 32px 60px rgba(12,63,63,0.14)',
            border: '1px solid rgba(15,63,63,0.08)',
            p: { xs: 3, md: 4 }
          }}
        >
          <Stack
            direction={{ xs: 'column', md: 'row' }}
            spacing={{ xs: 3, md: 4 }}
            divider={
              <Divider
                orientation={isMdUp ? 'vertical' : 'horizontal'}
                flexItem
                sx={{ borderColor: 'rgba(15,63,63,0.08)' }}
              />
            }
          >
            {pageContent.stats.map((item) => (
              <Stack key={item.value} spacing={1.5} flex={1}>
                <Typography variant="h3" sx={{ fontWeight: 800, color: palette.textPrimary }}>
                  {item.value}
                </Typography>
                <Typography variant="body1" sx={{ color: palette.textSecondary, lineHeight: 1.72 }}>
                  {item.label}
                </Typography>
              </Stack>
            ))}
          </Stack>
        </Box>
      </Container>

      <Box id="explore" sx={{ py: { xs: 8, md: 12 } }}>
        <Container maxWidth={layout.maxWidth} sx={{ ...layout.section }}>
          <Stack spacing={{ xs: 4, md: 5 }} alignItems="center">
            <Typography
              variant="h4"
              sx={{ fontWeight: 800, color: palette.textPrimary, textAlign: 'center', maxWidth: 760 }}
            >
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
                    borderRadius: 5,
                    background: 'linear-gradient(150deg, #ffffff 0%, #eaf5f4 100%)',
                    border: '1px solid rgba(15,63,63,0.06)',
                    boxShadow: '0 26px 46px rgba(12,63,63,0.12)'
                  }}
                >
                  <CardContent sx={{ p: { xs: 3, md: 4 }, display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <IconButton size="large" disabled sx={{ backgroundColor: palette.accentSoft, mb: 2 }}>
                      <CheckCircleOutlineIcon sx={{ color: palette.accent, fontSize: '2rem' }} />
                    </IconButton>
                    <Typography variant="h5" sx={{ fontWeight: 700, color: palette.textPrimary }}>
                      {feature.title}
                    </Typography>
                    <Typography variant="body1" sx={{ color: palette.textSecondary, lineHeight: 1.75 }}>
                      {feature.description}
                    </Typography>
                  </CardContent>
                </Card>
              ))}
            </Box>
          </Stack>
        </Container>
      </Box>

      <Box id={pageContent.seniorsId} sx={{ background: palette.pageBackground }}>
        <Container
          maxWidth={layout.maxWidth}
          sx={{ ...layout.section, py: { xs: 8, md: 10 } }}
        >
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={{ xs: 6, md: 8 }} alignItems="center">
            <CardMedia
              component="img"
              image="/aboelo-fitness-progress.png"
              alt={pageContent.officeImageAlt}
              sx={{ borderRadius: 5, boxShadow: '0 32px 60px rgba(22,69,69,0.22)', width: { xs: '100%', md: '48%' } }}
            />
            <Stack spacing={3} flex={1}>
              <Chip label="Senioren" color="primary" sx={{ alignSelf: 'flex-start', fontWeight: 600 }} />
              <Typography variant="h4" sx={{ fontWeight: 800, color: palette.textPrimary }}>
                {pageContent.seniorsHeading}
              </Typography>
              <Stack spacing={2.5}>
                {pageContent.seniorsPoints.map((point) => (
                  <Stack key={point} direction="row" spacing={2} alignItems="flex-start">
                    <CheckCircleOutlineIcon color="primary" sx={{ mt: 0.6 }} />
                    <Typography variant="body1" sx={{ color: palette.textSecondary, lineHeight: 1.78 }}>
                      {point}
                    </Typography>
                  </Stack>
                ))}
              </Stack>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2.5}>
                <Button
                  component={RouterLink}
                  to="/register"
                  variant="contained"
                  color="primary"
                  size="large"
                  endIcon={<ArrowForwardIcon />}
                  sx={{ borderRadius: 3 }}
                >
                  {pageContent.heroPrimaryCta}
                </Button>
                <Button component={RouterLink} to="/kontakt" variant="outlined" size="large" sx={{ borderRadius: 3 }}>
                  {pageContent.contactCta}
                </Button>
              </Stack>
            </Stack>
          </Stack>
        </Container>
      </Box>

      <Box id={pageContent.corporateId} sx={{ backgroundColor: palette.pageBackground }}>
        <Container
          maxWidth={layout.maxWidth}
          sx={{ ...layout.section, py: { xs: 8, md: 10 } }}
        >
          <Stack direction={{ xs: 'column-reverse', md: 'row' }} spacing={{ xs: 6, md: 8 }} alignItems="center">
            <Stack spacing={3} flex={1}>
              <Chip
                label="Unternehmen"
                color="default"
                sx={{ alignSelf: 'flex-start', backgroundColor: 'rgba(45,125,125,0.1)', color: palette.textPrimary }}
              />
              <Typography variant="h4" sx={{ fontWeight: 800, color: palette.textPrimary }}>
                {pageContent.corporateHeading}
              </Typography>
              <Typography variant="h6" sx={{ color: palette.textSecondary }}>
                {pageContent.corporateSubtitle}
              </Typography>
              <Stack spacing={2.5}>
                {pageContent.corporateBenefits.map((benefit) => (
                  <Stack key={benefit} direction="row" spacing={2} alignItems="flex-start">
                    <CheckCircleOutlineIcon sx={{ color: '#41b3a3', mt: 0.6 }} />
                    <Typography variant="body1" sx={{ lineHeight: 1.76 }}>
                      {benefit}
                    </Typography>
                  </Stack>
                ))}
              </Stack>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2.5}>
                <Button component={RouterLink} to="/register" variant="contained" size="large" color="secondary" endIcon={<ArrowForwardIcon />}>
                  {pageContent.heroPrimaryCta}
                </Button>
                {pageContent.finalSecondaryCta && (
                  <Button
                    component={RouterLink}
                    to="/kontakt"
                    variant="outlined"
                    size="large"
                    sx={{ borderRadius: 3, borderColor: 'rgba(255,255,255,0.6)', color: '#fff' }}
                  >
                    {pageContent.finalSecondaryCta}
                  </Button>
                )}
              </Stack>
            </Stack>
            <Card
              sx={{
                background: 'linear-gradient(150deg, rgba(255,255,255,0.92) 0%, rgba(211,239,235,0.7) 100%)',
                borderRadius: 5,
                overflow: 'hidden',
                boxShadow: '0 28px 60px rgba(12,63,63,0.18)',
                width: { xs: '100%', md: '52%' }
              }}
            >
              <CardMedia
                component="img"
                image="/aboelo-fitness-uebungen.png"
                alt="Team Session"
                sx={{ height: { xs: 280, md: 360 }, objectFit: 'cover' }}
              />
              <CardContent sx={{ color: palette.textPrimary }}>
                <Typography variant="subtitle1" sx={{ opacity: 0.88 }}>
                  Geführte Active Breaks steigern Produktivität und Wohlbefinden innerhalb weniger Wochen.
                </Typography>
              </CardContent>
            </Card>
          </Stack>
        </Container>
      </Box>

      <Box id={pageContent.medicalId} sx={{ background: palette.pageBackground }}>
        <Container
          maxWidth={layout.maxWidth}
          sx={{ ...layout.section, py: { xs: 8, md: 10 } }}
        >
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={{ xs: 6, md: 8 }} alignItems="center">
            <Stack spacing={3} flex={1}>
              <Chip label="Medizin & Pflege" color="primary" sx={{ alignSelf: 'flex-start' }} />
              <Typography variant="h4" sx={{ fontWeight: 800, color: palette.textPrimary }}>
                {pageContent.medicalHeading}
              </Typography>
              <Typography variant="h6" sx={{ color: palette.textSecondary }}>
                {pageContent.medicalSubtitle}
              </Typography>
              <Stack spacing={2.5}>
                {pageContent.medicalBenefits.map((benefit) => (
                  <Stack key={benefit} direction="row" spacing={2} alignItems="flex-start">
                    <CheckCircleOutlineIcon color="primary" sx={{ mt: 0.6 }} />
                    <Typography variant="body1" sx={{ color: palette.textSecondary, lineHeight: 1.78 }}>
                      {benefit}
                    </Typography>
                  </Stack>
                ))}
              </Stack>
            </Stack>
            <Card sx={{ borderRadius: 5, boxShadow: '0 32px 60px rgba(17,63,103,0.2)', flex: 1 }}>
              <CardContent sx={{ p: { xs: 3.5, md: 4 } }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2.5, color: palette.textPrimary }}>
                  Einsatzmöglichkeiten
                </Typography>
                <Stack spacing={2.2}>
                  <Stack direction="row" spacing={2} alignItems="center">
                    <PlayArrowIcon color="primary" />
                    <Typography variant="body1" sx={{ color: palette.textSecondary }}>
                      Tele-Reha und Nachsorge mit klaren Protokollen
                    </Typography>
                  </Stack>
                  <Stack direction="row" spacing={2} alignItems="center">
                    <PlayArrowIcon color="primary" />
                    <Typography variant="body1" sx={{ color: palette.textSecondary }}>
                      Aktivierungsprogramme in Tagespflege und betreutem Wohnen
                    </Typography>
                  </Stack>
                  <Stack direction="row" spacing={2} alignItems="center">
                    <PlayArrowIcon color="primary" />
                    <Typography variant="body1" sx={{ color: palette.textSecondary }}>
                      Case-Management mit 360° Compliance-Übersicht
                    </Typography>
                  </Stack>
                </Stack>
              </CardContent>
            </Card>
          </Stack>
        </Container>
      </Box>

      <Box
        sx={{
          backgroundColor: palette.pageBackground
        }}
      >
        <Container
          maxWidth={layout.maxWidth}
          sx={{
            ...layout.section,
            py: { xs: 8, md: 10 },
            display: 'flex',
            flexDirection: 'column',
            gap: 4,
            alignItems: 'center',
            borderRadius: { xs: 4, md: 5 },
            background: 'linear-gradient(120deg, rgba(15,61,61,0.95) 0%, rgba(45,125,125,0.95) 60%, rgba(83,181,181,0.92) 100%)',
            boxShadow: '0 30px 60px rgba(12,63,63,0.22)'
          }}
        >
          <Typography variant="h4" sx={{ fontWeight: 800, textAlign: 'center', maxWidth: 700 }}>
            {pageContent.finalCtaHeading}
          </Typography>
          <Typography variant="h6" sx={{ opacity: 0.9, textAlign: 'center', maxWidth: 720 }}>
            {pageContent.finalCtaText}
          </Typography>
          <Button
            component={RouterLink}
            to="/register"
            variant="contained"
            color="primary"
            size="large"
            endIcon={<ArrowForwardIcon />}
            sx={{ borderRadius: 3, px: { xs: 4, md: 5 }, py: 1.6 }}
          >
            {pageContent.finalPrimaryCta}
          </Button>
        </Container>
      </Box>

      <Box id={pageContent.faqId} sx={{ backgroundColor: palette.pageBackground }}>
        <Container
          maxWidth={layout.maxWidth}
          sx={{ ...layout.section, maxWidth: '840px', mx: 'auto', py: { xs: 8, md: 10 } }}
        >
          <Stack spacing={4} alignItems="center">
            <Typography variant="h4" sx={{ fontWeight: 800, color: palette.textPrimary }}>
              {pageContent.faqHeading}
            </Typography>
            <Divider sx={{ width: '100%', maxWidth: 240 }} />
            <Stack spacing={2} width="100%">
              {pageContent.faqs.map((item, index) => (
                <Accordion key={item.question} defaultExpanded={index === 0} sx={{ borderRadius: 3, boxShadow: '0 16px 30px rgba(17,63,63,0.1)' }}>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography variant="h6" sx={{ fontWeight: 600, color: palette.textPrimary }}>
                      {item.question}
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Typography variant="body1" sx={{ lineHeight: 1.8, color: palette.textSecondary }}>
                      {item.answer}
                    </Typography>
                  </AccordionDetails>
                </Accordion>
              ))}
            </Stack>
          </Stack>
        </Container>
      </Box>
    </Box>
  );
};

export default WelcomePage2;
