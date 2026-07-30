#!/usr/bin/env bash
#
# One screenshot from the right simulator, straight into the right folder.
#
#   ./appstore-screenshots/shot.sh 07-patterns              # iPhone 6.9" (default)
#   ./appstore-screenshots/shot.sh 07-patterns ipad-13      # iPad 13"
#   ./appstore-screenshots/shot.sh 07-patterns ipad-13 <UDID>
#
# Targets a specific device per set rather than `booted`: with both an iPhone
# and an iPad booted, `booted` silently resolves to one of them (the iPad, in
# practice) and you end up with iPad frames filed as iPhone shots.
#
# A wrong-size capture is deleted rather than left on disk, so a bad frame can't
# quietly survive to the upload.
#
set -uo pipefail

IPHONE_UDID="078CB6FE-0787-4F2F-9C53-9C5BB8BBB9B2"   # iPhone 16 Pro Max
IPAD_UDID="6C9F41C5-8EA2-4D81-A70B-F8A52FD19970"     # iPad Pro 13-inch (M4)

NAME="${1:-}"
SET="${2:-iphone-6.9}"
DEVICE="${3:-}"

if [[ -z "$NAME" ]]; then
  echo "usage: $0 <shot-name> [iphone-6.9|ipad-13] [udid]" >&2
  echo "e.g.:  $0 07-patterns" >&2
  exit 1
fi

case "$SET" in
  iphone-6.9) EXPECT_W=1320; EXPECT_H=2868; [[ -z "$DEVICE" ]] && DEVICE="$IPHONE_UDID" ;;
  ipad-13)    EXPECT_W=2064; EXPECT_H=2752; [[ -z "$DEVICE" ]] && DEVICE="$IPAD_UDID" ;;
  *) echo "Unknown set '$SET' (expected iphone-6.9 or ipad-13)" >&2; exit 1 ;;
esac

if ! xcrun simctl list devices booted | grep -q "$DEVICE"; then
  echo "That simulator isn't booted for set '$SET':" >&2
  echo "  $DEVICE" >&2
  echo "Booted right now:" >&2
  xcrun simctl list devices booted | grep -E "iPhone|iPad" >&2
  exit 1
fi

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
OUT_DIR="$REPO_ROOT/appstore-screenshots/$SET"
mkdir -p "$OUT_DIR"
TARGET="$OUT_DIR/${NAME%.png}.png"

if ! xcrun simctl io "$DEVICE" screenshot "$TARGET" >/dev/null 2>&1; then
  echo "Capture failed on $DEVICE." >&2
  exit 1
fi

W=$(sips -g pixelWidth  "$TARGET" 2>/dev/null | awk '/pixelWidth/{print $2}')
H=$(sips -g pixelHeight "$TARGET" 2>/dev/null | awk '/pixelHeight/{print $2}')

if [[ "$W" == "$EXPECT_W" && "$H" == "$EXPECT_H" ]]; then
  echo "OK  ${W}x${H}  ->  $SET/$(basename "$TARGET")"
else
  rm -f "$TARGET"
  echo "WRONG SIZE: got ${W}x${H}, need ${EXPECT_W}x${EXPECT_H} — file discarded." >&2
  echo "  (window scaled, or the wrong simulator is in the foreground)" >&2
  exit 1
fi
