import { FadeIn } from './FadeIn';

export function PublicGoods() {
  return (
    <section
      id="public-goods"
      className="relative z-[1] py-24 md:py-32 px-6"
      style={{
        background:
          'linear-gradient(180deg, transparent 0%, rgba(0, 214, 143, 0.04) 50%, transparent 100%)',
      }}
    >
      <FadeIn>
        <div className="max-w-[800px] mx-auto text-center bg-[#00D68F]/[0.06] border border-[#00D68F]/15 rounded-3xl p-12 md:p-16">
          <div
            className="font-bold text-7xl text-[#00D68F] mb-2"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            7%
          </div>
          <h2
            className="font-bold mb-4"
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: 'clamp(1.6rem, 3.5vw, 2.2rem)',
            }}
          >
            Every Round Funds Ethereum&apos;s Future
          </h2>
          <p className="text-[#F0EDFF]/60 text-lg max-w-[560px] mx-auto leading-relaxed">
            Every time a round ends, 7% of the game&apos;s ETH balance is automatically sent to{' '}
            <a
              href="https://www.protocolguild.org/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#00D68F] underline hover:text-[#00D68F]/80 transition-colors"
            >
              Protocol Guild
            </a>{' '}
            — the collective funding mechanism for 170+ Ethereum core protocol contributors. This is
            not a marketing pledge. It is enforced by smart contract code, executed every round,
            with no manual intervention.
          </p>
          <p className="mt-6 text-sm text-[#F0EDFF]/40">
            Enforced on-chain via{' '}
            <code
              className="bg-[#00D68F]/10 px-1.5 py-0.5 rounded text-[#00D68F]/70"
              style={{ fontFamily: "'JetBrains Mono', monospace" }}
            >
              charityEthDonationAmountPercentage = 7
            </code>{' '}
            &middot; Recipient configurable via DAO governance
          </p>
        </div>
      </FadeIn>
    </section>
  );
}
