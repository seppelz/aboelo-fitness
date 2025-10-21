import nodemailer from 'nodemailer';
import { emailConfig, appConfig } from '../config/env';

const logEmailConfig = () => {
  console.info('[emailService] Aktuelle E-Mail-Konfiguration:', {
    host: emailConfig.host,
    port: emailConfig.port,
    secure: emailConfig.secure,
    userDefined: Boolean(emailConfig.user),
    passDefined: Boolean(emailConfig.pass),
    fromAddress: emailConfig.from,
    // Log environment variables directly for debugging
    envVars: {
      EMAIL_HOST: process.env.EMAIL_HOST ? 'SET' : 'NOT SET',
      EMAIL_PORT: process.env.EMAIL_PORT ? 'SET' : 'NOT SET',
      EMAIL_SECURE: process.env.EMAIL_SECURE ? 'SET' : 'NOT SET',
      EMAIL_USER: process.env.EMAIL_USER ? 'SET' : 'NOT SET',
      EMAIL_PASSWORD: process.env.EMAIL_PASSWORD ? 'SET' : 'NOT SET',
      EMAIL_FROM: process.env.EMAIL_FROM ? 'SET' : 'NOT SET',
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

export const sendPasswordResetEmail = async (recipientEmail: string, token: string) => {
  const transporter = getTransporter();
  const resetUrl = `${appConfig.frontendBaseUrl.replace(/\/?$/, '')}/reset-password?token=${encodeURIComponent(token)}`;

  console.info('[emailService] Versand Passwort-Reset-Link vorbereitet', {
    recipientEmail,
    resetUrl,
    transporterAvailable: Boolean(transporter),
  });

  const message = {
    from: emailConfig.from,
    to: recipientEmail,
    subject: 'aboelo-fitness | Passwort zurücksetzen',
    text: `Hallo!\n\nSie haben eine Zurücksetzung Ihres Passworts angefordert. Klicken Sie auf den folgenden Link, um ein neues Passwort zu vergeben:\n\n${resetUrl}\n\nWenn Sie diese Anfrage nicht gestellt haben, können Sie diese E-Mail ignorieren.\n\nViele Grüße\nIhr aboelo-fitness Team`,
    html: `<p>Hallo!</p>
<p>Sie haben eine Zurücksetzung Ihres Passworts angefordert. Klicken Sie auf den folgenden Link, um ein neues Passwort zu vergeben:</p>
<p><a href="${resetUrl}">${resetUrl}</a></p>
<p>Wenn Sie diese Anfrage nicht gestellt haben, können Sie diese E-Mail ignorieren.</p>
<p>Viele Grüße<br/>Ihr aboelo-fitness Team</p>`,
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

export const sendContactEmail = async ({ name, email, subject, message }: ContactEmailPayload) => {
  const transporter = getTransporter();
  if (!transporter) {
    console.error('[emailService] Kein Transporter verfügbar, Kontaktanfrage wird nicht versendet.');
    throw new Error('EMAIL_TRANSPORTER_NOT_INITIALISED');
  }

  const recipient = process.env.CONTACT_FORM_TO?.trim() || emailConfig.from || emailConfig.user;
  const sanitizedRecipient = recipient && recipient.trim().length > 0 ? recipient : 'info@aboelo.de';
  const trimmedSubject = subject?.trim() ?? '';
  const finalSubject = trimmedSubject.length > 0 ? trimmedSubject : 'Kontaktformular-Anfrage';
  const textBody = `Kontaktformular-Eingang\n\nName: ${name}\nE-Mail: ${email}\n\nBetreff: ${finalSubject}\n\nNachricht:\n${message}`;
  const htmlBody = `<p><strong>Kontaktformular-Eingang</strong></p>
<p><strong>Name:</strong> ${name}<br/>
<strong>E-Mail:</strong> ${email}</p>
<p><strong>Betreff:</strong> ${finalSubject}</p>
<p>${message.replace(/\n/g, '<br/>')}</p>`;

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
      subject: `Kontaktformular | ${finalSubject}`,
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
