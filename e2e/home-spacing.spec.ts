import { expect, test } from '@playwright/test';

import { HOME_SPACING_ASSET_COUNT, mockHomeSpacingApi } from './home-spacing-fixtures';

/**
 * A busy attachment collection must not determine the height of the narrow
 * artwork rail and leave an equally tall empty column beneath the chat.
 * These checks measure the relationships between real content sections;
 * they do not impose an arbitrary page-wide maximum whitespace threshold.
 */
for (const viewport of [
  { width: 1920, height: 1080 },
  { width: 1440, height: 900 },
  { width: 390, height: 844 },
]) {
  for (const messageCount of [1, 24]) {
    test(`${viewport.width}px home keeps eight attachments in flow with ${messageCount} chat messages`, async ({
      page,
    }) => {
      await page.setViewportSize(viewport);
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await mockHomeSpacingApi(page, messageCount);
      await page.goto('/', { waitUntil: 'domcontentloaded' });

      const feed = page.getByTestId('home-feed-layout');
      const chat = page.getByTestId('gesture-message-chat');
      const attachments = page.getByTestId('attached-nft-showcase');
      await expect(attachments.locator('article')).toHaveCount(HOME_SPACING_ASSET_COUNT);
      await expect(chat.getByText('Spacing audit message 1:', { exact: false })).toBeVisible();
      await page.evaluate(async () => document.fonts.ready);

      // The collection spans the page after the feed/art row. A rail-only
      // collection would pass a generic document overflow or landmark check.
      const [feedBox, chatBox, collectionBox] = await Promise.all([
        feed.boundingBox(),
        chat.boundingBox(),
        attachments.boundingBox(),
      ]);
      expect(feedBox).not.toBeNull();
      expect(chatBox).not.toBeNull();
      expect(collectionBox).not.toBeNull();
      expect(Math.abs(collectionBox!.x - feedBox!.x)).toBeLessThanOrEqual(1);
      expect(Math.abs(collectionBox!.width - feedBox!.width)).toBeLessThanOrEqual(1);
      expect(collectionBox!.y).toBeGreaterThanOrEqual(feedBox!.y + feedBox!.height - 1);

      const spacing = await attachments.evaluate((element) => {
        const wrapper = element.parentElement!;
        return {
          wrapperMargin: Number.parseFloat(getComputedStyle(wrapper).marginTop),
          collectionMargin: Number.parseFloat(getComputedStyle(element).marginTop),
        };
      });
      const sectionGap = collectionBox!.y - feedBox!.y - feedBox!.height;
      expect(sectionGap).toBeLessThanOrEqual(spacing.wrapperMargin + spacing.collectionMargin + 2);

      if (viewport.width >= 1280) {
        // The art card can share the row, but it must not reserve blank space
        // below the chat greater than the chat panel itself.
        expect(feedBox!.height - chatBox!.height).toBeLessThanOrEqual(chatBox!.height);
        const cards = await attachments.locator('article').evaluateAll((elements) =>
          elements.map((element) => {
            const { x, y } = element.getBoundingClientRect();
            return { x, y };
          }),
        );
        const firstRow = cards.filter((card) => Math.abs(card.y - cards[0]!.y) < 1);
        expect(firstRow.length).toBeGreaterThanOrEqual(3);

        if (messageCount > 1) {
          const scroll = page.getByTestId('gesture-message-chat-scroll');
          const dimensions = await scroll.evaluate((element) => ({
            content: element.scrollHeight,
            panel: element.clientHeight,
            overflow: getComputedStyle(element).overflowY,
          }));
          expect(dimensions.content).toBeGreaterThan(dimensions.panel);
          expect(dimensions.overflow).toBe('auto');
        }
      }

      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= document.documentElement.clientWidth + 1,
        ),
      ).toBe(true);
    });
  }
}
