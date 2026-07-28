#!/usr/bin/env bash
#
# App Store screenshot capture for Attendize.
#
# Why this exists: screenshots have to be taken on the Mac that runs the
# simulator. Run it from a Terminal, drive the app yourself, press Return
# at each prompt.
#
# Usage:
#   ./appstore-screenshots/capture.sh                 # iPhone 6.9" (default sim)
#   ./appstore-screenshots/capture.sh --set ipad-13 --device <IPAD_UDID>
#   ./appstore-screenshots/capture.sh --list          # show booted sims + UDIDs
#
# Apple's 2025 requirements:
#   iPhone 6.9" (16 Pro Max) portrait -> 1320 x 2868
#   iPad 13"    (Pro 13")     portrait -> 2064 x 2752
#
set -uo pipefail

IPHONE_UDID="078CB6FE-0787-4F2F-9C53-9C5BB8BBB9B2"

SET="iphone-6.9"
DEVICE=""

while [[ $# -gt 0 ]]; do
  case "$1" in
    --set)    SET="$2"; shift 2 ;;
    --device) DEVICE="$2"; shift 2 ;;
    --list)
      echo "Booted simulators:"
      xcrun simctl list devices booted
      exit 0
      ;;
    -h|--help) sed -n '2,20p' "$0"; exit 0 ;;
    *) echo "Unknown option: $1" >&2; exit 1 ;;
  esac
done

case "$SET" in
  iphone-6.9) EXPECT_W=1320; EXPECT_H=2868; [[ -z "$DEVICE" ]] && DEVICE="$IPHONE_UDID" ;;
  ipad-13)    EXPECT_W=2064; EXPECT_H=2752 ;;
  *) echo "Unknown --set '$SET' (expected iphone-6.9 or ipad-13)" >&2; exit 1 ;;
esac

if [[ -z "$DEVICE" ]]; then
  echo "No --device UDID given for set '$SET'." >&2
  echo "Find it with: $0 --list" >&2
  exit 1
fi

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
OUT_DIR="$REPO_ROOT/appstore-screenshots/$SET"
mkdir -p "$OUT_DIR"

# Ranked: the first two or three are what show in search results.
SHOTS=(
  "01-dashboard|Today/Dashboard - streak, rank, today's classes"
  "02-insights|Insights - overall %, trend, per-course risk + heatmap"
  "03-checkin|Check-in - tap the center FAB"
  "04-calendar|Calendar - month view with attendance + the holiday"
  "05-forecast|Forecast/Analytics - the gold screens (needs Premium ON)"
  "06-achievements|Trophy/Achievements - ranks + badges"
)

if ! xcrun simctl list devices booted | grep -qi "$DEVICE"; then
  echo "WARNING: $DEVICE doesn't look booted. Capture will likely fail."
  echo "  iPhone: it should already be running via 'expo run:ios'."
  echo "  iPad:   create/boot an iPad Pro 13\" sim, then:"
  echo "          npx expo run:ios --device <IPAD_UDID>"
  read -r -p "Continue anyway? [y/N] " go
  [[ "$go" =~ ^[Yy]$ ]] || exit 1
fi

cat <<BANNER

Capturing set: $SET
Device:        $DEVICE
Output:        $OUT_DIR
Expecting:     ${EXPECT_W} x ${EXPECT_H}

Before you start, get the app into the demo state:
  1. Log out, sign in with dev login: devtest / devtestpassword
  2. Settings -> "Demo & data (dev)" -> Premium (dev) ON   (unlocks shot 05)
  3. Settings -> edit name -> "Maya"                       (so it greets a person)
  4. "Load sample data" if anything looks stale

BANNER

captured=()
failed=()

for entry in "${SHOTS[@]}"; do
  name="${entry%%|*}"
  desc="${entry#*|}"
  target="$OUT_DIR/$name.png"

  while true; do
    echo
    echo "--- $name"
    echo "    $desc"
    read -r -p "    Navigate there, then press Return (s = skip): " ans
    if [[ "$ans" == "s" ]]; then
      echo "    skipped"
      failed+=("$name (skipped)")
      break
    fi

    if ! xcrun simctl io "$DEVICE" screenshot "$target" >/dev/null 2>&1; then
      echo "    CAPTURE FAILED - is the sim booted?"
      failed+=("$name (capture failed)")
      break
    fi

    w=$(sips -g pixelWidth  "$target" 2>/dev/null | awk '/pixelWidth/{print $2}')
    h=$(sips -g pixelHeight "$target" 2>/dev/null | awk '/pixelHeight/{print $2}')

    if [[ "$w" == "$EXPECT_W" && "$h" == "$EXPECT_H" ]]; then
      echo "    OK  ${w}x${h}  ->  $name.png"
      captured+=("$name")
      break
    fi

    # Wrong size is worth stopping for - Apple rejects on exact pixels.
    echo "    WRONG SIZE: got ${w}x${h}, need ${EXPECT_W}x${EXPECT_H}"
    echo "    Usually means: wrong sim, landscape, or a scaled window."
    read -r -p "    [r]etake / [k]eep anyway / [s]kip: " fix
    case "$fix" in
      k) captured+=("$name (${w}x${h} - OFF SPEC)"); break ;;
      s) failed+=("$name (skipped)"); break ;;
      *) continue ;;
    esac
  done
done

echo
echo "=============================="
echo "Captured (${#captured[@]}):"
for c in "${captured[@]}"; do echo "  - $c"; done
if [[ ${#failed[@]} -gt 0 ]]; then
  echo "Not captured (${#failed[@]}):"
  for f in "${failed[@]}"; do echo "  - $f"; done
fi
echo
echo "Files: $OUT_DIR"
echo "Verify all at once:"
echo "  sips -g pixelWidth -g pixelHeight $OUT_DIR/*.png"
echo "=============================="
