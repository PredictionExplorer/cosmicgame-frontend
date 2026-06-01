import { expect, type Locator, type Page } from '@playwright/test';

export interface TooltipExpectation {
  label: string;
  expected: RegExp;
}

export async function dismissOpenTooltips(page: Page): Promise<void> {
  await page.mouse.move(0, 0);
  await page.keyboard.press('Escape');
  await expect(page.getByRole('tooltip')).toHaveCount(0);
}

export function tooltipTriggerForLabel(page: Page, label: string): Locator {
  const tooltipButtonSelector = [
    'button[aria-label="Show more information"]',
    'button[aria-label^="More information about"]',
    'button[aria-label^="Explain column:"]',
  ].join(', ');

  return page
    .getByText(label, { exact: true })
    .first()
    .locator('xpath=ancestor::*[.//button][1]')
    .locator(tooltipButtonSelector)
    .first();
}

export async function openTooltip(trigger: Locator): Promise<void> {
  const page = trigger.page();
  const coarsePointer = await page.evaluate(() => window.matchMedia('(pointer: coarse)').matches);
  const tooltipIsVisible = async () =>
    page
      .getByRole('tooltip')
      .first()
      .isVisible()
      .catch(() => false);

  if (!coarsePointer) {
    await trigger.hover({ force: true });
    await page.waitForTimeout(250);
    if (await tooltipIsVisible()) {
      return;
    }

    await trigger.focus();
    await page.waitForTimeout(250);
    if (await tooltipIsVisible()) {
      return;
    }
  }

  // Mobile Chrome emulation can miss hover-open on the first attempt. The app's
  // InfoTooltip trigger supports touch pointerdown explicitly, and because
  // these label-based triggers are buttons (not navigation links), the fallback
  // is safe and deterministic.
  if (coarsePointer) {
    try {
      await trigger.tap({ force: true });
      await page.waitForTimeout(150);
      if (await tooltipIsVisible()) {
        return;
      }
    } catch {
      // Some responsive table header clones can resolve just outside the
      // mobile viewport. Dispatching the touch event below still exercises the
      // same app tooltip handler without depending on physical tap geometry.
    }
  }

  await trigger.evaluate((element) => {
    element.dispatchEvent(
      new PointerEvent('pointerdown', {
        bubbles: true,
        cancelable: true,
        pointerType: 'touch',
      }),
    );
  });
  await page.waitForTimeout(150);
  if (await tooltipIsVisible()) {
    return;
  }

  await trigger.focus();
  await page.waitForTimeout(150);
  if (await tooltipIsVisible()) {
    return;
  }

  if (coarsePointer) {
    await trigger.click({ force: true });
    await page.waitForTimeout(150);
  }
}

export async function expectTooltipFullyVisible(page: Page, expected: RegExp): Promise<void> {
  const popper = page.getByRole('tooltip', { name: expected }).first();
  await expect(popper).toBeVisible();
  await expect(popper).toContainText(expected);

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

export async function expectLabelTooltip(
  page: Page,
  { label, expected }: TooltipExpectation,
): Promise<void> {
  await dismissOpenTooltips(page);
  const trigger = tooltipTriggerForLabel(page, label);
  await trigger.evaluate((element) => {
    element.scrollIntoView({ block: 'center', inline: 'center' });
  });
  await expect(trigger, `trigger for "${label}" must be visible`).toBeVisible();
  await openTooltip(trigger);
  await expectTooltipFullyVisible(page, expected);
  await dismissOpenTooltips(page);
}

export async function expectAllLabelTooltips(
  page: Page,
  expectations: TooltipExpectation[],
): Promise<void> {
  for (const expectation of expectations) {
    await expectLabelTooltip(page, expectation);
  }
}

export async function expectTooltipPortaledOutOfMain(page: Page, expected: RegExp): Promise<void> {
  const popper = page.getByRole('tooltip', { name: expected });
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

  expect(popperContext.isInsideMain, 'tooltip popper should be portaled out of <main>').toBe(false);
  expect(['fixed', 'absolute']).toContain(popperContext.wrapperPosition);
  expect(popperContext.wrapperWidth).toBeGreaterThan(40);
  expect(popperContext.wrapperHeight).toBeGreaterThan(10);
}
