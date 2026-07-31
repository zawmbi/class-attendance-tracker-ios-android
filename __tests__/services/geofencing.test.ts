import { AttendanceSettings, ClassModel } from "@/utils/types";

const mockStartGeofencing = jest.fn();
const mockStopGeofencing = jest.fn();
const mockHasStartedGeofencing = jest.fn();
const mockGetBackgroundPermissions = jest.fn();

jest.mock("expo-location", () => ({
  __esModule: true,
  GeofencingEventType: { Enter: 1, Exit: 2 },
  startGeofencingAsync: (...args: unknown[]) => mockStartGeofencing(...args),
  stopGeofencingAsync: (...args: unknown[]) => mockStopGeofencing(...args),
  hasStartedGeofencingAsync: (...args: unknown[]) => mockHasStartedGeofencing(...args),
  getBackgroundPermissionsAsync: () => mockGetBackgroundPermissions()
}));
jest.mock("expo-task-manager", () => ({ __esModule: true, defineTask: jest.fn() }));
jest.mock("expo-notifications", () => ({ __esModule: true, scheduleNotificationAsync: jest.fn() }));

import { syncGeofences } from "@/services/geofencing";

const pinnedClass = (id: string): ClassModel =>
  ({ id, name: `Class ${id}`, latitude: 42.3, longitude: -83.1, schedule: [] } as unknown as ClassModel);

const settingsWith = (over: Partial<AttendanceSettings>) =>
  ({ locationRemindersEnabled: false, autoCheckInEnabled: false, ...over }) as AttendanceSettings;

beforeEach(() => {
  jest.clearAllMocks();
  mockHasStartedGeofencing.mockResolvedValue(false);
  mockGetBackgroundPermissions.mockResolvedValue({ granted: true });
  // syncGeofences chains .catch() on these, so they must return promises.
  mockStartGeofencing.mockResolvedValue(undefined);
  mockStopGeofencing.mockResolvedValue(undefined);
});

describe("syncGeofences", () => {
  it("registers regions when only location reminders are enabled", async () => {
    const count = await syncGeofences([pinnedClass("a")], settingsWith({ locationRemindersEnabled: true }));
    expect(count).toBe(1);
    expect(mockStartGeofencing).toHaveBeenCalledTimes(1);
  });

  // Regression: gating on locationRemindersEnabled alone meant enabling only the
  // Premium auto-check-in toggle registered nothing, so arrivals never fired.
  it("registers regions when only auto check-in is enabled", async () => {
    const count = await syncGeofences([pinnedClass("a")], settingsWith({ autoCheckInEnabled: true }));
    expect(count).toBe(1);
    expect(mockStartGeofencing).toHaveBeenCalledTimes(1);
  });

  it("registers one region per pinned class, keyed by class id", async () => {
    await syncGeofences([pinnedClass("a"), pinnedClass("b")], settingsWith({ locationRemindersEnabled: true }));
    const regions = mockStartGeofencing.mock.calls[0][1] as { identifier: string; notifyOnEnter: boolean }[];
    expect(regions.map((r) => r.identifier)).toEqual(["a", "b"]);
    expect(regions.every((r) => r.notifyOnEnter)).toBe(true);
  });

  it("skips classes with no pinned coordinates", async () => {
    const unpinned = { id: "u", name: "Unpinned", schedule: [] } as unknown as ClassModel;
    const count = await syncGeofences([pinnedClass("a"), unpinned], settingsWith({ locationRemindersEnabled: true }));
    expect(count).toBe(1);
  });

  it("stops monitoring when both toggles are off", async () => {
    mockHasStartedGeofencing.mockResolvedValue(true);
    const count = await syncGeofences([pinnedClass("a")], settingsWith({}));
    expect(count).toBe(0);
    expect(mockStopGeofencing).toHaveBeenCalledTimes(1);
    expect(mockStartGeofencing).not.toHaveBeenCalled();
  });

  it("does not start without background permission", async () => {
    mockGetBackgroundPermissions.mockResolvedValue({ granted: false });
    const count = await syncGeofences([pinnedClass("a")], settingsWith({ locationRemindersEnabled: true }));
    expect(count).toBe(0);
    expect(mockStartGeofencing).not.toHaveBeenCalled();
  });
});
