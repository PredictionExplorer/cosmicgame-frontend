import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { routing } from '../../i18n/routing';
import {
  languageNames,
  nextSteps,
  scaffoldLocale,
  scaffoldLocaleProblem,
} from '../i18n-scaffold-locale-core';

/** A minimal repository layout: two catalogs and one module of each copy-module shape. */
function fixtureTree(): string {
  const root = mkdtempSync(join(tmpdir(), 'i18n-scaffold-'));
  const write = (path: string, contents: string) => {
    mkdirSync(join(root, path, '..'), { recursive: true });
    writeFileSync(join(root, path), contents);
  };
  write('messages/en/common.json', '{"ok": "OK", "nested": {"a": "A", "b": "B"}}\n');
  write('messages/en/nav.json', '{"gallery": "Gallery"}\n');
  write(
    'content/faq/text.en.ts',
    "import type { FAQText } from './structure';\n\nexport const faqTextEn: FAQText = { intro: 'Hello' };\n",
  );
  write('content/faq/structure.ts', 'export type FAQText = { intro: string };\n');
  write(
    'content/quiz/text.basic.en.ts',
    "import { quizTextEn } from './text.en';\n\nexport const QUIZ_BASIC_EN = { hub: quizTextEn };\n",
  );
  write('content/about/en.ts', "export const aboutContentEn = { heading: 'About' };\n");
  write('content/legal/TermsContent.en.ts', "export const termsCopyEn = { title: 'Terms' };\n");
  write('content/__tests__/ignored.en.ts', 'export const nope = 1;\n');
  return root;
}

describe('scaffoldLocaleProblem', () => {
  it('accepts a canonical tag that is not yet a routing locale', () => {
    expect(scaffoldLocaleProblem('ko')).toBeUndefined();
    expect(scaffoldLocaleProblem('pt-BR')).toBeUndefined();
  });

  it('rejects malformed, non-canonical, and already registered tags', () => {
    expect(scaffoldLocaleProblem('not a tag')).toMatch(/not a BCP 47/);
    expect(scaffoldLocaleProblem('zh_tw')).toMatch(/not a BCP 47/);
    expect(scaffoldLocaleProblem('KO')).toMatch(/write it as "ko"/);
    expect(scaffoldLocaleProblem('zh-tw')).toMatch(/write it as "zh-TW"/);
    for (const locale of routing.locales) {
      expect(scaffoldLocaleProblem(locale)).toMatch(/already a routing locale/);
    }
  });
});

describe('languageNames', () => {
  it('reads the English name and the autonym from CLDR', () => {
    expect(languageNames('ko')).toEqual({ english: 'Korean', autonym: '한국어' });
    expect(languageNames('uk')).toEqual({ english: 'Ukrainian', autonym: 'українська' });
  });
});

