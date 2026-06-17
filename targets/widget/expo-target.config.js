/** @type {import('@bacons/apple-targets/app.plugin').ConfigFunction} */
module.exports = (config) => ({
  type: "widget",
  name: "AttendizeWidget",
  displayName: "Today's Classes",
  icon: "../../assets/icon/attendize-icon-1024.png",
  colors: {
    $accent: "#2F5D50"
  },
  entitlements: {
    "com.apple.security.application-groups": config.ios.entitlements["com.apple.security.application-groups"]
  }
});
