// Kept as .mjs (not .ts) because PostCSS loads its config via its own
// resolver (cosmiconfig) before any TypeScript runtime is available in
// the Next.js build pipeline. A `.ts` config is not supported.
const config = {
  plugins: {
    '@tailwindcss/postcss': {},
  },
};

export default config;
