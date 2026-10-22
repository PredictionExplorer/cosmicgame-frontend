#!/usr/bin/env tsx
import { writeFileSync } from 'node:fs';

import { buildLlmsDocs } from './llms-docs-core';

function main(): void {
  writeFileSync('public/llms.txt', buildLlmsDocs(false));
  writeFileSync('public/llms-full.txt', buildLlmsDocs(true));
}

main();
