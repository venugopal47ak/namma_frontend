/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  darkMode: ["class"],
  theme: {
    extend: {
      colors: {
        ink: "#121724",
        sand: "#f6efe5",
        coral: "#f06543",
        teal: "#0f7b74",
        mint: "#d6f5ef",
        ember: "#ffba49"
      },
      boxShadow: {
        halo: "0 24px 80px rgba(12, 19, 36, 0.16)",
        soft: "0 16px 32px rgba(15, 23, 42, 0.08)"
      },
      backgroundImage: {
        mesh:
          "radial-gradient(circle at top left, rgba(240,101,67,0.22), transparent 32%), radial-gradient(circle at top right, rgba(15,123,116,0.18), transparent 28%), radial-gradient(circle at bottom left, rgba(255,186,73,0.16), transparent 30%)"
      },
      fontFamily: {
        display: ["Sora", "sans-serif"],
        body: ["Manrope", "sans-serif"]
      }
    }
  },
  plugins: []
};
