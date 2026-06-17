import { useGamificationStore } from "@/store/gamificationStore";

beforeEach(() => {
  useGamificationStore.getState().reset();
});

describe("acknowledgeAchievements", () => {
  it("records acknowledged ids without duplicates", () => {
    const store = useGamificationStore.getState();
    store.acknowledgeAchievements(["first_step", "warming_up"]);
    store.acknowledgeAchievements(["first_step"]);
    expect(useGamificationStore.getState().acknowledgedAchievements.sort()).toEqual(["first_step", "warming_up"]);
  });

  it("reset clears acknowledged achievements", () => {
    useGamificationStore.getState().acknowledgeAchievements(["first_step"]);
    useGamificationStore.getState().reset();
    expect(useGamificationStore.getState().acknowledgedAchievements).toHaveLength(0);
  });
});
