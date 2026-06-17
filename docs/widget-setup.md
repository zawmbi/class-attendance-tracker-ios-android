# Home-screen widget — implementation guide (free feature)

**Status: data layer done; native extension to be added on a Mac with Xcode.**

The "today + buffer" widget can't be written in React/JS — iOS needs a SwiftUI
**WidgetKit** extension and Android needs a native AppWidget. That target must be
added and compiled with Xcode/Android Studio, which this environment can't do,
and adding an unverified native target risks breaking the production EAS build.
So the JS data layer is shipped and tested; the native target is documented here.

## What's already done (in this repo)
- `utils/widget.ts` — `buildWidgetData(classes, records, settings)` returns the
  exact payload the widget shows: `{ dateLabel, sessions[], totalBuffer,
  atRiskCount }`, plus `WIDGET_APP_GROUP` / `WIDGET_DATA_KEY` constants.
- Unit tests in `__tests__/utils/widget.test.ts`.

## Remaining native work

### 1. Pick the tooling
- **iOS:** add a WidgetKit extension via the [`@bacons/apple-targets`](https://github.com/EvanBacon/expo-apple-targets)
  Expo config plugin (declares the extension target during prebuild). The widget
  UI is SwiftUI.
- **Android:** [`react-native-android-widget`](https://github.com/sAleksovski/react-native-android-widget)
  lets you build the widget with RN-like components.

### 2. App Group (iOS) for shared data
- Enable an App Group on both the app and the widget target:
  `group.com.attendancetrackerappsorganization.attendancetrackerapp.widget`
  (already exported as `WIDGET_APP_GROUP`).
- Add it under `ios.entitlements` in `app.config.ts`:
  ```ts
  ios: {
    entitlements: { "com.apple.security.application-groups": [WIDGET_APP_GROUP] }
  }
  ```

### 3. Write the payload from JS
Whenever attendance changes (and on app foreground), write the serialized
payload into the shared container so the widget can read it:
- iOS: write `serializeWidgetData(buildWidgetData(...))` to the App Group
  `UserDefaults(suiteName: WIDGET_APP_GROUP)` under `WIDGET_DATA_KEY`, then call
  `WidgetCenter.shared.reloadAllTimelines()`. A small native module or
  `expo-modules` function bridges this.
- Android: write to SharedPreferences and trigger a widget update.

### 4. Widget UI contract
Render from the JSON payload:
- `dateLabel` as the header.
- Up to ~3 `sessions` (name, time, a dot in `color`, a check if `checkedIn`).
- `totalBuffer` as "N absences left", tinted by `atRiskCount > 0`.

### 5. Verify
Build a dev client / TestFlight build on a Mac, add the widget to the home
screen, and confirm it updates after a check-in. (Cannot be verified in CI.)
