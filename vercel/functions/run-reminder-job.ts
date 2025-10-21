import type { VercelRequest, VercelResponse } from '@vercel/node';

const RENDER_ENDPOINT = process.env.RENDER_REMINDER_ENDPOINT || '';

export default async function handler(_req: VercelRequest, res: VercelResponse) {
  const token = process.env.RENDER_PUSH_JOB_TOKEN;
  if (!token || !RENDER_ENDPOINT) {
    res.status(500).json({
      success: false,
      error: 'Missing RENDER_PUSH_JOB_TOKEN or RENDER_REMINDER_ENDPOINT',
    });
    return;
  }

  try {
    const response = await fetch(RENDER_ENDPOINT, {
      method: 'POST',
      headers: {
        'X-Job-Token': token,
      },
    });

    const bodyText = await response.text();

    if (!response.ok) {
      res.status(response.status).json({
        success: false,
        body: bodyText,
      });
      return;
    }

    res.status(200).json({
      success: true,
      body: bodyText ? JSON.parse(bodyText) : null,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error?.message || 'Failed to trigger reminder job',
    });
  }
}
