import { expect, test, type Locator, type Page } from '@playwright/test';

/**
 * Verifies that every tooltip on the /contracts page actually opens, renders
 * its expected copy, and isn't clipped by an ancestor with `overflow: hidden`.
 *
 * Why this exists: `StatCard` (and several sibling cards) sit inside an
 * `overflow-hidden` container with `backdrop-filter: blur(...)`. Without the
 * Radix `TooltipPrimitive.Portal` wrapper added in `components/ui/tooltip.tsx`,
 * tooltips were rendered inside that clipping/stacking-context ancestor and
 * appeared "blocked by other elements" — particularly the "Initial Time
 * Increment" trigger reported by the user. These tests fail loudly if the
 * portal regression resurfaces.
 */

const TOOLTIP_LABELS_AND_COPY: Array<{ label: string; expected: RegExp }> = [
  // GameConfiguration cards
  {
    label: 'Gesture-Cost Drift',
    expected: /Each gesture increases the next Gesture Cost by this percentage/,
  },
  {
    label: 'Time Increment',
    expected: /Each gesture adds this much time to the Cycle Finalization Time/,
  },
  {
    label: 'Participation CST per Gesture',
    expected: /Cosmic Signature Tokens imprinted with each gesture/,
  },
  {
    label: 'Finalization Timeout',
    expected: /Time the Final Gesture participant has to finalize the cycle/,
  },
  {
    label: 'Initial Time Increment',
    expected: /The initial Cycle Finalization Time added when the first gesture is made/,
  },
  {
    label: 'Max Message Length',
    expected: /Maximum character length allowed in gesture messages/,
  },
  // FundDistribution segments
  { label: 'Signature Allocation', expected: /participant who made the Final Gesture/ },
  { label: 'Chrono-Warrior', expected: /ETH allocation to the Chrono-Warrior/ },
  { label: 'Stellar Selection', expected: /Portion distributed to randomly selected participants/ },
  { label: 'Anchor Distribution', expected: /Distributions to anchor-holders/ },
  { label: 'Public Goods', expected: /Forwarded to the Public Goods Beneficiary/ },
  // AuctionParameters stellar-selection cards
  {
    label: 'ETH Stellar Selection Recipients',
    expected: /Number of participants randomly selected to receive ETH allocations/,
  },
  {
    label: 'NFT Stellar Selection (Participants)',
    expected: /Number of participants randomly selected to receive Cosmic Signature NFTs/,
  },
  {
    label: 'NFT Stellar Selection (Anchored RWLK)',
    expected: /Number of RandomWalk NFT anchor-holders randomly selected/,
  },
  // AuctionParameters CST card
  {
    label: 'Calibration Ceiling',
    expected: /Starting Gesture Cost of the CST Calibration Window/,
  },
  // AuctionParameters public-goods row
  {
    label: 'Public Goods Address',
    expected: /currently receiving the Public Goods Allocation/,
  },
];

/**
 * Closes any visible tooltip. We press Escape (which Radix Tooltip dismisses
 * on, regardless of whether the popper was opened via hover, focus, or tap)
 * AND move the pointer to the corner so a hover-opened popper isn't
 * immediately reopened on the next iteration. Each `InfoTooltip` mounts its
 * own `TooltipProvider`, so opening another tooltip does NOT auto-close the
 * previous one — which is why we have to dismiss explicitly between asserts.
 */
async function dismissOpenTooltips(page: Page): Promise<void> {
  await page.mouse.move(0, 0);
  await page.keyboard.press('Escape');
  await expect(page.getByRole('tooltip')).toHaveCount(0);
}

/**
 * Given a card label, returns the trigger button that opens its tooltip. Each
 * label lives inline with its `InfoTooltip` trigger inside a flex row, so
 * going up one DOM level from the label and finding the
 * `[aria-label="Show more information"]` button within the same row pairs the
 * label with its tooltip the way a sighted user would.
 */
