export const AUTH_COOKIE_NAME = 'aboelo_auth_token';

export const getCookieDomain = () => {
  const customDomain = process.env.COOKIE_DOMAIN;
  if (customDomain && customDomain.trim() !== '') {
    return customDomain.trim();
  }
  return undefined;
};
