import { Platform } from "react-native";

// `react-native-iap` is a native module: it does not exist in Expo Go or on
// web. We require it lazily so the JS bundle still loads everywhere; every
// helper below degrades gracefully (no-op / empty) when it's unavailable.
type RNIap = typeof import("react-native-iap");
let nativeIap: RNIap | null = null;
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  nativeIap = require("react-native-iap");
} catch {
  nativeIap = null;
}

export const iapAvailable = () => nativeIap !== null && Platform.OS !== "web";

// Auto-renewable subscription product IDs. These MUST exactly match the
// products you create in App Store Connect (one subscription group with two
// durations) and in the Google Play Console. Keep them in sync if you rename.
export const PREMIUM_MONTHLY_ID = "com.attendancetrackerappsorganization.attendancetrackerapp.premium.monthly";
export const PREMIUM_ANNUAL_ID = "com.attendancetrackerappsorganization.attendancetrackerapp.premium.annual";
export const PREMIUM_SKUS = [PREMIUM_MONTHLY_ID, PREMIUM_ANNUAL_ID];

export const isPremiumSku = (sku?: string | null): boolean => !!sku && PREMIUM_SKUS.includes(sku);

// A platform-neutral view of a subscription product for the paywall UI.
export interface PremiumPlan {
  sku: string;
  title: string; // "Monthly" | "Annual"
  priceLabel: string; // localized, e.g. "$2.99"
  period: "month" | "year";
  // The raw library object — needed to pass the Android offer token at purchase.
  raw: unknown;
}

const androidFormattedPrice = (sub: any): string | undefined => {
  const phases = sub?.subscriptionOfferDetails?.[0]?.pricingPhases?.pricingPhaseList;
  if (Array.isArray(phases) && phases.length) {
    // The last pricing phase is the ongoing recurring price; earlier phases may
    // be a free trial or intro offer.
    return phases[phases.length - 1]?.formattedPrice;
  }
  return undefined;
};

const toPlan = (sub: any): PremiumPlan => {
  const sku: string = sub.productId;
  const isAnnual = sku === PREMIUM_ANNUAL_ID;
  const priceLabel = Platform.OS === "ios" ? sub.localizedPrice : androidFormattedPrice(sub);
  return {
    sku,
    title: isAnnual ? "Annual" : "Monthly",
    priceLabel: priceLabel ?? "",
    period: isAnnual ? "year" : "month",
    raw: sub
  };
};

// Opens the billing connection. Safe to call once on app start. Returns false
// when IAP isn't available (Expo Go / web) so callers can show a fallback.
export const connect = async (): Promise<boolean> => {
  if (!nativeIap) return false;
  await nativeIap.initConnection();
  if (Platform.OS === "android" && nativeIap.flushFailedPurchasesCachedAsPendingAndroid) {
    // Required by Play Billing: clears stale failed purchases before we start.
    try {
      await nativeIap.flushFailedPurchasesCachedAsPendingAndroid();
    } catch {
      // non-fatal
    }
  }
  return true;
};

export const disconnect = (): void => {
  if (!nativeIap) return;
  try {
    nativeIap.endConnection();
  } catch {
    // non-fatal
  }
};

export const fetchPlans = async (): Promise<PremiumPlan[]> => {
  if (!nativeIap) return [];
  const subs = await nativeIap.getSubscriptions({ skus: PREMIUM_SKUS });
  // Monthly first, Annual second, for a stable paywall layout.
  return subs.map(toPlan).sort((a, b) => (a.period === "month" ? -1 : 1) - (b.period === "month" ? -1 : 1));
};

// Kicks off the native purchase sheet. The granted entitlement is delivered
// asynchronously via the purchase listener (see setupPurchaseListeners).
export const purchasePlan = async (plan: PremiumPlan): Promise<void> => {
  if (!nativeIap) {
    throw new Error("In-app purchases aren't available on this device.");
  }
  const sku = plan.sku;
  if (Platform.OS === "android") {
    const offerToken = (plan.raw as any)?.subscriptionOfferDetails?.[0]?.offerToken;
    await nativeIap.requestSubscription({
      sku,
      ...(offerToken ? { subscriptionOffers: [{ sku, offerToken }] } : {})
    });
    return;
  }
  await nativeIap.requestSubscription({ sku });
};

// Finalizes a purchase so the store stops re-delivering it. Must be called for
// every purchase event once the entitlement has been recorded.
export const completePurchase = async (purchase: unknown): Promise<void> => {
  if (!nativeIap) return;
  try {
    await nativeIap.finishTransaction({ purchase: purchase as any, isConsumable: false });
  } catch {
    // non-fatal — the listener will fire again on next launch if this fails.
  }
};

// Returns true if the account currently owns one of our subscriptions. Note:
// this is a client-side check (no server receipt validation), which is fine for
// a simple on-device entitlement; add server validation if you ever need to be
// strict about expiry.
export const restore = async (): Promise<boolean> => {
  if (!nativeIap) return false;
  const purchases = await nativeIap.getAvailablePurchases();
  return purchases.some((p: any) => isPremiumSku(p.productId));
};

export interface PurchaseListeners {
  onPurchase: (purchase: unknown) => void;
  onError: (error: unknown) => void;
}

// Registers listeners for purchase success/failure. Returns a cleanup function.
export const setupPurchaseListeners = (handlers: PurchaseListeners): (() => void) => {
  if (!nativeIap) return () => {};
  const updateSub = nativeIap.purchaseUpdatedListener(handlers.onPurchase as any);
  const errorSub = nativeIap.purchaseErrorListener(handlers.onError as any);
  return () => {
    updateSub.remove();
    errorSub.remove();
  };
};
