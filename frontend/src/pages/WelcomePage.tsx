import React, { useState, useEffect, useMemo } from 'react';
import { Box, Container, Typography, Button, Stack, Chip, ToggleButtonGroup, ToggleButton, Card, CardContent, CardMedia, Accordion, AccordionSummary, AccordionDetails, Divider, IconButton } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import { Link as RouterLink } from 'react-router-dom';

const palette = {
  background: '#f4f6fb',
  heroGradient: 'linear-gradient(135deg, #0b1d51 0%, #1446a0 55%, #45c4b0 100%)',
  heroOverlay: 'rgba(11, 29, 81, 0.35)',
  cardBorder: 'rgba(255,255,255,0.35)',
  neutralSurface: 'rgba(255,255,255,0.85)',
  neutralGradient: 'linear-gradient(145deg, rgba(255,255,255,0.95) 0%, rgba(238,242,255,0.9) 100%)',
  darkSurface: 'linear-gradient(155deg, rgba(13,34,75,0.9) 0%, rgba(9,23,54,0.85) 100%)',
  accent: '#45c4b0',
  accentSoft: 'rgba(69, 196, 176, 0.16)',
  primaryText: '#0b1d51',
  secondaryText: '#4f5d75',
  glassShadow: '0 24px 48px rgba(12, 28, 61, 0.25)'
};