describe('scaffoldLocale', () => {
  let root: string;

  beforeEach(() => {
    root = fixtureTree();
  });

  afterEach(() => {
    rmSync(root, { recursive: true, force: true });
  });

  it('writes every per-locale file with identifiers renamed and skeleton files left alone', () => {
    const result = scaffoldLocale({ root, locale: 'ko' });

    expect(result.written).toEqual([
      'messages/ko/common.json',
      'messages/ko/nav.json',
      'content/about/ko.ts',
      'content/faq/text.ko.ts',
      'content/legal/TermsContent.ko.ts',
      'content/quiz/text.basic.ko.ts',
      'scripts/terminology/ko.ts',
      'e2e/ko-smoke.spec.ts',
      'e2e/ko-site-qa.desktop.spec.ts',
      'docs/i18n/glossary-ko.md',
      'docs/i18n/style-guide-ko.md',
      'docs/i18n/progress-ko.md',
    ]);
    expect(result.skipped).toEqual([]);

    const read = (path: string) => readFileSync(join(root, path), 'utf8');
    expect(read('messages/ko/common.json')).toBe(read('messages/en/common.json'));
    expect(read('content/faq/text.ko.ts')).toContain('export const faqTextKo: FAQText');
    expect(read('content/quiz/text.basic.ko.ts')).toBe(
      "import { quizTextKo } from './text.ko';\n\nexport const QUIZ_BASIC_KO = { hub: quizTextKo };\n",
    );
    expect(read('content/about/ko.ts')).toContain('aboutContentKo');
    expect(read('content/legal/TermsContent.ko.ts')).toContain('termsCopyKo');
    expect(existsSync(join(root, 'content/faq/structure.ko.ts'))).toBe(false);
    expect(existsSync(join(root, 'content/__tests__/ignored.ko.ts'))).toBe(false);

    expect(read('scripts/terminology/ko.ts')).toContain(
      'export const KO_TERMINOLOGY_RULES: readonly TerminologyRule[] = [];',
    );
    expect(read('e2e/ko-smoke.spec.ts')).toContain("defineLocaleSmoke('ko')");
    expect(read('e2e/ko-site-qa.desktop.spec.ts')).toContain("locale: 'ko'");
  });

  it('pre-fills the progress tracker with the real catalog key counts and module list', () => {
    scaffoldLocale({ root, locale: 'pt-BR' });
    const progress = readFileSync(join(root, 'docs/i18n/progress-pt-BR.md'), 'utf8');
    expect(progress).toContain('# Brazilian Portuguese Translation — Progress Tracker');
    expect(progress).toMatch(/\| common\s+\|\s+3 \|/);
    expect(progress).toMatch(/\| nav\s+\|\s+1 \|/);
    expect(progress).toContain('`content/quiz/text.basic.pt-BR.ts`');
    expect(readFileSync(join(root, 'scripts/terminology/pt-BR.ts'), 'utf8')).toContain(
      'PT_BR_TERMINOLOGY_RULES',
    );
  });

  it('keeps existing files unless asked to overwrite', () => {
    writeFileSync(join(root, 'messages', 'en', 'common.json'), '{"ok": "OK"}\n');
    mkdirSync(join(root, 'messages', 'ko'), { recursive: true });
    writeFileSync(join(root, 'messages', 'ko', 'common.json'), '{"ok": "확인"}\n');

    const first = scaffoldLocale({ root, locale: 'ko' });
    expect(first.skipped).toEqual(['messages/ko/common.json']);
    expect(readFileSync(join(root, 'messages/ko/common.json'), 'utf8')).toBe('{"ok": "확인"}\n');

    const second = scaffoldLocale({ root, locale: 'ko', overwrite: true });
    expect(second.skipped).toEqual([]);
    expect(readFileSync(join(root, 'messages/ko/common.json'), 'utf8')).toBe('{"ok": "OK"}\n');
  });

  it('can copy from a sibling locale instead of the default', () => {
    mkdirSync(join(root, 'messages', 'zh'), { recursive: true });
    writeFileSync(join(root, 'messages', 'zh', 'common.json'), '{"ok": "好"}\n');
    writeFileSync(
      join(root, 'content', 'about', 'zh.ts'),
      "export const aboutContentZh = { heading: '关于' };\n",
    );

    const result = scaffoldLocale({ root, locale: 'zh-SG', source: 'zh' });
    expect(result.written).toContain('messages/zh-SG/common.json');
    expect(readFileSync(join(root, 'content/about/zh-SG.ts'), 'utf8')).toContain(
      'aboutContentZhSg',
    );
    expect(readFileSync(join(root, 'messages/zh-SG/common.json'), 'utf8')).toBe('{"ok": "好"}\n');
  });
});

describe('nextSteps', () => {
  it('walks from routing registration to the surfaces outside the compiler', () => {
    const steps = nextSteps('ko');
    expect(steps[0]).toContain("Add 'ko' to LOCALES in i18n/routing.ts (label: 한국어)");
    expect(steps.some((step) => step.includes('content/*/index.ts'))).toBe(true);
    expect(steps.some((step) => step.includes('html:lang(ko)'))).toBe(true);
    expect(steps.some((step) => step.includes('glossary-ko.md'))).toBe(true);
    expect(steps.at(-1)).toContain('progress-ko.md');
  });
});
