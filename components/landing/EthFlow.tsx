'use client';

import { useRef, useEffect, useState } from 'react';

const FLOWS = [
  {
    label: 'Main Prize (Last Bidder)',
    pct: '25%',
    width: 50,
    color: 'linear-gradient(135deg, #FFB800, #FF3D8A)',
    textColor: '#FFB800',
  },
  {
    label: 'Chrono-Warrior (Longest EC Reign)',
    pct: '8%',
    width: 16,
    color: '#FF3D8A',
    textColor: '#FF3D8A',
  },
  {
    label: 'Protocol Guild (Ethereum Development)',
    pct: '7%',
    width: 14,
    color: 'linear-gradient(135deg, #00D68F, #00E5FF)',
    textColor: '#00D68F',
  },
  {
    label: 'CSN NFT Stakers (Passive Yield)',
    pct: '6%',
    width: 12,
    color: '#00E5FF',
    textColor: '#00E5FF',
  },
  {
    label: 'ETH Raffle (3 Random Bidders)',
    pct: '4%',
    width: 8,
    color: '#6C3CE1',
    textColor: '#6C3CE1',
  },
  {
    label: 'Rolls to Next Round (Growing Pool)',
    pct: '~50%',
    width: 100,
    color: 'linear-gradient(90deg, rgba(108,60,225,0.4), rgba(108,60,225,0.15))',
    textColor: 'rgba(240,237,255,0.7)',
  },
];

export function EthFlow() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setVisible(true);
          obs.disconnect();
        }
      },
      { threshold: 0.2 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <section id="eth-flow" className="relative z-[1] py-24 md:py-32 px-6">
      <div className="text-center max-w-[700px] mx-auto mb-16">
        <div
          className="text-xs tracking-[3px] uppercase text-[#6C3CE1] mb-4"
          style={{ fontFamily: "'JetBrains Mono', monospace" }}
        >
          Value Flow
        </div>
        <h2
          className="font-bold mb-4"
          style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: 'clamp(1.8rem, 4vw, 2.5rem)',
          }}
        >
          Where Every ETH Goes
        </h2>
        <p className="text-[#F0EDFF]/60 text-lg">
          When a round ends, the game&apos;s entire ETH balance is distributed by percentage. Zero
          goes to any team wallet. Here&apos;s the exact breakdown.
        </p>
      </div>

      <div ref={ref} className="max-w-[800px] mx-auto space-y-4">
        {FLOWS.map((flow, i) => (
          <div key={flow.label}>
            <div className="flex justify-between items-baseline mb-1.5">
              <span className="text-sm font-medium text-[#F0EDFF]">{flow.label}</span>
              <span
                className="text-sm"
                style={{ fontFamily: "'JetBrains Mono', monospace", color: flow.textColor }}
              >
                {flow.pct}
              </span>
            </div>
            <div className="h-7 rounded-lg bg-[#2D1B69]/30 overflow-hidden">
              <div
                className="h-full rounded-lg transition-all duration-1000 ease-out"
                style={{
                  width: visible ? `${flow.width}%` : '0%',
                  background: flow.color,
                  transitionDelay: `${i * 100}ms`,
                }}
              />
            </div>
          </div>
        ))}
        <p className="text-center mt-6 text-[#F0EDFF]/45 text-sm">
          Plus: CST tokens and Cosmic Signature NFTs minted directly to winners&apos; wallets. No
          withdrawal needed for token prizes.
        </p>
      </div>
    </section>
  );
}
