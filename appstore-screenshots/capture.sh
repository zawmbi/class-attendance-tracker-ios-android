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
#   ./appstore-screenshots/capture.sh --theme dark    # dark-theme set
#   ./appstore-screenshots/capture.sh --set ipad-13 --device <IPAD_UDID>
#   ./appstore-screenshots/capture.sh --list          # show booted sims + UDIDs
#
# Apple's 2025 requirements:
#   iPhone 6.9" (16 Pro Max) portrait -> 1320 x 2868
#   iPad 13"    (Pro 13")     portrait -> 2064 x 2752
#
# Theme note: the app defaults to the system appearance and Settings can pin
# it (System / Light / Dark). So for a dark set either flip the simulator to
# dark (Settings > Developer > Dark Appearance, or `xcrun simctl ui <udid>
# appearance dark`) or pin Dark in-app. `--theme dark` doesn't switch anything
# itself — it routes output to a separate folder and reminds you. expo-status-bar
# follows the resolved mode, so the status bar comes out light-on-dark.
#
set -uo pipefail

IPHONE_UDID="078CB6FE-0787-4F2F-9C53-9C5BB8BBB9B2"
# iPad Pro 13-inch (M4), iOS 26.5. Recreate with:
#   xcrun simctl create "iPad Pro 13-inch (M4)" \
#     com.apple.CoreSimulator.SimDeviceType.iPad-Pro-13-inch-M4-8GB \
#     com.apple.CoreSimulator.SimRuntime.iOS-26-5
IPAD_UDID="6C9F41C5-8EA2-4D81-A70B-F8A52FD19970"

SET="iphone-6.9"
DEVICE=""
THEME="light"

while [[ $# -gt 0 ]]; do
  case "$1" in
    --set)    SET="$2"; shift 2 ;;
    --device) DEVICE="$2"; shift 2 ;;
    --theme)  THEME="$2"; shift 2 ;;
    --list)
      echo "Booted simulators:"
      xcrun simctl list devices booted
      exit 0
      ;;
    # Print the leading comment block, minus the shebang. Derived rather than a
    # fixed line range so edits to the header can't leak code into --help.
    -h|--help) awk 'NR>1 && /^#/ {sub(/^# ?/, ""); print; next} NR>1 {exit}' "$0"; exit 0 ;;
    *) echo "Unknown option: $1" >&2; exit 1 ;;
  esac
done

# THEME_LABEL matches the Settings segmented control. Spelled out rather than
# using ${THEME^} — that's bash 4+, and macOS still ships bash 3.2.
case "$THEME" in
  light) THEME_LABEL="Light" ;;
  dark)  THEME_LABEL="Dark" ;;
  *) echo "Unknown --theme '$THEME' (expected light or dark)" >&2; exit 1 ;;
esac

case "$SET" in
  iphone-6.9) EXPECT_W=1320; EXPECT_H=2868; [[ -z "$DEVICE" ]] && DEVICE="$IPHONE_UDID" ;;
  ipad-13)    EXPECT_W=2064; EXPECT_H=2752; [[ -z "$DEVICE" ]] && DEVICE="$IPAD_UDID" ;;
  *) echo "Unknown --set '$SET' (expected iphone-6.9 or ipad-13)" >&2; exit 1 ;;
esac

if [[ -z "$DEVICE" ]]; then
  echo "No --device UDID given for set '$SET'." >&2
  echo "Find it with: $0 --list" >&2
  exit 1
fi

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
# Dark sets live alongside the light ones so both can be uploaded / compared.
OUT_DIR="$REPO_ROOT/appstore-screenshots/$SET"
[[ "$THEME" == "dark" ]] && OUT_DIR="$OUT_DIR-dark"
mkdir -p "$OUT_DIR"

