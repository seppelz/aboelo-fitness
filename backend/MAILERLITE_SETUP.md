# MailerSend Setup Guide for Aboelo Fitness

## ✅ What's Been Done

Your email service has been upgraded to support **MailerSend API** alongside SMTP. The system automatically detects which method to use based on your configuration.

**Note:** MailerSend is MailerLite's sister product specifically designed for transactional emails (password resets, welcome emails, etc.).

## 🚀 Setup Instructions

### Step 1: Install Dependencies

```bash
cd backend
npm install
```

This installs `axios` which is needed for MailerSend API calls.

### Step 2: Configure Render.com Environment Variables

Add these environment variables in your Render.com dashboard:

```bash
MAILERSEND_API_TOKEN=your-api-token-from-mailersend
MAILERSEND_API_URL=https://api.mailersend.com
EMAIL_FROM=info@aboelo.de
FRONTEND_BASE_URL=https://fitness.aboelo.de
```

**Where to get your API token:**
1. Log in to MailerSend: https://www.mailersend.com/
2. Go to **Email → Domains** (verify a domain or use sandbox)
3. Go to **Settings** → **API Tokens**
4. Click **Generate new token**
5. Copy the token (starts with `mlsn_...`)
6. Paste it into `MAILERSEND_API_TOKEN` in Render.com

### Step 3: Remove or Comment Out Old SMTP Variables (Optional)

Since MailerSend API is being used, you can remove these (they won't be used):
- `EMAIL_HOST`
- `EMAIL_PORT`
- `EMAIL_SECURE`
- `EMAIL_USER`
- `EMAIL_PASSWORD`

**Keep:**
- `EMAIL_FROM=info@aboelo.de`
- `FRONTEND_BASE_URL=https://fitness.aboelo.de`

### Step 4: Deploy

1. Commit the changes:
   ```bash
   git add .
   git commit -m "Update to MailerSend API for email sending"
   git push
   ```

2. Render.com will automatically redeploy

### Step 5: Test

Test the forgot password functionality:
1. Go to https://fitness.aboelo.de
2. Click "Passwort vergessen"
3. Enter a registered email
4. Check the Render.com logs for:
   ```
   [emailService] method: 'mailersend'
   [emailService] Sende E-Mail via MailerSend API...
   [emailService] E-Mail via MailerSend erfolgreich versendet
   ```

## 📊 How It Works

The email service now has **two modes**:

### Mode 1: MailerSend API (Preferred)
- ✅ If `MAILERSEND_API_TOKEN` is set → Uses MailerSend API
- ✅ Bypasses SMTP port blocking
- ✅ More reliable delivery
- ✅ Better for cloud hosting

### Mode 2: SMTP (Fallback)
- ⚙️ If `MAILERSEND_API_TOKEN` is NOT set → Uses traditional SMTP
- Requires `EMAIL_HOST`, `EMAIL_USER`, `EMAIL_PASSWORD`

**The system automatically picks the right method!**

## 🔍 Troubleshooting

### "Cannot find module 'axios'"
**Solution:** Run `npm install` in the backend folder

### "MAILERSEND_API_TOKEN not configured"
**Solution:** Add the token to Render.com environment variables and redeploy

### "401 Unauthorized"
**Solution:** Your API token is incorrect. Get a new one from MailerSend dashboard

### "403 Forbidden - Domain not verified"
**Solution:** Verify your domain in MailerSend or use their sandbox domain for testing

### Emails still not sending
**Check Render.com logs** for:
```bash
[emailService] method: 'mailersend'  # Should show mailersend, not smtp
[emailService] MailerSend API Fehler:  # Look for specific error
```

## 📧 Email Functions

All three email functions now use MailerLite:

1. **Password Reset** - `sendPasswordResetEmail()`
2. **Welcome Email** - `sendWelcomeEmail()` (on registration)
3. **Contact Form** - `sendContactEmail()`

## 💡 Benefits

✅ **No SMTP blocking** - Works on Render.com and other cloud platforms  
✅ **Better deliverability** - Professional email service  
✅ **Generous free tier** - Plenty for your needs  
✅ **Easy tracking** - See delivery status in MailerLite dashboard  
✅ **Automatic fallback** - Can still use SMTP if needed

## 🎯 Next Steps

1. Install dependencies: `npm install`
2. Add `MAILERSEND_API_TOKEN` and `MAILERSEND_API_URL` to Render.com
3. Deploy and test forgot password
4. Emails should work! 🎉
