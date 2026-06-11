#!/usr/bin/env node
/**
 * Merge V2-only ABI fragments into shared Cosmic Game JSON ABIs.
 * Skips entries that already exist (same function name + input types).
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const fragments = JSON.parse(
  fs.readFileSync(path.join(root, 'contracts/cosmicGameV2AbiFragments.json'), 'utf8'),
);

const targets = ['CosmicGame.json', 'EthDonations.json', 'SystemManagement.json'];

function fragmentKey(item) {
  if (item.type !== 'function') return null;
  return `${item.name}:${JSON.stringify(item.inputs)}`;
}

for (const fileName of targets) {
  const filePath = path.join(root, 'contracts', fileName);
  const abi = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  const existing = new Set(abi.map(fragmentKey).filter(Boolean));
  let added = 0;
  for (const fragment of fragments) {
    const key = fragmentKey(fragment);
    if (!key || existing.has(key)) continue;
    abi.push(fragment);
    existing.add(key);
    added++;
  }
  fs.writeFileSync(filePath, `${JSON.stringify(abi, null, 2)}\n`);
  console.log(`${fileName}: added ${added} V2 fragment(s)`);
}
