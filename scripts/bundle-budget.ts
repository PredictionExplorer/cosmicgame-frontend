import path from 'node:path';

import { DEFAULT_BUDGET_KB, evaluateBudget, getHomeJsFiles } from './bundle-budget-core';

// Wrapped in main() because tsx runs this file as CommonJS, where top-level
// await is not supported by esbuild's transform.
async function main(): Promise<void> {
  const nextDir = path.join(process.cwd(), '.next');
  const budgetKb = Number(process.env.APP_HOME_JS_GZIP_BUDGET_KB ?? DEFAULT_BUDGET_KB);

  const result = evaluateBudget(await getHomeJsFiles(nextDir), budgetKb);

  console.warn(result.summary);

  if (!result.withinBudget) {
    process.exitCode = 1;
  }
}

void main();
