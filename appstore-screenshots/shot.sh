#!/usr/bin/env bash
#
# One screenshot from the booted simulator, straight into the right folder.
#
#   ./appstore-screenshots/shot.sh 07-patterns            # iPhone (default)
#   ./appstore-screenshots/shot.sh 07-patterns ipad-13    # iPad
#
# Exists because the full `xcrun simctl io <UDID> screenshot <long path>` line
# wraps when pasted into a terminal and breaks mid-path. Uses `booted` rather
# than a UDID so there's nothing long to mangle.
#
set -uo pipefail

NAME="${1:-}"
SET="${2:-iphone-6.9}"

if [[ -z "$NAME" ]]; then
  echo "usage: $0 <shot-name> [iphone-6.9|ipad-13]" >&2
  echo "e.g.:  $0 07-patterns" >&2
  exit 1
fi

case "$SET" in
  iphone-6.9) EXPECT_W=1320; EXPECT_H=2868 ;;
  ipad-13)    EXPECT_W=2064; EXPECT_H=2752 ;;
  *) echo "Unknown set '$SET' (expected iphone-6.9 or ipad-13)" >&2; exit 1 ;;
esac

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
OUT_DIR="$REPO_ROOT/appstore-screenshots/$SET"
mkdir -p "$OUT_DIR"
TARGET="$OUT_DIR/${NAME%.png}.png"

if ! xcrun simctl io booted screenshot "$TARGET" >/dev/null 2>&1; then
  echo "Capture failed — is a simulator booted? (xcrun simctl list devices booted)" >&2
  exit 1
fi

W=$(sips -g pixelWidth  "$TARGET" 2>/dev/null | awk '/pixelWidth/{print $2}')
H=$(sips -g pixelHeight "$TARGET" 2>/dev/null | awk '/pixelHeight/{print $2}')

if [[ "$W" == "$EXPECT_W" && "$H" == "$EXPECT_H" ]]; then
  echo "OK  ${W}x${H}  ->  $SET/$(basename "$TARGET")"
else
  echo "WRONG SIZE: got ${W}x${H}, need ${EXPECT_W}x${EXPECT_H}" >&2
  echo "  (wrong simulator for this set, or the window is scaled)" >&2
  exit 1
fi
