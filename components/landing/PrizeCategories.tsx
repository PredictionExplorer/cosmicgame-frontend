import { FadeIn } from './FadeIn';

const PRIZES = [
  {
    icon: '\u2605',
    title: 'Main Prize (Last Bidder)',
    description:
      "25% of the round's ETH balance, plus a unique Cosmic Signature NFT and 1,000 CST. Sent directly when you claim.",
    tag: '25% ETH + NFT + CST',
    tagStyle: 'bg-[#FFB800]/15 text-[#FFB800]',
  },
  {
    icon: '\u26A1',
    title: 'Chrono-Warrior',
    description:
      'Held the Endurance Champion crown the longest? Earn 8% of the ETH pool, plus a unique NFT and 1,000 CST. The most lucrative secondary prize.',
    tag: '8% ETH + NFT + CST',
    tagStyle: 'bg-[#FFB800]/15 text-[#FFB800]',
  },
  {
    icon: '\u23F3',
    title: 'Endurance Champion',
    description:
      'Longest single unbroken streak as last bidder in the round. Rewards strategic timing over capital. Unique NFT + 1,000 CST.',
    tag: 'NFT + 1,000 CST',
    tagStyle: 'bg-[#00E5FF]/12 text-[#00E5FF]',
  },
  {
    icon: '\uD83D\uDCB0',
    title: 'Last CST Bidder',
    description:
      'The final player who bid using CST earns a Cosmic Signature NFT and 1,000 CST. A reward for CST ecosystem participation.',
    tag: 'NFT + 1,000 CST',
    tagStyle: 'bg-[#00E5FF]/12 text-[#00E5FF]',
  },
  {
    icon: '\uD83C\uDFB2',
    title: 'ETH Raffles (3 Winners)',
    description:
      '3 random bidders split 4% of the ETH pool (~1.33% each). Every bid you place is an entry. More bids = better odds.',
    tag: '4% ETH Total',
    tagStyle: 'bg-[#FFB800]/15 text-[#FFB800]',
  },
  {
    icon: '\uD83C\uDFA8',
    title: 'NFT Raffle: Bidders (10 Winners)',
    description:
      '10 random bidders each receive a Cosmic Signature NFT + 1,000 CST. Your bids are your raffle tickets.',
    tag: '10x NFT + CST',
    tagStyle: 'bg-[#00E5FF]/12 text-[#00E5FF]',
  },
  {
    icon: '\uD83D\uDEB6',
    title: 'NFT Raffle: RWLK Stakers (10 Winners)',
    description:
      'Up to 10 Random Walk NFT stakers win a Cosmic Signature NFT + 1,000 CST each. Passive raffle from staking.',
    tag: '10x NFT + CST',
    tagStyle: 'bg-[#00E5FF]/12 text-[#00E5FF]',
  },
  {
    icon: '\uD83D\uDCAB',
    title: 'CSN Staking Rewards',
    description:
      "6% of every round's ETH is distributed pro-rata to all staked Cosmic Signature NFTs. Passive yield, every round.",
    tag: '6% ETH Pro-Rata',
    tagStyle: 'bg-[#FFB800]/15 text-[#FFB800]',
  },
  {
    icon: '\uD83C\uDF1F',
    title: 'Per-Bid CST Reward',
    description:
      'Every single bid -- ETH or CST -- instantly mints 100 CST to your wallet. Guaranteed. No raffle. Just bid and earn.',
    tag: '100 CST Per Bid',
    tagStyle: 'bg-[#6C3CE1]/20 text-[#6C3CE1]',
  },
];

export function PrizeCategories() {
  return (
    <section id="prizes" className="relative z-[1] py-24 md:py-32 px-6">
      <FadeIn>
        <div className="text-center max-w-[700px] mx-auto mb-16">
          <div
            className="text-xs tracking-[3px] uppercase text-[#6C3CE1] mb-4"
            style={{ fontFamily: "'JetBrains Mono', monospace" }}
          >
            Prizes
          </div>
          <h2
            className="font-bold mb-4"
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: 'clamp(1.8rem, 4vw, 2.5rem)',
            }}
          >
            Multiple Winners Every Round
          </h2>
          <p className="text-[#F0EDFF]/60 text-lg">
            Over 10 prize categories ensure that participation is rewarded, not just winning the
            last bid. Everyone who plays has a path to earning.
          </p>
        </div>
      </FadeIn>

      <div className="max-w-[1100px] mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {PRIZES.map((prize, i) => (
          <FadeIn key={prize.title} delay={i * 60}>
            <div className="bg-[#2D1B69]/20 border border-[#6C3CE1]/12 rounded-2xl p-7 transition-all duration-300 hover:border-[#6C3CE1]/35 hover:-translate-y-0.5 h-full flex flex-col">
              <div className="text-3xl mb-3">{prize.icon}</div>
              <h3
                className="font-bold text-base mb-2 text-[#F0EDFF]"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                {prize.title}
              </h3>
              <p className="text-[#F0EDFF]/55 text-sm leading-relaxed flex-1">
                {prize.description}
              </p>
              <span
                className={`inline-block mt-3 px-2.5 py-1 rounded-full text-xs font-semibold w-fit ${prize.tagStyle}`}
              >
                {prize.tag}
              </span>
            </div>
          </FadeIn>
        ))}
      </div>
    </section>
  );
}
