import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#0f1115",
        panel: "#171a21",
        bubbleUser: "#2f6feb",
        bubbleBot: "#1f232c",
        border: "#262b36",
      },
    },
  },
  plugins: [],
};

export default config;
