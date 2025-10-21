import { Request, Response } from 'express';
import { sendContactEmail } from '../services/emailService';

interface ContactFormBody {
  name?: string;
  email?: string;
  subject?: string;
  message?: string;
}

const sanitize = (value: unknown): string => {
  if (typeof value !== 'string') {
    return '';
  }
  return value.trim();
};

export const submitContactForm = async (req: Request, res: Response) => {
  const { name, email, subject, message } = req.body as ContactFormBody;

  const sanitizedName = sanitize(name);
  const sanitizedEmail = sanitize(email).toLowerCase();
  const sanitizedSubject = sanitize(subject);
  const sanitizedMessage = sanitize(message);

  if (!sanitizedName || !sanitizedEmail || !sanitizedMessage) {
    return res.status(400).json({
      success: false,
      message: 'Bitte füllen Sie alle Pflichtfelder aus (Name, E-Mail, Nachricht).',
    });
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(sanitizedEmail)) {
    return res.status(400).json({
      success: false,
      message: 'Bitte geben Sie eine gültige E-Mail-Adresse ein.',
    });
  }

  if (sanitizedMessage.length < 10) {
    return res.status(400).json({
      success: false,
      message: 'Ihre Nachricht sollte mindestens 10 Zeichen enthalten.',
    });
  }

  try {
    await sendContactEmail({
      name: sanitizedName,
      email: sanitizedEmail,
      subject: sanitizedSubject,
      message: sanitizedMessage,
    });

    return res.status(200).json({
      success: true,
      message: 'Vielen Dank! Ihre Nachricht wurde erfolgreich versendet.',
    });
  } catch (error) {
    console.error('[submitContactForm] Fehler beim Versand der Kontaktformular-Nachricht', error);
    return res.status(500).json({
      success: false,
      message: 'Beim Versenden der Nachricht ist ein Fehler aufgetreten. Bitte versuchen Sie es später erneut.',
    });
  }
};
