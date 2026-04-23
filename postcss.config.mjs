import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** Project root — avoids Tailwind scanning from a wrong `process.cwd()` when the shell cwd is a parent folder. */
const config = {
  plugins: {
    '@tailwindcss/postcss': {
      base: __dirname,
    },
  },
};

export default config;
