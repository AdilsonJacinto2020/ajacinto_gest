/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      colors: {
        unitel: {
          DEFAULT: "#ff6600",
          hover: "#e65c00",
          light: "#fff3eb",
        },
        africell: {
          DEFAULT: "#800080",
          hover: "#6b006b",
          light: "#faebfa",
        },
        zap: {
          DEFAULT: "#e30613",
          hover: "#c00510",
          light: "#feecee",
        },
        dstv: {
          DEFAULT: "#0055b8",
          hover: "#004494",
          light: "#eaf2fb",
        },
        brand: {
          50: '#f0fdf4',
          100: '#dcfce7',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          900: '#14532d',
        }
      },
    },
  },
  plugins: [],
}
