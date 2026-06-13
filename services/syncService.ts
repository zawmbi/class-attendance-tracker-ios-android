import { doc, getDoc, setDoc } from "firebase/firestore";

import { auth, db } from "@/services/firebase";
import { buildSnapshot, mergeSnapshots, SyncSnapshot } from "@/utils/sync";
import { AttendanceRecord, AttendanceSettings, ClassModel } from "@/utils/types";

const userDoc = (uid: string) => doc(db, "users", uid);

const requireUid = (): string => {
  const uid = auth.currentUser?.uid;
  if (!uid) {
    throw new Error("Sign in with an account to use cloud backup.");
  }
  return uid;
};

// Firestore rejects `undefined`; round-trip through JSON to drop optional fields
// that are unset (e.g. an absent linkedGroup).
const sanitize = <T>(value: T): T => JSON.parse(JSON.stringify(value));

export const pullSnapshot = async (uid: string): Promise<SyncSnapshot | null> => {
  const snap = await getDoc(userDoc(uid));
  return snap.exists() ? (snap.data() as SyncSnapshot) : null;
};

export const pushSnapshot = async (uid: string, snapshot: SyncSnapshot): Promise<void> => {
  await setDoc(userDoc(uid), sanitize(snapshot));
};

export interface SyncOutcome {
  // The snapshot now considered authoritative.
  applied: SyncSnapshot;
  // True if remote was newer and local state should be replaced with `applied`.
  pulledNewer: boolean;
  // True if we wrote local state up to the cloud.
  pushed: boolean;
}

// Two-way sync: pull remote, compare, then either adopt remote (if newer) or
// push local up. Returns what happened so the caller can update local state.
export const syncNow = async (
  classes: ClassModel[],
  records: AttendanceRecord[],
  settings: AttendanceSettings
): Promise<SyncOutcome> => {
  const uid = requireUid();
  const local = buildSnapshot(classes, records, settings);
  const remote = await pullSnapshot(uid);
  const { winner, remoteIsNewer } = mergeSnapshots(local, remote);

  if (remoteIsNewer) {
    return { applied: winner, pulledNewer: true, pushed: false };
  }

  await pushSnapshot(uid, local);
  return { applied: local, pulledNewer: false, pushed: true };
};

// Force-replace the cloud copy with local state (explicit "Back up now").
export const backupNow = async (
  classes: ClassModel[],
  records: AttendanceRecord[],
  settings: AttendanceSettings
): Promise<SyncSnapshot> => {
  const uid = requireUid();
  const snapshot = buildSnapshot(classes, records, settings);
  await pushSnapshot(uid, snapshot);
  return snapshot;
};

// Force-replace local state with the cloud copy (explicit "Restore").
export const restoreFromCloud = async (): Promise<SyncSnapshot | null> => {
  const uid = requireUid();
  return pullSnapshot(uid);
};
