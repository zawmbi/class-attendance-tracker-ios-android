import { buildSnapshot, formatSyncedAt, mergeSnapshots, SYNC_SCHEMA_VERSION } from "@/utils/sync";
import { makeClass, makeRecord, makeSettings } from "../helpers/fixtures";

const settings = makeSettings();
const snap = (updatedAt: number) => buildSnapshot([makeClass()], [makeRecord()], settings, updatedAt);

describe("buildSnapshot", () => {
  it("captures classes/records/settings with a version and timestamp", () => {
    const s = buildSnapshot([makeClass()], [makeRecord()], settings, 1000);
    expect(s.version).toBe(SYNC_SCHEMA_VERSION);
    expect(s.updatedAt).toBe(1000);
    expect(s.classes).toHaveLength(1);
    expect(s.records).toHaveLength(1);
  });
});

describe("mergeSnapshots", () => {
  it("adopts remote when it is newer", () => {
    const result = mergeSnapshots(snap(100), snap(200));
    expect(result.remoteIsNewer).toBe(true);
    expect(result.winner.updatedAt).toBe(200);
  });

  it("keeps local when it is newer or tied", () => {
    expect(mergeSnapshots(snap(300), snap(200)).remoteIsNewer).toBe(false);
    expect(mergeSnapshots(snap(200), snap(200)).remoteIsNewer).toBe(false); // tie favors local
  });

  it("uses remote when there is no local, and local when there is no remote", () => {
    expect(mergeSnapshots(null, snap(50)).remoteIsNewer).toBe(true);
    expect(mergeSnapshots(snap(50), null).remoteIsNewer).toBe(false);
  });

  it("throws when both sides are empty", () => {
    expect(() => mergeSnapshots(null, null)).toThrow();
  });
});

describe("formatSyncedAt", () => {
  const now = new Date("2026-03-10T12:00:00Z").getTime();
  it("handles the never-synced case", () => {
    expect(formatSyncedAt(null, now)).toMatch(/not backed up/i);
  });
  it("describes recent and older syncs", () => {
    expect(formatSyncedAt(now - 30 * 1000, now)).toMatch(/just now/i);
    expect(formatSyncedAt(now - 5 * 60000, now)).toMatch(/5 min ago/);
    expect(formatSyncedAt(now - 3 * 3600000, now)).toMatch(/3 hr ago/);
    expect(formatSyncedAt(now - 2 * 86400000, now)).toMatch(/2 days ago/);
  });
});
