import nodemailer from 'nodemailer';
import { emailConfig, appConfig } from '../config/env';

const logEmailConfig = () => {
  console.info('[emailService] Aktuelle E-Mail-Konfiguration:', {
    host: emailConfig.host,
    port: emailConfig.port,
    secure: emailConfig.secure,
    userDefined: Boolean(emailConfig.user),
    fromAddress: emailConfig.from,
  });
};

const ensureTransporter = () => {
  const { host, port, secure, user, pass } = emailConfig;
  if (!host || !user || !pass) {
    console.error('[emailService] E-Mail-Konfiguration unvollständig. Host/User/Pass müssen gesetzt sein.', {
      host,
      userDefined: Boolean(user),
      passDefined: Boolean(pass),
    });
    return null;
  }

  logEmailConfig();

  return nodemailer.createTransport({
    host,
    port,
    secure,
    requireTLS: !secure,
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

    const result = await transporter.sendMail(message);
    console.info('[emailService] Passwort-Reset-E-Mail erfolgreich versendet.', {
      messageId: result.messageId,
      accepted: result.accepted,
      rejected: result.rejected,
      response: result.response,
    });
  } catch (error) {
    console.error('[emailService] Versand der Passwort-Reset-E-Mail fehlgeschlagen.', error);
    throw error;
  }
};
