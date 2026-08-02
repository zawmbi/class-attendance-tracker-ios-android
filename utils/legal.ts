/**
 * Legal document URLs, shared by the paywall (screens/PremiumScreen.tsx) and
 * Settings (screens/SettingsScreen.tsx).
 *
 * App Store guideline 3.1.2(c) requires an app selling auto-renewable
 * subscriptions to carry functional links to both documents, and the same links
 * must appear in the App Store metadata (see docs/app-store-listing.md). Keep
 * these two places in sync — hence one module rather than per-screen constants.
 */

/** Apple's standard EULA. Swap for a hosted Terms of Use if we ever write one. */
export const TERMS_URL = "https://www.apple.com/legal/internet-services/itunes/dev/stdeula/";

/** Deep-links to the policy itself, not the site landing page — review checks this. */
export const PRIVACY_URL = "https://lindascomputing.xyz/class-attendance-tracker-ios-android/privacy.html";

/** The address published in the privacy policy; also the App Store support contact. */
export const SUPPORT_EMAIL = "support@zawmbi.com";

/** Fallback for Settings → Help & feedback when no mail client is configured. */
export const SUPPORT_URL = "https://lindascomputing.xyz/class-attendance-tracker-ios-android/";

export const SUPPORT_MAILTO = `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent("Attendize — help & feedback")}`;
