# Cloud Backup & Sync — setup (Premium)

The app code is in place (`services/syncService.ts`, `utils/sync.ts`, the
Settings → "Cloud backup" group). To make it work live you must enable Cloud
Firestore in the Firebase project (`attendance-tracker-4764d`) and add rules.

## 1. Enable Firestore
Firebase console → **Build → Firestore Database → Create database** →
Production mode → pick a region.

## 2. Security rules
Each user may only read/write their own document. Paste into **Firestore →
Rules**:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{uid} {
      allow read, write: if request.auth != null && request.auth.uid == uid;
    }
  }
}
```

## 3. How it works
- Data is stored at `/users/{uid}` as a single snapshot
  (`{ version, updatedAt, classes, records, settings }`).
- **Back up & sync now**: pulls the remote copy; if it's newer than local it
  replaces local state, otherwise it pushes local up. Snapshot-level
  last-write-wins keyed on `updatedAt`.
- **Restore from cloud**: force-replaces local data with the cloud copy.
- Only available to Premium subscribers and signed-in (non-guest) accounts.

## Limitations / future work
- Conflict resolution is whole-snapshot last-write-wins, not per-record merge.
  If two devices edit while offline, the later sync wins for the whole dataset.
  A per-record merge (add `updatedAt` to each record and union by id) would be
  the next step if multi-device concurrent editing becomes common.
- Entitlement and sync are client-side; there is no server validation of the
  subscription before allowing writes. Add an App Check / server check if you
  need to harden this.
- Not exercised against a live Firestore in CI — the merge/decision logic is
  covered by unit tests (`__tests__/utils/sync.test.ts`); the network calls are
  thin wrappers over the Firebase SDK.
