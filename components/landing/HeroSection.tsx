'use client';

import { useEffect, useState } from 'react';

export function HeroSection() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <section className="relative z-[1] min-h-screen flex items-center justify-center text-center px-6 pt-20 md:pt-28 pb-20">
      <div
        className={`max-w-[800px] transition-all duration-1000 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
      >
        <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-[#6C3CE1]/15 border border-[#6C3CE1]/30 text-sm text-[#00E5FF] font-medium mb-8">
          <span className="w-2 h-2 rounded-full bg-[#00D68F] animate-[pulse-dot_2s_ease-in-out_infinite]" />
          Built on Arbitrum &middot; CC0 Open Source &middot; Formally Verified
        </div>

        <h1
          className="font-bold leading-[1.1] mb-6"
          style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: 'clamp(2.5rem, 6vw, 4rem)',
          }}
        >
          The Last Bidder Wins.
          <br />
          <span
            style={{
              background: 'linear-gradient(135deg, #6C3CE1, #FF3D8A)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            But So Does Everyone Else.
          </span>
        </h1>

        <p className="text-lg text-[#F0EDFF]/70 max-w-[640px] mx-auto mb-12 leading-relaxed">
          Cosmic Signature is the strategic on-chain game where every round creates 10+ winners.
          Zero ETH goes to any team wallet. 7% funds Ethereum core development. 50% rolls into a
          growing prize pool. Bid with ETH or CST. Earn NFTs. Stake for yield. Shape the game
          through DAO governance.
        </p>

        <div className="flex gap-4 justify-center flex-wrap">
          <a
            href="https://app.cosmicsignature.com"
            className="px-10 py-4 rounded-xl font-semibold text-lg text-white transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-[#6C3CE1]/50"
            style={{ background: 'linear-gradient(135deg, #6C3CE1, #FF3D8A)' }}
          >
            Launch App
          </a>
          <a
            href="https://discord.gg/cosmicsignature"
            target="_blank"
            rel="noopener noreferrer"
            className="px-10 py-4 rounded-xl font-semibold text-lg text-[#F0EDFF] border border-[#6C3CE1]/40 bg-transparent transition-all duration-300 hover:bg-[#6C3CE1]/10 hover:border-[#6C3CE1]"
          >
            Join Discord
          </a>
        </div>
      </div>
    </section>
  );
}
