#!/usr/bin/env bash
# Fast simulator switcher — installs the ALREADY-BUILT app on a chosen simulator
# and launches it against a running Metro. No rebuild, no re-download.
#
# ── One-time per coding session ────────────────────────────────────────────
#   1. Build the app once for the simulator:   npx expo run:ios
#   2. Leave Metro running in its own terminal: npx expo start
#
# ── Then switch devices instantly (another terminal) ───────────────────────
#   bash scripts/sim.sh "iPad Pro 13-inch (M4)"
#   bash scripts/sim.sh "iPhone 16 Pro Max"
#   bash scripts/sim.sh                  # no arg → lists available simulators
#
# JS changes hot-reload automatically. You only need `npx expo run:ios` again
# if you change NATIVE code (new native package, icon/splash, app.config native bits).

set -euo pipefail
BUNDLE_ID="com.attendancetrackerappsorganization.attendancetrackerapp"
SCHEME="attendance-tracker"
PORT=8081

if [ "${1:-}" = "" ]; then
  echo "Available iOS simulators:"
  xcrun simctl list devices available | grep -iE "iphone|ipad" | sed -E 's/ \([0-9A-F-]+\).*//I; s/^[[:space:]]*/  /'
  echo
  echo "Usage: bash scripts/sim.sh \"<device name>\"   (quote names with spaces)"
  exit 0
fi
DEVICE="$1"

# Newest built simulator .app from Xcode DerivedData.
APP="$(ls -td "$HOME"/Library/Developer/Xcode/DerivedData/AttendanceTracker-*/Build/Products/Debug-iphonesimulator/AttendanceTracker.app 2>/dev/null | head -1 || true)"
if [ -z "$APP" ] || [ ! -d "$APP" ]; then
  echo "✗ No built app found. Run 'npx expo run:ios' once first, then use this script to switch devices."
  exit 1
fi

if ! curl -s -o /dev/null "http://localhost:$PORT/status" 2>/dev/null; then
  echo "⚠️  Metro isn't running on :$PORT — start it in another terminal:  npx expo start"
fi

open -a Simulator
xcrun simctl boot "$DEVICE" 2>/dev/null || true   # already-booted is fine
xcrun simctl install "$DEVICE" "$APP"
# Open pointed at Metro (covers both dev-client and plain debug builds).
xcrun simctl launch "$DEVICE" "$BUNDLE_ID" >/dev/null 2>&1 || true
xcrun simctl openurl "$DEVICE" "$SCHEME://expo-development-client/?url=http%3A%2F%2Flocalhost%3A$PORT" >/dev/null 2>&1 || true
echo "✅ Launched on: $DEVICE  (JS served by Metro on :$PORT)"
