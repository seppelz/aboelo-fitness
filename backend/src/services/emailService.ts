import nodemailer from 'nodemailer';
import { emailConfig, appConfig } from '../config/env';

const ensureTransporter = () => {
  const { host, port, secure, user, pass } = emailConfig;
  if (!host || !user || !pass) {
    console.warn('[emailService] E-Mail-Konfiguration unvollständig. E-Mails werden nicht versendet.');
    return null;
  }

  return nodemailer.createTransport({
    host,
    port,
    secure,
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
    console.info('[emailService] Passwort-Reset-Link (nur Log):', resetUrl);
    return;
  }

  await transporter.sendMail(message);
};
