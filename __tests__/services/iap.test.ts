// Mock the native module so the wrapper can be exercised in Node.
jest.mock("react-native-iap", () => ({
  initConnection: jest.fn().mockResolvedValue(true),
  endConnection: jest.fn(),
  flushFailedPurchasesCachedAsPendingAndroid: jest.fn().mockResolvedValue(undefined),
  getSubscriptions: jest.fn(),
  requestSubscription: jest.fn().mockResolvedValue(undefined),
  getAvailablePurchases: jest.fn(),
  finishTransaction: jest.fn().mockResolvedValue(undefined),
  purchaseUpdatedListener: jest.fn(() => ({ remove: jest.fn() })),
  purchaseErrorListener: jest.fn(() => ({ remove: jest.fn() }))
}));

import * as RNIap from "react-native-iap";
import {
  connect,
  fetchPlans,
  iapAvailable,
  isPremiumSku,
  PREMIUM_ANNUAL_ID,
  PREMIUM_MONTHLY_ID,
  PREMIUM_SKUS,
  purchasePlan,
  restore
} from "@/services/iap";

const mocked = RNIap as jest.Mocked<typeof RNIap>;

describe("product identity", () => {
  it("exposes the two premium SKUs", () => {
    expect(PREMIUM_SKUS).toEqual([PREMIUM_MONTHLY_ID, PREMIUM_ANNUAL_ID]);
  });
  it("isPremiumSku recognizes only our products", () => {
    expect(isPremiumSku(PREMIUM_MONTHLY_ID)).toBe(true);
    expect(isPremiumSku(PREMIUM_ANNUAL_ID)).toBe(true);
    expect(isPremiumSku("com.someone.else")).toBe(false);
    expect(isPremiumSku(null)).toBe(false);
  });
  it("iapAvailable is true when the native module loads", () => {
    expect(iapAvailable()).toBe(true);
  });
});

describe("connect", () => {
  it("opens the billing connection", async () => {
    await expect(connect()).resolves.toBe(true);
    expect(mocked.initConnection).toHaveBeenCalled();
  });
});

describe("fetchPlans", () => {
  it("maps store subscriptions to platform-neutral plans (monthly first)", async () => {
    mocked.getSubscriptions.mockResolvedValueOnce([
      { productId: PREMIUM_ANNUAL_ID, localizedPrice: "$19.99" },
      { productId: PREMIUM_MONTHLY_ID, localizedPrice: "$2.99" }
    ] as never);

    const plans = await fetchPlans();
    expect(plans.map((p) => p.title)).toEqual(["Monthly", "Annual"]);
    expect(plans[0]).toMatchObject({ sku: PREMIUM_MONTHLY_ID, period: "month", priceLabel: "$2.99" });
    expect(plans[1]).toMatchObject({ sku: PREMIUM_ANNUAL_ID, period: "year", priceLabel: "$19.99" });
  });
});

describe("purchasePlan", () => {
  it("requests the subscription by SKU (iOS path)", async () => {
    await purchasePlan({ sku: PREMIUM_MONTHLY_ID, title: "Monthly", priceLabel: "$2.99", period: "month", raw: {} });
    expect(mocked.requestSubscription).toHaveBeenCalledWith({ sku: PREMIUM_MONTHLY_ID });
  });
});

describe("restore", () => {
  it("returns true when an owned purchase matches a premium SKU", async () => {
    mocked.getAvailablePurchases.mockResolvedValueOnce([{ productId: PREMIUM_ANNUAL_ID }] as never);
    await expect(restore()).resolves.toBe(true);
  });
  it("returns false when no premium purchase is owned", async () => {
    mocked.getAvailablePurchases.mockResolvedValueOnce([{ productId: "com.other.thing" }] as never);
    await expect(restore()).resolves.toBe(false);
    mocked.getAvailablePurchases.mockResolvedValueOnce([] as never);
    await expect(restore()).resolves.toBe(false);
  });
});
