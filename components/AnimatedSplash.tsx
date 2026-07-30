import { useEffect, useMemo, useRef, useState } from "react";
import { Animated, Easing, Image, StyleSheet, View, useWindowDimensions } from "react-native";
import Svg, { ClipPath, Defs, Ellipse, G, LinearGradient, Mask, Path, RadialGradient, Rect, Stop } from "react-native-svg";

const AnimatedPath = Animated.createAnimatedComponent(Path);

// The calligraphic brush check from the launch-screen design (docs/
// Attendize-Splash-standalone.html) — blunt rounded entry, weight through the
// vertex, tapering to a needle point. Matches the app icon.
const CHECK_D =
  "M168,520 C252,532 332,590 392,662 C520,522 706,344 852,218 " +
  "C706,410 498,650 384,812 C330,700 256,600 152,566 C138,556 138,528 168,520 Z";

// The web version derived this at runtime from getTotalLength()/getPointAtLength(),
// which don't exist in react-native-svg. Precomputed by sampling the cubics:
// leftmost (142.9,547.5), rightmost (852,218), bottom (384,812) lifted 78 to ride
// the centerline rather than the outer edge.
const SPINE_D = "M142.9,547.5 Q292.4,610.9 384,734 Q618,476 852,218";
// Path length + the 58 slack the original added so the cap clears the end.
const SPINE_LEN = 1180;

const WORDMARK = "Attendize";
const STUDIO = ["Zawmbi", "Productions"];

// 4-step walk cycle over 3 unique frames, per assets/zawmbi/frames.json:
// contact-left → passing → contact-right → passing.
const WALK_FRAMES = [
  require("@/assets/zawmbi/frame1.png"),
  require("@/assets/zawmbi/frame2.png"),
  require("@/assets/zawmbi/frame3.png")
];
const WALK_SEQUENCE = [0, 1, 2, 1];

// Springy easings from the design. RN's Easing.bezier matches CSS cubic-bezier,
// except overshoot curves (y > 1) are fine here — they're plain cubic beziers.
const SPRING = Easing.bezier(0.22, 1.62, 0.36, 1);
const POP = Easing.bezier(0.18, 1.78, 0.32, 1);
const SNAP = Easing.bezier(0.5, 0.02, 0.22, 1);
const EASE_OUT = Easing.out(Easing.quad);

// The design runs 2900ms (where the web preview looped). This is a utility app
// people open to log one class, so playback is compressed to 1.5s total.
//
// Every delay and duration below stays written at its AUTHORED value and is
// scaled through ms() — truncating instead would cut the late beats (studio
// credit, tagline) off mid-animation, and keeping the original numbers means
// this still reads against the design file.
const AUTHORED_MS = 2900;
const TOTAL_MS = 1500;
const FADE_MS = 220;
const SEQUENCE_MS = TOTAL_MS - FADE_MS;
const SCALE = SEQUENCE_MS / AUTHORED_MS;
const ms = (authored: number) => Math.round(authored * SCALE);

const WALK_FRAME_MS = ms(200);
// He walks on at 320ms and plants when the hop starts at 1270ms (authored).
const WALK_START_MS = ms(320);
const WALK_END_MS = ms(1270);

type Props = { onDone: () => void };

/**
 * Cold-launch intro. iOS cannot animate the native launch screen — that's a
 * static storyboard — so this renders on top of the app once JS is ready and
 * fades out, with the native splash (same #071710-ish ground) behind it so the
 * hand-off doesn't flash.
 */
