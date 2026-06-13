import { AttendanceRecord, AttendanceSettings, ClassModel } from "@/utils/types";

// Bump if the persisted snapshot shape changes in an incompatible way.
export const SYNC_SCHEMA_VERSION = 1;

// A full point-in-time copy of a user's data, stored at /users/{uid} in
// Firestore. Conflict resolution is snapshot-level last-write-wins keyed on
// `updatedAt` — simple and predictable for a single-user, multi-device app.
// (For true per-record merging you'd add per-record timestamps; documented as a
// future improvement.)
export interface SyncSnapshot {
  version: number;
  updatedAt: number; // epoch ms
  classes: ClassModel[];
  records: AttendanceRecord[];
  settings: AttendanceSettings;
}

export const buildSnapshot = (
  classes: ClassModel[],
  records: AttendanceRecord[],
  settings: AttendanceSettings,
  updatedAt: number = Date.now()
): SyncSnapshot => ({
  version: SYNC_SCHEMA_VERSION,
  updatedAt,
  classes,
  records,
  settings
});

export interface MergeResult {
  // The snapshot that should be treated as the source of truth after the sync.
  winner: SyncSnapshot;
  // True when the remote copy was newer and should replace local state.
  remoteIsNewer: boolean;
}

// Decide which side wins. Newer `updatedAt` wins; ties favor local (the device
// initiating the sync). A missing side loses to a present one.
export const mergeSnapshots = (local: SyncSnapshot | null, remote: SyncSnapshot | null): MergeResult => {
  if (!remote) {
    if (!local) {
      throw new Error("Nothing to sync: both local and remote snapshots are empty.");
    }
    return { winner: local, remoteIsNewer: false };
  }
  if (!local) {
    return { winner: remote, remoteIsNewer: true };
  }
  const remoteIsNewer = remote.updatedAt > local.updatedAt;
  return { winner: remoteIsNewer ? remote : local, remoteIsNewer };
};

// Coarse human label for "last synced N ago", used in Settings.
export const formatSyncedAt = (epochMs: number | null, now: number = Date.now()): string => {
  if (!epochMs) {
    return "Not backed up yet";
  }
  const diffMin = Math.floor((now - epochMs) / 60000);
  if (diffMin < 1) return "Backed up just now";
  if (diffMin < 60) return `Backed up ${diffMin} min ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `Backed up ${diffHr} hr ago`;
  const diffDay = Math.floor(diffHr / 24);
  return `Backed up ${diffDay} day${diffDay === 1 ? "" : "s"} ago`;
};
