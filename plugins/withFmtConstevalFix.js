const { withDangerousMod } = require("@expo/config-plugins");
const fs = require("fs");
const path = require("path");

// React Native's bundled `fmt` library fails to compile under newer Xcode /
// Apple Clang because its `consteval` format-string checks became stricter
// ("call to consteval function ... is not a constant expression" in
// format-inl.h).
//
// fmt's base.h *unconditionally* sets `FMT_USE_CONSTEVAL` based on compiler
// detection (no `#ifndef` guard), so a `-DFMT_USE_CONSTEVAL=0` preprocessor
// define is silently overridden and has no effect. The only reliable fix is to
// patch the header itself to force the runtime/constexpr path.
//
// This plugin injects a post_install hook into the generated iOS Podfile that
// rewrites the freshly-installed fmt header during `pod install`, so it never
// needs to be edited by hand and survives `--clean` regenerations and EAS.
const FMT_FIX_SNIPPET = `
  fmt_base_header = File.join(installer.sandbox.root, 'fmt', 'include', 'fmt', 'base.h')
  if File.exist?(fmt_base_header)
    fmt_src = File.read(fmt_base_header)
    fmt_patched = fmt_src.gsub(/^#  define FMT_USE_CONSTEVAL 1$/, '#  define FMT_USE_CONSTEVAL 0')
    File.write(fmt_base_header, fmt_patched) unless fmt_src == fmt_patched
  end
`;

const withFmtConstevalFix = (config) =>
  withDangerousMod(config, [
    "ios",
    (config) => {
      const podfilePath = path.join(config.modRequest.platformProjectRoot, "Podfile");
      let contents = fs.readFileSync(podfilePath, "utf-8");

      if (!contents.includes("fmt_base_header")) {
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