export const AnimatedSplash = ({ onDone }: Props) => {
  const { width, height } = useWindowDimensions();

  // One driver per animated property; all run off a single mount effect so the
  // relative delays stay exactly as authored.
  const anims = useMemo(
    () => ({
      auraOpacity: new Animated.Value(0),
      auraScale: new Animated.Value(0.5),
      draw: new Animated.Value(SPINE_LEN),
      sheen: new Animated.Value(0),
      markX: new Animated.Value(0.92),
      markY: new Animated.Value(1.08),
      coreY: new Animated.Value(0),
      rule: new Animated.Value(0),
      tagOpacity: new Animated.Value(0),
      tagScale: new Animated.Value(0.72),
      zawX: new Animated.Value(-248),
      zawY: new Animated.Value(0),
      zawScaleX: new Animated.Value(1),
      zawScaleY: new Animated.Value(1),
      fade: new Animated.Value(1)
    }),
    []
  );

  const letters = useMemo(
    () => WORDMARK.split("").map(() => ({ v: new Animated.Value(0) })),
    []
  );
  const studio = useMemo(() => STUDIO.map(() => ({ v: new Animated.Value(0) })), []);

  // Keep the latest callback without restarting the sequence.
  const doneRef = useRef(onDone);
  doneRef.current = onDone;

  // Leg cycle runs on its own interval — it's frame swapping, not interpolation.
  const [walkFrame, setWalkFrame] = useState(WALK_SEQUENCE[0]);
  useEffect(() => {
    let step = 0;
    let interval: ReturnType<typeof setInterval> | undefined;
    const startAt = setTimeout(() => {
      interval = setInterval(() => {
        step = (step + 1) % WALK_SEQUENCE.length;
        setWalkFrame(WALK_SEQUENCE[step]);
      }, WALK_FRAME_MS);
    }, WALK_START_MS);
    // Plant on the contact frame for the hop rather than mid-stride.
    const stopAt = setTimeout(() => {
      if (interval) clearInterval(interval);
      setWalkFrame(WALK_SEQUENCE[0]);
    }, WALK_END_MS);
    return () => {
      clearTimeout(startAt);
      clearTimeout(stopAt);
      if (interval) clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    // duration/delay are AUTHORED values; both get scaled to the 1.5s runtime.
    const timing = (
      value: Animated.Value,
      toValue: number,
      duration: number,
      delay: number,
      easing: (v: number) => number
    ) =>
      Animated.timing(value, {
        toValue,
        duration: ms(duration),
        delay: ms(delay),
        easing,
        useNativeDriver: false
      });

    // Same, for the hand-rolled keyframe sequences below.
    const step = (value: Animated.Value, toValue: number, duration: number, easing = EASE_OUT) =>
      Animated.timing(value, { toValue, duration: ms(duration), easing, useNativeDriver: false });

    const sequence = Animated.parallel([
      // 1 · aura blooms with a spring
      Animated.sequence([
        Animated.delay(ms(60)),
        Animated.parallel([
          step(anims.auraOpacity, 1, 660, SPRING),
          step(anims.auraScale, 1.06, 660, SPRING)
        ]),
        Animated.parallel([step(anims.auraOpacity, 0.82, 540), step(anims.auraScale, 1, 540)])
      ]),

      // 2 · check snaps on along its real traced outline, then a sheen sweeps it
      timing(anims.draw, 0, 560, 200, SNAP),
      timing(anims.sheen, 1, 760, 640, Easing.bezier(0.4, 0, 0.5, 1)),

      // 3 · squash-and-stretch landing
      Animated.sequence([
        Animated.delay(ms(700)),
        Animated.parallel([
          Animated.sequence([
            step(anims.markX, 1.19, 230),
            step(anims.markX, 0.94, 221),
            step(anims.markX, 1.04, 189),
            step(anims.markX, 1, 180)
          ]),
          Animated.sequence([
            step(anims.markY, 0.86, 230),
            step(anims.markY, 1.06, 221),
            step(anims.markY, 0.98, 189),
            step(anims.markY, 1, 180)
          ])
        ])
      ]),
      Animated.sequence([
        Animated.delay(ms(740)),
        step(anims.coreY, 4, 144),
        step(anims.coreY, -1, 154),
        step(anims.coreY, 0, 182)
      ]),

      // 4 · letters pop up with overshoot, staggered
      ...letters.map((l, i) => timing(l.v, 1, 620, 1000 + i * 58, POP)),

      // 5 · rule springs open, tagline pops
      timing(anims.rule, 1, 760, 1560, SPRING),
      timing(anims.tagOpacity, 1, 700, 1660, POP),
      timing(anims.tagScale, 1, 700, 1660, POP),

      // 6 · the mascot walks on and presents the mark, then hops as his credit
      // lands. The leg cycle is driven separately (see walkFrame).
      timing(anims.zawX, 0, 940, WALK_START_MS, Easing.bezier(0.32, 0.06, 0.5, 1)),
      Animated.sequence([
        Animated.delay(ms(1270)),
        Animated.parallel([
          Animated.sequence([
            step(anims.zawY, 0, 102),
            step(anims.zawY, -15, 192),
            step(anims.zawY, 0, 346)
          ]),
          Animated.sequence([
            step(anims.zawScaleX, 1.14, 102),
            step(anims.zawScaleX, 0.92, 192),
            step(anims.zawScaleX, 1.12, 205),
            step(anims.zawScaleX, 1, 141)
          ]),
          Animated.sequence([
            step(anims.zawScaleY, 0.86, 102),
            step(anims.zawScaleY, 1.12, 192),
            step(anims.zawScaleY, 0.88, 205),
            step(anims.zawScaleY, 1, 141)
          ])
        ])
      ]),

      // 7 · studio credit words pop
      ...studio.map((w, i) => timing(w.v, 1, 640, 1320 + i * 120, POP))
    ]);

    sequence.start();

    const handoff = setTimeout(() => {
      Animated.timing(anims.fade, {
        toValue: 0,
        duration: FADE_MS,
        easing: Easing.out(Easing.cubic),
        // JS-driven like the rest of the sequence. Mixing a native-driven value
        // into the same tree logs "onAnimatedValueUpdate with no listeners".
        useNativeDriver: false
      }).start(({ finished }) => {
        if (finished) doneRef.current();
      });
    }, SEQUENCE_MS);

    return () => {
      clearTimeout(handoff);
      sequence.stop();
    };
  }, [anims, letters, studio]);

  // Gradient geometry in absolute units — percentage-sized react-native-svg
  // gradients mis-size on device, so everything below is userSpaceOnUse.
  const auraSize = width * 1.2;

  return (
    <Animated.View
      pointerEvents="none"
      style={[StyleSheet.absoluteFill, { opacity: anims.fade, zIndex: 999 }]}
    >
      {/* Ground + the two radial washes from the design */}
      <View style={[StyleSheet.absoluteFill, { backgroundColor: "#071710" }]}>
        <Svg width={width} height={height}>
          <Defs>
            <RadialGradient id="bg" cx={width / 2} cy={height * 0.33} rx={width * 0.96} ry={height * 0.66} gradientUnits="userSpaceOnUse">
              <Stop offset="0" stopColor="#2a6349" />
              <Stop offset="0.38" stopColor="#194936" />
              <Stop offset="0.72" stopColor="#0e2c20" />
              <Stop offset="1" stopColor="#071710" />
            </RadialGradient>
            <RadialGradient id="mint" cx={width / 2} cy={height * 0.3} rx={width * 0.78} ry={height * 0.48} gradientUnits="userSpaceOnUse">
              <Stop offset="0" stopColor="#7ad6a8" stopOpacity="0.2" />
              <Stop offset="0.62" stopColor="#7ad6a8" stopOpacity="0" />
            </RadialGradient>
            <RadialGradient id="vig" cx={width / 2} cy={height * 0.4} rx={width * 1.18} ry={height * 0.76} gradientUnits="userSpaceOnUse">
              <Stop offset="0.5" stopColor="#000000" stopOpacity="0" />
              <Stop offset="1" stopColor="#000000" stopOpacity="0.55" />
            </RadialGradient>
          </Defs>
          <Rect width={width} height={height} fill="url(#bg)" />
          <Rect width={width} height={height} fill="url(#mint)" />
          <Rect width={width} height={height} fill="url(#vig)" />
        </Svg>
      </View>

      {/* Aura bloom behind the mark */}
      <Animated.View
        style={{
          position: "absolute",
          left: width / 2 - auraSize / 2,
          top: height * 0.42 - auraSize / 2,
          width: auraSize,
          height: auraSize,
          opacity: anims.auraOpacity,
          transform: [{ scale: anims.auraScale }]
        }}
      >
        <Svg width={auraSize} height={auraSize}>
          <Defs>
            <RadialGradient id="aura" cx={auraSize / 2} cy={auraSize / 2} r={auraSize / 2} gradientUnits="userSpaceOnUse">
              <Stop offset="0" stopColor="#F8D98A" stopOpacity="0.42" />
              <Stop offset="0.48" stopColor="#E6B655" stopOpacity="0.12" />
              <Stop offset="0.7" stopColor="#E6B655" stopOpacity="0" />
            </RadialGradient>
          </Defs>
          <Rect width={auraSize} height={auraSize} fill="url(#aura)" />
        </Svg>
      </Animated.View>

      {/* Core: mark + wordmark + rule + tagline */}
      <Animated.View
        style={{
          ...StyleSheet.absoluteFillObject,
          alignItems: "center",
          justifyContent: "center",
          marginTop: -52,
          transform: [{ translateY: anims.coreY }]
        }}
      >
        <Animated.View style={{ transform: [{ scaleX: anims.markX }, { scaleY: anims.markY }] }}>
          <Svg width={170} height={143} viewBox="120 200 750 630">
            <Defs>
              <RadialGradient id="tkD" cx="33%" cy="27%" r="90%">
                <Stop offset="0" stopColor="#F8D98A" />
                <Stop offset="0.3" stopColor="#E6B655" />
                <Stop offset="0.64" stopColor="#C9922F" />
                <Stop offset="1" stopColor="#915E14" />
              </RadialGradient>
              <LinearGradient id="gSheen" x1="0" y1="0" x2="1" y2="0">
                <Stop offset="0" stopColor="#fff" stopOpacity="0" />
                <Stop offset="0.44" stopColor="#fff" stopOpacity="0.06" />
                <Stop offset="0.5" stopColor="#fff" stopOpacity="0.9" />
                <Stop offset="0.56" stopColor="#fff" stopOpacity="0.06" />
                <Stop offset="1" stopColor="#fff" stopOpacity="0" />
              </LinearGradient>
              {/* Reveal mask: the spine is stroked wide enough to cover the
                  outline, and its dash offset animates the draw-on. The explicit
                  region is required — without x/y/width/height the mask box
                  defaults to a fraction of the bounding box and clips the mark
                  away entirely. */}
              <Mask id="mDraw" maskUnits="userSpaceOnUse" x={0} y={80} width={1024} height={880}>
                <AnimatedPath
                  d={SPINE_D}
                  fill="none"
                  stroke="#fff"
                  strokeWidth={200}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeDasharray={SPINE_LEN}
                  strokeDashoffset={anims.draw as unknown as number}
                />
              </Mask>
              <ClipPath id="cCheck">
                <Path d={CHECK_D} />
              </ClipPath>
            </Defs>
            <G mask="url(#mDraw)">
              <Path d={CHECK_D} fill="url(#tkD)" />
              <G clipPath="url(#cCheck)">
                <Ellipse cx={470} cy={498} rx={152} ry={92} fill="#fff" opacity={0.14} />
                <AnimatedSheen value={anims.sheen} />
              </G>
            </G>
          </Svg>
        </Animated.View>

        {/* Wordmark — one node per letter so they can pop independently */}
        <View style={{ flexDirection: "row", marginTop: 24 }}>
          {WORDMARK.split("").map((ch, i) => (
            <Animated.Text
              key={`${ch}-${i}`}
              style={{
                fontFamily: "Fraunces_600SemiBold",
                fontSize: 45,
                lineHeight: 50,
                letterSpacing: -1,
                color: "#f8f4e8",
                opacity: letters[i].v,
                transform: [
                  { translateY: letters[i].v.interpolate({ inputRange: [0, 1], outputRange: [30, 0] }) },
                  { scale: letters[i].v.interpolate({ inputRange: [0, 1], outputRange: [0.55, 1] }) },
                  {
                    rotate: letters[i].v.interpolate({ inputRange: [0, 1], outputRange: ["-9deg", "0deg"] })
                  }
                ]
              }}
            >
              {ch}
            </Animated.Text>
          ))}
        </View>

        <Animated.View
          style={{
            width: 168,
            height: 1.5,
            marginTop: 13,
            backgroundColor: "rgba(248,217,138,0.9)",
            transform: [{ scaleX: anims.rule }]
          }}
        />

        <Animated.Text
          style={{
            marginTop: 13,
            fontFamily: "Outfit_500Medium",
            fontSize: 10.5,
            letterSpacing: 3.15,
            textTransform: "uppercase",
            color: "#a8c2ae",
            opacity: anims.tagOpacity,
            transform: [{ scale: anims.tagScale }]
          }}
        >
          Show up · Level up
        </Animated.Text>
      </Animated.View>

      {/* Studio credit */}
      <View style={{ position: "absolute", left: 0, right: 0, bottom: 44, alignItems: "center" }}>
        <View style={{ flexDirection: "row", alignItems: "flex-end", gap: 9 }}>
          <Animated.View
            style={{
              transform: [
                { translateX: anims.zawX },
                { translateY: anims.zawY },
                { scaleX: anims.zawScaleX },
                { scaleY: anims.zawScaleY }
              ]
            }}
          >
            <Image
              source={WALK_FRAMES[walkFrame]}
              style={{ width: 44, height: 53 }}
              resizeMode="contain"
              // Pixel art — keep the hard edges instead of smoothing them.
              fadeDuration={0}
            />
          </Animated.View>

          <View style={{ flexDirection: "row", paddingBottom: 4 }}>
            {STUDIO.map((word, i) => (
              <Animated.Text
                key={word}
                style={{
                  fontFamily: "GamjaFlower_400Regular",
                  fontSize: 25,
                  lineHeight: 27,
                  color: "#efe9d5",
                  opacity: studio[i].v,
                  transform: [
                    { translateY: studio[i].v.interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) },
                    { scale: studio[i].v.interpolate({ inputRange: [0, 1], outputRange: [0.6, 1] }) }
                  ]
                }}
              >
                {i === 0 ? `${word} ` : word}
              </Animated.Text>
            ))}
          </View>
        </View>
      </View>
    </Animated.View>
  );
};

// The sheen is a rotated bar swept across the mark. Split out because animating
// a transform string needs its own interpolation node.
const AnimatedSheen = ({ value }: { value: Animated.Value }) => {
  const AnimatedRect = useMemo(() => Animated.createAnimatedComponent(Rect), []);
  return (
    <AnimatedRect
      x={value.interpolate({ inputRange: [0, 1], outputRange: [55, 1035] }) as unknown as number}
      y={110}
      width={215}
      height={820}
      fill="url(#gSheen)"
      origin="495, 515"
      rotation={18}
    />
  );
};
