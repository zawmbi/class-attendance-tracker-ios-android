# Attendize — QA Test Plan

Two layers of testing:

1. **Automated unit tests** (`npm test`) — cover the pure logic: attendance math,
   forecasting, gamification, date/calendar helpers, syllabus parsing, motivation
   insights, the IAP wrapper, and the zustand stores. 102 tests / 12 suites.
2. **Manual QA cases** (below) — cover UI flows, navigation, IAP on-device, and
   anything that needs a real build (these can't run in Jest).

Run automated tests with:

```bash
npm test          # watch-free single run
npm run test:ci   # CI mode, serial
npm run typecheck # tsc --noEmit
```

---

## Automated coverage map

| Area | Module(s) | Test file |
| --- | --- | --- |
| Attendance %, buffer, risk, projections, heatmap, streaks | `utils/attendance.ts` | `__tests__/utils/attendance.test.ts` |
| Grades, weekday/time patterns, monthly momentum, forecast | `utils/forecast.ts` | `__tests__/utils/forecast.test.ts` |
| XP, ranks, achievements, comeback detection | `utils/gamification.ts` | `__tests__/utils/gamification.test.ts` |
| Time parsing, next session, week math | `utils/date.ts` | `__tests__/utils/date.test.ts` |
| Week/month/semester calendars | `utils/calendar.ts` | `__tests__/utils/calendar.test.ts` |
| Syllabus parsing (incl. MWF/TTH codes) | `utils/syllabus.ts` | `__tests__/utils/syllabus.test.ts` |
| Motivation / behavior / priority insights | `utils/motivation.ts` | `__tests__/utils/motivation.test.ts` |
| Count-based class view (pct/buffer/risk) | `utils/attenza.ts` | `__tests__/utils/attenza.test.ts` |
| In-app purchase wrapper (mocked native module) | `services/iap.ts` | `__tests__/services/iap.test.ts` |
| User / attendance / gamification stores | `store/*.ts` | `__tests__/store/*.test.ts` |

---

## Manual QA cases

Statuses: ☐ not run · ✅ pass · ❌ fail. Test on iPhone + iPad (the app supports tablet).

### Onboarding & accounts
- [ ] QA-01 Fresh install shows the auth screen, not the dashboard.
- [ ] QA-02 "Create Account" with email/password succeeds and lands on the dashboard.
- [ ] QA-03 "Log In" with wrong credentials shows an error alert, no crash.
- [ ] QA-04 "Skip for now — explore the demo" enters guest mode with sample data.
- [ ] QA-05 `devtest` / `devtestpassword` logs in offline and reveals the dev "Demo & data" group in Settings.
- [ ] QA-06 Edit display name in Settings persists across app relaunch.
- [ ] QA-07 Sign out returns to the auth screen; data is retained for that account.
- [ ] QA-08 Delete account wipes classes/records and returns to auth.

### Classes & check-in
- [ ] QA-10 Add a class manually; it appears on the dashboard and calendar.
- [ ] QA-11 Quick Check-In marks Present/Late/Absent; XP + streak update immediately.
- [ ] QA-12 Re-checking the same class on the same day replaces (not duplicates) the record.
- [ ] QA-13 Mark a record Excused; verify it's excluded from the % and the original status is restored if changed back.
- [ ] QA-14 Edit a class's required attendance; buffer/risk recompute.
- [ ] QA-15 Delete a class; its records disappear too.

### Free features
- [ ] QA-20 Dashboard buffer gauge + streak render with correct numbers vs. records.
- [ ] QA-21 Calendar week/month views show sessions on the right weekdays.
- [ ] QA-22 Trophy case shows unlocked vs. locked badges; a new unlock celebrates once.
- [ ] QA-23 Insights overall % and weekly trend render (non-premium teaser visible).

### Premium gating (with `isPremium = false`)
- [ ] QA-30 Analytics/Forecast screen shows the locked "Unlock with Premium" state.
- [ ] QA-31 Insights "End-of-term Forecast" card shows the PREMIUM lock and routes to the paywall.
- [ ] QA-32 Edit Class → Syllabus scan shows the locked "Auto-fill with Premium" row → opens the upgrade modal → "See plans" opens the paywall.
- [ ] QA-33 Settings → Subscription → "Upgrade to Premium" opens the paywall.

### In-App Purchase (requires TestFlight/dev build + Sandbox Apple ID)
- [ ] QA-40 Paywall loads live localized prices for Monthly and Annual.
- [ ] QA-41 Annual is pre-selected and shows the "BEST VALUE" tag.
- [ ] QA-42 Subscribe (Monthly) completes in sandbox; gated screens unlock without restart.
- [ ] QA-43 Subscribe (Annual) completes; entitlement persists across relaunch.
- [ ] QA-44 "Restore Purchases" re-grants premium on a fresh install with the same Apple ID.
- [ ] QA-45 Cancel the purchase sheet → no entitlement granted, no error crash.
- [ ] QA-46 Auto-renew disclosure text + Terms of Use + Privacy Policy links are visible and tappable.
- [ ] QA-47 Premium user sees "You're all set" + "Manage subscription" (opens App Store settings).
- [ ] QA-48 In Expo Go (no native IAP), paywall shows the "Subscriptions aren't available here" fallback (no crash).

### Notifications & misc
- [ ] QA-50 Class reminder fires at the configured lead time (with notifications allowed).
- [ ] QA-51 Toggle theme Light/Dark; persists across relaunch.
- [ ] QA-52 Reorder dashboard widgets; order persists.
- [ ] QA-53 iPad: layouts use the wide two-column/large-badge treatment without clipping.

### Regression / data integrity
- [ ] QA-60 Existing install that previously had free "premium" no longer shows premium after update (migration to v1 resets it; restore re-grants if purchased).
- [ ] QA-61 Kill and relaunch mid-session; persisted classes/records/settings survive.
