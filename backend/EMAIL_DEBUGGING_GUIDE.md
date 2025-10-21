# Email Debugging Guide

## Quick Test

To test email functionality locally or on Render:

```bash
cd backend
npm run test:email
```

This will show you:
- Which environment variables are set
- Any connection errors
- Detailed SMTP communication logs

## Required Environment Variables

Make sure these are set in Render.com:

| Variable | Description | Example |
|----------|-------------|---------|
| `EMAIL_HOST` | SMTP server hostname | `smtp.gmail.com` |
| `EMAIL_PORT` | SMTP port | `587` (STARTTLS) or `465` (SSL) |
| `EMAIL_SECURE` | Use SSL/TLS | `false` for port 587, `true` for port 465 |
| `EMAIL_USER` | SMTP username | `your-email@gmail.com` |
| `EMAIL_PASSWORD` | SMTP password or app password | Your password or app-specific password |
| `EMAIL_FROM` | From address | `no-reply@aboelo-fitness.de` |
| `FRONTEND_BASE_URL` | Frontend URL for reset links | `https://fitness.aboelo.de` |

## Common SMTP Providers

### Gmail
```
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-specific-password
```

**Important**: You must use an [App Password](https://support.google.com/accounts/answer/185833), not your regular Gmail password.

### SendGrid
```
EMAIL_HOST=smtp.sendgrid.net
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=apikey
EMAIL_PASSWORD=YOUR_SENDGRID_API_KEY
```

### Mailgun
```
EMAIL_HOST=smtp.mailgun.org
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=postmaster@your-domain.mailgun.org
EMAIL_PASSWORD=your-mailgun-password
```

### Amazon SES
```
EMAIL_HOST=email-smtp.us-east-1.amazonaws.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-ses-smtp-username
EMAIL_PASSWORD=your-ses-smtp-password
```

## Checking Logs on Render

1. Go to your Render dashboard
2. Click on your backend service
3. Go to "Logs" tab
4. Look for lines starting with `[emailService]` and `[requestPasswordReset]`

Key things to check:
- Are environment variables showing as "SET" or "NOT SET"?
- Does SMTP verification succeed?
- What's the exact error message if it fails?

## Common Error Messages

### "Missing parameter name"
- **Fixed**: This was caused by Express 5. Now using Express 4.

### "EMAIL_TRANSPORTER_NOT_INITIALISED"
- **Cause**: Missing `EMAIL_HOST`, `EMAIL_USER`, or `EMAIL_PASSWORD`
- **Fix**: Set all required environment variables in Render

### "Invalid login" or "Authentication failed"
- **Cause**: Wrong username/password
- **Fix**: 
  - For Gmail: Use App Password, not regular password
  - Verify credentials are correct
  - Check if 2FA is enabled (requires app password)

### "Connection timeout"
- **Cause**: Firewall blocking SMTP port or wrong host
- **Fix**: 
  - Verify `EMAIL_HOST` is correct
  - Try port 587 with `EMAIL_SECURE=false`
  - Some hosting providers block port 25

### "Self-signed certificate"
- **Cause**: SSL certificate issues
- **Fix**: Use port 587 with `EMAIL_SECURE=false` instead of 465

## Testing Locally

1. Create a `.env` file in the `backend` folder:
```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
EMAIL_FROM=no-reply@aboelo-fitness.de
FRONTEND_BASE_URL=http://localhost:3000
TEST_EMAIL_RECIPIENT=your-email@gmail.com
```

2. Run the test:
```bash
npm run test:email
```

## Deployment Checklist

- [ ] All environment variables set in Render
- [ ] EMAIL_PASSWORD is an app-specific password (for Gmail)
- [ ] EMAIL_SECURE matches EMAIL_PORT (false for 587, true for 465)
- [ ] EMAIL_FROM is a valid sender address
- [ ] Test email sent successfully after deployment
- [ ] Check Render logs for detailed error messages if it fails
