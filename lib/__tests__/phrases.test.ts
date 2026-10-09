import type { LandingText } from '@/content/landing/structure';
import { landingTextZh } from '@/content/landing/text.zh';
import { landingTextZhHk } from '@/content/landing/text.zh-HK';
import { landingTextZhTw } from '@/content/landing/text.zh-TW';

import { PHRASE_BREAK, phraseTokens, type PhraseToken } from '@/lib/phrases';

const text = (value: string): PhraseToken => ({ type: 'text', text: value });
const keep = (value: string): PhraseToken => ({ type: 'keep', text: value });

describe('phraseTokens', () => {
  it('leaves text without Han characters alone', () => {
    expect(phraseTokens('Every gesture shapes the art.')).toBeNull();
    expect(phraseTokens('')).toBeNull();
  });

  it('glues a closing mark to the character before it', () => {
    // Regression: keep-all plus overflow-wrap pushed 。 onto a line of its own
    // (都在塑造艺术 / 。). Glued, the mark can only move with its character.
    expect(phraseTokens('都在塑造艺术。')).toEqual([text('都在塑造艺'), keep('术。')]);
    expect(phraseTokens('开放、已验证、可复现。')).toEqual([
      text('开'),
      keep('放、'),
      text('已验'),
      keep('证、'),
      text('可复'),
      keep('现。'),
    ]);
  });

  it('keeps a run of closing marks together and an opening mark with what it opens', () => {
    expect(phraseTokens('他说：「好的。」然后')).toEqual([
      text('他'),
      keep('说：'),
      keep('「好'),
      keep('的。」'),
      text('然后'),
    ]);
  });

  it('keeps authored break points in the text and never glues a mark to one', () => {
    expect(phraseTokens(`都有一部分${PHRASE_BREAK}流向${PHRASE_BREAK}以太坊`)).toEqual([
      text(`都有一部分${PHRASE_BREAK}流向${PHRASE_BREAK}以太坊`),
    ]);
    expect(phraseTokens(`周期${PHRASE_BREAK}。`)).toEqual([text(`周期${PHRASE_BREAK}。`)]);
  });

  it('never glues a mark to a space', () => {
    expect(phraseTokens('将 Cosmic Signature NFT 锚定至协议。')).toEqual([
      text('将 Cosmic Signature NFT 锚定至协'),
      keep('议。'),
    ]);
    expect(phraseTokens('周期 。')).toEqual([text('周期 。')]);
  });

  it('adds and drops no characters', () => {
    const source = `他说：「每个周期的储备，都有一部分${PHRASE_BREAK}流向以太坊。」`;
    expect((phraseTokens(source) ?? []).map((token) => token.text).join('')).toBe(source);
  });
});

describe('Chinese landing headings', () => {
  // Lines turn only at punctuation, spaces and break points (keep-all), so a
  // run between them is one unit: at 320px a display-md heading holds about
  // nine Han characters, and a longer run would break wherever it overflows.
  const MAX_RUN = 9;
  const headings = (copy: LandingText) => [
    copy.hero.headlineLead,
    copy.hero.headlineAccent,
    copy.cycle.heading,
    copy.art.heading,
    copy.tracks.heading,
    copy.publicGoods.heading,
    copy.council.heading,
    copy.verifiability.heading,
    copy.faq.heading,
    copy.closing.heading,
  ];
  const runs = (heading: string) =>
    heading.split(/[\s​]+|(?<=[，、。；：！？])/u).filter((run) => /[㐀-鿿]/.test(run));

  it.each([
    ['zh', landingTextZh],
    ['zh-TW', landingTextZhTw],
    ['zh-HK', landingTextZhHk],
  ])('%s gives every heading break points that fit a phone line', (_locale, copy) => {
    const tooLong = headings(copy)
      .flatMap(runs)
      .filter((run) => Array.from(run).length > MAX_RUN);
    expect(tooLong).toEqual([]);
  });
});
