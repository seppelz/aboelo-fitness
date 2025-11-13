declare global {
  interface Window {
    dataLayer: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

let measurementIdCache: string | null = null;

const ensureGtagFunction = () => {
  if (!window.dataLayer) {
    window.dataLayer = [];
  }

  if (!window.gtag) {
    window.gtag = (...args: unknown[]) => {
      window.dataLayer.push(args);
    };
  }
};

const safeGtag = (...args: unknown[]) => {
  if (typeof window !== 'undefined') {
    ensureGtagFunction();
    window.gtag?.(...args);
  }
};

export const initializeAnalytics = (measurementId?: string) => {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return;
  }

  if (!measurementId) {
    console.warn('[Analytics] Missing GA measurement ID. Skipping initialization.');
    return;
  }

  if (measurementIdCache === measurementId && window.gtag) {
    return;
  }

  measurementIdCache = measurementId;

  ensureGtagFunction();

  const scriptSrc = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
  const existingScript = document.querySelector(`script[src="${scriptSrc}"]`);

  if (!existingScript) {
    const script = document.createElement('script');
    script.async = true;
    script.src = scriptSrc;
    document.head.appendChild(script);
  }

  safeGtag('js', new Date());
  safeGtag('config', measurementId, { anonymize_ip: true });
};

export const trackPageView = (path: string) => {
  if (typeof window === 'undefined' || !measurementIdCache) {
    return;
  }

  safeGtag('config', measurementIdCache, {
    page_path: path,
  });
};

export const trackEvent = (action: string, params: Record<string, unknown> = {}) => {
  if (typeof window === 'undefined' || !measurementIdCache) {
    return;
  }

  safeGtag('event', action, params);
};
