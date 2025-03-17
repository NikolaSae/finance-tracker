// tailwind.config.ts
import type { Config } from "tailwindcss";

export default {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: 'class', // Omogućava manuelno uključivanje tamne teme
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
      maxWidth: {
        'medal': '300px', // Dodajemo custom max-width
        '8xl': '90rem',
      },
      width: {
        'medal': '300px', // Eksplicitna širina za medalju
      }
    },
  },
  plugins: [],
  corePlugins: {
    preflight: false, // Isključite ako imate konflikte sa Material UI
  }
} satisfies Config;