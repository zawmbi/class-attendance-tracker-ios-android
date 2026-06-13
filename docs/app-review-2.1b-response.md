# App Review — Guideline 2.1(b) response & In-App Purchase setup

Submission context: Attendize 1.0, Guideline 2.1(b) "Information Needed" — Apple
asked us to explain the business model around paid content/subscriptions.

This version adds **real auto-renewable subscriptions via StoreKit/In-App
Purchase** (`react-native-iap`). Everything below reflects that.

---

## Reply to send in App Store Connect (Resolution Center)

> Thank you for the review. Here is our business model.
>
> **1. Who are the users that will use the paid content and subscriptions?**
> College and graduate students who use Attendize to track class attendance.
> Premium is an optional upgrade for users who want forecasting and deeper
> analytics; the core attendance tracking is free.
>
> **2. Where can users purchase the content and subscriptions?**
> Only inside the app, exclusively through Apple In-App Purchase. There is no
> other storefront, website, or external way to buy. The paywall is on the
> "Attendize Premium" screen.
>
> **3. What previously purchased content/subscriptions can a user access?**
> The Premium subscription itself. A subscriber's entitlement is restored via
> the "Restore Purchases" button on the Premium screen, and automatically on a
> new device/reinstall using the same Apple ID. Premium unlocks: end-of-term
> forecasting and what-if projections, behavioral/pattern insights, syllabus
> scanning, advanced reminders, and premium themes.
>
> **4. What paid content/features are unlocked WITHOUT using In-App Purchase?**
> None. There is no content unlocked outside of Apple In-App Purchase. There are
> no promo codes, external payments, or alternative unlock paths.
>
> **5. How do users obtain an account? Is there a fee?**
> Accounts are free. Users sign up with email/password (or continue as a guest).
> Creating an account costs nothing and is not required to use the free
> features.
>
> **6. How do users purchase "Premium"?**
> Tapping any "Premium" / "Unlock with Premium" prompt opens the Premium screen,
> which offers three auto-renewable subscriptions — Monthly, 6-Month, and Annual
> — purchased through Apple In-App Purchase. Price, billing period, auto-renew terms, and
> links to Terms of Use and Privacy Policy are shown on that screen, along with
> a Restore Purchases option.

---

## Products to create in App Store Connect (must match the app)

The product IDs are defined in `services/iap.ts` and must match exactly:

| Plan    | Product ID                                                                     | Duration | Type                |
| ------- | ------------------------------------------------------------------------------ | -------- | ------------------- |
| Monthly | `com.attendancetrackerappsorganization.attendancetrackerapp.premium.monthly`    | 1 Month  | Auto-renewable sub. |
| 6-Month | `com.attendancetrackerappsorganization.attendancetrackerapp.premium.semiannual` | 6 Months | Auto-renewable sub. |
| Annual  | `com.attendancetrackerappsorganization.attendancetrackerapp.premium.annual`     | 1 Year   | Auto-renewable sub. |

All three belong in **one subscription group** (e.g. "Attendize Premium") so the
user can switch between Monthly, 6-Month, and Annual.

### Localized copy (App Store Connect limits: Display Name ≤30, Description ≤45)

| Field        | Monthly                                      | 6-Month                                  | Annual                                   |
| ------------ | -------------------------------------------- | ---------------------------------------- | ---------------------------------------- |
| Display Name | `Premium (Monthly)`                          | `Premium (6-Month)`                      | `Premium (Annual)`                       |
| Description  | `Unlock forecasts, insights & syllabus scan` | `Full Premium for the whole term`        | `All Premium features — best value`      |

Subscription Group display name: `Attendize Premium`

### App Store Connect checklist
1. Agreements, Tax, and Banking → sign the **Paid Applications agreement** (IAPs
   won't load until this is active).
2. Features → In-App Purchases → create a **Subscription Group**.
3. Add the three subscriptions above with the exact product IDs, a price, a
   localized display name, and a description; submit them **with** the app
   version (attach them to the 1.0 build).
4. Provide a **Privacy Policy URL** and **Terms of Use (EULA)** — the app links
   to Apple's standard EULA by default (see `TERMS_URL` in
   `screens/PremiumScreen.tsx`); swap in your own if you have one.

### Google Play (for the Android build)
Create matching subscriptions with the same product IDs in Play Console →
Monetize → Subscriptions, and add a base plan (monthly / yearly) to each.

---

## How the reviewer can test the purchase

- Use a **Sandbox Apple ID** (App Store Connect → Users and Access → Sandbox).
- Install via **TestFlight** or the review build (IAP does **not** work in Expo
  Go or the iOS Simulator's App Store).
- Open the app → any "Premium" prompt → **Attendize Premium** → pick Monthly, 6-Month, or
  Annual → **Subscribe**. The sandbox sheet completes the purchase for free and
  unlocks Forecast/Analytics, Insights, and syllabus scanning immediately.
- **Restore Purchases** re-grants the entitlement on a fresh install.

> Note: the `devtest` demo login still loads sample data for feature review, but
> premium features are now gated behind the subscription, so please test the
> purchase with a sandbox account as above.

---

## Implementation notes (for us)

- Library: `react-native-iap@^12.16.4` with its Expo config plugin (added in
  `app.config.ts`). Requires a dev/EAS build — **not** Expo Go.
- App-side files: `services/iap.ts` (SDK wrapper + product IDs),
  `components/IapProvider.tsx` (connection, listeners, restore, entitlement
  sync), `screens/PremiumScreen.tsx` (paywall), `store/userStore.ts`
  (`isPremium` now defaults to false; `setPremium` is the only way to grant it).
- Entitlement is checked client-side (no server receipt validation). That's
  acceptable for a simple on-device unlock; add server-side validation if you
  later need to strictly enforce expiry.
- Build the binary with `eas build` and upload a new version before replying so
  the reviewer sees the working IAP.
