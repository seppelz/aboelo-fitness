import { Request, Response } from 'express';
import PushSubscription from '../models/PushSubscription';
import { pushConfig } from '../config/env';
import { sendNotification, testNotificationPayload } from '../services/pushService';

const ensurePushConfigured = () => {
  if (!pushConfig.publicKey || !pushConfig.privateKey) {
    return false;
  }
  return true;
};

const normalizeSubscription = (subscription: any) => {
  if (!subscription || typeof subscription !== 'object') {
    return null;
  }

  const endpoint = typeof subscription.endpoint === 'string' ? subscription.endpoint.trim() : undefined;
  const keys = subscription.keys && typeof subscription.keys === 'object' ? subscription.keys : undefined;
  const p256dh = keys && typeof keys.p256dh === 'string' ? keys.p256dh.trim() : undefined;
  const auth = keys && typeof keys.auth === 'string' ? keys.auth.trim() : undefined;
  const expirationTime = subscription.expirationTime ? new Date(subscription.expirationTime) : null;

  if (!endpoint || !p256dh || !auth) {
    return null;
  }

  return {
    endpoint,
    keys: {
      p256dh,
      auth,
    },
    expirationTime: Number.isFinite(expirationTime?.getTime()) ? expirationTime : null,
  };
};

export const subscribeToPush = async (req: Request, res: Response) => {
  if (!ensurePushConfigured()) {
    return res.status(503).json({
      success: false,
      message: 'Push-Benachrichtigungen sind derzeit nicht verfügbar. Bitte versuchen Sie es später erneut.',
    });
  }

  const normalized = normalizeSubscription(req.body?.subscription);
  if (!normalized) {
    return res.status(400).json({
      success: false,
      message: 'Ungültige Push-Subscription-Daten.',
    });
  }

  try {
    const userId = (req as any).user?._id;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Nicht autorisiert.' });
    }

    const payload = {
      user: userId,
      endpoint: normalized.endpoint,
      keys: normalized.keys,
      expirationTime: normalized.expirationTime,
      userAgent: typeof req.headers['user-agent'] === 'string' ? req.headers['user-agent'] : undefined,
    };

    const subscription = await PushSubscription.findOneAndUpdate(
      { endpoint: normalized.endpoint },
      payload,
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    return res.status(200).json({
      success: true,
      subscriptionId: subscription._id,
    });
  } catch (error) {
    console.error('[subscribeToPush] Failed to persist subscription', error);
    return res.status(500).json({
      success: false,
      message: 'Fehler beim Speichern der Push-Subscription.',
    });
  }
};

export const unsubscribeFromPush = async (req: Request, res: Response) => {
  const endpoint = typeof req.body?.endpoint === 'string' ? req.body.endpoint.trim() : undefined;
  if (!endpoint) {
    return res.status(400).json({ success: false, message: 'Endpoint ist erforderlich.' });
  }

  try {
    await PushSubscription.deleteOne({ endpoint });
    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('[unsubscribeFromPush] Failed to remove subscription', error);
    return res.status(500).json({ success: false, message: 'Fehler beim Entfernen der Subscription.' });
  }
};

export const sendTestPush = async (req: Request, res: Response) => {
  if (!ensurePushConfigured()) {
    return res.status(503).json({
      success: false,
      message: 'Push-Benachrichtigungen sind derzeit nicht verfügbar.',
    });
  }

  try {
    const userId = (req as any).user?._id;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Nicht autorisiert.' });
    }

    const subscriptions = await PushSubscription.find({ user: userId });
    if (subscriptions.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Keine Push-Subscription gefunden. Bitte aktivieren Sie Benachrichtigungen erneut.',
      });
    }

    await Promise.all(
      subscriptions.map(async (subscription) => {
        try {
          await sendNotification(
            {
              endpoint: subscription.endpoint,
              keys: subscription.keys,
              expirationTime: subscription.expirationTime ?? undefined,
            },
            {
              ...testNotificationPayload,
              body: 'Test-Erinnerung: Ihre Push-Benachrichtigung funktioniert!',
            }
          );
        } catch (error: any) {
          const statusCode = error?.statusCode;
          if (statusCode === 404 || statusCode === 410) {
            console.warn('[sendTestPush] Subscription invalid. Removing.', subscription.endpoint);
            await PushSubscription.deleteOne({ _id: subscription._id });
          } else {
            throw error;
          }
        }
      })
    );

    return res.status(200).json({
      success: true,
      message: 'Test-Push-Benachrichtigung wurde gesendet.',
    });
  } catch (error) {
    console.error('[sendTestPush] Failed to send test notification', error);
    return res.status(500).json({
      success: false,
      message: 'Fehler beim Senden der Test-Benachrichtigung.',
    });
  }
};
