/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./screens/**/*.{ts,tsx}"
  ],
  presets: [require("nativewind/preset")], 
  theme: {
    extend: {
      colors: {
        background: "#F5F1E8",
        primary: "#2F5D50",
        secondary: "#A3B18A",
        accent: "#D4A373",
        surface: "#FCF8F1",
        ink: "#1F352E",
        muted: "#6B7C72",
        border: "#E3DBCD",
        warning: "#C98B42",
        critical: "#B65B4A",
        success: "#4C7A5D"
      },
      fontFamily: {
        serif: ["Alice"]
      },
      boxShadow: {
        card: "0px 10px 30px rgba(47, 93, 80, 0.08)"
      },
      borderRadius: {
        card: "24px"
      }
    }
  },
  plugins: []
};
