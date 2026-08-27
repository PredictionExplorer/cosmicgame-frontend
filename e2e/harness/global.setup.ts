/**
 * Setup project for the harness tier: ensures a full local stack (chain,
 * indexer, API, director, testing-mode frontend) is running, then pins the
 * director to the `quiet` scenario so specs own every state transition.
 */

import { test as setup } from '@playwright/test';

import { switchScenario, controlStatus, waitUntil } from './support/control';
import { ensureStack } from './support/stack';

setup('boot or reuse the harness stack', async () => {
  setup.setTimeout(20 * 60_000);
  const { state, owned } = await ensureStack();
  await waitUntil('director readiness', async () => (await controlStatus()).ready);
  await switchScenario('quiet');
  // eslint-disable-next-line no-console -- setup progress note in the Playwright reporter stream.
  console.log(
    `[harness-e2e] stack ${owned ? 'booted' : 'reused'} — app http://localhost:${state.webPort}, control http://127.0.0.1:${state.controlPort}`,
  );
});
