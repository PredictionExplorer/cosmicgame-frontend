/**
 * Minimal prefixed console logger for harness processes. No dependencies;
 * colors are plain ANSI and disabled when stdout is not a TTY.
 */

const COLORS = ['\u001b[36m', '\u001b[35m', '\u001b[33m', '\u001b[32m', '\u001b[34m', '\u001b[91m'];
const RESET = '\u001b[0m';
const BOLD = '\u001b[1m';

const useColor = process.stdout.isTTY === true && !process.env.NO_COLOR;
let nextColor = 0;

export interface PrefixLogger {
  line(text: string): void;
  info(text: string): void;
  warn(text: string): void;
  error(text: string): void;
}

/** Create a logger that prefixes every line with a fixed, colored tag. */
export function createLogger(name: string): PrefixLogger {
  const color = COLORS[nextColor++ % COLORS.length] ?? '';
  const tag = useColor ? `${color}${name.padEnd(10)}${RESET}` : name.padEnd(10);
  const write = (text: string) => {
    for (const raw of text.split('\n')) {
      if (raw.trim().length === 0) continue;
      process.stdout.write(`${tag} | ${raw}\n`);
    }
  };
  return {
    line: write,
    info: write,
    warn: (text) => write(useColor ? `\u001b[33m${text}${RESET}` : text),
    error: (text) => write(useColor ? `\u001b[31m${text}${RESET}` : text),
  };
}

/** Top-level step announcements from the orchestrator itself. */
export function step(text: string): void {
  process.stdout.write(useColor ? `\n${BOLD}▸ ${text}${RESET}\n` : `\n> ${text}\n`);
}

export function fail(problem: string, resolution?: string): never {
  process.stderr.write(useColor ? `\u001b[31m✖ ${problem}${RESET}\n` : `ERROR: ${problem}\n`);
  if (resolution) process.stderr.write(`  → ${resolution}\n`);
  process.exit(1);
}
