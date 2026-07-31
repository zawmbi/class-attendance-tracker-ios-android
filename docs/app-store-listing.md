# App Store Listing — Attendize (v1.0)

Copy/paste these into App Store Connect → your app → the 1.0 version page and
"App Information". Character limits noted; trim if you tweak the wording.

---

## App Name (≤30 chars)
Attendize

## Subtitle (≤30 chars)
Track classes, keep your streak

## Promotional Text (≤170 chars, editable anytime without review)
Never lose track of attendance again. See exactly how many classes you can miss, protect your streak, and forecast your final grade-ready percentage.

## Keywords (≤100 chars, comma-separated, no spaces needed)
attendance,class,tracker,college,student,school,schedule,streak,planner,absence,university,grades

## Primary Category
Education

## Secondary Category (optional)
Productivity

## Copyright (App Information field)
2026 Linda Mansour
<!-- Apple's Copyright field = "<year> <rights holder>". Use your legal name as
an Individual developer (matches the account "Linda Mansour"); if you later form
a company, switch it to e.g. "2026 Zawmbi Productions LLC". No © symbol needed. -->

## Apple Account / seller name
Shown on the store as "Linda Mansour" (Individual account). To display a brand
like "Zawmbi Productions" you'd convert to an Organization account (needs a
D-U-N-S number) — separate from this Copyright field.

---

## Description (≤4000 chars)
Attendize is the calm, focused way to stay on top of class attendance — built for students who want to know exactly where they stand.

ADD YOUR CLASSES
Set up your schedule in seconds. Each class tracks your attendance percentage, your target, and how many sessions you can still miss.

CHECK IN, FAST
One tap to mark Present, Late, or Absent. Your streak, XP, and momentum update instantly so showing up actually feels rewarding.

KNOW YOUR BUFFER
Attendize does the math for you: see how many classes you can skip before you fall below your required percentage — no more guessing.

FORECAST YOUR TERM
Project your end-of-term attendance, run "what-if" scenarios, and spot the classes that need attention before it's too late.

SEE YOUR PATTERNS
Weekday and time-of-day insights, a consistency heatmap, and punctuality records show you exactly when you tend to slip.

STAY MOTIVATED
Earn ranks and badges as you build consistency. A guided get-started checklist helps you set everything up on day one.

PRIVATE BY DESIGN
Your classes and attendance stay on your device. No ads, no tracking, no selling your data. Delete your account and data anytime.

ATTENDIZE PREMIUM (OPTIONAL)
Core tracking is free. Premium unlocks end-of-term forecasting and what-if projections, behavioral insights, syllabus scanning, advanced reminders, and premium themes.

Subscription options:
- Premium (Monthly) — $3.99 / month
- Premium (6-Month) — $17.99 every 6 months ($3.00 / month)
- Premium (Annual) — $29.99 / year ($2.50 / month)

Each plan starts with a 2-week free trial. Payment is charged to your Apple ID at confirmation of purchase. Subscriptions renew automatically unless canceled at least 24 hours before the end of the current period, and your account is charged for renewal within 24 hours before the period ends. Manage or cancel anytime in your Apple ID account settings.

Privacy Policy: https://lindascomputing.xyz/class-attendance-tracker-ios-android/privacy.html
Terms of Use (EULA): https://www.apple.com/legal/internet-services/itunes/dev/stdeula/

Works great on iPhone and iPad.

---

## What's New in This Version (1.0)
First release of Attendize:
- Add classes and check in with one tap
- Attendance buffer, streaks, and badges
- End-of-term forecast and pattern insights
- Full iPad layout
- Guided first-run setup

---

## App Review Information
**Sign-In required:** Yes — provide this demo account (fill the Sign-In Information fields):
- **Username:** `devtest`
- **Password:** `devtestpassword`

**Notes:** On the login screen, enter the username/password above to sign in.
This loads sample classes (it's a local demo login, so it works offline). Guest
mode has been removed, so the demo login above is the only way in — please use it.

**Subscription information (guideline 3.1.2(c)):** The Attendize Premium screen
shows each plan's title, length, price, and price-per-month, the auto-renewal
terms, and tappable links to the Privacy Policy and the Terms of Use (EULA). The
App Description also lists all three plans with prices and carries functional
links to both documents. We use Apple's standard EULA:
https://www.apple.com/legal/internet-services/itunes/dev/stdeula/

**Location (guideline 2.5.4):** The "location" background mode has been removed
from UIBackgroundModes. The app's only location feature is region monitoring
(geofencing): a student can pin a course to a place, and iOS wakes the app on
arrival to offer or record a check-in. This needs no persistent location.

**In-App Purchases:** Premium features (forecasting, analytics/insights,
syllabus scanning, advanced reminders, themes) are unlocked by an auto-renewable
subscription — Monthly, 6-Month, or Annual — via Apple In-App Purchase on the "Attendize
Premium" screen. To test: use a Sandbox Apple ID, open any "Premium" prompt →
Attendize Premium → Subscribe, then verify the gated screens unlock. "Restore
Purchases" re-grants the entitlement. See docs/app-review-2.1b-response.md for
the full business-model write-up and product IDs.

## Support URL (required)
https://lindascomputing.xyz/class-attendance-tracker-ios-android/

## Marketing URL (optional)
[optional]

## Privacy Policy URL (required)
https://lindascomputing.xyz/class-attendance-tracker-ios-android/privacy.html

---

## Screenshots checklist (required)
You must upload at least one set for each required device:
- iPhone 6.9" or 6.7" (e.g., iPhone 16 Pro Max) — REQUIRED
- iPad 13" (e.g., iPad Pro 13") — REQUIRED because the app supports iPad

Capture from the Simulator with ⌘S (saved to your Desktop). Good screens to show:
1. Dashboard (momentum + today)
2. Quick check-in
3. Forecast / Analytics
4. Insights (heatmap)
5. Trophy case / badges

## App Privacy answers (the questionnaire)
- Contact Info → Email Address: Collected, Linked to user, App Functionality. Not used for tracking.
- Contact Info → Name: Collected, Linked to user, App Functionality. Not used for tracking.
- Identifiers → User ID: Collected (via sign-in), Linked, App Functionality. Not tracking.
- User Content → Other User Content: Collected, Linked to user, App Functionality. Not tracking.
  (This covers the classes/attendance/settings uploaded to Firebase Firestore
  **only when a signed-in user enables Cloud Backup & Sync**. Local-only users
  transmit nothing — but Apple's label reflects what the app *can* collect, so
  declare it.)
- Purchases → Purchase History: handled by Apple In-App Purchase; you do not
  collect it yourself, so leave "Not collected" unless you log it.
- Location → Coarse/Precise: "Not collected" (processed on-device only; you do not transmit it).
- Everything else: Not collected.
