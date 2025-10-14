import { Response } from 'express';
import { cookieConfig } from '../config/env';
import { AUTH_COOKIE_NAME } from '../constants/auth';

export const setAuthCookie = (res: Response, token: string) => {
  res.cookie(AUTH_COOKIE_NAME, token, {
    httpOnly: cookieConfig.httpOnly,
    secure: cookieConfig.secure,
    sameSite: cookieConfig.sameSite,
    domain: cookieConfig.domain,
    path: cookieConfig.path,
    maxAge: cookieConfig.maxAgeMs,
  });
};

export const clearAuthCookie = (res: Response) => {
  res.clearCookie(AUTH_COOKIE_NAME, {
    httpOnly: cookieConfig.httpOnly,
    secure: cookieConfig.secure,
    sameSite: cookieConfig.sameSite,
    domain: cookieConfig.domain,
    path: cookieConfig.path,
  });
};
