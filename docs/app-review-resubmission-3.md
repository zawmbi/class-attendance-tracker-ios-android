# App Review — Submission f3f1f0d8 (v1.0 build 21) response

Rejected 2026-07-31 on two guidelines. Build 21 was reviewed on an iPad Air
11-inch (M3).

## Status as of 2026-08-02

| | |
| --- | --- |
| 2.5.4 code fix | **Done** — committed as `735f7f0` |
| Build 22 | **Done** — EAS build `446f1482`, FINISHED 2026-07-31, from `735f7f0` |
| Build 22 binary verified | **Yes** — IPA unpacked; `UIBackgroundModes` = `["fetch"]`, no `location` |
| In-app 3.1.2(c) disclosures | **Already present** — paywall + Settings → General |
| App Store Connect metadata | **Not done** — manual, see Step 3 |
| Resolution Center reply | **Not sent** — text below |
| `Help & feedback` dead row | **Fixed** — commit `393ac0f` |
| Build 23 | **Done** — EAS build `af48bd8a`, FINISHED 2026-08-02, from `393ac0f` |
| Build 23 binary verified | **Yes** — `UIBackgroundModes` = `["fetch"]`, `CFBundleVersion` 23; Hermes bundle carries `support@zawmbi.com`, `stdeula`, `privacy.html` |
| Device test of geofencing | **Not done** — see "the one open risk" below |

Build 22 was already a valid answer to both rejections. **Build 23** additionally
wires up the dead `Help & feedback` row in Settings → General, which sits one row
above the legal links a reviewer taps to verify 3.1.2(c). Submit build 23.

### How to verify a build actually carries the fix

`ios/` is gitignored, so the checked-out `Info.plist` can be stale and proves
nothing. Check the artifact instead:

```sh
curl -sL -o b.ipa "$(eas build:list --platform ios --limit 1 --json \
  | node -e 'let s="";process.stdin.on("data",d=>s+=d).on("end",()=>console.log(JSON.parse(s.slice(s.indexOf("["))) [0].artifacts.applicationArchiveUrl))')"
unzip -q b.ipa -d out
plutil -extract UIBackgroundModes json -o - out/Payload/Attendize.app/Info.plist
# expect: ["fetch"]

# The JS bundle is Hermes bytecode, so grep won't see strings — use `strings`.
strings -a out/Payload/Attendize.app/main.jsbundle | grep -c stdeula
```

---

## 1. Guideline 3.1.2(c) — subscription metadata (EULA link)

**What Apple asked for:** a functional Terms of Use (EULA) link in the App Store
*metadata* — not in the app.

**Nothing to fix in code.** The Premium screen (`screens/PremiumScreen.tsx`)
already shows every required element:

| Requirement | Where |
| --- | --- |
| Title of subscription | `:121-123` "ATTENDIZE PREMIUM"; per-tier titles `:36-38` |
| Length of subscription | `:36-38` `billed` → rendered `:218-220` |
| Price | `:36-38` `price`, live StoreKit `priceLabel` preferred `:187` |
| Price per unit | `:36-38` `perMonth` → rendered `:219` |
| Privacy Policy link | `:295-299` |
| Terms of Use (EULA) link | `:290-294` |

**Actions in App Store Connect (manual — cannot be done from the repo):**

1. **App Description** — replace with the updated text in `app-store-listing.md`.
   It now lists all three plans with prices and ends with two labelled links:
   - `Privacy Policy: https://lindascomputing.xyz/class-attendance-tracker-ios-android/privacy.html`
   - `Terms of Use (EULA): https://www.apple.com/legal/internet-services/itunes/dev/stdeula/`
2. **App Information → Privacy Policy URL** — set to the `privacy.html` URL
   above. It was previously an unfilled placeholder.
3. **App Review Information → Notes** — paste the two blocks from
   `app-store-listing.md` ("Subscription information" and "Location"). Apple
   explicitly asked for this to be present on future submissions.
