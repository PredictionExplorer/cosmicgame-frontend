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
