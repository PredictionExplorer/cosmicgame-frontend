/**
 * Teardown project for the harness tier: stops the stack when setup booted
 * it; when a developer's stack was reused, restores their previous scenario.
 */

import { test as teardown } from '@playwright/test';

import { switchScenario } from './support/control';
import { clearOwnership, readOwnership, stopOwnedStack } from './support/stack';

teardown('release the harness stack', async () => {
  teardown.setTimeout(5 * 60_000);
  const ownership = readOwnership();
  if (ownership?.owned) {
    await stopOwnedStack();
  } else if (ownership?.previousScenario && ownership.previousScenario !== 'quiet') {
    await switchScenario(ownership.previousScenario)
      .then(() => {
        // eslint-disable-next-line no-console -- visible ownership handoff in the reporter.
        console.log(`[harness-e2e] restored scenario "${ownership.previousScenario}"`);
      })
      .catch((err: unknown) => {
        console.warn(
          `[harness-e2e] could not restore scenario "${ownership.previousScenario}": ${
            err instanceof Error ? err.message : String(err)
          }`,
        );
      });
  }
  clearOwnership();
});
