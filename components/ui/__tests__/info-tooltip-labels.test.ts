import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

/**
 * Every ⓘ names what it explains. Without `label` (or a full `ariaLabel`)
 * the button is just "More information", and a list of them (the trait
 * sheet's rows) can only be told apart by their descriptions. This guard
 * reads every production call site of `<InfoTooltip`.
 */
const ROOT = join(__dirname, '..', '..', '..');
const SOURCE_DIRS = ['app', 'components'];

function sourceFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) {
      return name === '__tests__' || name === 'node_modules' ? [] : sourceFiles(path);
    }
    return /\.tsx$/.test(name) && !/\.test\.tsx$/.test(name) ? [path] : [];
  });
}

/** The code of a file without its comments, where the component is only mentioned. */
function withoutComments(source: string): string {
  return source
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .split('\n')
    .filter((line) => !/^\s*\/\//.test(line))
    .join('\n');
}

/** The props of each `<InfoTooltip …>` element in a file, up to its closing `>`. */
function infoTooltipElements(source: string): string[] {
  const elements: string[] = [];
  const pattern = /<InfoTooltip\b/g;
  let match: RegExpExecArray | null;
  while ((match = pattern.exec(source)) !== null) {
    let depth = 0;
    let end = match.index;
    for (; end < source.length; end += 1) {
      const char = source[end];
      if (char === '{') depth += 1;
      else if (char === '}') depth -= 1;
      else if (char === '>' && depth === 0) break;
    }
    elements.push(source.slice(match.index, end + 1));
  }
  return elements;
}

describe('InfoTooltip call sites', () => {
  it('name what each button explains', () => {
    const unlabelled = SOURCE_DIRS.flatMap((dir) => sourceFiles(join(ROOT, dir))).flatMap(
      (file) => {
        if (file.endsWith(join('components', 'ui', 'info-tooltip.tsx'))) return [];
        return infoTooltipElements(withoutComments(readFileSync(file, 'utf8')))
          .filter((element) => !/\b(?:label|ariaLabel)=/.test(element))
          .map((element) => `${relative(ROOT, file)}: ${element.replace(/\s+/g, ' ')}`);
      },
    );
    expect(unlabelled).toEqual([]);
  });
});
