import { FadeIn } from './FadeIn';

const ROWS = [
  {
    category: 'ETH Revenue',
    typical: 'Goes to creators + royalties',
    cosmic: '100% to players, stakers, and public goods',
  },
  {
    category: 'Holder Value',
    typical: 'Hope for floor price increase',
    cosmic: 'ETH staking yield + raffles + governance power',
  },
  {
    category: 'Prize Pool',
    typical: 'None — static collection',
    cosmic: '50% rolls forward, growing every round',
  },
  {
    category: 'Public Goods',
    typical: 'Optional pledge, often unfulfilled',
    cosmic: '7% every round, enforced by smart contract',
  },
  {
    category: 'Governance',
    typical: 'Discord polls at best',
    cosmic: 'On-chain DAO with real voting power',
  },
  {
    category: 'Code',
    typical: 'Closed source or unaudited',
    cosmic: 'CC0 open source, formally verified (Certora)',
  },
];

export function WhyDifferent() {
  return (
    <section
      id="why-different"
      className="relative z-[1] py-24 md:py-32 px-6"
      style={{
        background:
          'linear-gradient(180deg, transparent 0%, rgba(108, 60, 225, 0.03) 50%, transparent 100%)',
      }}
    >
      <FadeIn>
        <div className="text-center max-w-[700px] mx-auto mb-16">
          <div
            className="text-xs tracking-[3px] uppercase text-[#6C3CE1] mb-4"
            style={{ fontFamily: "'JetBrains Mono', monospace" }}
          >
            Why It&apos;s Different
          </div>
          <h2
            className="font-bold mb-4"
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: 'clamp(1.8rem, 4vw, 2.5rem)',
            }}
          >
            Value Flows to You, Not Creators
          </h2>
          <p className="text-[#F0EDFF]/60 text-lg">
            Most NFT projects extract value from holders. Cosmic Signature was built so every ETH
            wei goes to players, stakers, or public goods.
          </p>
        </div>
      </FadeIn>

      <FadeIn>
        <div className="max-w-[900px] mx-auto space-y-4">
          {/* Header - desktop only */}
          <div
            className="hidden md:grid grid-cols-3 gap-0 text-sm font-bold"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            <div className="px-5 pb-3" />
            <div className="px-5 pb-3 text-[#FF4757]/60">Typical NFT Project</div>
            <div className="px-5 pb-3 text-[#00D68F]">Cosmic Signature</div>
          </div>

          {ROWS.map((row) => (
            <div
              key={row.category}
              className="grid grid-cols-1 md:grid-cols-3 gap-0 rounded-xl overflow-hidden border border-[#6C3CE1]/12"
            >
              <div className="px-5 py-4 bg-[#2D1B69]/15 text-[#F0EDFF]/50 text-sm font-medium">
                {row.category}
              </div>
              <div className="px-5 py-4 bg-[#2D1B69]/15 text-sm text-[#FF4757]/70">
                <span className="md:hidden text-[10px] uppercase tracking-wider text-[#F0EDFF]/40 block mb-1">
                  Typical NFT
                </span>
                {row.typical}
              </div>
              <div className="px-5 py-4 bg-[#2D1B69]/15 text-sm text-[#00D68F]">
                <span className="md:hidden text-[10px] uppercase tracking-wider text-[#F0EDFF]/40 block mb-1">
                  Cosmic Signature
                </span>
                {row.cosmic}
              </div>
            </div>
          ))}
        </div>
      </FadeIn>
    </section>
  );
}
