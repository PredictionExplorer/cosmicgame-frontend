import path from 'node:path';

import { DEFAULT_BUDGET_KB, evaluateBudget, getHomeJsFiles } from './bundle-budget-core';

const nextDir = path.join(process.cwd(), '.next');
const budgetKb = Number(process.env.APP_HOME_JS_GZIP_BUDGET_KB ?? DEFAULT_BUDGET_KB);

const result = evaluateBudget(await getHomeJsFiles(nextDir), budgetKb);

console.warn(result.summary);

if (!result.withinBudget) {
  process.exitCode = 1;
}
