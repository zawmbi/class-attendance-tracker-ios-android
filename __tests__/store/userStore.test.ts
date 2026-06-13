import { useUserStore } from "@/store/userStore";

const reset = () => {
  useUserStore.getState().reset();
  useUserStore.getState().closeUpgradeModal();
};

beforeEach(reset);

describe("premium entitlement", () => {
  it("defaults to locked (no free premium)", () => {
    expect(useUserStore.getState().isPremium).toBe(false);
  });
  it("setPremium toggles the entitlement", () => {
    useUserStore.getState().setPremium(true);
    expect(useUserStore.getState().isPremium).toBe(true);
    useUserStore.getState().setPremium(false);
    expect(useUserStore.getState().isPremium).toBe(false);
  });
});

describe("upgrade prompts", () => {
  it("opens an upgrade prompt by reason", () => {
    useUserStore.getState().openUpgradeModal("analytics");
    expect(useUserStore.getState().upgradePrompt).toBe("analytics");
  });
  it("does not reopen a prompt the user has already dismissed (seen)", () => {
    useUserStore.getState().markPromptSeen("analytics");
    useUserStore.getState().closeUpgradeModal();
    useUserStore.getState().openUpgradeModal("analytics");
    expect(useUserStore.getState().upgradePrompt).toBeNull();
  });
  it("markPromptSeen records the reason once", () => {
    useUserStore.getState().markPromptSeen("syllabus_import");
    useUserStore.getState().markPromptSeen("syllabus_import");
    expect(useUserStore.getState().seenUpgradePrompts.filter((r) => r === "syllabus_import")).toHaveLength(1);
  });
});

describe("auth", () => {
  it("signIn sets authenticated profile fields", () => {
    useUserStore.getState().signIn("email", "Ada", "ada@example.com");
    const state = useUserStore.getState();
    expect(state.isAuthenticated).toBe(true);
    expect(state.authProvider).toBe("email");
    expect(state.userName).toBe("Ada");
  });
  it("signOut clears the session and dev flag", () => {
    useUserStore.getState().signIn("email", "Ada", "ada@example.com");
    useUserStore.getState().setIsDev(true);
    useUserStore.getState().signOut();
    const state = useUserStore.getState();
    expect(state.isAuthenticated).toBe(false);
    expect(state.userName).toBe("");
    expect(state.isDev).toBe(false);
  });
  it("reset returns premium and auth to initial state", () => {
    useUserStore.getState().setPremium(true);
    useUserStore.getState().signIn("apple", "Grace", "grace@example.com");
    useUserStore.getState().reset();
    const state = useUserStore.getState();
    expect(state.isPremium).toBe(false);
    expect(state.isAuthenticated).toBe(false);
  });
});
