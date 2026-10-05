import { expect, type Page } from '@playwright/test';

/**
 * Headings whose wrapped lines start with a closing mark (。，、」 …, or an
 * ASCII . , ) and the like). A browser's own line breaking never does this;
 * an overflow break (`overflow-wrap: anywhere` under `keep-all`, the Chinese
 * heading setting) can, when a clause just misses its line: 都在塑造艺术 / 。.
 * Lines are read from each character's box, so the check sees what renders.
 */
function readStrandedHeadingLines(page: Page): Promise<string[]> {
  return page.evaluate(() => {
    const CLOSING = /^[。，、；：！？）」』》〉】〕”’….,;:!?)\]]/u;
    const stranded: string[] = [];
    const headings = document.querySelectorAll<HTMLElement>("h1, h2, h3, [class*='type-display-']");
    for (const heading of headings) {
      if (heading.parentElement?.closest("h1, h2, h3, [class*='type-display-']")) continue;
      if (heading.offsetParent === null) continue;

      const lines: Array<{ top: number; text: string }> = [];
      const walker = document.createTreeWalker(heading, NodeFilter.SHOW_TEXT);
      const range = document.createRange();
      for (let node = walker.nextNode(); node; node = walker.nextNode()) {
        const text = node.textContent ?? '';
        for (let index = 0; index < text.length; index += 1) {
          const char = text[index]!;
          if (/[\s​]/u.test(char)) continue;
          range.setStart(node, index);
          range.setEnd(node, index + 1);
          const box = range.getClientRects()[0];
          // Skip visually hidden text (sr-only) and glyphs with no box.
          if (!box || box.width < 1 || box.height < 4) continue;
          const line = lines.at(-1);
          if (line && box.top < line.top + box.height / 2) line.text += char;
          else lines.push({ top: box.top, text: char });
        }
      }
      lines.slice(1).forEach((line, index) => {
        if (CLOSING.test(line.text)) {
          const all = lines.map((each) => each.text).join(' / ');
          stranded.push(`line ${index + 2} of "${all}"`);
        }
      });
    }
    return stranded;
  });
}

/** Fails when any visible heading has a wrapped line that starts with a closing mark. */
export async function expectNoStrandedHeadingPunctuation(page: Page, where: string): Promise<void> {
  await page.evaluate(() => document.fonts.ready);
  expect(
    await readStrandedHeadingLines(page),
    `heading lines that start with a closing mark on ${where}`,
  ).toEqual([]);
}

/**
 * H1s that split the brand across lines ("Cosmic / Signatureの仕組み"). From
 * 360px every heading tier has room for "Cosmic Signature" on one line, so
 * the brand must never wrap there (components/ui/site-name-text.tsx).
 */
function readSplitBrandHeadings(page: Page): Promise<string[]> {
  return page.evaluate(() => {
    const BRAND = 'Cosmic Signature';
    const split: string[] = [];
    for (const heading of document.querySelectorAll<HTMLElement>('h1')) {
      if (heading.offsetParent === null) continue;
      const text = heading.textContent ?? '';
      const at = text.indexOf(BRAND);
      if (at === -1) continue;
      // The tops of the brand's first and last glyph boxes.
      const tops: number[] = [];
      const walker = document.createTreeWalker(heading, NodeFilter.SHOW_TEXT);
      const range = document.createRange();
      let offset = 0;
      for (let node = walker.nextNode(); node; node = walker.nextNode()) {
        const data = node.textContent ?? '';
        for (const target of [at, at + BRAND.length - 1]) {
          if (target < offset || target >= offset + data.length) continue;
          range.setStart(node, target - offset);
          range.setEnd(node, target - offset + 1);
          const box = range.getClientRects()[0];
          if (box) tops.push(box.top);
        }
        offset += data.length;
      }
      if (tops.length === 2 && Math.abs(tops[0]! - tops[1]!) > 4) split.push(text);
    }
    return split;
  });
}

/** Fails when a visible H1 wraps "Cosmic Signature" onto two lines. */
export async function expectBrandHeldWhole(page: Page, where: string): Promise<void> {
  await page.evaluate(() => document.fonts.ready);
  expect(await readSplitBrandHeadings(page), `H1s that split the brand on ${where}`).toEqual([]);
}
