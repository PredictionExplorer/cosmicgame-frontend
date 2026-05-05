import { readFileSync } from 'fs';
import { join } from 'path';

import { protocolFacts } from '@/content/protocol-facts';

const readPublicFile = (fileName: string) =>
  readFileSync(join(process.cwd(), 'public', fileName), 'utf8');

describe('LLM-facing protocol docs', () => {
  const docs = [
    ['llms.txt', readPublicFile('llms.txt')],
    ['llms-full.txt', readPublicFile('llms-full.txt')],
  ] as const;

  it.each(docs)('%s reflects the typical per-cycle NFT count', (_fileName, content) => {
    expect(content).toContain(`${protocolFacts.typicalNftsPerCycle} Cosmic Signature NFTs`);
    expect(content).not.toMatch(/12 COSMIC NFTs/i);
  });

  it.each(docs)('%s reflects deployed allocation percentages', (_fileName, content) => {
    expect(content).toContain(`${protocolFacts.mainEthPercentage}%`);
    expect(content).toContain(`${protocolFacts.anchorDistributionPercentage}%`);
    expect(content).toContain(`${protocolFacts.publicGoodsPercentage}%`);
    expect(content).toContain(`${protocolFacts.stellarSelectionEthPercentage}%`);
    expect(content).not.toMatch(/19%/);
    expect(content).not.toMatch(/10%.*Public Goods/i);
    expect(content).not.toMatch(/Stellar Selection recipients share 6%/i);
  });

  it.each(docs)('%s avoids RandomWalk per-wallet discount wording', (_fileName, content) => {
    expect(content).toContain('each RandomWalkNFT can be used once');
    expect(content).not.toMatch(/once per wallet/i);
  });
});
