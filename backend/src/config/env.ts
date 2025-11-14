import dotenv from 'dotenv';
import type { Secret, SignOptions } from 'jsonwebtoken';

// Ensure environment variables from .env are loaded before access
dotenv.config();

const ensureEnv = (key: string, fallback?: string): string => {
  const rawValue = process.env[key];
  const value = rawValue && rawValue.trim() !== '' ? rawValue.trim() : undefined;

  if (value) {
    return value;
  }

  if (fallback !== undefined) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error(`Environment variable ${key} is required in production deployments.`);
    }
    console.warn(`Environment variable ${key} is not set. Using fallback value. This must be changed for production deployments.`);
    return fallback;
  }

  throw new Error(`Environment variable ${key} is required but was not provided.`);
};

const getOptionalEnv = (key: string): string | undefined => {
  const value = process.env[key];
  if (typeof value !== 'string') {
    return undefined;
  }
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
};

export const jwtConfig: {
  secret: Secret;
  expiresIn: SignOptions['expiresIn'];
} = {
  secret: ensureEnv('JWT_SECRET', 'dev-secret-change-me'),
  expiresIn: (process.env.JWT_EXPIRES_IN && process.env.JWT_EXPIRES_IN.trim() !== ''
    ? process.env.JWT_EXPIRES_IN
    : '12h') as SignOptions['expiresIn'],
};

export const rateLimitConfig = {
  login: {
    windowMs: Number(process.env.RATE_LIMIT_LOGIN_WINDOW_MS) || 15 * 60 * 1000,
    max: Number(process.env.RATE_LIMIT_LOGIN_MAX) || 20,
  },
  general: {
    windowMs: Number(process.env.RATE_LIMIT_GENERAL_WINDOW_MS) || 15 * 60 * 1000,
    max: Number(process.env.RATE_LIMIT_GENERAL_MAX) || 500,
  },
  passwordReset: {
    windowMs: Number(process.env.RATE_LIMIT_PASSWORD_RESET_WINDOW_MS) || 60 * 60 * 1000,
    max: Number(process.env.RATE_LIMIT_PASSWORD_RESET_MAX) || 5,
  },
};

export const cookieConfig = {
  domain: process.env.COOKIE_DOMAIN?.trim() || undefined,
  secure: process.env.COOKIE_SECURE === 'true' || process.env.NODE_ENV === 'production',
  sameSite: (process.env.COOKIE_SAMESITE as 'lax' | 'strict' | 'none' | undefined) || 'lax',
  path: '/',
  httpOnly: true,
  maxAgeMs: Number(process.env.COOKIE_MAX_AGE_MS) || 12 * 60 * 60 * 1000,
};

export const csrfConfig = {
  cookieName: process.env.CSRF_COOKIE_NAME || 'aboelo_csrf_token',
  headerName: process.env.CSRF_HEADER_NAME || 'x-csrf-token',
  secretCookieName: process.env.CSRF_SECRET_COOKIE_NAME || 'aboelo_csrf_secret',
};

export const httpsConfig = {
  enabled: process.env.HTTPS_ENABLED === 'true',
  keyPath: process.env.HTTPS_KEY_PATH?.trim(),
  certPath: process.env.HTTPS_CERT_PATH?.trim(),
  passphrase: process.env.HTTPS_PASSPHRASE?.trim(),
};

export const emailConfig = {
  host: process.env.EMAIL_HOST?.trim(),
  port: process.env.EMAIL_PORT ? Number(process.env.EMAIL_PORT) : 587,
  secure: process.env.EMAIL_SECURE === 'true',
  user: process.env.EMAIL_USER?.trim(),
  pass: process.env.EMAIL_PASSWORD?.trim(),
  from: process.env.EMAIL_FROM?.trim() || 'no-reply@aboelo-fitness.de',
  // MailerSend API configuration
  mailersendApiToken: process.env.MAILERSEND_API_TOKEN?.trim(),
  mailersendApiUrl: process.env.MAILERSEND_API_URL?.trim() || 'https://api.mailersend.com',
};

export const appConfig = {
  frontendBaseUrl: process.env.FRONTEND_BASE_URL?.trim() || 'https://fitness.aboelo.de',
};

export const pushConfig = {
  publicKey: getOptionalEnv('PUSH_VAPID_PUBLIC_KEY'),
  privateKey: getOptionalEnv('PUSH_VAPID_PRIVATE_KEY'),
  mailto: getOptionalEnv('PUSH_VAPID_MAILTO') || 'mailto:info@aboelo.de',
  jobToken: getOptionalEnv('PUSH_JOB_TOKEN'),
};