4. Leave the custom **EULA** field empty — we use Apple's standard EULA, so the
   link in the description is the correct route.

> One in-app bug was fixed alongside this: `PRIVACY_URL` pointed at the site
> landing page rather than the policy itself. It now deep-links to
> `privacy.html`.

### Reply to send

> Thank you for the review.
>
> Regarding guideline 3.1.2(c): we have updated the App Store metadata. The App
> Description now lists each auto-renewable subscription with its title, length,
> price and price per month, states the auto-renewal terms, and includes
> functional links to both our Privacy Policy and the Terms of Use (EULA). We
> use Apple's standard EULA:
> https://www.apple.com/legal/internet-services/itunes/dev/stdeula/
> The Privacy Policy URL field in App Store Connect is also now populated.
>
> Inside the app, the "Attendize Premium" screen displays the title, length,
> price and price-per-month of each plan, the auto-renewal terms, and tappable
> links to the Privacy Policy and Terms of Use. These links are also available
> in Settings → General.

---

## 2. Guideline 2.5.4 — `location` in UIBackgroundModes

**Apple is right, and we have removed the key.** The app never needed it.

The only location feature is **region monitoring (geofencing)**: a student pins a
course to a place, and iOS wakes the app when they arrive to offer or record a
check-in. That is exactly the "region monitoring location service" Apple's
rejection recommends. iOS delivers region-entry events — even after the app is
terminated — without the `location` background mode. The app never streams
continuous location and never calls `startLocationUpdatesAsync` or
`watchPositionAsync`.

### What changed

- `app.config.ts` — removed `UIBackgroundModes: ["location"]` from
  `ios.infoPlist`, with a comment explaining why it must not come back.
- `patches/expo-location+19.0.8.patch` (**new**) — `expo-location` unconditionally
  set `allowsBackgroundLocationUpdates = YES` in its geofencing task consumer
  (`EXGeofencingTaskConsumer.m:74`). iOS raises an exception when that is set
  without the `location` background mode, so removing the key alone would have
  crashed `startGeofencingAsync`. The patch makes the assignment conditional on
  the app actually declaring the mode. Geofencing is unaffected — region
  monitoring does not require it.
- `package.json` — added `"postinstall": "patch-package"` so EAS reapplies the
  patch on every build, plus `patch-package` as a devDependency.

`UIBackgroundModes` still contains `fetch`, which `expo-task-manager` injects
automatically via its config plugin. See "Known follow-ups" below.

### Verification

- `npx expo config --type introspect` with the stale `ios/` directory moved aside
  resolves `UIBackgroundModes` to `['fetch']` only. The `location` entry had also
  been stale in the checked-out `ios/Attendize/Info.plist`; that copy is now
  updated too. (`ios/` is gitignored, so EAS prebuilds it fresh regardless.)
- `npm run typecheck` — clean. `npm test` — 125 passed, 16 suites.

### Still required before resubmitting

**A physical-device test — the one open risk.** Geofencing cannot be exercised in
the Simulator, and this change alters native code. If this was never run against
build 22 on a real iPhone, the failure mode is specific: without the
`expo-location` patch taking effect, `startGeofencingAsync` throws the moment a
reviewer flips "Location check-in reminders" on. Do this before resubmitting.
Run:

```sh
npx expo prebuild -p ios --clean   # regenerate ios/ without the background mode
npx expo run:ios --device          # install on a real iPhone
```

Then: pin a course to your current location (Edit class → Location reminder),
enable Settings → "Location check-in reminders" and grant **Always** location,
leave the area and return. Confirm the arrival notification fires with the app
backgrounded, and that no crash occurs when the toggle is switched on — that is
the specific regression the patch guards against.

### Reply to send

> Regarding guideline 2.5.4: we have removed the "location" value from the
> UIBackgroundModes key. The app does not require persistent real-time location.
>
> Our only location feature is region monitoring, as recommended in your
> guidance. A student can optionally pin a course to a place; iOS then wakes the
> app on region entry to offer or automatically record an attendance check-in.
> The app does not use continuous background location updates. The updated build
> monitors regions only, with no background location mode declared.

