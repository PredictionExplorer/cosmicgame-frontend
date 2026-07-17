import { DEFAULT_BANNED_TERMS, buildBannedPattern } from '../../scripts/lexicon-scan-core';
import navMessages from '../../messages/en/nav.json';
import { ECOSYSTEM_DESTINATIONS, getEcosystemDestinations } from '../ecosystem';
import { COSMIC_SIGNATURE_MARKETPLACE_URL } from '../marketplace';
import { CHAOS_ZERO_PREDICTIONS_URL } from '../predictions';
import { CST_UNISWAP_SWAP_URL } from '../uniswap';

function t(key: string): string {
  const value = key
    .split('.')
    .reduce<unknown>(
      (current, part) =>
        typeof current === 'object' && current !== null
          ? (current as Record<string, unknown>)[part]
          : undefined,
      navMessages,
    );
  if (typeof value !== 'string') throw new Error(`Missing test message: ${key}`);
  return value;
}

const localizedDestinations = getEcosystemDestinations(t);

describe('ECOSYSTEM_DESTINATIONS', () => {
  it('exposes exactly the three external product surfaces', () => {
    expect(ECOSYSTEM_DESTINATIONS.map((d) => d.id)).toEqual([
      'uniswap-cst',
      'axiom-zero',
      'chaos-zero',
    ]);
  });

  it('names Axiom Zero as the NFT marketplace', () => {
    const axiom = localizedDestinations.find((d) => d.id === 'axiom-zero')!;
    expect(axiom.name).toBe('Axiom Zero');
    expect(axiom.product.toLowerCase()).toContain('marketplace');
    expect(axiom.href).toBe(COSMIC_SIGNATURE_MARKETPLACE_URL);
    expect(axiom.ariaLabel).toContain('Axiom Zero');
  });

  it('names Chaos Zero as the prediction market', () => {
    const chaos = localizedDestinations.find((d) => d.id === 'chaos-zero')!;
    expect(chaos.name).toBe('Chaos Zero');
    expect(chaos.product.toLowerCase()).toContain('prediction');
    expect(chaos.href).toBe(CHAOS_ZERO_PREDICTIONS_URL);
    expect(chaos.ariaLabel).toBe('Make predictions on Chaos Zero');
  });

  it('points the CST trade segment at the Uniswap swap URL', () => {
    const uniswap = localizedDestinations.find((d) => d.id === 'uniswap-cst')!;
    expect(uniswap.href).toBe(CST_UNISWAP_SWAP_URL);
    expect(uniswap.ariaLabel).toBe('Trade CST on Uniswap');
  });

  it('uses unique ids and hrefs served over https', () => {
    const ids = ECOSYSTEM_DESTINATIONS.map((d) => d.id);
    const hrefs = ECOSYSTEM_DESTINATIONS.map((d) => d.href);
    expect(new Set(ids).size).toBe(ids.length);
    expect(new Set(hrefs).size).toBe(hrefs.length);
    for (const href of hrefs) {
      expect(new URL(href).protocol).toBe('https:');
    }
  });

  it('keeps every accessible name anchored to its visible label', () => {
    for (const destination of localizedDestinations) {
      // WCAG "label in name": the visible text must appear in the aria-label.
      expect(destination.ariaLabel.toLowerCase()).toContain(destination.name.toLowerCase());
    }
  });

  it('keeps all user-visible copy lexicon-safe', () => {
    const pattern = buildBannedPattern(DEFAULT_BANNED_TERMS);
    for (const destination of localizedDestinations) {
      for (const copy of [
        destination.name,
        destination.product,
        destination.tagline,
        destination.ariaLabel,
      ]) {
        pattern.lastIndex = 0;
        expect(`"${copy}"`).not.toMatch(pattern);
      }
    }
  });
});
