import path from 'node:path';

import {
  DEFAULT_BUDGET_KB,
  DEFAULT_LANDING_BUDGET_KB,
  evaluateBudget,
  getHomeJsFiles,
  getLandingJsFiles,
} from './bundle-budget-core';

// Wrapped in main() because tsx runs this file as CommonJS, where top-level
// await is not supported by esbuild's transform.
async function main(): Promise<void> {
  const nextDir = path.join(process.cwd(), '.next');
  const appBudgetKb = Number(process.env.APP_HOME_JS_GZIP_BUDGET_KB ?? DEFAULT_BUDGET_KB);
  const landingBudgetKb = Number(
    process.env.LANDING_HOME_JS_GZIP_BUDGET_KB ?? DEFAULT_LANDING_BUDGET_KB,
  );

  const appResult = evaluateBudget(await getHomeJsFiles(nextDir), appBudgetKb, 'App home');
  console.warn(appResult.summary);

  const landingResult = evaluateBudget(getLandingJsFiles(nextDir), landingBudgetKb, 'Landing home');
  console.warn(landingResult.summary);

  if (!appResult.withinBudget || !landingResult.withinBudget) {
    process.exitCode = 1;
  }
}

void main();