---

## Resubmission runbook

Order matters: the metadata edits are what 3.1.2(c) is actually about, and the
build must be made *after* the code changes are committed.

### Step 1 — device-test geofencing (do not skip)

Native code changed and the Simulator cannot exercise geofencing.

```sh
npx expo prebuild -p ios --clean
npx expo run:ios --device
```

Pin a course to your current location, enable Settings → "Location check-in
reminders", grant **Always**, then leave and re-enter the area. Confirm the
arrival notification fires with the app backgrounded, and — the specific
regression the patch guards — that flipping the toggle does not crash.

### Step 2 — commit and build — **DONE**

EAS builds from committed state, so commit first.

```sh
git add -A && git commit -m "Remove location background mode; fix auto check-in geofencing"
eas build --platform ios --profile production
eas submit --platform ios --profile production
```

`autoIncrement` is on, so this became **build 22** (EAS build
`446f1482-0ba5-425a-b338-36ca34a6d51d`, finished 2026-07-31 from commit
`735f7f0`).

**Binary verified.** The shipped IPA was downloaded and unpacked; the embedded
`Payload/Attendize.app/Info.plist` resolves to:

```
UIBackgroundModes = ["fetch"]
CFBundleVersion  = 22
```

No `location` entry. This is the artifact-level proof that 2.5.4 is addressed —
worth re-running with `plutil -extract UIBackgroundModes json -o -` on any future
build, since `ios/` is gitignored and the local copy can go stale.

If build 22 does not appear in the App Store Connect build picker, `eas submit`
was never run for it:

```sh
eas submit --platform ios --profile production   # pick build 22
```

### Step 3 — App Store Connect metadata

In **App Store Connect → Attendize → the 1.0 version page**:

1. **Description** — replace with the updated copy from `app-store-listing.md`.
   It lists all three plans with prices and ends with the two labelled links.
2. **App Information → Privacy Policy URL** —
   `https://lindascomputing.xyz/class-attendance-tracker-ios-android/privacy.html`
   (this was an unfilled placeholder before).
3. Leave the custom **EULA** field empty — we use Apple's standard EULA, so the
   description link is the correct route.
4. **Build** — select build 22.
5. **App Review Information → Notes** — paste the "Subscription information" and
   "Location" blocks from `app-store-listing.md`. Apple explicitly asked for
   these on future submissions.
6. **Sign-In Information** — confirm `devtest` / `devtestpassword` is set and
   "Sign-in required" is checked. Guest mode is gone, so this is the only way in.
7. **Save**, then **Add for Review** → **Submit to App Review**.

The three subscriptions and the subscription group were only marked "Rejected"
because the app was; selecting the new build and submitting re-submits them
automatically. No need to recreate them.

### Step 4 — reply in Resolution Center

Send both replies below as a single message, in the app's Resolution Center
thread for submission `f3f1f0d8-6373-4f92-bd96-594c07c288ab`.

Apple asked for a **screen recording** confirming the 3.1.2(c) information is
present. Record ~30 seconds on device or Simulator:

1. Sign in as `devtest`, open any Premium prompt → **Attendize Premium**.
2. Show the three plan rows — each with its title, billing period, price and
   price per month.
3. Scroll to the auto-renewal disclosure paragraph.
4. Tap **Terms of Use**, show it opens Apple's standard EULA, come back.
5. Tap **Privacy Policy**, show it opens the hosted policy.
6. Go to **Settings → General** and show the same two rows there.

No recording is needed for 2.5.4 — Apple only asks for one if you are *claiming*
persistent background location. We removed the key instead.

#### Combined reply — copy this verbatim