const WelcomePage: React.FC = () => {
  const [language, setLanguage] = useState<'de' | 'en'>('de');

  const content = useMemo(() => ({
    de: {
      metaTitle: 'aboelo-fitness | Digitale Bewegungslösungen für Senioren, Unternehmen und Gesundheitspartner',
      metaDescription: 'aboelo-fitness kombiniert evidenzbasierte Trainingsprogramme, Live-Coachings und Analytics für Senioren, Mitarbeitende und Pflegeeinrichtungen. Jetzt informieren und registrieren.',
      heroBadge: 'Ganzheitliche Bewegungslösungen',
      heroTitle: 'Digitale Fitness, die Menschen bewegt – zuhause, im Büro und in der Pflege',
      heroSubtitle: 'aboelo-fitness verbindet evidenzbasierte Mikro-Pausen von 1–2 Minuten mit klaren Videoanleitungen und intelligenten Erinnerungen. Wir helfen dabei, alle 60 Minuten aufzustehen und das 6-Übungen-pro-Tag-Ziel locker zu erreichen.',
      heroPrimaryCta: 'Jetzt registrieren',
      heroSecondaryCta: 'Programm entdecken',
      stats: [
        { value: '30 Min.', label: 'Tägliche Aktivpausen reichen, um spürbare Fortschritte zu erzielen.' },
        { value: '+95%', label: 'der Pilotnutzer:innen berichten über mehr Energie im Alltag.' },
        { value: '4 Zielgruppen', label: 'Senioren, Pflege, Unternehmen und medizinische Partner.' }
      ],
      featureHeading: 'Warum aboelo-fitness begeistert',
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
          description: 'In Kürze: individuell planbare Browser-Reminder, die an die nächste Aktivpause erinnern und Teams synchron aktiv halten.'
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
      medicalHeading: 'Für Ärzt:innen, Therapeut:innen und Pflegeeinrichtungen',
      medicalSubtitle: 'Strukturierte Aktivierung ohne Zusatzaufwand – ideal für Tagespflege, betreutes Wohnen und Ambulanz.',
      medicalBenefits: [
        'Automatisierte Dokumentation von Teilnahme und Fortschritt',
        'Gemeinsame Zieldefinition mit klaren Wochenempfehlungen (6 Übungen pro Tag)',
        'Infomaterialien für Pflegekräfte und Angehörige zur sicheren Durchführung'
      ],
      testimonialHeading: 'Stimmen aus der Praxis',
      testimonials: [
        {
          quote: 'Mit den 2-Minuten-Übungen hält unser Büro-Team jede Stunde kurz inne – und die Energie bleibt bis Feierabend hoch.',
          name: 'Dr. Felix Stern',
          role: 'Chief People Officer, TechWerk GmbH'
        },
        {
          quote: 'Unsere Tagesgäste schaffen ihre Aktivpausen jetzt selbständig. Die klaren Videos geben Sicherheit und machen Spaß.',
          name: 'Anja Hoffmann',
          role: 'Pflegedienstleitung, Tagespflege Lebensfreude'
        }
      ],
      faqHeading: 'Häufige Fragen',
      faqs: [
        {
          question: 'Wie häufig sollte ich die Übungen machen?',
          answer: 'Wir empfehlen sechs Aktivpausen pro Tag – jeweils 1–2 Minuten. Das entspricht einer kurzen Bewegung pro Stunde im Büro oder Zuhause.'
        },
        {
          question: 'Gibt es Live-Coachings?',
          answer: 'Nein. aboelo-fitness setzt auf leicht verständliche Videos und Schritt-für-Schritt-Anleitungen, damit jede Person selbstständig trainieren kann.'
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
      finalCtaText: 'aboelo-fitness motiviert zu sechs kurzen Aktivpausen pro Tag. Starten Sie jetzt Ihren kostenlosen Testzugang oder sprechen Sie mit uns über Ihren Einsatz im Team.',
      finalPrimaryCta: 'Kostenlosen Test starten',
      finalSecondaryCta: 'Beratung anfragen',
      languageLabelDe: 'Deutsch',
      languageLabelEn: 'English',
      faqId: 'faq',
      seniorsId: 'senioren',
      corporateId: 'unternehmen',
      medicalId: 'partner',
      heroCtaHref: '/register',
      officeImageAlt: 'Team macht aktive Pause im Büro',
      seniorImageAlt: 'Seniorin trainiert mit Tablet',
      contactCta: 'Kontakt aufnehmen'
    },
    en: {
      metaTitle: 'aboelo-fitness | Digital movement solutions for seniors, teams and care partners',
      metaDescription: 'aboelo-fitness delivers science-backed exercise programs, live coaching and analytics for seniors, caregivers, companies and medical partners. Discover the platform and sign up today.',
      heroBadge: 'Holistic Movement Platform',
      heroTitle: 'Digital fitness that empowers people – at home, at work and in care',
      heroSubtitle: 'aboelo-fitness blends science-backed 1–2 minute movement breaks with easy-to-follow videos and intelligent reminders. We help desk workers stand up every hour and hit their 6-exercises-a-day goal.',
      heroPrimaryCta: 'Register now',
      heroSecondaryCta: 'Explore the program',
      stats: [
        { value: '30 min', label: 'Daily active breaks are enough to feel the difference.' },
        { value: '95%', label: 'of pilot users report more energy during the day.' },
        { value: '4 segments', label: 'Seniors, care teams, employers and health professionals.' }
      ],
      featureHeading: 'Why organizations choose aboelo-fitness',
      features: [
        {
          title: 'Guided micro breaks',
          description: '1–2 minute activity bursts with age-friendly demonstrations—ideal for desks, living rooms or care facilities.'
        },
        {
          title: 'Transparent progress',
          description: 'Weekly and monthly dashboards keep every completed exercise visible and encourage sustainable routines.'
        },
        {
          title: 'Smart reminders',
          description: 'Coming soon: customizable browser nudges that prompt the next movement break and sync whole teams.'
        }
      ],
      seniorsHeading: 'Active ageing made joyful',
      seniorsPoints: [
        'Gentle mobility, fall prevention and strength routines tailored for the home',
        'Large type, high contrast visuals and optional audio cues support every move',
        'Positive reinforcement via streaks, weekly goals and shared updates with loved ones'
      ],
      corporateHeading: 'Healthy teams in every workplace',
      corporateSubtitle: 'Stand up every hour for a 1–2 minute reset—more focus, fewer sick days, visible care for your people.',
      corporateBenefits: [
        'Six guided activity breaks per workday—on demand and repeatable whenever needed',
        'Coming soon: browser reminders that nudge teams automatically at the right time',
        'Quick ergonomics tips, shoulder openers and eye resets for meeting-heavy days'
      ],
      medicalHeading: 'For physicians, therapists and care facilities',
      medicalSubtitle: 'Structured activation without extra staffing—ideal for day care, assisted living and outpatient programs.',
      medicalBenefits: [
        'Automated records of participation and adherence',
        'Shared goal-setting with clear weekly recommendations (6 exercises per day)',
        'Support materials for caregivers and families to ensure safe execution'
      ],
      testimonialHeading: 'Voices from the field',
      testimonials: [
        {
          quote: 'Our teams love the 2-minute reset between meetings—it keeps energy high right through to the afternoon.',
          name: 'Dr. Felix Stern',
          role: 'Chief People Officer, TechWerk GmbH'
        },
        {
          quote: 'Day-care guests now complete their activation breaks independently. The clear videos make every move safe and fun.',
          name: 'Anja Hoffmann',
          role: 'Head Nurse, Lebensfreude Day Care'
        }
      ],
      faqHeading: 'Frequently asked questions',
      faqs: [
        {
          question: 'How often should I do the exercises?',
          answer: 'We recommend six activity breaks per day—one short movement every hour keeps your desk routine healthy.'
        },
        {
          question: 'Do you offer live coaching?',
          answer: 'No. aboelo-fitness focuses on self-guided videos with clear instructions so everyone can move safely and independently.'
        },
        {
          question: 'What reminders are available?',
          answer: 'Right now you receive daily goals and streak prompts. Customizable browser reminders are on the roadmap and will launch soon.'
        },
        {
          question: 'What data do you store?',
          answer: 'We only keep training-related metrics such as completed sessions, duration and personal goals. All processing is GDPR compliant.'
        }
      ],
      finalCtaHeading: 'Ready to inspire healthy routines?',
      finalCtaText: 'aboelo-fitness inspires six short movement breaks each day. Launch your free trial or chat with us about rolling it out to your team.',
      finalPrimaryCta: 'Start free trial',
      finalSecondaryCta: 'Request consultation',
      languageLabelDe: 'Deutsch',
      languageLabelEn: 'English',
      faqId: 'faq',
      seniorsId: 'seniors',
      corporateId: 'workplace',
      medicalId: 'partners',
      heroCtaHref: '/register',
      officeImageAlt: 'Team enjoying an active break in the office',
      seniorImageAlt: 'Senior woman exercising with a tablet',
      contactCta: 'Contact us'
    }
  }), []);

  useEffect(() => {
    const selected = content[language];
    document.title = selected.metaTitle;
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', selected.metaDescription);
    } else {
      const meta = document.createElement('meta');
      meta.setAttribute('name', 'description');
      meta.setAttribute('content', selected.metaDescription);
      document.head.appendChild(meta);
    }
    document.documentElement.lang = language;
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.id = 'aboelo-structured-data';
    const jsonLd = {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: 'aboelo-fitness',
      url: 'https://www.aboelo-fitness.de/',
      inLanguage: language === 'de' ? 'de-DE' : 'en-US',
      description: selected.metaDescription,
      potentialAction: {
        '@type': 'RegisterAction',
        target: 'https://www.aboelo-fitness.de/register',
        name: language === 'de' ? 'Jetzt registrieren' : 'Register now'
      },
      publisher: {
        '@type': 'Organization',
        name: 'aboelo-fitness',
        sameAs: ['https://www.linkedin.com/company/aboelo-fitness']
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
  }, [content, language]);

  const selectedContent = content[language];

  useEffect(() => {
    document.body.style.background = palette.background;
    return () => {
      document.body.style.background = '';
    };
  }, []);

  return (
    <Box sx={{ background: palette.background }}>
      <Box
        sx={{
          position: 'relative',
          overflow: 'hidden',
          background: palette.heroGradient,
          color: '#ffffff',
          pt: { xs: 12, sm: 14 },
          pb: { xs: 12, sm: 16 }
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            background: 'radial-gradient(circle at top right, rgba(255,255,255,0.18) 0%, transparent 55%)'
          }}
        />
        <Container maxWidth="lg" sx={{ position: 'relative' }}>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={{ xs: 6, md: 8 }} alignItems="center">
            <Stack spacing={3} flex={1}>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Chip 
                  label={selectedContent.heroBadge} 
                  color="default" 
                  sx={{ 
                    backgroundColor: palette.heroOverlay,
                    color: '#fff', 
                    fontSize: '1rem', 
                    px: 2.5, 
                    py: 3, 
                    borderRadius: 999,
                    backdropFilter: 'blur(12px)',
                    border: '1px solid rgba(255,255,255,0.25)'
                  }} 
                />
                <ToggleButtonGroup
                  color="standard"
                  value={language}
                  exclusive
                  onChange={(_, value) => value && setLanguage(value)}
                  sx={{ backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: 999, backdropFilter: 'blur(10px)' }}
                >
                  <ToggleButton value="de" sx={{ color: '#fff', px: 2 }}>{selectedContent.languageLabelDe}</ToggleButton>
                  <ToggleButton value="en" sx={{ color: '#fff', px: 2 }}>{selectedContent.languageLabelEn}</ToggleButton>
                </ToggleButtonGroup>
              </Stack>
              <Typography variant="h2" sx={{ fontWeight: 800, lineHeight: 1.05, fontSize: { xs: '2.7rem', md: '3.9rem' }, textShadow: '0 12px 30px rgba(0,0,0,0.25)' }}>
                {selectedContent.heroTitle}
              </Typography>
              <Typography variant="h6" sx={{ opacity: 0.92, fontSize: { xs: '1.15rem', md: '1.32rem' }, maxWidth: 660, lineHeight: 1.6 }}>
                {selectedContent.heroSubtitle}
              </Typography>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ xs: 'stretch', sm: 'center' }}>
                <Button
                  component={RouterLink}
                  to={selectedContent.heroCtaHref}
                  size="large"
                  variant="contained"
                  color="secondary"
                  endIcon={<ArrowForwardIcon />}
                  sx={{ fontSize: '1.15rem', py: 1.6, px: 4.25, borderRadius: 999, boxShadow: palette.glassShadow }}
                >
                  {selectedContent.heroPrimaryCta}
                </Button>
                <Button
                  href="#explore"
                  size="large"
                  variant="outlined"
                  endIcon={<ArrowDownwardIcon />}
                  sx={{ fontSize: '1.05rem', py: 1.6, px: 4, borderColor: 'rgba(255,255,255,0.55)', color: '#fff', borderRadius: 999, backdropFilter: 'blur(6px)' }}
                >
                  {selectedContent.heroSecondaryCta}
                </Button>
              </Stack>
              <Box
                sx={{
                  pt: 4,
                  display: 'grid',
                  gap: 3,
                  gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' }
                }}
              >
                {selectedContent.stats.map((item) => (
                  <Box 
                    key={item.value} 
                    sx={{ 
                      background: palette.neutralSurface,
                      borderRadius: 4,
                      p: 3,
                      minHeight: 170,
                      boxShadow: '0 18px 38px rgba(5,16,41,0.12)',
                      border: '1px solid rgba(255,255,255,0.35)'
                    }}
                  >
                    <Typography variant="h4" sx={{ fontWeight: 700, mb: 1, color: palette.primaryText }}>{item.value}</Typography>
                    <Typography variant="body1" sx={{ color: 'rgba(11,29,81,0.72)', lineHeight: 1.6 }}>{item.label}</Typography>
                  </Box>
                ))}
              </Box>
            </Stack>
            <Card sx={{ flex: 1, backgroundColor: 'rgba(255,255,255,0.18)', backdropFilter: 'blur(18px)', borderRadius: 5, border: '1px solid rgba(255,255,255,0.28)', boxShadow: palette.glassShadow }}>
              <CardMedia
                component="img"
                image="https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=1200&q=80"
                alt={selectedContent.seniorImageAlt}
                sx={{ height: { xs: 280, md: 420 }, objectFit: 'cover', borderTopLeftRadius: 20, borderTopRightRadius: 20 }}
              />
              <CardContent sx={{ color: '#fff' }}>
                <Typography variant="subtitle1" sx={{ opacity: 0.85 }}>
                  {language === 'de' ? 'Live-Coaching, alltagstaugliche Übungen und motivierende Gamification.' : 'Live coaching, everyday-friendly workouts and motivational gamification.'}
                </Typography>
              </CardContent>
            </Card>
          </Stack>
        </Container>
      </Box>

      <Box id="explore">
        <Container maxWidth="lg" sx={{ py: { xs: 8, md: 10 } }}>
          <Stack spacing={4} alignItems="center">
            <Typography variant="h3" sx={{ fontWeight: 800, textAlign: 'center', maxWidth: 720, color: palette.primaryText }}>
              {selectedContent.featureHeading}
            </Typography>
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' },
                gap: 4,
                width: '100%'
              }}
            >
              {selectedContent.features.map((feature) => (
                <Card 
                  key={feature.title} 
                  sx={{ 
                    height: '100%', 
                    borderRadius: 4, 
                    boxShadow: '0 22px 40px rgba(12,28,61,0.12)',
                    background: palette.neutralGradient,
                    border: '1px solid rgba(12,28,61,0.05)'
                  }}
                >
                  <CardContent sx={{ p: 4 }}>
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

      <Box id={selectedContent.seniorsId} sx={{ background: 'linear-gradient(135deg, #ffffff 0%, #f1f4ff 100%)' }}>
        <Container maxWidth="lg" sx={{ py: { xs: 8, md: 10 } }}>
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
              image="https://images.unsplash.com/photo-1573497491208-6b1acb260507?auto=format&fit=crop&w=1200&q=80"
              alt={selectedContent.officeImageAlt}
              sx={{ borderRadius: 4, boxShadow: '0 28px 52px rgba(12,28,61,0.2)' }}
            />
            <Stack spacing={3}>
              <Chip label={language === 'de' ? 'Senioren' : 'Seniors'} color="primary" sx={{ alignSelf: 'flex-start', fontWeight: 600 }} />
              <Typography variant="h4" sx={{ fontWeight: 800, color: palette.primaryText }}>{selectedContent.seniorsHeading}</Typography>
              <Stack spacing={2}>
                {selectedContent.seniorsPoints.map((point) => (
                  <Stack key={point} direction="row" spacing={2} alignItems="flex-start">
                    <CheckCircleOutlineIcon color="primary" sx={{ mt: 0.5 }} />
                    <Typography variant="body1" sx={{ lineHeight: 1.75, color: palette.secondaryText }}>{point}</Typography>
                  </Stack>
                ))}
              </Stack>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <Button component={RouterLink} to="/register" variant="contained" color="primary" size="large" endIcon={<ArrowForwardIcon />}
                  sx={{ borderRadius: 3 }}>
                  {selectedContent.heroPrimaryCta}
                </Button>
                <Button component={RouterLink} to="/kontakt" variant="outlined" size="large" sx={{ borderRadius: 3 }}>
                  {selectedContent.contactCta}
                </Button>
              </Stack>
            </Stack>
          </Box>
        </Container>
      </Box>

      <Box id={selectedContent.corporateId} sx={{ background: palette.darkSurface, color: '#fff' }}>
        <Container maxWidth="lg" sx={{ py: { xs: 8, md: 10 } }}>
          <Box
            sx={{
              display: 'grid',
              gap: 6,
              alignItems: 'center',
              gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }
            }}
          >
            <Stack spacing={3}>
              <Chip label={language === 'de' ? 'Unternehmen' : 'Workplace'} color="default" sx={{ backgroundColor: 'rgba(255,255,255,0.2)', alignSelf: 'flex-start' }} />
              <Typography variant="h4" sx={{ fontWeight: 800 }}>{selectedContent.corporateHeading}</Typography>
              <Typography variant="h6" sx={{ opacity: 0.88 }}>{selectedContent.corporateSubtitle}</Typography>
              <Stack spacing={2}>
                {selectedContent.corporateBenefits.map((benefit) => (
                  <Stack key={benefit} direction="row" spacing={2} alignItems="flex-start">
                    <CheckCircleOutlineIcon sx={{ color: '#41b3a3', mt: 0.5 }} />
                    <Typography variant="body1" sx={{ lineHeight: 1.7 }}>{benefit}</Typography>
                  </Stack>
                ))}
              </Stack>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <Button component={RouterLink} to="/register" variant="contained" size="large" color="secondary" endIcon={<ArrowForwardIcon />} sx={{ borderRadius: 3 }}>
                  {selectedContent.heroPrimaryCta}
                </Button>
                <Button component={RouterLink} to="/kontakt" variant="outlined" size="large" sx={{ borderRadius: 3, borderColor: 'rgba(255,255,255,0.6)', color: '#fff' }}>
                  {selectedContent.finalSecondaryCta}
                </Button>
              </Stack>
            </Stack>
            <Card sx={{ backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 4, boxShadow: '0 20px 40px rgba(0,0,0,0.35)' }}>
              <CardMedia
                component="img"
                image="https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1200&q=80"
                alt="Team Session"
                sx={{ borderTopLeftRadius: 16, borderTopRightRadius: 16, height: { xs: 260, md: 360 }, objectFit: 'cover' }}
              />
              <CardContent sx={{ color: '#fff' }}>
                <Typography variant="subtitle1" sx={{ opacity: 0.85 }}>
                  {language === 'de' ? 'Geführte Active Breaks steigern Produktivität und Wohlbefinden innerhalb weniger Wochen.' : 'Guided active breaks elevate productivity and wellbeing in just a few weeks.'}
                </Typography>
              </CardContent>
            </Card>
          </Box>
        </Container>
      </Box>

      <Box id={selectedContent.medicalId} sx={{ background: 'linear-gradient(135deg, #ffffff 0%, #f2f7ff 100%)' }}>
        <Container maxWidth="lg" sx={{ py: { xs: 8, md: 10 } }}>
          <Box
            sx={{
              display: 'grid',
              gap: 6,
              alignItems: 'center',
              gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }
            }}
          >
            <Stack spacing={3}>
              <Chip label={language === 'de' ? 'Medizin & Pflege' : 'Healthcare'} color="primary" sx={{ alignSelf: 'flex-start' }} />
              <Typography variant="h4" sx={{ fontWeight: 800, color: palette.primaryText }}>{selectedContent.medicalHeading}</Typography>
              <Typography variant="h6" sx={{ color: palette.secondaryText }}>{selectedContent.medicalSubtitle}</Typography>
              <Stack spacing={2}>
                {selectedContent.medicalBenefits.map((benefit) => (
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
                  {language === 'de' ? 'Einsatzmöglichkeiten' : 'Use cases'}
                </Typography>
                <Stack spacing={2}>
                  <Stack direction="row" spacing={2} alignItems="center">
                    <PlayArrowIcon color="primary" />
                    <Typography variant="body1">{language === 'de' ? 'Tele-Reha und Nachsorge mit klaren Protokollen' : 'Tele-rehab and aftercare with structured protocols'}</Typography>
                  </Stack>
                  <Stack direction="row" spacing={2} alignItems="center">
                    <PlayArrowIcon color="primary" />
                    <Typography variant="body1">{language === 'de' ? 'Aktivierungsprogramme in Tagespflege und betreutem Wohnen' : 'Activation programs in day care and assisted living'}</Typography>
                  </Stack>
                  <Stack direction="row" spacing={2} alignItems="center">
                    <PlayArrowIcon color="primary" />
                    <Typography variant="body1">{language === 'de' ? 'Case-Management mit 360° Compliance-Übersicht' : 'Case management with 360° adherence overview'}</Typography>
                  </Stack>
                </Stack>
              </CardContent>
            </Card>
          </Box>
        </Container>
      </Box>

      <Box sx={{ backgroundColor: '#f6f8ff' }}>
        <Container maxWidth="lg" sx={{ py: { xs: 8, md: 10 } }}>
          <Stack spacing={6}>
            <Typography variant="h4" sx={{ textAlign: 'center', fontWeight: 800, color: palette.primaryText }}>{selectedContent.testimonialHeading}</Typography>
            <Box
              sx={{
                display: 'grid',
                gap: 4,
                gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }
              }}
            >
              {selectedContent.testimonials.map((testimonial) => (
                <Card key={testimonial.name} sx={{ height: '100%', borderRadius: 4, boxShadow: '0 10px 30px rgba(17,63,103,0.08)', background: '#fff' }}>
                  <CardContent sx={{ p: 4 }}>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: palette.primaryText }}>
                      “{testimonial.quote}”
                    </Typography>
                    <Typography variant="subtitle1" color="primary">
                      {testimonial.name}
                    </Typography>
                    <Typography variant="body2" sx={{ color: palette.secondaryText }}>
                      {testimonial.role}
                    </Typography>
                  </CardContent>
                </Card>
              ))}
            </Box>
          </Stack>
        </Container>
      </Box>

      <Box id={selectedContent.faqId} sx={{ backgroundColor: '#ffffff' }}>
        <Container maxWidth="md" sx={{ py: { xs: 8, md: 10 } }}>
          <Stack spacing={4} alignItems="center">
            <Typography variant="h4" sx={{ fontWeight: 800, color: palette.primaryText }}>{selectedContent.faqHeading}</Typography>
            <Divider sx={{ width: '100%', maxWidth: 240 }} />
            <Stack spacing={2} width="100%">
              {selectedContent.faqs.map((item, index) => (
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

      <Box sx={{ background: 'linear-gradient(140deg, #0b1d51 0%, #1446a0 50%, #45c4b0 100%)', color: '#fff' }}>
        <Container maxWidth="md" sx={{ py: { xs: 8, md: 10 } }}>
          <Stack spacing={4.5} alignItems="center" textAlign="center">
            <Typography variant="h3" sx={{ fontWeight: 800 }}>{selectedContent.finalCtaHeading}</Typography>
            <Typography variant="h6" sx={{ maxWidth: 640, opacity: 0.92, lineHeight: 1.7 }}>{selectedContent.finalCtaText}</Typography>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <Button component={RouterLink} to="/register" variant="contained" color="secondary" size="large" endIcon={<ArrowForwardIcon />} sx={{ borderRadius: 3 }}>
                {selectedContent.finalPrimaryCta}
              </Button>
              <Button component={RouterLink} to="/kontakt" variant="outlined" size="large" sx={{ borderRadius: 3, borderColor: 'rgba(255,255,255,0.6)', color: '#fff' }}>
                {selectedContent.finalSecondaryCta}
              </Button>
            </Stack>
          </Stack>
        </Container>
      </Box>
    </Box>
  );
};

export default WelcomePage;
