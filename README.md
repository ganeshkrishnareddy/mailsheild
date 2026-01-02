# 🛡️ MailShield - Phishing Awareness Platform

Deployed and maintained by **P Ganesh Krishna Reddy**.

<p align="center">
  <img src="logo.png" width="400" alt="MailShield Logo">
</p>

[![MailShield](https://img.shields.io/badge/MailShield-v1.1.0-blue?style=for-the-badge&logo=android)](https://img.shields.io/badge/MailShield-v1.1.0-blue)
[![Live Demo](https://img.shields.io/badge/Live-mailsheild.netlify.app-blue?style=for-the-badge&logo=netlify)](https://mailsheild.netlify.app)
[![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](https://img.shields.io/badge/License-MIT-green)

> [!NOTE]
> **Standalone Demo Active**: The live web dashboard includes an internal simulation engine to demonstrate AI analysis features without requiring the FastAPI backend or mobile app connectivity.

A multi-platform security ecosystem designed to protect users from phishing attacks using AI-powered analysis and real-time alerts.

## 🚀 The Three Pillars of Protection

MailShield consists of three interconnected systems working in harmony:

1.  **FastAPI Backend**: The central intelligence hub handling secure OAuth, threat analysis, and notification routing.
2.  **React Dashboard**: A premium web portal for managing security settings and reviewing threat history.
3.  **Kotlin Android App**: A native mobile experience for on-the-go security monitoring and push notifications.

---

## ✨ Key Features

-   **Native Google Sign-In**: Securely connect your Gmail account with minimal, read-only permissions.
-   **Intelligent Scanning**: Analyzes headers and metadata for spoofing, brand impersonation, and malicious patterns.
-   **Real-time Telegram Alerts**: Instant notifications to your phone when a high-risk email hits your inbox.
-   **Smart Gmail Labeling**: Automatically categorizes emails in your inbox (`🚨 Phishing`, `⚠️ Suspicious`) so you know what to avoid.
-   **Privacy-First Architecture**: No email content is ever stored. Processing happens in-memory with encrypted tokens.

---

## 🛠️ Project Setup

### 1. Backend (FastAPI)
```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
# Configure .env with GOOGLE_CLIENT_ID and TELEGRAM_BOT_TOKEN
python -m uvicorn app.main:app --reload
```

### 2. Frontend (React + Vite)
```bash
cd frontend
npm install
npm run dev
```

### 3. Android App (Kotlin + Compose)
1.  Open the `android/` folder in **Android Studio**.
2.  **SHA-1 Registration**: Run `keytool -list -v -keystore ~/.android/debug.keystore` and add your SHA-1 to the Google Cloud Console.
3.  **Firebase Config**: Place your `google-services.json` in `android/app/`.
4.  **Client ID**: Update the `requestIdToken` in `LoginScreen.kt` with your Web Client ID.

---

## 🎯 Detection Logic
Our engine analyzes:
-   **Domain Spoofing**: Detects `paypa1.com` vs `paypal.com`.
-   **Urgency Analysis**: Identifies threatening language common in phishing.
-   **Authentication**: Checks SPF, DKIM, and DMARC status.
-   **Brand Impersonation**: Massive database of banks, e-commerce, and tech giants.

---

## 🤝 Contributing
Built with ❤️ for a safer digital world. PRs are welcome!

**Maintainer**: Ganesh Krishna Reddy
**Contact**: ganeshkrishnareddy6@gmail.com