> Hello, and thank you for the detailed review.
>
> **Guideline 3.1.2(c) — subscription information**
>
> We have updated the App Store metadata. The App Description now lists each
> auto-renewable subscription with its title, length, price and price per month:
> Premium (Monthly) — $3.99 per month; Premium (6-Month) — $17.99 every 6 months
> ($3.00 per month); Premium (Annual) — $29.99 per year ($2.50 per month). It
> states the auto-renewal terms and ends with functional links to both our
> Privacy Policy and the Terms of Use (EULA). We use Apple's standard EULA:
> https://www.apple.com/legal/internet-services/itunes/dev/stdeula/
> The Privacy Policy URL field in App Store Connect is also populated:
> https://lindascomputing.xyz/class-attendance-tracker-ios-android/privacy.html
>
> Inside the app, the "Attendize Premium" screen shows each plan's title, length,
> price and price per month, the auto-renewal terms, and tappable links to the
> Privacy Policy and the Terms of Use. Both links are also available in
> Settings → General. A screen recording confirming this is attached, and the
> same information is now in the App Review Information notes.
>
> **Guideline 2.5.4 — UIBackgroundModes**
>
> We have removed the "location" value from the UIBackgroundModes key. Build 22
> declares only "fetch". The app does not require persistent real-time location.
>
> Our only location feature is region monitoring, exactly as your guidance
> recommends. A student can optionally pin a course to a place; iOS then wakes
> the app on region entry to offer or automatically record an attendance
> check-in. The app never calls startLocationUpdatesAsync or watchPositionAsync
> and never streams continuous location.
>
> Please review build 22, which contains this change. Thank you.

---

## Known follow-ups (not blocking this resubmission)

1. **`fetch` remains in UIBackgroundModes.** `expo-task-manager`'s plugin adds it
   unconditionally, but the app registers no background-fetch task — the same
   class of issue Apple raised for `location`. Reviewers rarely flag `fetch`, so
   it is left alone to keep this resubmission's diff tight. If it is ever
   questioned, strip it with a small config plugin.
2. **iOS monitors at most 20 regions per app.** Pinning more than 20 courses
   silently fails for the excess.
3. **`NSLocationAlwaysUsageDescription` is a generic string.** The shipped
   Info.plist carries "Allow Attendize to access your location" — injected by
   `expo-location`'s plugin, not by `app.config.ts`, which only sets the
   When-In-Use and AlwaysAndWhenInUse strings. It is the deprecated pre-iOS-11
   key and has survived 23 builds unflagged, but a vague purpose string is a 5.1.1
   risk. Override it in `ios.infoPlist` if it is ever raised.
3. **Dead code:** `services/notificationService.ts:67` and `:163` are exported
   but never imported, duplicating permission logic `geofencing.ts` handles.
4. ~~**`Help & feedback`** in Settings still has a no-op `onPress`.~~ **Fixed for
   build 23** — it now opens a `mailto:` to `support@zawmbi.com` (the address the
   privacy policy publishes), falling back to the support site and then an alert
   if no mail client is configured. It sat directly above the two legal rows a
   reviewer taps to verify 3.1.2(c), so a dead tap there was a live 2.1 risk.

---

## Also fixed in this build: "Auto check-in on arrival" never armed

Settings asked for background location permission when the Premium auto-check-in
toggle was switched on, but `syncGeofences` only built regions when
`locationRemindersEnabled` was true — so enabling *only* that toggle registered
no regions and arrivals never fired. Plausibly part of why the reviewer could not
find a location feature.

- `services/geofencing.ts` — either toggle now arms region monitoring. They
  select what happens on arrival (auto-log vs. nudge), not whether to monitor.
- `app/(tabs)/_layout.tsx` — added `autoCheckInEnabled` to the sync effect's
  dependency array so flipping it re-syncs immediately.
- `__tests__/services/geofencing.test.ts` (**new**) — 6 tests covering both
  gating paths, one-region-per-class keyed by class id, unpinned classes,
  stop-when-both-off, and the missing-permission path.
