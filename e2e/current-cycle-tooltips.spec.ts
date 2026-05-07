import { test } from '@playwright/test';

import {
  expectAllLabelTooltips,
  expectTooltipPortaledOutOfMain,
  openTooltip,
  tooltipTriggerForLabel,
} from './tooltip-helpers';

const CURRENT_CYCLE_TOOLTIPS = [
  {
    label: 'Total Gestures',
    expected: /Total gestures made in this cycle/,
  },
  {
    label: 'Cycle Reserve',
    expected: /ETH portion of the Signature Allocation/,
  },
  {
    label: 'Stellar Selection Pool',
    expected: /randomly selected participants/,
  },
  {
    label: 'Public Goods',
    expected: /Cycle Reserve is forwarded to Protocol Guild/,
  },
  {
    label: 'Contributed ETH',
    expected: /Direct ETH contributions from the community/,
  },
  {
    label: 'Attached NFTs',
    expected: /NFTs attached to gestures by the community/,
  },
];

test.describe('/current-cycle tooltips', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/current-cycle', { waitUntil: 'networkidle' });
    await page.emulateMedia({ reducedMotion: 'reduce' });
  });

  test('opens every documented tooltip on the current-cycle page', async ({ page }, testInfo) => {
    test.skip(
      testInfo.project.name === 'Mobile Chrome',
      'Mobile coverage is handled by the targeted Total Gestures regression below.',
    );
    await expectAllLabelTooltips(page, CURRENT_CYCLE_TOOLTIPS);
  });

  test('keeps the Total Gestures tooltip fully visible and portaled', async ({ page }) => {
    const trigger = tooltipTriggerForLabel(page, 'Total Gestures');
    await trigger.scrollIntoViewIfNeeded();
    await openTooltip(trigger);

    await expectTooltipPortaledOutOfMain(page, /Total gestures made in this cycle/);
  });
});
