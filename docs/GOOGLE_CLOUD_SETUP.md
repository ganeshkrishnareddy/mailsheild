# Google Cloud Setup Guide

## Step 1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Click "New Project"
3. Name it "MailShield" and create

## Step 2: Enable Gmail API

1. Go to "APIs & Services" → "Library"
2. Search for "Gmail API"
3. Click "Enable"

## Step 3: Configure OAuth Consent Screen

1. Go to "APIs & Services" → "OAuth consent screen"
2. Select "External" user type
3. Fill in app information:
   - App name: MailShield
   - User support email: your email
   - Developer contact: your email
4. Add scopes:
   - `https://www.googleapis.com/auth/gmail.readonly`
   - `https://www.googleapis.com/auth/gmail.modify`
   - `https://www.googleapis.com/auth/userinfo.email`
   - `https://www.googleapis.com/auth/userinfo.profile`
5. Add yourself as a test user

## Step 4: Create OAuth Credentials

1. Go to "APIs & Services" → "Credentials"
2. Click "Create Credentials" → "OAuth client ID"
3. Application type: "Web application"
4. Name: "MailShield Web"
5. Authorized redirect URIs:
   - `http://localhost:8000/api/auth/callback`
6. Copy Client ID and Client Secret

## Step 5: Configure Backend

Update `backend/.env`:

```
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret
GOOGLE_REDIRECT_URI=http://localhost:8000/api/auth/callback
```

## Step 6: For Android App

1. Create another OAuth credential
2. Application type: "Android"
3. Package name: `com.mailshield.app`
4. Get SHA-1 from Android Studio

## Production Notes

- For production, verify your app with Google
- Add a privacy policy URL
- Use HTTPS redirect URIs
