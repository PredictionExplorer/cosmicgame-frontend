import { readFileSync } from 'node:fs';
import path from 'node:path';

import { findFaqItemByHash, getFaqContent } from '@/content/faq';
import {
  getHowItWorksContent,
  howItWorksContentEn,
  howItWorksContentZh,
} from '@/content/how-it-works';
import { protocolFacts } from '@/content/protocol-facts';

import { routing } from '@/i18n/routing';
import { FUNDING_HELP_HREF } from '@/components/wallet/FundingNotice';

/** Han, hiragana, katakana and the full-width marks around them. */
const CJK = '\\u3000-\\u30ff\\u3400-\\u9fff\\uff00-\\uffef';
const SPACE_BESIDE_CJK = new RegExp(`\\s(?=[${CJK}])|(?<=[${CJK}])\\s`);

describe('how-it-works content', () => {
  it('selects the requested locale', () => {
    expect(getHowItWorksContent('en')).toBe(howItWorksContentEn);
    expect(getHowItWorksContent('zh-Hans')).toBe(howItWorksContentZh);
  });

  it('keeps routing destinations locale-invariant', () => {
    for (const locale of routing.locales) {
      const content = getHowItWorksContent(locale);
      expect(content.metadata.path).toBe(howItWorksContentEn.metadata.path);
      expect(content.hero.primaryCta.href).toBe(howItWorksContentEn.hero.primaryCta.href);
      expect(content.hero.secondaryCta.href).toBe(howItWorksContentEn.hero.secondaryCta.href);
      expect(content.payoff.link.href).toBe(howItWorksContentEn.payoff.link.href);
      expect(content.callToAction.primaryCta.href).toBe(
        howItWorksContentEn.callToAction.primaryCta.href,
      );
      expect(content.callToAction.faqCta.href).toBe(howItWorksContentEn.callToAction.faqCta.href);
      expect(content.callToAction.discordCta.href).toBe(
        howItWorksContentEn.callToAction.discordCta.href,
      );
      expect(content.callToAction.twitterCta.href).toBe(
        howItWorksContentEn.callToAction.twitterCta.href,
      );
    }
  });

  it('sends readers to the gesture form, the live cycle, the FAQ and a public invite', () => {
    const { hero, callToAction } = howItWorksContentEn;
    expect(hero.primaryCta.href).toBe('/#make-gesture');
    // F231: "Learn More" jumped to the section right below it; the second way in is the live cycle.
    expect(hero.secondaryCta).toEqual({ label: 'See the live cycle', href: '/current-cycle' });
    expect(callToAction.primaryCta.href).toBe('/#make-gesture');
    expect(callToAction.faqCta.href).toBe('/faq');
    // A /channels/ deep link opens only for members; the invite works for everyone.
    expect(callToAction.discordCta.href).toMatch(/^https:\/\/discord\.gg\/[A-Za-z0-9]+$/);
  });

  it('shows a real Signature as the payoff, captioned with its cycle', () => {
    for (const locale of routing.locales) {
      const { payoff } = getHowItWorksContent(locale);
      expect(payoff.sample.seed).toMatch(/^[0-9a-f]{64}$/);
      expect(payoff.link.href).toBe(`/detail/${payoff.sample.tokenId}`);
      expect(payoff.caption).toContain(String(payoff.sample.cycle));
      expect(payoff.caption).not.toContain('{cycle}');
    }
  });

  it('provides complete Chinese prose and metadata', () => {
    expect(howItWorksContentZh.metadata.title).toMatch(/[㐀-鿿]/);
    expect(howItWorksContentZh.metadata.description).toMatch(/[㐀-鿿]/);
    expect(howItWorksContentZh.hero.paragraph).toMatch(/[㐀-鿿]/);
    expect(howItWorksContentZh.payoff.body).toMatch(/[㐀-鿿]/);
  });

  it('keeps section structure parity between locales', () => {
    for (const locale of routing.locales) {
      const content = getHowItWorksContent(locale);
      expect(content.rewardBreakdown.items).toHaveLength(4);
      expect(content.gameCycle.phases).toHaveLength(6);
      expect(content.stepByStep.steps.map((step) => step.highlights.length)).toEqual(
        howItWorksContentEn.stepByStep.steps.map((step) => step.highlights.length),
      );
      expect(content.costs.items).toHaveLength(3);
      expect(content.proTips.tips).toHaveLength(3);
    }
  });

  it('shows every rule in the open: no hover-only copy behind a heading (D073)', () => {
    for (const locale of routing.locales) {
      const content = getHowItWorksContent(locale);
      const cards = [
        ...content.rewardBreakdown.items,
        ...content.gameCycle.phases,
        ...content.stepByStep.steps,
      ];
      for (const card of cards) expect(card).not.toHaveProperty('tooltip');
    }
  });

  it('says what a gesture costs and links the risk disclosures in every locale (D072)', () => {
    for (const locale of routing.locales) {
      const { costs } = getHowItWorksContent(locale);
      expect(costs.riskLink.href).toBe('/risk-disclosures');
      expect(costs.items[1].body).toContain(`${protocolFacts.ethGestureCostStepUpPercent}%`);
      expect(costs.note.trim()).not.toBe('');
    }
    const [notReturned, stepsUp, gas] = howItWorksContentEn.costs.items;
    expect(notReturned.body).toMatch(/joins the Cycle Reserve, and CST paid is burned/);
    expect(stepsUp.body).toContain(
      `raises the next ETH Gesture Cost by ${protocolFacts.ethGestureCostStepUpPercent}%`,
    );
    expect(gas.body).toMatch(/network fee in ETH/);
  });

  it('points readers without ETH on Arbitrum at the FAQ bridging answer (D087)', () => {
    for (const locale of routing.locales) {
      const { funding } = getHowItWorksContent(locale).stepByStep;
      // The same anchor the gesture form's FundingNotice links.
      expect(funding.link.href).toBe(FUNDING_HELP_HREF);
      expect(funding.text.trim()).not.toBe('');
      expect(funding.link.label.trim()).not.toBe('');
      const hash = funding.link.href.slice(funding.link.href.indexOf('#'));
      expect(findFaqItemByHash(getFaqContent(locale), hash)).not.toBeNull();
    }
  });

  it('never quotes the wallet button, whose label differs by width (D081)', () => {
    for (const locale of routing.locales) {
      const wallet = JSON.parse(
        readFileSync(path.join(process.cwd(), 'messages', locale, 'wallet.json'), 'utf8'),
      ) as { connect: { buttonShort: string } };
      // "Connect Wallet" on desktop, "Connect" on phones: any quoted label
      // naming the button is wrong on one of them.
      const word = wallet.connect.buttonShort.toLowerCase();
      const copy = JSON.stringify(getHowItWorksContent(locale));
      for (const [open, close] of [
        ['“', '”'],
        ['‘', '’'],
        ['「', '」'],
        ['«', '»'],
      ]) {
        for (const [, quoted = ''] of copy.matchAll(
          new RegExp(`${open}([^${close}]*)${close}`, 'g'),
        )) {
          expect(quoted.toLowerCase()).not.toContain(word);
        }
      }
    }
  });

  it('keeps the tips to plain facts, not strategy (D074)', () => {
    const { proTips } = howItWorksContentEn;
    expect(proTips.heading).toBe('Good to know');
    const copy = JSON.stringify(proTips);
    expect(copy).not.toMatch(/strateg|maximi[sz]|wisely|positions you/i);
    // The lifecycle states the Stellar Selection split; the tips do not repeat it.
    expect(copy).not.toContain(
      `${protocolFacts.stellarSelectionEthPercentage}% of the Cycle Reserve`,
    );
  });

  it('names the anchored-NFT track by its glossary name only (D074)', () => {
    const copy = JSON.stringify(howItWorksContentEn);
    expect(copy).toContain('Anchored-NFT Stellar Selection');
    expect(copy).not.toMatch(/anchor-holders/);
  });

  it('writes English with typographic quotes and dashes (D074)', () => {
    const strings = (value: unknown): string[] =>
      typeof value === 'string'
        ? [value]
        : value && typeof value === 'object'
          ? Object.values(value).flatMap(strings)
          : [];
    for (const text of strings(howItWorksContentEn)) {
      expect(text).not.toMatch(/"/);
      expect(text).not.toMatch(/\w'\w/);
      expect(text).not.toMatch(/ - /);
    }
  });

  it('states the time-extension rule once, in the cycle, not again in the steps (F231)', () => {
    const steps = howItWorksContentEn.stepByStep.steps.flatMap((step) => step.highlights).join(' ');
    expect(steps).not.toMatch(/time increment|extends the Cycle Finalization Time/);
    expect(howItWorksContentEn.gameCycle.phases[1].description).toContain('time increment');
  });

  it('writes every H1 as one plain string, with no space beside Japanese text (F152)', () => {
    for (const locale of routing.locales) {
      expect(getHowItWorksContent(locale).hero.heading).not.toMatch(/<\/?accent>/);
    }
    // Regression: the halves were joined with a literal JSX space, giving "Cosmic Signatureの 仕組み".
    const ja = getHowItWorksContent('ja').hero.heading;
    expect(ja).toBe('Cosmic Signatureの仕組み');
    expect(ja).not.toMatch(SPACE_BESIDE_CJK);
  });
});

describe('how-it-works protocol-fact interpolation', () => {
  it('derives the calibration-window figures from protocolFacts', () => {
    expect(howItWorksContentEn.gameCycle.phases[0].description).toContain(
      `${protocolFacts.initialCstCalibrationWindowHours}-hour`,
    );
    expect(howItWorksContentEn.gameCycle.phases[1].description).toContain(
      `shortens the CST Calibration Window by about ${protocolFacts.cstCalibrationWindowDecreasePercentPerEthGesture}%`,
    );
    expect(howItWorksContentEn.gameCycle.phases[1].description).toContain(
      `lengthens it by about ${protocolFacts.cstCalibrationWindowIncreasePercentPerCstGesture}%`,
    );
    expect(howItWorksContentEn.proTips.tips[0].body).toContain(
      `at least ${protocolFacts.cstCalibrationCeilingMinCst} CST`,
    );
  });

  it('derives the allocation percentages and CST amounts from protocolFacts', () => {
    expect(howItWorksContentEn.rewardBreakdown.items[1].description).toContain(
      `${protocolFacts.stellarSelectionEthPercentage}% of the Cycle Reserve`,
    );
    expect(howItWorksContentEn.rewardBreakdown.items[3].description).toContain(
      `${protocolFacts.mainEthPercentage}% of the Cycle Reserve in ETH, ${protocolFacts.specialAllocationCst.toLocaleString()} CST`,
    );
    expect(howItWorksContentEn.gameCycle.phases[3].description).toContain(
      `${protocolFacts.mainEthPercentage}% of the Cycle Reserve`,
    );
    expect(howItWorksContentEn.gameCycle.phases[4].description).toContain(
      `${protocolFacts.specialAllocationCst.toLocaleString()} CST`,
    );
    expect(howItWorksContentEn.gameCycle.phases[5].description).toContain(
      `${protocolFacts.compoundingReservePercentage}% of the Cycle Reserve`,
    );
  });

  it('states the exclusive finalization window in the open, from protocolFacts (D073)', () => {
    const expiry = howItWorksContentEn.gameCycle.phases[2].description;
    expect(expiry).toContain(
      `has ${protocolFacts.finalGestureExclusivityHours} hours to finalize the cycle`,
    );
    expect(expiry).toMatch(
      /anyone may finalize, and whoever does receives the Signature Allocation/,
    );
    expect(howItWorksContentEn.gameCycle.legend.exclusiveWindow).toContain(
      `${protocolFacts.finalGestureExclusivityHours}-hour window`,
    );
    expect(howItWorksContentEn.stepByStep.steps[2].highlights[0]).toContain(
      `${protocolFacts.randomWalkDiscountPercentage}% ETH Gesture Cost reduction, once per NFT`,
    );
  });

  it('explains Participation CST without the contract identifiers', () => {
    const { description } = howItWorksContentEn.rewardBreakdown.items[0];
    expect(description).toMatch(/square root of the time since the previous gesture/);
    expect(description).not.toContain('bidCstRewardAmountMultiplier');
  });

  it('interpolates the same protocolFacts into the Chinese copy', () => {
    expect(howItWorksContentZh.gameCycle.phases[3].description).toContain(
      `${protocolFacts.mainEthPercentage}%`,
    );
    expect(howItWorksContentZh.gameCycle.phases[0].description).toContain(
      `${protocolFacts.initialCstCalibrationWindowHours} 小时`,
    );
    expect(howItWorksContentZh.gameCycle.phases[1].description).toContain(
      `${protocolFacts.cstCalibrationWindowDecreasePercentPerEthGesture}%`,
    );
    expect(howItWorksContentZh.gameCycle.phases[2].description).toContain(
      `${protocolFacts.finalGestureExclusivityHours} 小时`,
    );
    expect(howItWorksContentZh.costs.items[1].body).toContain(
      `${protocolFacts.ethGestureCostStepUpPercent}%`,
    );
    expect(howItWorksContentZh.rewardBreakdown.items[3].description).toContain(
      `${protocolFacts.specialAllocationCst.toLocaleString()} CST`,
    );
    expect(howItWorksContentZh.stepByStep.steps[2].highlights[0]).toContain(
      `${protocolFacts.randomWalkDiscountPercentage}%`,
    );
  });
});
