// One-shot fixer for the app/ -> app/[locale]/ move: every relative
// specifier (imports, jest.mock, require, dynamic import) that no longer
// resolves gets one extra '../' if and only if that makes it resolve.
// Delete after Sprint 0 verification.
import { readFileSync, writeFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';

const ROOT = process.cwd();
const EXTS = ['', '.ts', '.tsx', '.js', '.jsx', '.json', '/index.ts', '/index.tsx'];

function resolves(fromDir, spec) {
  const base = resolve(fromDir, spec);
  return EXTS.some((ext) => existsSync(base + ext));
}

function* walk(dir) {
  for (const entry of readdirSync(dir)) {
    const p = join(dir, entry);
    if (statSync(p).isDirectory()) yield* walk(p);
    else if (/\.(ts|tsx)$/.test(entry)) yield p;
  }
}

const SPEC_RE =
  /(from\s+|jest\.mock\(\s*|jest\.requireActual\(\s*|require\(\s*|import\(\s*)(['"])(\.\.?\/[^'"]+)\2/g;

let fixedFiles = 0;
for (const file of walk(join(ROOT, 'app/[locale]'))) {
  const dir = dirname(file);
  const src = readFileSync(file, 'utf8');
  let changed = false;
  const out = src.replace(SPEC_RE, (full, lead, quote, spec) => {
    if (resolves(dir, spec)) return full;
    const bumped = '../' + spec;
    if (resolves(dir, bumped)) {
      changed = true;
      return `${lead}${quote}${bumped}${quote}`;
    }
    console.warn(`UNRESOLVED (left as-is): ${file} -> ${spec}`);
    return full;
  });
  if (changed) {
    writeFileSync(file, out);
    fixedFiles += 1;
    console.log('fixed', file.replace(ROOT + '/', ''));
  }
}
console.log(`done: ${fixedFiles} files updated`);
