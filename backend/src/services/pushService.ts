import webPush, { PushSubscription as WebPushSubscription, WebPushError } from 'web-push';
import { pushConfig, appConfig } from '../config/env';

let isConfigured = false;

const ensureConfigured = () => {
  if (isConfigured) {
    return;
  }

  const { publicKey, privateKey, mailto } = pushConfig;

  if (!publicKey || !privateKey) {
    console.warn('[pushService] VAPID keys are not configured. Push notifications are disabled.');
    return;
  }

  webPush.setVapidDetails(mailto, publicKey, privateKey);
  isConfigured = true;
  console.info('[pushService] VAPID configuration initialised.');
};

export interface PushPayload {
  title: string;
  body: string;
  url?: string;
  icon?: string;
  badge?: string;
  tag?: string;
  data?: Record<string, unknown>;
}

export const sendNotification = async (
  subscription: WebPushSubscription,
  payload: PushPayload
) => {
  ensureConfigured();

  if (!isConfigured) {
    throw new Error('PUSH_NOT_CONFIGURED');
  }

  const resolvedPayload = {
    ...payload,
    data: {
      ...payload.data,
      url: payload.url || payload.data?.url || appConfig.frontendBaseUrl,
    },
  };

  const message = JSON.stringify(resolvedPayload);

  return webPush.sendNotification(subscription, message).catch((error: WebPushError) => {
    console.error('[pushService] Failed to send notification', {
      endpoint: subscription.endpoint,
      statusCode: error?.statusCode,
      body: error?.body,
    });
    throw error;
  });
};

export const testNotificationPayload: PushPayload = {
  title: 'aboelo-fitness Aktivpause',
  body: 'Test-Erinnerung: So sehen deine zukünftigen Aktivpausen-Benachrichtigungen aus.',
  url: appConfig.frontendBaseUrl,
  tag: 'aboelo-activity-reminder',
};
