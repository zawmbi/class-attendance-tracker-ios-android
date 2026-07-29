# Local StoreKit testing

`Attendize.storekit` fakes the App Store on-device and in the simulator. With it
enabled, the paywall loads real product metadata and purchases complete
instantly — no sandbox tester, no App Store Connect products, and **no Paid
Applications Agreement**. That last point is what makes it useful for testing
before the agreement is active.

The three products mirror `services/iap.ts` exactly, each with the 2-week free
trial the paywall promises:

| Product ID suffix    | Duration | Price  |
| -------------------- | -------- | ------ |
| `.premium.monthly`   | P1M      | $3.99  |
| `.premium.semiannual`| P6M      | $17.99 |
| `.premium.annual`    | P1Y      | $29.99 |

## Enabling it

This file lives outside `ios/` on purpose — `ios/` is gitignored and
`expo prebuild --clean` deletes it. The *scheme setting* below does live inside
`ios/`, so it has to be redone after a clean prebuild.

1. `open ios/Attendize.xcworkspace`
2. Drag `storekit/Attendize.storekit` into the project navigator. Uncheck
   "Copy items if needed" so it keeps referencing the tracked file.
3. Product → Scheme → Edit Scheme → Run → Options.
4. Set **StoreKit Configuration** to `Attendize.storekit`.
5. Run from Xcode (not `expo run:ios` — the scheme option only applies to
   Xcode-launched runs).

## Verifying it worked

Open the paywall. Prices should render from the config, and the button should
be enabled. If it still says "Subscriptions aren't available here", the
dev-only `IAP debug —` line underneath names the failing layer
(see `components/IapProvider.tsx`).

## What it does not prove

StoreKit config testing bypasses the real store entirely, so a passing local
purchase does **not** confirm that:

- the Paid Applications Agreement is active,
- the products exist in App Store Connect with matching IDs,
- the subscription group, pricing, and localizations are approved.

All three still have to be true before review, and are best confirmed with a
sandbox purchase on a TestFlight build.

## Transaction controls

While running with the config, Xcode's Debug → StoreKit menu can expire
subscriptions, trigger renewals, force refunds, and clear purchase history.
The `_timeRate` in the file is `0` (real time); raise it to accelerate renewal
cycles when testing expiry.
