# Privacy Policy for Attendize

_Last updated: June 30, 2026_

Attendize ("the app", "we", "us") helps you track class attendance. This policy
explains what data the app handles and how. We've tried to keep it plain.

## Summary
- By default, your **classes and attendance records are stored locally on your device**.
- If you create an account and turn on **Cloud Backup & Sync**, those records (and your settings) are stored in **Google Firebase (Firestore)** under your account so you can back them up and sync across devices. This is optional and off until you enable it.
- If you create an account, your **email and name** are handled by our authentication provider (Google Firebase Authentication) to sign you in.
- **Location** (if you allow it) is used **on your device** to remind you when you're near class. It is not collected, stored, or shared by us.
- **Subscriptions** are purchased through Apple In-App Purchase (or Google Play); the app store processes your payment — we never see your card details.
- We **do not sell your data** and we **do not use it for advertising or tracking**.
- You can **delete your account and all associated data — local and cloud — at any time** from within the app (Settings → Delete account).

## Information we handle

**Account information.** If you sign up or sign in (including with Google or Apple), we receive your email address and display name through **Google Firebase Authentication** in order to create and secure your account. We do not receive your password.

**Class and attendance data.** The classes you add and the attendance you log are stored **locally on your device** using on-device storage. They stay on your device unless you remove them or enable Cloud Backup & Sync.

**Cloud Backup & Sync (optional).** If you are signed in and choose to back up or sync, your classes, attendance records, and app settings are uploaded to and stored in **Google Firebase Firestore** under your account, so you can restore them or keep multiple devices in sync. You control this: it only happens when you sign in and use the backup/sync feature, and you can delete the cloud copy at any time by deleting your account.

**Location data.** With your permission, the app may use your location to provide proximity-based class reminders. This processing happens on your device; we do not collect or transmit your location.

**Reminders / notifications.** Class reminders are scheduled and delivered locally on your device. We do not send your schedule to a server to generate them.

**Subscriptions.** Optional Premium features are unlocked via an auto-renewable subscription purchased through Apple In-App Purchase (or Google Play on Android). The app store handles the transaction and billing; we receive only your subscription status (active or not), never your payment information.

**Diagnostics.** We do not collect analytics or advertising identifiers.

## How we use information
- To authenticate you and keep your account secure.
- To provide app features you request (tracking, reminders, forecasts, and — if you enable it — cloud backup and sync).
- To make Premium features available to active subscribers.
- We do **not** use your information for advertising, profiling, or tracking across apps or websites.

## Third-party services
- **Google Firebase Authentication** — handles sign-in. See Google's Privacy Policy: https://policies.google.com/privacy
- **Google Firebase Firestore** — stores your cloud backup if you enable Cloud Backup & Sync. Same Google Privacy Policy applies.
- **Sign in with Apple** (if used) — see Apple's Privacy Policy: https://www.apple.com/legal/privacy/
- **Apple In-App Purchase / Google Play Billing** — processes subscription purchases. See Apple's and Google's respective privacy policies.

## Data storage and international transfer
Cloud backups are stored on Google Firebase infrastructure, which may process and
store data on servers located outside your country (including the United States).
Data is protected in transit and at rest using industry-standard encryption
provided by these platforms.

## Data retention and deletion
On-device data persists until you remove it. Any cloud backup persists until you
delete your account. You can, at any time from within the app:
- **Settings → Delete account** — permanently deletes your authentication account, your cloud backup (Firestore), and your on-device data.
- **Settings → Clear all data & start fresh** — wipes the data stored locally on your device.

Deleting the app also removes locally stored data (but not a cloud backup — use
Delete account to remove that).

## Your rights
Depending on where you live, you may have the right to access, correct, or delete
your personal data. The in-app **Delete account** option fulfills deletion
directly; for other requests, contact us using the details below.

## Children's privacy
Attendize is not directed to children under 13, and we do not knowingly collect
personal information from them.

## Changes to this policy
We may update this policy; the "Last updated" date will change accordingly.
Material changes will be reflected here.

## Contact
Questions about this policy? Contact us at: **support@zawmbi.com**

<!--
HOSTING: Publish this as a public URL (required by App Store Connect).
Easiest free options:
  1. GitHub Pages — put this file in a public repo, enable Pages, link to it.
  2. A public Notion page (Share → Publish to web).
  3. Any static host (Netlify/Vercel/your site).
Then paste the URL into App Store Connect → App Privacy / App Information, and
make sure the in-app paywall PRIVACY_URL (screens/PremiumScreen.tsx) points to it.
-->
