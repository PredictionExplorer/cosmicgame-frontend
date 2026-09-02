import { readFileSync } from 'fs';
import { join } from 'path';

import { protocolFacts } from '@/content/protocol-facts';

import { TRANSLATED_LOCALES } from '@/i18n/routing';
import { COSMIC_SIGNATURE_MARKETPLACE_URL } from '@/config/marketplace';
import { CHAOS_ZERO_PREDICTIONS_URL } from '@/config/predictions';

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

  it.each(docs)('%s names Axiom Zero as the NFT marketplace', (_fileName, content) => {
    expect(content).toContain('Axiom Zero');
    expect(content).toContain(COSMIC_SIGNATURE_MARKETPLACE_URL);
    expect(content).toMatch(/zero-fee/i);
    // The marketplace section replaced the stale OpenSea-first framing.
    expect(content).not.toMatch(/tradeable on OpenSea/i);
  });

  it.each(docs)('%s names Chaos Zero as the prediction market', (_fileName, content) => {
    expect(content).toContain('Chaos Zero');
    expect(content).toContain(CHAOS_ZERO_PREDICTIONS_URL);
    expect(content).toMatch(/prediction market/i);
    expect(content).toMatch(/more gestures than the previous one/i);
  });

  // lexicon-allow-start: this test enforces the ban list against the AI docs,
  // so the banned vocabulary must literally appear in the test itself.
  it.each(docs)('%s keeps ecosystem copy free of gambling vocabulary', (_fileName, content) => {
    // The lexicon scanner does not cover .txt files, so enforce the most
    // load-bearing bans here: Chaos Zero must be described via predictions.
    expect(content).not.toMatch(/\b(bet|bets|betting|wager|wagers|odds|gambling)\b/i);
  });
  // lexicon-allow-end

  it.each(docs)('%s includes useful Simplified Chinese protocol guidance', (_fileName, content) => {
    expect(content).toMatch(/^## 中文/m);
    expect(content).toContain('程序化链上艺术协议');
    expect(content).toContain('48 小时');
    expect(content).toContain(`${protocolFacts.typicalNftsPerCycle} 枚 Cosmic Signature NFT`);
    expect(content).toContain('每枚 RandomWalk NFT 只能');
    expect(content).toContain('COSMIC 癌症突变数据库');
  });

  it.each(docs)('%s includes useful Ukrainian protocol guidance', (_fileName, content) => {
    expect(content).toMatch(/^## Українська/m);
    expect(content).toContain('процедурний протокол ончейн-мистецтва');
    expect(content).toContain('48 годин');
    expect(content).toContain(`${protocolFacts.typicalNftsPerCycle} Cosmic Signature NFT`);
    expect(content).toContain('кожен RandomWalk NFT');
    expect(content).toContain('базою даних мутацій раку COSMIC');
    // Ukrainian thousands never use the English comma grouping, which a
    // Ukrainian reader parses as a decimal point.
    expect(content).not.toMatch(/\d,\d{3} CST[^\n]*[\u0400-\u04ff]/);
  });

  describe.each(TRANSLATED_LOCALES)('%s routes', (locale) => {
    it.each(docs)('%s links the canonical landing and app routes', (_fileName, content) => {
      expect(content).toContain(`https://cosmicsignature.com/${locale}`);
      expect(content).toContain(`https://cosmicsignature.com/${locale}/learn`);
      expect(content).toContain(`https://app.cosmicsignature.com/${locale}`);
      expect(content).toContain(`https://app.cosmicsignature.com/${locale}/security`);
      expect(content).toContain(`https://app.cosmicsignature.com/${locale}/audits`);
      expect(content).toContain(`https://app.cosmicsignature.com/${locale}/risk-disclosures`);
    });
  });
});