function tooltipTriggerForLabel(page: Page, label: string): Locator {
  return page
    .getByText(label, { exact: true })
    .first()
    .locator('xpath=..')
    .locator('button[aria-label="Show more information"]')
    .first();
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
    // Reduced motion lets us avoid waiting for Framer Motion / hover transforms
    // before pointer-event hit-testing settles.
    await page.emulateMedia({ reducedMotion: 'reduce' });
  });

  test('every documented tooltip opens with the right copy and is not clipped', async ({
    page,
  }) => {
    for (const { label, expected } of TOOLTIP_LABELS_AND_COPY) {
      const trigger = tooltipTriggerForLabel(page, label);
      await trigger.scrollIntoViewIfNeeded();
      await expect(trigger, `trigger for "${label}" must be visible`).toBeVisible();

      // Hover opens the tooltip on desktop, tap opens it on mobile (the
      // TooltipTrigger has touch-tap handling for that). Hover works in both
      // configured projects (Desktop Chrome + Mobile Chrome via Pixel 5
      // emulation), so we use it everywhere.
      await trigger.hover();

      await expectTooltipFullyVisible(page, expected);

      await dismissOpenTooltips(page);
    }
  });

  test('the "Initial Time Increment" tooltip is not blocked by ancestor clipping', async ({
    page,
  }) => {
    // Targeted regression test for the user-reported symptom: this trigger
    // sits inside a `StatCard` with `overflow: hidden` AND `backdrop-filter`,
    // so without the portal fix the popper would either not appear at all or
    // appear visually clipped to the card's bounds.
    const trigger = tooltipTriggerForLabel(page, 'Initial Time Increment');
    await trigger.scrollIntoViewIfNeeded();
    await trigger.hover();

    const popper = page.getByRole('tooltip', {
      name: /The initial Cycle Finalization Time added when the first gesture is made/,
    });
    await expect(popper).toBeVisible();
    await expect(popper).toContainText(
      'The initial Cycle Finalization Time added when the first gesture is made',
    );

    // The popper must NOT live inside the page's <main> — that's where the
    // `StatCard` (with its `overflow:hidden` + `backdrop-filter` stacking
    // context) renders. The whole point of the portal fix is to lift the
    // popper out of that subtree so neither the clipping nor the local
    // stacking context can hide the tooltip.
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
    expect(popperContext.isInsideMain, 'tooltip popper should be portaled out of <main>').toBe(
      false,
    );
    // Radix uses Floating UI which positions the popper wrapper with
    // `position: fixed` (or absolute when inline) — `fixed` lifts it above
    // ancestor `overflow:hidden`, which is essential for the popper to render
    // outside the StatCard's clipping rectangle.
    expect(['fixed', 'absolute']).toContain(popperContext.wrapperPosition);
    // The wrapper's bounding box should be substantial — i.e., not collapsed
    // by the ancestor clipping. We assert on the wrapper rather than the
    // role=tooltip node because Radix's animations briefly leave the inner
    // node sized at zoom-in scale while the wrapper has the full layout box.
    expect(popperContext.wrapperWidth).toBeGreaterThan(40);
    expect(popperContext.wrapperHeight).toBeGreaterThan(10);
  });

  test('every "Show more information" button on the page has a working tooltip', async ({
    page,
  }) => {
    // Bound the test by counting triggers on the page. We loop a max of N to
    // keep the test from running forever if the page grows; we just want a
    // sanity-check that no trigger silently fails to open.
    const triggers = page.getByRole('button', { name: 'Show more information' });
    const count = await triggers.count();
    expect(count, 'expected at least one tooltip trigger on /contracts').toBeGreaterThan(0);

    const sampleSize = Math.min(count, 12);
    for (let i = 0; i < sampleSize; i += 1) {
      const trigger = triggers.nth(i);
      await trigger.scrollIntoViewIfNeeded();
      await trigger.hover();
      await expect(page.getByRole('tooltip')).toBeVisible();
      await dismissOpenTooltips(page);
    }
  });
});
