import {
  getHowItWorksContent,
  howItWorksContentEn,
  howItWorksContentZh,
} from '@/content/how-it-works';
import { protocolFacts } from '@/content/protocol-facts';

import { routing } from '@/i18n/routing';

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
      expect(content.proTips.tips).toHaveLength(6);
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
      `about ${protocolFacts.cstCalibrationWindowDecreasePercentPerEthGesture}% down or ${protocolFacts.cstCalibrationWindowIncreasePercentPerCstGesture}% up`,
    );
    expect(howItWorksContentEn.proTips.tips[5].body).toContain(
      `by about ${protocolFacts.cstCalibrationWindowIncreasePercentPerCstGesture}%`,
    );
  });

  it('derives the allocation percentages and CST amounts from protocolFacts', () => {
    expect(howItWorksContentEn.rewardBreakdown.items[1].tooltip).toContain(
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
  });

  it('derives the exclusivity window and Random Walk reduction from protocolFacts', () => {
    expect(howItWorksContentEn.gameCycle.phases[2].tooltip).toContain(
      `${protocolFacts.finalGestureExclusivityHours}-hour exclusive finalization window`,
    );
    expect(howItWorksContentEn.stepByStep.steps[2].highlights[0]).toContain(
      `${protocolFacts.randomWalkDiscountPercentage}% ETH Gesture Cost reduction`,
    );
    expect(howItWorksContentEn.stepByStep.steps[2].tooltip).toContain(
      `${protocolFacts.randomWalkDiscountPercentage}% ETH Gesture Cost reduction`,
    );
  });

  it('quotes the dynamic Participation CST formula from protocolFacts', () => {
    expect(howItWorksContentEn.rewardBreakdown.items[0].tooltip).toContain(
      protocolFacts.dynamicCstRewardFormula,
    );
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
    expect(howItWorksContentZh.gameCycle.phases[2].tooltip).toContain(
      `${protocolFacts.finalGestureExclusivityHours} 小时`,
    );
    expect(howItWorksContentZh.rewardBreakdown.items[0].tooltip).toContain(
      protocolFacts.dynamicCstRewardFormula,
    );
    expect(howItWorksContentZh.rewardBreakdown.items[3].description).toContain(
      `${protocolFacts.specialAllocationCst.toLocaleString()} CST`,
    );
    expect(howItWorksContentZh.stepByStep.steps[2].highlights[0]).toContain(
      `${protocolFacts.randomWalkDiscountPercentage}%`,
    );
  });
});
