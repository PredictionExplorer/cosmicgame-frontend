import { FadeIn } from './FadeIn';

const FEATURES = [
  {
    icon: '\uD83D\uDCC8',
    title: 'Dual Dutch Auctions',
    description:
      'ETH bids start with a ~2-day Dutch auction that declines to a floor, then switch to ~1% incremental steps after the first bid. CST bids follow their own ~12-hour Dutch auction that resets after each bid, with prices burned from supply. Timing is everything.',
  },
  {
    icon: '\uD83C\uDFA8',
    title: 'Generative NFTs with On-Chain Seeds',
    description:
      'Every Cosmic Signature NFT carries a unique seed stored permanently on-chain, generated from block data and Arbitrum precompiles. The art is procedurally generated from this seed. You can name your NFTs (up to 32 characters). Stake them for 6% ETH yield per round.',
  },
  {
    icon: '\uD83C\uDFE0',
    title: 'DAO Governance',
    description:
      "CST is your voting power through an on-chain OpenZeppelin Governor. Propose changes with just 100 CST (one bid's reward). Vote on prize percentages, public goods recipient, timer settings, and more.",
  },
  {
    icon: '\uD83D\uDD17',
    title: 'Random Walk NFT Utility',
    description:
      'Hold a Random Walk NFT? Attach it to any ETH bid for a 50% discount (one-time per NFT, you keep the NFT). Or stake it for eligibility in the per-round CSN + CST raffle (up to 10 winners).',
  },
  {
    icon: '\uD83D\uDCAA',
    title: 'Self-Growing Prize Pool',
    description:
      "50% of the game's ETH stays in the contract after each round. As new bids add ETH and only half leaves, the pool compounds. Early rounds seed later ones. The longer the game runs, the bigger the prizes become.",
  },
  {
    icon: '\uD83D\uDD12',
    title: 'Formally Verified & CC0',
    description:
      "Smart contracts are verified with Certora formal verification (mathematical proof of correctness), analyzed with Slither, and built on OpenZeppelin's battle-tested foundations. Everything is CC0 licensed — fully open source, public domain.",
  },
];

export function GameFeatures() {
  return (
    <section id="features" className="relative z-[1] py-24 md:py-32 px-6">
      <FadeIn>
        <div className="text-center max-w-[700px] mx-auto mb-16">
          <div
            className="text-xs tracking-[3px] uppercase text-[#6C3CE1] mb-4"
            style={{ fontFamily: "'JetBrains Mono', monospace" }}
          >
            Game Mechanics
          </div>
          <h2
            className="font-bold mb-4"
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: 'clamp(1.8rem, 4vw, 2.5rem)',
            }}
          >
            Built for Strategic Depth
          </h2>
          <p className="text-[#F0EDFF]/60 text-lg">
            Every mechanic creates meaningful decisions. Timing, economics, and game theory drive
            outcomes.
          </p>
        </div>
      </FadeIn>

      <div className="max-w-[1100px] mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
        {FEATURES.map((feature, i) => (
          <FadeIn key={feature.title} delay={i * 80}>
            <div className="bg-[#2D1B69]/20 border border-[#6C3CE1]/12 rounded-2xl p-9 transition-all duration-300 hover:border-[#6C3CE1]/30 h-full">
              <h3
                className="font-bold text-lg mb-3 flex items-center gap-2.5 text-[#F0EDFF]"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                <span className="text-2xl">{feature.icon}</span>
                {feature.title}
              </h3>
              <p className="text-[#F0EDFF]/60 text-[0.92rem] leading-relaxed">
                {feature.description}
              </p>
            </div>
          </FadeIn>
        ))}
      </div>
    </section>
  );
}
