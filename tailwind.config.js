/**
 * Tailwind configuration extended for "psychotic bitcoin maxi in a suit and tie" aesthetic.
 * Light on structural/layout changes; focuses on tokens (colors, fonts, shadows, animations).
 */
export default {
  darkMode: "class", // opt-in dark mode via a class; we'll default to dark by adding class to <html>
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        heading: ["Poppins", "Inter", "system-ui", "sans-serif"],
        body: ["Roboto", "system-ui", "sans-serif"],
      },
      colors: {
        brand: {
          orange: "#F7931A", // Bitcoin Orange
          navy: "#1E3A8A", // Wall Street navy
          black: "#121212", // Deep black background
          charcoal: "#333333", // Primary text (muted in dark mode)
          gray: "#A1A1AA", // Subtle borders / secondary text
          green: "#22C55E", // Gains
          red: "#EF4444", // Losses
        },
      },
      boxShadow: {
        "glow-orange": "0 0 6px 1px rgba(247,147,26,0.55)",
        "inner-thin-orange": "inset 0 0 0 1px rgba(247,147,26,0.4)",
      },
      backgroundImage: {
        "gradient-orange-dark":
          "linear-gradient(135deg,#F7931A 0%,#121212 60%)",
        "gradient-orange-navy":
          "linear-gradient(135deg,#F7931A 0%,#1E3A8A 70%)",
        "radial-orange":
          "radial-gradient(circle at 30% 30%,#F7931A 0%,#121212 70%)",
      },
      keyframes: {
        "metric-pulse": {
          "0%,100%": { boxShadow: "0 0 0 0 rgba(247,147,26,0.5)" },
          "50%": { boxShadow: "0 0 0 6px rgba(247,147,26,0)" },
        },
        "shimmer-bar": {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
      animation: {
        "metric-pulse": "metric-pulse 2.4s ease-in-out infinite",
        "shimmer-bar": "shimmer-bar 2s linear infinite",
      },
      transitionTimingFunction: {
        aggressive: "cubic-bezier(.75,-0.01,.25,1.01)",
      },
      borderRadius: {
        none: "0", // reinforce sharp edges for buttons/cards
      },
    },
  },
  plugins: [],
};
