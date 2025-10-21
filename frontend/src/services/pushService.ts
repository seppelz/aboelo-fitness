import api from './api';

const getEnvString = (value?: string | null): string | undefined => {
  if (typeof value !== 'string') {
    return undefined;
  }
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
};

export const getPushPublicKey = (): string | undefined => {
  return (
    getEnvString(process.env.REACT_APP_PUSH_VAPID_KEY) ||
    getEnvString(process.env.NEXT_PUBLIC_PUSH_VAPID_KEY)
  );
};

export const registerPushSubscription = async (subscription: PushSubscription) => {
  const payload = typeof subscription.toJSON === 'function' ? subscription.toJSON() : subscription;
  await api.post('/push/subscribe', {
    subscription: payload,
  });
};

export const unregisterPushSubscription = async (subscription: PushSubscription | string) => {
  const endpoint = typeof subscription === 'string'
    ? subscription
    : subscription.endpoint;

  if (!endpoint) {
    return;
  }

  await api.post('/push/unsubscribe', { endpoint });
};

export const sendTestPushNotification = async () => {
  await api.post('/push/test');
};
