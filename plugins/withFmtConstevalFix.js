const { withDangerousMod } = require("@expo/config-plugins");
const fs = require("fs");
const path = require("path");

// React Native's bundled `fmt` library fails to compile under newer Xcode /
// Apple Clang because its `consteval` format-string checks became stricter
// ("call to consteval function ... is not a constant expression" in
// format-inl.h). Defining FMT_USE_CONSTEVAL=0 tells fmt to use its runtime/
// constexpr path instead, which sidesteps the error without changing behavior.
//
// This plugin injects that define into the generated iOS Podfile's post_install
// hook automatically during `expo prebuild`, so it never needs to be edited by
// hand and survives `--clean` regenerations.
const FMT_FIX_SNIPPET = `
  installer.pods_project.targets.each do |target|
    if target.name == 'fmt'
      target.build_configurations.each do |config|
        config.build_settings['GCC_PREPROCESSOR_DEFINITIONS'] ||= ['$(inherited)']
        config.build_settings['GCC_PREPROCESSOR_DEFINITIONS'] << 'FMT_USE_CONSTEVAL=0'
      end
    end
  end
`;

const withFmtConstevalFix = (config) =>
  withDangerousMod(config, [
    "ios",
    (config) => {
      const podfilePath = path.join(config.modRequest.platformProjectRoot, "Podfile");
      let contents = fs.readFileSync(podfilePath, "utf-8");

      if (!contents.includes("FMT_USE_CONSTEVAL=0")) {
        if (/post_install do \|installer\|/.test(contents)) {
          contents = contents.replace(
            /post_install do \|installer\|/,
            `post_install do |installer|\n${FMT_FIX_SNIPPET}`
          );
        } else {
          // No post_install block in the template — append a minimal one.
          contents += `\npost_install do |installer|\n${FMT_FIX_SNIPPET}end\n`;
        }
        fs.writeFileSync(podfilePath, contents);
      }

      return config;
    }
  ]);

module.exports = withFmtConstevalFix;