# App Store Connect takes up to 10 per device size; this fills all 10.
# Ranked deliberately: only the first ~3 show in search results, so the
# differentiators (forecast, insights) come before the familiar stuff
# (calendar, settings). Format: name|headline|how to get there.
SHOTS=(
  "01-dashboard|Today - streak, rank, today's classes, badges|Today tab. Scroll so the momentum ring AND the Today list are both visible."
  "02-forecast|End-of-term projection - 'will I pass?'|Insights tab -> End-of-term Forecast card -> Forecast tab. Needs Premium ON."
  "03-insights|Overall %, 6-week trend, priority course, heatmap|Insights tab. Set Consistency to 'Both' - dates + week labels read richest."
  "04-checkin|One-tap check-in|Center FAB. Capture with the status options showing, not mid-transition."
  "05-class-detail|Buffer gauge - 'you can miss N more and stay on target'|Courses -> pick the course with the most history (Biostatistics)."
  "06-calendar|Month view - color-coded attendance + a canceled holiday|Calendar tab. Land on a month showing the holiday (~3 weeks back)."
  "07-patterns|Weekday patterns - your weak spot, absence distribution|Forecast -> Patterns tab. Needs enough history to look populated."
  "08-goal-planner|Skip budget - 'skip up to N of your M remaining'|Forecast tab, scroll to the goal planner. Set the goal slider to 90%."
  "09-achievements|Rank ladder + earned badges|Trophy tab. Scroll so several unlocked badges are in frame."
  "10-courses|Multi-course management with schedules and targets|Courses tab. Best with all 5 demo courses visible."
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
Theme:         $THEME
Device:        $DEVICE
Output:        $OUT_DIR
Expecting:     ${EXPECT_W} x ${EXPECT_H}

Before you start, get the app into the demo state:
  1. Log out, sign in with dev login: devtest / devtestpassword
  2. Settings -> "Demo & data (dev)" -> Premium (dev) ON   (unlocks 02/07/08)
  3. Settings -> edit name -> "Maya"                       (so it greets a person)
  4. Settings -> Appearance -> Theme -> ${THEME_LABEL}
     (or leave it on System and set the simulator itself:
      xcrun simctl ui $DEVICE appearance $THEME)
  5. "Load sample data" — regenerate it even if it looks fine. The demo set is
     built relative to today, so a fresh load gives you a live "Today", an
     intact streak, and a populated current month.

Making them read as rich rather than empty:
  - Scroll position matters more than the screen choice. Frame each shot so two
    things are visible (a number AND the thing it describes), never one card
    floating in whitespace.
  - Avoid capturing a screen whose top 2 heatmap rows or trend weeks are blank —
    scroll past them.
  - Landing on a course with real history (Biostatistics) beats one with three
    records; the buffer gauge and risk pill only look meaningful when populated.

BANNER

captured=()
failed=()

total="${#SHOTS[@]}"
index=0

for entry in "${SHOTS[@]}"; do
  name="${entry%%|*}"
  rest="${entry#*|}"
  desc="${rest%%|*}"
  hint="${rest#*|}"
  index=$((index + 1))
  target="$OUT_DIR/$name.png"

  while true; do
    echo
    echo "--- [$index/$total] $name"
    echo "    $desc"
    echo "    -> $hint"
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
# Guard both expansions: under `set -u`, bash 3.2 (still what macOS ships)
# treats "${arr[@]}" on an EMPTY array as an unbound variable and aborts —
# which is exactly the skip-everything case.
echo "Captured (${#captured[@]}):"
if [[ ${#captured[@]} -gt 0 ]]; then
  for c in "${captured[@]}"; do echo "  - $c"; done
fi
if [[ ${#failed[@]} -gt 0 ]]; then
  echo "Not captured (${#failed[@]}):"
  for f in "${failed[@]}"; do echo "  - $f"; done
fi
echo
echo "Files: $OUT_DIR"
echo "Verify all at once:"
echo "  sips -g pixelWidth -g pixelHeight $OUT_DIR/*.png"
echo "=============================="
