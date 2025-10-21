import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { getPushPublicKey, registerPushSubscription, unregisterPushSubscription, sendTestPushNotification } from '../services/pushService';

type PushSupportStatus = 'unknown' | 'unsupported' | 'missing-key' | 'ready';

const decodeBase64 = (input: string): string => {
  if (typeof window !== 'undefined' && typeof window.atob === 'function') {
    return window.atob(input);
  }

  if (typeof globalThis !== 'undefined' && typeof (globalThis as any).Buffer !== 'undefined') {
    return (globalThis as any).Buffer.from(input, 'base64').toString('binary');
  }

  throw new Error('Base64 decoding is not supported in this environment.');
};

const base64UrlToUint8Array = (base64Url: string): Uint8Array => {
  const padding = '='.repeat((4 - (base64Url.length % 4)) % 4);
  const base64 = (base64Url + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = decodeBase64(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; i += 1) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
};

type ReminderExerciseInfo = {
  title: string;
  url: string;
  muscleGroup?: string;
};

type ReminderContent = {
  title: string;
  body: string;
  url?: string;
};

type ReminderConfig = {
  enabled: boolean;
  intervalMinutes: number;
  fetchNextExercise?: () => Promise<ReminderExerciseInfo | null>;
};

interface UseActivityReminderResult {
  supportsNotifications: boolean;
  permission: NotificationPermission;
  requestPermission: () => Promise<NotificationPermission>;
  triggerTestReminder: () => Promise<void>;
  permissionRequested: boolean;
  permissionMessage: string;
  subscriptionStatus: PushSupportStatus;
  isSubscribed: boolean;
  subscribeToPush: () => Promise<boolean>;
  unsubscribeFromPush: () => Promise<void>;
}

const REMINDER_TITLE = 'Zeit für deine Aktivpause!';
const REMINDER_BODY = 'Steh kurz auf, bewege dich 1–2 Minuten und starte deine nächste Übung.';
const TEST_TITLE = 'Test-Erinnerung';
const TEST_BODY = 'So sieht deine Aktivpausen-Erinnerung aus. Klicke, um die nächste Übung zu öffnen.';

export const useActivityReminder = ({ enabled, intervalMinutes, fetchNextExercise }: ReminderConfig): UseActivityReminderResult => {
  const supportsNotifications = typeof window !== 'undefined' && 'Notification' in window;
  const supportsServiceWorker = typeof window !== 'undefined' && 'serviceWorker' in navigator;
  const supportsPushManager = typeof window !== 'undefined' && 'PushManager' in window;
  const vapidKey = useMemo(() => getPushPublicKey(), []);
  const [permission, setPermission] = useState<NotificationPermission>(() => {
    if (!supportsNotifications) {
      return 'default';
    }
    return Notification.permission;
  });
  const [subscriptionStatus, setSubscriptionStatus] = useState<PushSupportStatus>('unknown');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [permissionRequested, setPermissionRequested] = useState(false);

  const permissionMessage = useMemo(() => {
    if (!supportsNotifications) {
      return 'Dieser Browser unterstützt keine Benachrichtigungen. Wir zeigen dir stattdessen Hinweisfenster an.';
    }

    if (!supportsServiceWorker || !supportsPushManager) {
      return 'Push-Benachrichtigungen werden von diesem Browser nicht unterstützt.';
    }

    if (!vapidKey) {
      return 'Push-Benachrichtigungen sind derzeit nicht verfügbar (Konfiguration fehlt).';
    }

    if (permission === 'granted') {
      return isSubscribed
        ? 'Super! Push-Benachrichtigungen sind aktiviert.'
        : 'Benachrichtigungen sind erlaubt. Aktiviere Push-Benachrichtigungen, um Erinnerungen zu erhalten.';
    }

    if (permission === 'denied') {
      return 'Benachrichtigungen sind blockiert. Du kannst sie in den Seiteneinstellungen deines Browsers aktivieren.';
    }

    if (permissionRequested) {
      return 'Wir warten auf deine Entscheidung im Browser-Popup.';
    }

    return 'Erlaube Browser-Benachrichtigungen, damit wir dich an Aktivpausen erinnern können.';
  }, [supportsNotifications, supportsServiceWorker, supportsPushManager, vapidKey, permission, permissionRequested, isSubscribed]);

  const timerRef = useRef<number | null>(null);

  const clearReminder = useCallback(() => {
    if (timerRef.current !== null && typeof window !== 'undefined') {
      console.debug('[Reminder] Clearing existing reminder timer');
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const getReminderContent = useCallback(
    async (isTest: boolean): Promise<ReminderContent> => {
      const defaultContent: ReminderContent = {
        title: isTest ? TEST_TITLE : REMINDER_TITLE,
        body: isTest ? TEST_BODY : REMINDER_BODY,
      };

      if (!fetchNextExercise) {
        return defaultContent;
      }

      try {
        const nextExercise = await fetchNextExercise();
        if (nextExercise) {
          const muscleSuffix = nextExercise.muscleGroup ? ` (${nextExercise.muscleGroup})` : '';
          return {
            title: isTest ? `Test: Nächste Übung${muscleSuffix}` : `Zeit für deine nächste Übung${muscleSuffix}`,
            body: `Steh kurz auf und starte jetzt "${nextExercise.title}". Klicke hier, um direkt zur Übung zu springen.`,
            url: nextExercise.url,
          };
        }
      } catch (error) {
        console.error('[Reminder] Failed to prepare next exercise', error);
      }

      return defaultContent;
    },
    [fetchNextExercise]
  );

  const triggerReminder = useCallback(
    async (isTest: boolean) => {
      const content = await getReminderContent(isTest);

      if (!supportsNotifications) {
        if (typeof window !== 'undefined') {
          window.alert(`${content.title}\n${content.body}`);
        }
        return;
      }

      try {
        const notification = new Notification(content.title, {
          body: content.body,
          data: content.url ? { url: content.url } : undefined,
        });

        if (content.url) {
          const targetUrl = content.url;
          const handleClick = (event?: Event) => {
            try {
              event?.preventDefault?.();
              window.focus();
              window.location.assign(targetUrl);
            } catch (error) {
              console.error('[Reminder] Failed to navigate to exercise', error);
            } finally {
              notification.close();
            }
          };

          notification.onclick = handleClick;
          notification.addEventListener('click', handleClick);
        }
      } catch (error) {
        console.error('Failed to show notification', error);
      }
    },
    [getReminderContent, supportsNotifications]
  );

  useEffect(() => {
    if (!supportsNotifications) {
      return;
    }

    if (!enabled || permission !== 'granted') {
      clearReminder();
      return;
    }

    const intervalMs = Math.max(1, intervalMinutes) * 60 * 1000;
    if (typeof window === 'undefined') {
      return;
    }

    clearReminder();
    timerRef.current = window.setInterval(() => {
      void triggerReminder(false);
    }, intervalMs);
    console.debug('[Reminder] Interval scheduled in ms', intervalMs);

    return clearReminder;
  }, [supportsNotifications, enabled, permission, intervalMinutes, triggerReminder, clearReminder]);

  useEffect(() => {
    if (!supportsNotifications) {
      return;
    }

    if (enabled && permission === 'default') {
      Notification.requestPermission().then(setPermission).catch((error) => {
        console.error('Notification permission request failed', error);
      });
    }
  }, [enabled, permission, supportsNotifications]);

  useEffect(() => {
    if (permission === 'granted' || permission === 'denied') {
      setPermissionRequested(false);
    }
  }, [permission]);

  const requestPermission = useCallback(async () => {
    if (!supportsNotifications) {
      return 'denied';
    }

    if (permission !== 'default') {
      return permission;
    }

    try {
      setPermissionRequested(true);
      const result = await Notification.requestPermission();
      setPermission(result);
      if (result === 'granted') {
        console.info('[Reminder] Notification permission granted');
      } else if (result === 'denied') {
        console.warn('[Reminder] Notification permission denied by user');
      }
      return result;
    } catch (error) {
      console.error('Notification permission request failed', error);
      return 'denied';
    }
  }, [permission, supportsNotifications]);

  const ensureServiceWorkerRegistration = useCallback(async (): Promise<ServiceWorkerRegistration | null> => {
    if (!supportsServiceWorker || !supportsPushManager) {
      return null;
    }

    try {
      const registration = await navigator.serviceWorker.getRegistration();
      if (registration) {
        return registration;
      }

      return await navigator.serviceWorker.register('/service-worker.js');
    } catch (error) {
      console.error('[Reminder] Failed to obtain service worker registration', error);
      return null;
    }
  }, [supportsServiceWorker, supportsPushManager]);

  const subscribeToPush = useCallback(async () => {
    if (!supportsNotifications || !supportsServiceWorker || !supportsPushManager) {
      setSubscriptionStatus('unsupported');
      return false;
    }

    if (!vapidKey) {
      setSubscriptionStatus('missing-key');
      return false;
    }

    try {
      const registration = await ensureServiceWorkerRegistration();
      if (!registration || !registration.pushManager) {
        setSubscriptionStatus('unsupported');
        return false;
      }

      const existing = await registration.pushManager.getSubscription();
      if (existing) {
        await registerPushSubscription(existing);
        setIsSubscribed(true);
        setSubscriptionStatus('ready');
        return true;
      }

      const newSubscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: base64UrlToUint8Array(vapidKey),
      });

      await registerPushSubscription(newSubscription);
      setIsSubscribed(true);
      setSubscriptionStatus('ready');
      return true;
    } catch (error) {
      console.error('[Reminder] Failed to subscribe to push notifications', error);
      if ((error as any)?.name === 'NotAllowedError') {
        setSubscriptionStatus('unsupported');
      }
      return false;
    }
  }, [supportsNotifications, supportsServiceWorker, supportsPushManager, vapidKey, ensureServiceWorkerRegistration]);

  const unsubscribeFromPush = useCallback(async () => {
    try {
      const registration = supportsServiceWorker ? await navigator.serviceWorker.getRegistration() : null;
      const subscription = await registration?.pushManager?.getSubscription();

      if (subscription) {
        await unregisterPushSubscription(subscription);
        await subscription.unsubscribe();
      }

      setIsSubscribed(false);
      setSubscriptionStatus((status) => (status === 'ready' ? 'ready' : status));
    } catch (error) {
      console.error('[Reminder] Failed to unsubscribe from push notifications', error);
    }
  }, [supportsServiceWorker]);

  const triggerTestReminder = useCallback(async () => {
    if (!supportsNotifications) {
      await triggerReminder(true);
      return;
    }

    const currentPermission = await requestPermission();
    if (currentPermission !== 'granted') {
      if (typeof window !== 'undefined') {
        window.alert('Bitte erlaube Browser-Benachrichtigungen, damit Erinnerungen angezeigt werden. Du kannst dies in den Seiteneinstellungen deines Browsers ändern.');
      }
      console.warn('[Reminder] Cannot trigger test reminder, permission status:', currentPermission);
      return;
    }

    if (subscriptionStatus === 'ready' && !isSubscribed) {
      const result = await subscribeToPush();
      if (!result) {
        console.warn('[Reminder] Testbenachrichtigung übersprungen, Subscription fehlgeschlagen.');
        return;
      }
    }

    if (subscriptionStatus === 'ready' && isSubscribed) {
      try {
        await sendTestPushNotification();
        return;
      } catch (error) {
        console.error('[Reminder] Failed to request backend test push', error);
      }
    }

    await triggerReminder(true);
  }, [requestPermission, triggerReminder, supportsNotifications, subscriptionStatus, isSubscribed, subscribeToPush]);

  useEffect(() => {
    if (!supportsNotifications || !supportsServiceWorker || !supportsPushManager) {
      setSubscriptionStatus('unsupported');
      return;
    }

    if (!vapidKey) {
      setSubscriptionStatus('missing-key');
      return;
    }

    const checkSubscription = async () => {
      try {
        const registration = await navigator.serviceWorker.getRegistration();
        const subscription = await registration?.pushManager?.getSubscription();

        if (subscription) {
          setIsSubscribed(true);
          setSubscriptionStatus('ready');
        } else {
          setIsSubscribed(false);
          setSubscriptionStatus('ready');
        }
      } catch (error) {
        console.error('[Reminder] Failed to check push subscription', error);
        setSubscriptionStatus('unsupported');
      }
    };

    void checkSubscription();
  }, [supportsNotifications, supportsServiceWorker, supportsPushManager, vapidKey]);

  return {
    supportsNotifications,
    permission,
    requestPermission,
    triggerTestReminder,
    permissionRequested,
    permissionMessage,
    subscriptionStatus,
    isSubscribed,
    subscribeToPush,
    unsubscribeFromPush,
  };
};
