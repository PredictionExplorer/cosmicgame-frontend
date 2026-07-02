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

  it.each(docs)('%s uses canonical apex and app hosts correctly', (_fileName, content) => {
    expect(content).toContain('https://cosmicsignature.com/');
    expect(content).toContain('https://app.cosmicsignature.com/');
    expect(content).not.toContain('https://www.cosmicsignature.com');
  });

  it.each(docs)('%s includes AI-facing disambiguation language', (_fileName, content) => {
    expect(content).toMatch(/not related to the COSMIC cancer mutation database/i);
  });

  it.each(docs)('%s links the canonical trust and risk pages', (_fileName, content) => {
    expect(content).toContain('https://app.cosmicsignature.com/security');
    expect(content).toContain('https://app.cosmicsignature.com/audits');
    expect(content).toContain('https://app.cosmicsignature.com/risk-disclosures');
  });

  it.each(docs)(
    '%s states the open-finalization transfer behavior (claimMainPrize after 48h)',
    (_fileName, content) => {
      expect(content).toMatch(/48-hour exclusive/i);
      expect(content).toMatch(/anyone may finalize/i);
      expect(content).toMatch(/finalizer receives the Signature Allocation/i);
      expect(content).not.toMatch(/still belongs/i);
    },
  );

  it.each(docs)('%s states the once-only anchoring rule', (_fileName, content) => {
    expect(content).toMatch(/anchored only once/i);
  });

  it.each(docs)('%s uses the exact 1%-per-cycle increment growth', (_fileName, content) => {
    expect(content).toMatch(
      /grows 1% (per finalized cycle|each time a cycle finalizes|with every finalized cycle)/i,
    );
    expect(content).not.toMatch(/10-20% per year|10% to 20%/i);
  });

  it.each(docs)('%s avoids unsupported blanket audit claims', (_fileName, content) => {
    expect(content).not.toMatch(/formally verified Solidity contracts/i);
  });

  it('llms.txt documents the 5-week open-retrieval escrow timeout', () => {
    const content = readPublicFile('llms.txt');
    expect(content).toMatch(/5-week retrieval timeout/i);
    expect(content).toMatch(/anyone may retrieve unretrieved allocations for themselves/i);
  });
});
