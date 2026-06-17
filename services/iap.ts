import { Platform } from "react-native";

// `expo-iap` is an Expo native module: it works in dev/production builds on iOS
// and Android, but not on web. Every helper below degrades gracefully (no-op /
// empty) when it isn't usable so the JS bundle still loads everywhere.
import {
  endConnection,
  fetchProducts,
  finishTransaction,
  getAvailablePurchases,
  initConnection,
  purchaseErrorListener,
  purchaseUpdatedListener,
  requestPurchase,
  type Product,
  type Purchase
} from "expo-iap";

export const iapAvailable = () => Platform.OS !== "web";

// Auto-renewable subscription product IDs. These MUST exactly match the
// products you create in App Store Connect (one subscription group with three
// durations) and in the Google Play Console. Keep them in sync if you rename.
export const PREMIUM_MONTHLY_ID = "com.attendancetrackerappsorganization.attendancetrackerapp.premium.monthly";
export const PREMIUM_SEMIANNUAL_ID = "com.attendancetrackerappsorganization.attendancetrackerapp.premium.semiannual";
export const PREMIUM_ANNUAL_ID = "com.attendancetrackerappsorganization.attendancetrackerapp.premium.annual";
export const PREMIUM_SKUS = [PREMIUM_MONTHLY_ID, PREMIUM_SEMIANNUAL_ID, PREMIUM_ANNUAL_ID];

export const isPremiumSku = (sku?: string | null): boolean => !!sku && PREMIUM_SKUS.includes(sku);

export type PremiumPeriod = "month" | "6month" | "year";

// A platform-neutral view of a subscription product for the paywall UI.
export interface PremiumPlan {
  sku: string;
  title: string; // "Monthly" | "6-Month" | "Annual"
  priceLabel: string; // localized, e.g. "$2.99"
  period: PremiumPeriod;
  // The raw expo-iap product — needed to pass the Android offer token at purchase.
  raw: Product;
}

// Layout order: shortest to longest duration.
const PERIOD_ORDER: Record<PremiumPeriod, number> = { month: 0, "6month": 1, year: 2 };

const planMeta = (sku: string): { title: string; period: PremiumPeriod } => {
  if (sku === PREMIUM_ANNUAL_ID) return { title: "Annual", period: "year" };
  if (sku === PREMIUM_SEMIANNUAL_ID) return { title: "6-Month", period: "6month" };
  return { title: "Monthly", period: "month" };
};

const androidOfferToken = (product: Product): string | undefined =>
  (product as any)?.subscriptionOfferDetailsAndroid?.[0]?.offerToken ?? undefined;

const toPlan = (product: Product): PremiumPlan => ({
  sku: product.id,
  ...planMeta(product.id),
  // `displayPrice` is the store's localized, currency-correct price string.
  priceLabel: product.displayPrice ?? "",
  raw: product
});

// Opens the billing connection. Safe to call once on app start. Returns false
// when IAP isn't usable (web) so callers can show a fallback.
export const connect = async (): Promise<boolean> => {
  if (!iapAvailable()) return false;
  await initConnection();
  return true;
};

export const disconnect = (): void => {
  if (!iapAvailable()) return;
  try {
    void endConnection();
  } catch {
    // non-fatal
  }
};

export const fetchPlans = async (): Promise<PremiumPlan[]> => {
  if (!iapAvailable()) return [];
  const products = await fetchProducts({ skus: PREMIUM_SKUS, type: "subs" });
  // Shortest to longest duration, for a stable paywall layout.
  return (products ?? [])
    .filter((p): p is Product => !!p && isPremiumSku(p.id))
    .map(toPlan)
    .sort((a, b) => PERIOD_ORDER[a.period] - PERIOD_ORDER[b.period]);
};

// Kicks off the native purchase sheet. The granted entitlement is delivered
// asynchronously via the purchase listener (see setupPurchaseListeners).
export const purchasePlan = async (plan: PremiumPlan): Promise<void> => {
  if (!iapAvailable()) {
    throw new Error("In-app purchases aren't available on this device.");
  }
  const sku = plan.sku;
  if (Platform.OS === "android") {
    const offerToken = androidOfferToken(plan.raw);
    await requestPurchase({
      type: "subs",
      request: {
        android: {
          skus: [sku],
          ...(offerToken ? { subscriptionOffers: [{ sku, offerToken }] } : {})
        }
      }
    });
    return;
  }
  await requestPurchase({ type: "subs", request: { ios: { sku } } });
};

// Finalizes a purchase so the store stops re-delivering it. Must be called for
// every purchase event once the entitlement has been recorded.
export const completePurchase = async (purchase: Purchase): Promise<void> => {
  if (!iapAvailable()) return;
  try {
    await finishTransaction({ purchase, isConsumable: false });
  } catch {
    // non-fatal — the listener will fire again on next launch if this fails.
  }
};

// Returns true if the account currently owns one of our subscriptions. Note:
// this is a client-side check (no server receipt validation), which is fine for
// a simple on-device entitlement; add server validation if you ever need to be
// strict about expiry.
export const restore = async (): Promise<boolean> => {
  if (!iapAvailable()) return false;
  const purchases = await getAvailablePurchases();
  return (purchases ?? []).some((p) => isPremiumSku(p?.productId));
};

export interface PurchaseListeners {
  onPurchase: (purchase: Purchase) => void;
  onError: (error: unknown) => void;
}

// Registers listeners for purchase success/failure. Returns a cleanup function.
export const setupPurchaseListeners = (handlers: PurchaseListeners): (() => void) => {
  if (!iapAvailable()) return () => {};
  const updateSub = purchaseUpdatedListener(handlers.onPurchase);
  const errorSub = purchaseErrorListener(handlers.onError as (error: unknown) => void);
  return () => {
    updateSub.remove();
    errorSub.remove();
  };
};
