import { createContext, useCallback, useContext, useEffect, useState } from "react";

import * as Iap from "@/services/iap";
import { PremiumPlan } from "@/services/iap";
import { useUserStore } from "@/store/userStore";

interface IapContextValue {
  // Whether the billing connection opened (false in Expo Go / web).
  available: boolean;
  plans: PremiumPlan[];
  loadingPlans: boolean;
  // The SKU currently being purchased, or null.
  purchasing: string | null;
  restoring: boolean;
  purchase: (plan: PremiumPlan) => Promise<void>;
  // Returns true if an active subscription was found and premium was granted.
  restore: () => Promise<boolean>;
  // Why the paywall is unusable, when it is. Every failure below is otherwise
  // swallowed so the JS bundle keeps loading, which makes "subscriptions aren't
  // available" indistinguishable from a missing agreement or a SKU typo. Shown
  // on the paywall in dev builds only — see PremiumScreen.
  diagnostic: string | null;
}

const IapContext = createContext<IapContextValue | null>(null);

const describeError = (error: unknown): string => {
  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;
  try {
    return JSON.stringify(error);
  } catch {
    return String(error);
  }
};

export const IapProvider = ({ children }: { children: React.ReactNode }) => {
  const setPremium = useUserStore((s) => s.setPremium);
  const [available, setAvailable] = useState(false);
  const [plans, setPlans] = useState<PremiumPlan[]>([]);
  const [loadingPlans, setLoadingPlans] = useState(true);
  const [purchasing, setPurchasing] = useState<string | null>(null);
  const [restoring, setRestoring] = useState(false);
  const [diagnostic, setDiagnostic] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    let cleanupListeners: () => void = () => {};

    const init = async () => {
      let connectError: string | null = null;
      const ok = await Iap.connect().catch((error) => {
        connectError = describeError(error);
        return false;
      });
      if (!mounted) {
        return;
      }
      setAvailable(ok);
      if (!ok) {
        setLoadingPlans(false);
        setDiagnostic(
          connectError
            ? `Store connection failed: ${connectError}`
            : "Store connection unavailable (expo-iap native module missing — Expo Go or web?)"
        );
        return;
      }

      // Grant entitlement as soon as a purchase completes (new buy, a pending
      // "ask to buy" approval, or a transaction left unfinished last launch).
      cleanupListeners = Iap.setupPurchaseListeners({
        onPurchase: async (purchase) => {
          try {
            if (Iap.isPremiumSku((purchase as any)?.productId)) {
              setPremium(true);
            }
            await Iap.completePurchase(purchase);
          } finally {
            if (mounted) {
              setPurchasing(null);
            }
          }
        },
        onError: (error) => {
          if (mounted) {
            setPurchasing(null);
            setDiagnostic(`Purchase failed: ${describeError(error)}`);
          }
        }
      });

      try {
        const fetched = await Iap.fetchPlans();
        if (mounted) {
          setPlans(fetched);
          // Connected but nothing came back: the store accepted the query and
          // returned zero matching products. Almost always App Store Connect
          // config rather than app code — see the checklist in the message.
          setDiagnostic(
            fetched.length > 0
              ? null
              : `Connected, but the store returned 0 of ${Iap.PREMIUM_SKUS.length} products.\n` +
                  "Check, in order: Paid Applications Agreement active (Business -> Agreements, " +
                  "plus bank + tax info); all three subscriptions in 'Ready to Submit' with a price " +
                  "and localization; product IDs match services/iap.ts exactly; bundle ID matches."
          );
        }
      } catch (error) {
        // Leave plans empty; the paywall shows an "unavailable" fallback.
        if (mounted) {
          setDiagnostic(`Product fetch failed: ${describeError(error)}`);
        }
      } finally {
        if (mounted) {
          setLoadingPlans(false);
        }
      }

      // Re-grant premium to anyone who already subscribed (new device, reinstall).
      try {
        const active = await Iap.restore();
        if (mounted && active) {
          setPremium(true);
        }
      } catch {
        // offline / transient — entitlement stays as persisted.
      }
    };

    init();
    return () => {
      mounted = false;
      cleanupListeners();
      Iap.disconnect();
    };
  }, [setPremium]);

  const purchase = useCallback(async (plan: PremiumPlan) => {
    setPurchasing(plan.sku);
    try {
      await Iap.purchasePlan(plan);
      // Entitlement is granted by the purchase listener above.
    } catch (error) {
      setPurchasing(null);
      throw error;
    }
  }, []);

  const restore = useCallback(async () => {
    setRestoring(true);
    try {
      const active = await Iap.restore();
      if (active) {
        setPremium(true);
      }
      return active;
    } finally {
      setRestoring(false);
    }
  }, [setPremium]);

  return (
    <IapContext.Provider value={{ available, plans, loadingPlans, purchasing, restoring, purchase, restore, diagnostic }}>
      {children}
    </IapContext.Provider>
  );
};

export const useIap = (): IapContextValue => {
  const ctx = useContext(IapContext);
  if (!ctx) {
    throw new Error("useIap must be used within an IapProvider");
  }
  return ctx;
};
