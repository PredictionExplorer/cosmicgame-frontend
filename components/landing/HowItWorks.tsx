import { FadeIn } from './FadeIn';

const STEPS = [
  {
    number: '01',
    title: 'Dutch Auction Opens',
    description:
      'Round activates after a 30-minute cooldown. The ETH bid price starts high and declines over ~2 days. Wait for your price, or bid first for strategic advantage.',
    detail: 'Price declines linearly to floor',
  },
  {
    number: '02',
    title: 'Bid & Compete',
    description:
      'First ETH bid starts the countdown timer (~1 day). Each subsequent bid extends it by ~1 hour and costs ~1% more. Bid with CST to burn tokens instead of spending ETH. Every bid earns 100 CST instantly.',
    detail: 'ETH or CST · Optional RWLK 50% discount',
  },
  {
    number: '03',
    title: 'Earn Titles',
    description:
      'Hold "last bidder" status the longest unbroken stretch to become Endurance Champion. Hold the EC crown the longest to become Chrono-Warrior and earn 8% of the round\'s ETH.',
    detail: 'Skill & timing, not just capital',
  },
  {
    number: '04',
    title: 'Win & Stake',
    description:
      "When the timer expires, prizes flow to 10+ categories of winners. Stake your Cosmic Signature NFTs for passive ETH yield. Use CST to vote in the DAO and shape the game's future.",
    detail: '6% ETH to stakers every round',
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="relative z-[1] py-24 md:py-32 px-6">
      <FadeIn>
        <div className="text-center max-w-[700px] mx-auto mb-16">
          <div
            className="text-xs tracking-[3px] uppercase text-[#6C3CE1] mb-4"
            style={{ fontFamily: "'JetBrains Mono', monospace" }}
          >
            How It Works
          </div>
          <h2
            className="font-bold mb-4"
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: 'clamp(1.8rem, 4vw, 2.5rem)',
            }}
          >
            A Strategic Game in Four Phases
          </h2>
          <p className="text-[#F0EDFF]/60 text-lg">
            Each round is a self-contained competition. Time your bids, earn champion titles, and
            claim your share of the prize pool.
          </p>
        </div>
      </FadeIn>

      <div className="max-w-[1100px] mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {STEPS.map((step, i) => (
          <FadeIn key={step.number} delay={i * 100}>
            <div className="group relative bg-[#2D1B69]/25 border border-[#6C3CE1]/15 rounded-2xl p-9 text-center transition-all duration-400 hover:-translate-y-1 hover:border-[#6C3CE1]/40 overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#6C3CE1] to-[#FF3D8A] opacity-0 group-hover:opacity-100 transition-opacity duration-400" />
              <div
                className="font-bold text-4xl mb-3"
                style={{
                  fontFamily: "'Space Grotesk', sans-serif",
                  background: 'linear-gradient(135deg, #6C3CE1, #FF3D8A)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                {step.number}
              </div>
              <h3
                className="font-bold text-lg mb-2.5 text-[#F0EDFF]"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                {step.title}
              </h3>
              <p className="text-[#F0EDFF]/60 text-sm leading-relaxed">{step.description}</p>
              <div
                className="mt-3 text-xs text-[#00E5FF] opacity-70"
                style={{ fontFamily: "'JetBrains Mono', monospace" }}
              >
                {step.detail}
              </div>
            </div>
          </FadeIn>
        ))}
      </div>
    </section>
  );
}
