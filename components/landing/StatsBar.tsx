'use client';

import { useRef, useEffect, useState } from 'react';

const STATS = [
  { value: '10+', label: 'Prize Categories Per Round', color: '#FFB800' },
  { value: '~50%', label: 'ETH Rolls to Next Round', color: '#00E5FF' },
  { value: '0%', label: 'ETH to Team / Creators', color: '#FF3D8A' },
  { value: '7%', label: 'Funds Ethereum Development', color: '#00D68F' },
  { value: '100', label: 'CST Earned Per Bid', color: '#6C3CE1' },
];

export function StatsBar() {
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
      { threshold: 0.3 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`relative z-[1] px-6 transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
    >
      <div className="max-w-[1100px] mx-auto grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-px bg-[#6C3CE1]/15 rounded-2xl overflow-hidden border border-[#6C3CE1]/20">
        {STATS.map((stat) => (
          <div key={stat.label} className="px-4 py-8 text-center bg-[#0D0521]/80 backdrop-blur-sm">
            <div
              className="font-bold text-3xl mb-1"
              style={{ fontFamily: "'Space Grotesk', sans-serif", color: stat.color }}
            >
              {stat.value}
            </div>
            <div className="text-xs text-[#F0EDFF]/50 font-medium">{stat.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
