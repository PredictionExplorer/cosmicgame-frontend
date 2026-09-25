import path from 'node:path';

import {
  DEFAULT_BUDGET_KB,
  DEFAULT_LANDING_BUDGET_KB,
  DEFAULT_READING_BUDGET_KB,
  READING_ROUTES,
  evaluateBudget,
  getHomeJsFiles,
  getLandingJsFiles,
  getRouteJsFilesFromStats,
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

  const readingBudgetKb = Number(
    process.env.READING_PAGE_JS_GZIP_BUDGET_KB ?? DEFAULT_READING_BUDGET_KB,
  );
  const readingResults = READING_ROUTES.map((route) =>
    evaluateBudget(getRouteJsFilesFromStats(nextDir, route), readingBudgetKb, route),
  );
  for (const result of readingResults) console.warn(result.summary);

  if (
    !appResult.withinBudget ||
    !landingResult.withinBudget ||
    readingResults.some((result) => !result.withinBudget)
  ) {
    process.exitCode = 1;
  }
}

void main();
