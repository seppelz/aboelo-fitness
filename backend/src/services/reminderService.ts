import User, { IUser } from '../models/User';
import PushSubscription from '../models/PushSubscription';
import { sendNotification, PushPayload } from './pushService';
import { appConfig } from '../config/env';

export interface ReminderJobResult {
  evaluatedUsers: number;
  usersNotified: number;
  notificationsSent: number;
  subscriptionsRemoved: number;
  usersSkipped: number;
}

const DEFAULT_REMINDER_PAYLOAD: PushPayload = {
  title: 'Zeit für deine Aktivpause!',
  body: 'Steh kurz auf, beweg dich 1–2 Minuten und starte die nächste Übung.',
  url: appConfig.frontendBaseUrl,
  tag: 'aboelo-activity-reminder',
};

const isReminderDue = (user: IUser, referenceDate: Date): boolean => {
  const settings = user.reminderSettings;
  if (!settings || settings.enabled !== true) {
    return false;
  }

  const intervalMs = Math.max(1, settings.intervalMinutes || 60) * 60 * 1000;
  if (!settings.lastSentAt) {
    return true;
  }

  return referenceDate.getTime() - new Date(settings.lastSentAt).getTime() >= intervalMs;
};

const buildReminderPayload = async (_user: IUser): Promise<PushPayload> => {
  // Placeholder for future personalization (next exercise, etc.)
  return DEFAULT_REMINDER_PAYLOAD;
};

export const runReminderJob = async (): Promise<ReminderJobResult> => {
  const now = new Date();
  const users = await User.find({ 'reminderSettings.enabled': true });

  let notificationsSent = 0;
  let usersNotified = 0;
  let subscriptionsRemoved = 0;
  let usersSkipped = 0;

  for (const user of users) {
    if (!isReminderDue(user, now)) {
      usersSkipped += 1;
      continue;
    }

    const subscriptions = await PushSubscription.find({ user: user._id });
    if (subscriptions.length === 0) {
      usersSkipped += 1;
      continue;
    }

    const payload = await buildReminderPayload(user);
    let sentForUser = 0;

    await Promise.all(
      subscriptions.map(async (subscription) => {
        try {
          await sendNotification(
            {
              endpoint: subscription.endpoint,
              keys: subscription.keys,
              expirationTime: subscription.expirationTime ? subscription.expirationTime.getTime() : undefined,
            },
            payload
          );
          sentForUser += 1;
        } catch (error: any) {
          const statusCode = error?.statusCode;
          if (statusCode === 404 || statusCode === 410) {
            await PushSubscription.deleteOne({ _id: subscription._id });
            subscriptionsRemoved += 1;
          } else {
            throw error;
          }
        }
      })
    );

    if (sentForUser > 0) {
      notificationsSent += sentForUser;
      usersNotified += 1;
      user.reminderSettings = user.reminderSettings || { enabled: true, intervalMinutes: 60 } as any;
      user.reminderSettings.lastSentAt = now;
      await user.save({ validateBeforeSave: false });
    } else {
      usersSkipped += 1;
    }
  }

  return {
    evaluatedUsers: users.length,
    usersNotified,
    notificationsSent,
    subscriptionsRemoved,
    usersSkipped,
  };
};
