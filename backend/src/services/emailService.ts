import nodemailer from 'nodemailer';
import axios from 'axios';
import { emailConfig, appConfig } from '../config/env';

// Email sending methods
type EmailMethod = 'mailerlite' | 'smtp';

const getEmailMethod = (): EmailMethod => {
  // Prefer MailerLite API if token is configured
  if (emailConfig.mailerliteApiToken) {
    return 'mailerlite';
  }
  return 'smtp';
};

const logEmailConfig = () => {
  const method = getEmailMethod();
  console.info('[emailService] Aktuelle E-Mail-Konfiguration:', {
    method,
    host: emailConfig.host,
    port: emailConfig.port,
    secure: emailConfig.secure,
    userDefined: Boolean(emailConfig.user),
    passDefined: Boolean(emailConfig.pass),
    fromAddress: emailConfig.from,
    mailerliteConfigured: Boolean(emailConfig.mailerliteApiToken),
    // Log environment variables directly for debugging
    envVars: {
      EMAIL_HOST: process.env.EMAIL_HOST ? 'SET' : 'NOT SET',
      EMAIL_PORT: process.env.EMAIL_PORT ? 'SET' : 'NOT SET',
      EMAIL_SECURE: process.env.EMAIL_SECURE ? 'SET' : 'NOT SET',
      EMAIL_USER: process.env.EMAIL_USER ? 'SET' : 'NOT SET',
      EMAIL_PASSWORD: process.env.EMAIL_PASSWORD ? 'SET' : 'NOT SET',
      EMAIL_FROM: process.env.EMAIL_FROM ? 'SET' : 'NOT SET',
      MAILERLITE_API_TOKEN: process.env.MAILERLITE_API_TOKEN ? 'SET' : 'NOT SET',
    }
  });
};

const ensureTransporter = () => {
  console.info('[emailService] Initialisiere E-Mail-Transporter...');
  logEmailConfig();
  
  const { host, port, secure, user, pass } = emailConfig;
  if (!host || !user || !pass) {
    console.error('[emailService] E-Mail-Konfiguration unvollständig. Host/User/Pass müssen gesetzt sein.', {
      host: host || 'MISSING',
      port,
      secure,
      userDefined: Boolean(user),
      passDefined: Boolean(pass),
    });
    return null;
  }

  return nodemailer.createTransport({
    host,
    port,
    secure,
    connectionTimeout: 15000,
    greetingTimeout: 15000,
    logger: true,
    debug: true,
    auth: {
      user,
      pass,
    },
  });
};

const getTransporter = (() => {
  let cached: nodemailer.Transporter | null | undefined;
  return () => {
    if (cached === undefined) {
      cached = ensureTransporter();
    }
    return cached;
  };
})();

