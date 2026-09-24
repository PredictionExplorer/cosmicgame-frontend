import { expect, test, type Locator, type Page } from '@playwright/test';

/**
 * Verifies that every explained label on the /contracts page opens, renders
 * its expected copy, and isn't clipped by an ancestor. Each label is an
 * `ExplainedTerm`: the label itself is the trigger, named "More information
 * about {label}", and its card is portaled out of <main> so no section's
 * overflow or stacking context can hide it.
 */

const TOOLTIP_LABELS_AND_COPY: Array<{ label: string; expected: RegExp }> = [
  // Protocol configuration
  {
    label: 'ETH Gesture Cost step-up',
    expected: /ETH gesture cost uses this step-up parameter/,
  },
  {
    label: 'Time added per gesture',
    expected:
      /Each gesture adds this much time to the Cycle Finalization Time\. The increment grows by \d+(?:\.\d+)?% with each cycle\./,
  },
  {
    label: 'Participation CST now',
    expected: /Estimated Participation CST if a gesture lands now/,
  },
  {
    label: 'Finalization timeout',
    expected: /Time the Final Gesture participant has to finalize the cycle/,
  },
  {
    label: 'Initial cycle duration',
    expected: /The initial Cycle Finalization Time added when the first gesture is made/,
  },
  {
    label: 'Message length limit',
    expected: /Maximum character length allowed in gesture messages/,
  },
  {
    label: 'ETH Stellar Selection recipients',
    expected: /Number of participants randomly selected to receive ETH allocations/,
  },
  {
    label: 'NFT Stellar Selection recipients',
    expected: /Number of participants randomly selected to receive Cosmic Signature NFTs/,
  },
  {
    label: 'Anchored-NFT Stellar Selection recipients',
    expected: /Number of Random Walk NFT anchor-holders randomly selected/,
  },
  // Allocation tracks
  { label: 'Signature Allocation', expected: /participant who made the Final Gesture/ },
  { label: 'Chrono-Warrior', expected: /ETH allocation to the Chrono-Warrior/ },
  { label: 'Stellar Selection', expected: /Portion distributed to randomly selected participants/ },
  {
    label: 'Anchor Distribution',
    expected: /ETH Anchor Distributions to Cosmic Signature NFT anchor-holders/,
  },
  { label: 'Public Goods', expected: /Forwarded to the Public Goods Beneficiary/ },
  // Calibration Windows
  {
    label: 'Starting cost',
    expected: /Starting Gesture Cost of the CST Calibration Window/,
  },
  // Public Goods
  {
    label: 'Public Goods Beneficiary',
    expected: /currently receiving the Public Goods Allocation/,
  },
];

/**
 * Closes any visible tooltip. We press Escape (which Radix Tooltip dismisses
 * on, regardless of whether the popper was opened via hover, focus, or tap)
 * AND move the pointer to the corner so a hover-opened popper isn't
 * immediately reopened on the next iteration. Dismissing explicitly also keeps
 * the next assertion from accidentally matching stale tooltip content while
 * animations are settling.
 */
async function dismissOpenTooltips(page: Page): Promise<void> {
  await page.mouse.move(0, 0);
  await page.keyboard.press('Escape');
  await expect(page.getByRole('tooltip')).toHaveCount(0);
}

/** The explained label itself is the trigger, named after the label it explains. */
function tooltipTriggerForLabel(page: Page, label: string): Locator {
  return page.getByRole('button', { name: `More information about ${label}`, exact: true }).first();
}

/** A tooltip is "fully on screen" when its bounding box sits inside the viewport. */
async function expectTooltipFullyVisible(page: Page, expected: RegExp): Promise<void> {
  const popper = page.getByRole('tooltip', { name: expected });
  await expect(popper).toBeVisible();

  const tooltipBox = await popper.boundingBox();
  expect(tooltipBox, `tooltip "${expected}" must have a bounding box`).not.toBeNull();
  if (!tooltipBox) return;

  const viewport = page.viewportSize();
  expect(viewport).not.toBeNull();
  if (!viewport) return;

  const margin = 4;
  expect(tooltipBox.x).toBeGreaterThanOrEqual(-margin);
  expect(tooltipBox.y).toBeGreaterThanOrEqual(-margin);
  expect(tooltipBox.x + tooltipBox.width).toBeLessThanOrEqual(viewport.width + margin);
  expect(tooltipBox.y + tooltipBox.height).toBeLessThanOrEqual(viewport.height + margin);
}

test.describe('/contracts tooltips', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/contracts', { waitUntil: 'networkidle' });
    // Reduced motion skips the card's zoom-in before hit-testing settles.
    await page.emulateMedia({ reducedMotion: 'reduce' });
  });

  test('every documented tooltip opens with the right copy and is not clipped', async ({
    page,
  }) => {
    for (const { label, expected } of TOOLTIP_LABELS_AND_COPY) {
      const trigger = tooltipTriggerForLabel(page, label);
      await trigger.scrollIntoViewIfNeeded();
      await expect(trigger, `trigger for "${label}" must be visible`).toBeVisible();

      // A click pins the card on every pointer type (hover opens it only for a mouse).
      await trigger.click();

      await expectTooltipFullyVisible(page, expected);

      await dismissOpenTooltips(page);
    }
  });

  test("an explained label's card is portaled out of <main>, so no section clips it", async ({
    page,
  }) => {
    const trigger = tooltipTriggerForLabel(page, 'Initial cycle duration');
    await trigger.scrollIntoViewIfNeeded();
    await trigger.click();

    const popper = page.getByRole('tooltip', {
      name: /The initial Cycle Finalization Time added when the first gesture is made/,
    });
    await expect(popper).toBeVisible();

    const popperContext = await popper.evaluate((el) => {
      const wrapper = el.closest('[data-radix-popper-content-wrapper]') ?? el;
      const wrapperRect = (wrapper as HTMLElement).getBoundingClientRect();
      return {
        isInsideMain: Boolean(el.closest('main')),
        wrapperPosition: getComputedStyle(wrapper as HTMLElement).position,
        wrapperWidth: wrapperRect.width,
        wrapperHeight: wrapperRect.height,
      };
    });
    expect(popperContext.isInsideMain, 'the card should be portaled out of <main>').toBe(false);
    expect(['fixed', 'absolute']).toContain(popperContext.wrapperPosition);
    expect(popperContext.wrapperWidth).toBeGreaterThan(40);
    expect(popperContext.wrapperHeight).toBeGreaterThan(10);
  });

  test('every information button on the page has a working tooltip', async ({ page }) => {
    // Bound the test by counting triggers on the page. We loop a max of N to
    // keep the test from running forever if the page grows; we just want a
    // sanity-check that no trigger silently fails to open.
    const triggers = page.locator(':is(button, [role="button"])[aria-label^="More information"]');
    const count = await triggers.count();
    expect(count, 'expected at least one tooltip trigger on /contracts').toBeGreaterThan(0);

    const sampleSize = Math.min(count, 12);
    for (let i = 0; i < sampleSize; i += 1) {
      const trigger = triggers.nth(i);
      await trigger.scrollIntoViewIfNeeded();
      await trigger.click();
      await expect(page.getByRole('tooltip')).toBeVisible();
      await dismissOpenTooltips(page);
    }
  });
});
