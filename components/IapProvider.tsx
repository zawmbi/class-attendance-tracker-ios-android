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
}

const IapContext = createContext<IapContextValue | null>(null);

export const IapProvider = ({ children }: { children: React.ReactNode }) => {
  const setPremium = useUserStore((s) => s.setPremium);
  const [available, setAvailable] = useState(false);
  const [plans, setPlans] = useState<PremiumPlan[]>([]);
  const [loadingPlans, setLoadingPlans] = useState(true);
  const [purchasing, setPurchasing] = useState<string | null>(null);
  const [restoring, setRestoring] = useState(false);

  useEffect(() => {
    let mounted = true;
    let cleanupListeners: () => void = () => {};

    const init = async () => {
      const ok = await Iap.connect().catch(() => false);
      if (!mounted) {
        return;
      }
      setAvailable(ok);
      if (!ok) {
        setLoadingPlans(false);
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
        onError: () => {
          if (mounted) {
            setPurchasing(null);
          }
        }
      });

      try {
        const fetched = await Iap.fetchPlans();
        if (mounted) {
          setPlans(fetched);
        }
      } catch {
        // Leave plans empty; the paywall shows an "unavailable" fallback.
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
    <IapContext.Provider value={{ available, plans, loadingPlans, purchasing, restoring, purchase, restore }}>
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
