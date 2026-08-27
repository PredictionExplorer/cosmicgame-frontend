/**
 * Full-stack specs against the local harness: real contracts on a local
 * chain, the real indexer/API, and the testing-mode frontend. One serial
 * file — the game world is shared, so each section drives the state it
 * needs (never assuming leftovers) and waits on explicit chain/indexer
 * conditions instead of wall-clock guesses.
 */

import { expect, test, type Page } from '@playwright/test';

import {
  awaitCycleState,
  awaitIndexed,
  control,
  controlStatus,
  dashboardShowsOpenedCycle,
  dashboardShowsUnopenedActiveCycle,
  readDashboard,
  switchScenario,
} from './support/control';
import { readStackState, webUrl } from './support/stack';

test.describe.configure({ mode: 'serial' });

function appUrl(path = '/'): string {
  const state = readStackState();
  if (!state) throw new Error('Harness stack state missing');
  return `${webUrl(state)}${path}`;
}

async function openHome(page: Page): Promise<void> {
  await page.goto(appUrl('/'), { waitUntil: 'domcontentloaded' });
  await expect(page.getByTestId('cycle-monument')).toBeVisible({ timeout: 30_000 });
}

test.beforeAll(async () => {
  // Specs own all activity; the setup project already pinned `quiet`.
  await switchScenario('quiet');
});

test('seeded history reaches the indexer and the app boots on it', async ({ page }) => {
  const dashboard = await awaitIndexed(
    'seeded cycles to be indexed',
    (d) => (d.CurRoundNum ?? 0) >= 2,
  );
  expect(dashboard.CurRoundNum ?? 0).toBeGreaterThanOrEqual(2);

  await openHome(page);
  await expect(page.getByTestId('gesture-message-chat')).toBeVisible();
  await expect(page.getByTestId('home-deck-board')).toBeVisible();
});

test('phase rendering follows the driven chain state', async ({ page }) => {
  test.setTimeout(8 * 60_000);

  await control('/phase', { name: 'waiting-first-gesture' });
  await awaitCycleState('cycle active with no gestures', (s) => s.cycle.active && !s.cycle.opened);
  // The dashboard API refreshes live reads on its own cadence; the UI can
  // only follow once the API has observed the new chain state.
  await awaitIndexed('the API to observe the unopened cycle', dashboardShowsUnopenedActiveCycle);
  await openHome(page);
  await expect(page.getByTestId('cycle-monument')).toHaveAttribute(
    'data-phase',
    'waiting-first-gesture',
    { timeout: 60_000 },
  );

  await control('/phase', { name: 'final-minute' });
  await awaitCycleState(
    'countdown inside the final minute',
    (s) => s.cycle.opened && Number(s.cycle.secondsUntilFinalization) > 0,
  );
  await awaitIndexed('the API to observe the opening gesture', dashboardShowsOpenedCycle);
  await openHome(page);
  await expect(page.getByTestId('cycle-monument')).toHaveAttribute(
    'data-phase',
    /final-minute|final-ten|confirming|ready-to-finalize/,
    { timeout: 60_000 },
  );
});

test('a gesture lands on chain, in the indexer, and in the chat', async ({ page }) => {
  test.setTimeout(8 * 60_000);

  await control('/phase', { name: 'waiting-first-gesture' });
  await awaitCycleState('a fresh open cycle', (s) => s.cycle.active && !s.cycle.opened);

  const before = await readDashboard();
  const message = `Playwright roundtrip mark ${Date.now()}`;
  await control('/gesture', { persona: 'Nova', kind: 'eth', message });

  await awaitCycleState('the gesture to register on chain', (s) => s.cycle.opened);
  await awaitIndexed(
    'the gesture to reach the indexer',
    (d) =>
      (d.CurNumBids ?? 0) > (before.CurNumBids ?? 0) ||
      (d.CurRoundNum ?? 0) > (before.CurRoundNum ?? 0),
  );

  await openHome(page);
  await expect(page.getByTestId('gesture-message-chat')).toContainText(message, {
    timeout: 60_000,
  });
});

test('burner wallet and dev panel drive the game from the browser', async ({ page }) => {
  test.setTimeout(8 * 60_000);

  await openHome(page);

  // The panel exists only in testing mode; opening it connects the burner.
  await page.getByTestId('harness-open').click();
  await expect(page.getByTestId('harness-panel')).toBeVisible();
  await expect(page.getByTestId('harness-cycle-index')).not.toHaveText('…', { timeout: 30_000 });

  // Burner connection flips the composer from its connect prompt to the form.
  await expect(page.getByTestId('composer-message-input')).toBeVisible({ timeout: 30_000 });

  const before = await readDashboard();
  await page.getByTestId('harness-persona-select').selectOption('Lyra');
  await page.getByTestId('harness-gesture-eth').click();
  await awaitIndexed(
    'the panel-triggered gesture to be indexed',
    (d) => (d.CurNumBids ?? 0) > (before.CurNumBids ?? 0),
  );
});

test('endgame: finalization pays out and the next cycle opens', async ({ page }) => {
  test.setTimeout(10 * 60_000);

  await control('/phase', { name: 'ready-to-finalize' });
  const readyStatus = await awaitCycleState(
    'the countdown to expire',
    (s) => s.cycle.opened && Number(s.cycle.secondsUntilFinalization) === 0,
  );
  const cycleBefore = Number(readyStatus.cycle.index);

  await awaitIndexed(
    'the API to observe the expired countdown',
    (d) =>
      dashboardShowsOpenedCycle(d) && (d.PrizeClaimTs ?? Infinity) <= Math.floor(Date.now() / 1000),
  );
  await openHome(page);
  await expect(page.getByTestId('cycle-monument')).toHaveAttribute(
    'data-phase',
    /confirming|ready-to-finalize/,
    { timeout: 60_000 },
  );

  await control('/finalize', {});
  await awaitCycleState(
    'the next cycle to begin',
    (s) => Number(s.cycle.index) === cycleBefore + 1,
  );
  await awaitIndexed(
    'the finalized cycle to reach the indexer',
    (d) => (d.CurRoundNum ?? 0) >= cycleBefore + 1,
  );

  // The UI rolls over: the monument leaves the endgame phases.
  await openHome(page);
  await expect(page.getByTestId('cycle-monument')).toHaveAttribute(
    'data-phase',
    /opening-soon|waiting-first-gesture|live|approach/,
    { timeout: 90_000 },
  );

  const status = await controlStatus();
  expect(Number(status.cycle.index)).toBe(cycleBefore + 1);
});
