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
  return page
    .getByText(label, { exact: true })
    .first()
    .locator('xpath=ancestor::*[.//button[@aria-label="Show more information"]][1]')
    .locator('button[aria-label="Show more information"]')
    .first();
}

export async function openTooltip(trigger: Locator): Promise<void> {
  await trigger.hover();
  await trigger.page().waitForTimeout(250);
  if ((await trigger.page().getByRole('tooltip').count()) > 0) {
    return;
  }

  // Mobile Chrome emulation can miss hover-open on the first attempt. The app's
  // InfoTooltip trigger supports touch pointerdown explicitly, and because
  // these label-based triggers are buttons (not navigation links), the fallback
  // is safe and deterministic.
  await trigger.dispatchEvent('pointerdown', {
    bubbles: true,
    cancelable: true,
    pointerType: 'touch',
  });
  await trigger.click();
  await trigger.page().waitForTimeout(150);
}

export async function expectTooltipFullyVisible(page: Page, expected: RegExp): Promise<void> {
  const popper = page.getByRole('tooltip').first();
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
  const trigger = tooltipTriggerForLabel(page, label);
  await trigger.scrollIntoViewIfNeeded();
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
