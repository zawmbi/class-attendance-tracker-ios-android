/** @type {import('@bacons/apple-targets/app.plugin').ConfigFunction} */
module.exports = (config) => ({
  type: "widget",
  name: "AttendizeWidget",
  displayName: "Today's Classes",
  // Must stay in sync with the app icon. apple-targets regenerates
  // Assets.xcassets/AppIcon.appiconset from this on every prebuild, so editing
  // those PNGs by hand does nothing — this path is the only real source.
  //
  // Points at the pre-flattened variant on purpose: apple-targets composites
  // transparency onto WHITE, which would ring the rounded corners in white.
  icon: "../../assets/icon/attendize-glass-1024-opaque.png",
  colors: {
    $accent: "#2F5D50"
  },
  entitlements: {
    "com.apple.security.application-groups": config.ios.entitlements["com.apple.security.application-groups"]
  }
});