// MailerLite API email sending
const sendViaMailerLite = async (to: string, subject: string, htmlContent: string, textContent: string) => {
  const { mailerliteApiToken, mailerliteApiUrl, from } = emailConfig;
  
  if (!mailerliteApiToken) {
    throw new Error('MAILERLITE_API_TOKEN not configured');
  }

  try {
    console.info('[emailService] Sende E-Mail via MailerLite API...', { to, subject });
    
    const response = await axios.post(
      `${mailerliteApiUrl}/email`,
      {
        to: [{ email: to }],
        from: { email: from || 'info@aboelo.de', name: 'Aboelo Fitness' },
        subject,
        html: htmlContent,
        text: textContent,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${mailerliteApiToken}`,
        },
      }
    );

    console.info('[emailService] E-Mail via MailerLite erfolgreich versendet', {
      status: response.status,
      data: response.data,
    });

    return response.data;
  } catch (error: any) {
    console.error('[emailService] MailerLite API Fehler:', {
      message: error?.message,
      response: error?.response?.data,
      status: error?.response?.status,
    });
    throw error;
  }
};

export const sendPasswordResetEmail = async (recipientEmail: string, token: string) => {
  const resetUrl = `${appConfig.frontendBaseUrl.replace(/\/?$/, '')}/reset-password?token=${encodeURIComponent(token)}`;
  const method = getEmailMethod();

  console.info('[emailService] Versand Passwort-Reset-Link vorbereitet', {
    recipientEmail,
    resetUrl,
    method,
  });

  const subject = 'aboelo-fitness | Passwort zurücksetzen';
  const textContent = `Hallo!\n\nSie haben eine Zurücksetzung Ihres Passworts angefordert. Klicken Sie auf den folgenden Link, um ein neues Passwort zu vergeben:\n\n${resetUrl}\n\nWenn Sie diese Anfrage nicht gestellt haben, können Sie diese E-Mail ignorieren.\n\nViele Grüße\nIhr aboelo-fitness Team`;
  const htmlContent = `<p>Hallo!</p>
<p>Sie haben eine Zurücksetzung Ihres Passworts angefordert. Klicken Sie auf den folgenden Link, um ein neues Passwort zu vergeben:</p>
<p><a href="${resetUrl}">${resetUrl}</a></p>
<p>Wenn Sie diese Anfrage nicht gestellt haben, können Sie diese E-Mail ignorieren.</p>
<p>Viele Grüße<br/>Ihr aboelo-fitness Team</p>`;

  // Use MailerLite API if configured
  if (method === 'mailerlite') {
    try {
      return await sendViaMailerLite(recipientEmail, subject, htmlContent, textContent);
    } catch (error: any) {
      console.error('[emailService] Versand der Passwort-Reset-E-Mail fehlgeschlagen.');
      console.error('[emailService] Error:', error?.message);
      throw error;
    }
  }

  // Fall back to SMTP
  const transporter = getTransporter();
  const message = {
    from: emailConfig.from,
    to: recipientEmail,
    subject,
    text: textContent,
    html: htmlContent,
  };

  if (!transporter) {
    console.error('[emailService] Kein Transporter verfügbar, E-Mail wird nicht versendet. Passwort-Reset-Link folgt im Log.');
    console.info('[emailService] Passwort-Reset-Link (nur Log):', resetUrl);
    throw new Error('EMAIL_TRANSPORTER_NOT_INITIALISED');
  }

  try {
    console.info('[emailService] SMTP-Verbindung wird verifiziert...');
    const verifyStart = Date.now();
    await transporter.verify();
    console.info('[emailService] SMTP-Verifizierung erfolgreich', {
      durationMs: Date.now() - verifyStart,
    });

    console.info('[emailService] Sende E-Mail...', {
      from: message.from,
      to: message.to,
      subject: message.subject
    });
    
    const result = await transporter.sendMail(message);
    console.info('[emailService] Passwort-Reset-E-Mail erfolgreich versendet.', {
      messageId: result.messageId,
      accepted: result.accepted,
      rejected: result.rejected,
      response: result.response,
    });
    
    return result;
  } catch (error: any) {
    console.error('[emailService] Versand der Passwort-Reset-E-Mail fehlgeschlagen.');
    console.error('[emailService] Error name:', error?.name);
    console.error('[emailService] Error message:', error?.message);
    console.error('[emailService] Error code:', error?.code);
    console.error('[emailService] Error command:', error?.command);
    console.error('[emailService] Full error:', error);
    throw error;
  }
};

interface ContactEmailPayload {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export const sendWelcomeEmail = async (recipientEmail: string, userName: string) => {
  const method = getEmailMethod();
  const loginUrl = `${appConfig.frontendBaseUrl.replace(/\/?$/, '')}/login`;

  const subject = 'Willkommen bei aboelo-fitness! 🎉';
  const textContent = `Hallo ${userName}!\n\nHerzlich willkommen bei aboelo-fitness! Wir freuen uns, dass Sie dabei sind.\n\nSie können sich jetzt unter ${loginUrl} anmelden und mit Ihrem Trainingsprogramm beginnen.\n\nViel Erfolg und bleiben Sie aktiv!\n\nIhr aboelo-fitness Team`;
  const htmlContent = `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #2d7d7d;">Willkommen bei aboelo-fitness! 🎉</h2>
      <p>Hallo ${userName}!</p>
      <p>Herzlich willkommen bei aboelo-fitness! Wir freuen uns, dass Sie dabei sind.</p>
      <p>Sie können sich jetzt anmelden und mit Ihrem Trainingsprogramm beginnen:</p>
      <p style="text-align: center; margin: 30px 0;">
        <a href="${loginUrl}" style="background-color: #2d7d7d; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">Jetzt anmelden</a>
      </p>
      <p>Viel Erfolg und bleiben Sie aktiv!</p>
      <p>Ihr aboelo-fitness Team</p>
    </div>`;

  // Use MailerLite API if configured
  if (method === 'mailerlite') {
    try {
      return await sendViaMailerLite(recipientEmail, subject, htmlContent, textContent);
    } catch (error: any) {
      console.error('[emailService] Versand der Willkommens-E-Mail fehlgeschlagen.');
      console.error('[emailService] Error:', error?.message);
      // Don't throw - registration should succeed even if email fails
      return;
    }
  }

  // Fall back to SMTP
  const transporter = getTransporter();
  if (!transporter) {
    console.error('[emailService] Kein Transporter verfügbar, Willkommens-E-Mail wird nicht versendet.');
    // Don't throw - registration should succeed even if email fails
    return;
  }

  const message = {
    from: emailConfig.from,
    to: recipientEmail,
    subject,
    text: textContent,
    html: htmlContent,
  };

  try {
    console.info('[emailService] Sende Willkommens-E-Mail...', {
      to: recipientEmail,
      subject: message.subject
    });

    await transporter.verify();
    const result = await transporter.sendMail(message);
    
    console.info('[emailService] Willkommens-E-Mail erfolgreich versendet.', {
      messageId: result.messageId,
      accepted: result.accepted,
    });
    
    return result;
  } catch (error: any) {
    console.error('[emailService] Versand der Willkommens-E-Mail fehlgeschlagen.');
    console.error('[emailService] Error:', error?.message);
    // Don't throw - registration should succeed even if email fails
  }
};

export const sendContactEmail = async ({ name, email, subject, message }: ContactEmailPayload) => {
  const method = getEmailMethod();

  const recipient = process.env.CONTACT_FORM_TO?.trim() || emailConfig.from || emailConfig.user;
  const sanitizedRecipient = recipient && recipient.trim().length > 0 ? recipient : 'info@aboelo.de';
  const trimmedSubject = subject?.trim() ?? '';
  const finalSubject = trimmedSubject.length > 0 ? trimmedSubject : 'Kontaktformular-Anfrage';
  const emailSubject = `Kontaktformular | ${finalSubject}`;
  const textBody = `Kontaktformular-Eingang\n\nName: ${name}\nE-Mail: ${email}\n\nBetreff: ${finalSubject}\n\nNachricht:\n${message}`;
  const htmlBody = `<p><strong>Kontaktformular-Eingang</strong></p>
<p><strong>Name:</strong> ${name}<br/>
<strong>E-Mail:</strong> ${email}</p>
<p><strong>Betreff:</strong> ${finalSubject}</p>
<p>${message.replace(/\n/g, '<br/>')}</p>`;

  // Use MailerLite API if configured
  if (method === 'mailerlite') {
    try {
      console.info('[emailService] Sende Kontaktformular-E-Mail via MailerLite...', {
        to: sanitizedRecipient,
        replyTo: email,
        subject: emailSubject,
      });
      return await sendViaMailerLite(sanitizedRecipient, emailSubject, htmlBody, textBody);
    } catch (error: any) {
      console.error('[emailService] Versand der Kontaktformular-E-Mail fehlgeschlagen.');
      console.error('[emailService] Error:', error?.message);
      throw error;
    }
  }

  // Fall back to SMTP
  const transporter = getTransporter();
  if (!transporter) {
    console.error('[emailService] Kein Transporter verfügbar, Kontaktanfrage wird nicht versendet.');
    throw new Error('EMAIL_TRANSPORTER_NOT_INITIALISED');
  }

  try {
    console.info('[emailService] Sende Kontaktformular-E-Mail...', {
      to: sanitizedRecipient,
      replyTo: email,
      subject: finalSubject,
    });

    const verifyStart = Date.now();
    await transporter.verify();
    console.info('[emailService] SMTP-Verifizierung für Kontaktformular erfolgreich', {
      durationMs: Date.now() - verifyStart,
    });

    const result = await transporter.sendMail({
      from: emailConfig.from,
      to: sanitizedRecipient,
      subject: emailSubject,
      replyTo: email,
      text: textBody,
      html: htmlBody,
    });

    console.info('[emailService] Kontaktformular-E-Mail erfolgreich versendet.', {
      messageId: result.messageId,
      accepted: result.accepted,
      rejected: result.rejected,
      response: result.response,
    });

    return result;
  } catch (error: any) {
    console.error('[emailService] Versand der Kontaktformular-E-Mail fehlgeschlagen.');
    console.error('[emailService] Error name:', error?.name);
    console.error('[emailService] Error message:', error?.message);
    console.error('[emailService] Error code:', error?.code);
    console.error('[emailService] Error command:', error?.command);
    console.error('[emailService] Full error:', error);
    throw error;
  }
};
