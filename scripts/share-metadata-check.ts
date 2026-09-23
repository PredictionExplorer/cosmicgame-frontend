#!/usr/bin/env tsx
/**
 * Checks the link-preview metadata of every prerendered page after
 * `next build` (see ./share-metadata-check-core.ts). Runs in pre-push after
 * the production build:
 *
 *   npm run build && npm run seo:share-check
 */

/* eslint-disable no-console -- CLI output; runs via npm scripts, never ships to the browser. */

import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

import { prerenderedDocuments, shareMetadataProblems } from './share-metadata-check-core';

const APP_DIR = join(process.cwd(), '.next', 'server', 'app');

function main(): void {
  if (!existsSync(APP_DIR)) {
    console.error(`${APP_DIR} not found: run \`npm run build\` first.`);
    process.exitCode = 1;
    return;
  }

  const documents = prerenderedDocuments(APP_DIR);
  const failures = documents.flatMap((document) => {
    const problems = shareMetadataProblems(readFileSync(join(APP_DIR, document), 'utf8'));
    return problems.length > 0 ? [{ document, problems }] : [];
  });

  for (const { document, problems } of failures) {
    console.error(`${document}\n  ${problems.join('\n  ')}`);
  }
  console.log(
    `share metadata: ${documents.length - failures.length}/${documents.length} prerendered pages complete`,
  );
  if (failures.length > 0) process.exitCode = 1;
}

main();
