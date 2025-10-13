import { useCallback, useEffect, useRef, useState } from 'react';

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
}

const REMINDER_TITLE = 'Zeit für deine Aktivpause!';
const REMINDER_BODY = 'Steh kurz auf, bewege dich 1–2 Minuten und starte deine nächste Übung.';
const TEST_TITLE = 'Test-Erinnerung';
const TEST_BODY = 'So sieht deine Aktivpausen-Erinnerung aus. Klicke, um die nächste Übung zu öffnen.';

export const useActivityReminder = ({ enabled, intervalMinutes, fetchNextExercise }: ReminderConfig): UseActivityReminderResult => {
  const supportsNotifications = typeof window !== 'undefined' && 'Notification' in window;
  const [permission, setPermission] = useState<NotificationPermission>(() => {
    if (!supportsNotifications) {
      return 'default';
    }
    return Notification.permission;
  });
  const [permissionRequested, setPermissionRequested] = useState(false);

  const permissionMessage = !supportsNotifications
    ? 'Dieser Browser unterstützt keine Benachrichtigungen. Wir zeigen dir stattdessen Hinweisfenster an.'
    : permission === 'granted'
    ? 'Super! Benachrichtigungen sind aktiviert.'
    : permission === 'denied'
    ? 'Benachrichtigungen sind blockiert. Du kannst sie in den Seiteneinstellungen deines Browsers aktivieren.'
    : permissionRequested
    ? 'Wir warten auf deine Entscheidung im Browser-Popup.'
    : 'Erlaube Browser-Benachrichtigungen, damit wir dich an Aktivpausen erinnern können.';

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

  const triggerTestReminder = useCallback(async () => {
    if (!supportsNotifications) {
      await triggerReminder(true);
      return;
    }

    const currentPermission = await requestPermission();
    if (currentPermission === 'granted') {
      await triggerReminder(true);
    } else {
      if (typeof window !== 'undefined') {
        window.alert('Bitte erlaube Browser-Benachrichtigungen, damit Erinnerungen angezeigt werden. Du kannst dies in den Seiteneinstellungen deines Browsers ändern.');
      }
      console.warn('[Reminder] Cannot trigger test reminder, permission status:', currentPermission);
    }
  }, [requestPermission, triggerReminder, supportsNotifications]);

  return {
    supportsNotifications,
    permission,
    requestPermission,
    triggerTestReminder,
    permissionRequested,
    permissionMessage,
  };
};
