'use client';

import { useState, useEffect, type FormEvent } from 'react';

import { FadeIn } from './FadeIn';

const LAUNCH_DATE = new Date('2026-05-08T01:00:00Z'); // May 7, 2026 at 9:00 PM ET

function useCountdown(target: Date) {
  const [time, setTime] = useState({ d: 0, h: 0, m: 0, s: 0 });

  useEffect(() => {
    const tick = () => {
      const diff = target.getTime() - Date.now();
      if (diff <= 0) {
        setTime({ d: 0, h: 0, m: 0, s: 0 });
        return;
      }
      setTime({
        d: Math.floor(diff / 86400000),
        h: Math.floor((diff % 86400000) / 3600000),
        m: Math.floor((diff % 3600000) / 60000),
        s: Math.floor((diff % 60000) / 1000),
      });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [target]);

  return time;
}

export function CTASection() {
  const countdown = useCountdown(LAUNCH_DATE);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    const form = e.target as HTMLFormElement;
    form.reset();
    setTimeout(() => setSubmitted(false), 3000);
  };

  const units = [
    { key: 'd', label: 'Days', value: countdown.d },
    { key: 'h', label: 'Hours', value: countdown.h },
    { key: 'm', label: 'Minutes', value: countdown.m },
    { key: 's', label: 'Seconds', value: countdown.s },
  ] as const;

  return (
    <section id="join" className="relative z-[1] text-center px-6 py-24 md:pt-24 md:pb-40">
      <FadeIn>
        <div className="mb-12">
          <div
            className="text-sm tracking-[2px] uppercase text-[#FF3D8A] mb-6"
            style={{ fontFamily: "'JetBrains Mono', monospace" }}
          >
            Genesis Round Countdown
          </div>
          <div className="flex justify-center gap-4 flex-wrap">
            {units.map((u) => (
              <div
                key={u.key}
                className="bg-[#2D1B69]/30 border border-[#FF3D8A]/20 rounded-2xl px-5 py-6 min-w-[100px]"
              >
                <div
                  className="font-bold text-4xl text-[#FF3D8A]"
                  style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                >
                  {String(u.value).padStart(2, '0')}
                </div>
                <div className="text-xs text-[#F0EDFF]/50 mt-1">{u.label}</div>
              </div>
            ))}
          </div>
          <p
            className="mt-5 text-sm text-[#F0EDFF]/45"
            style={{ fontFamily: "'JetBrains Mono', monospace" }}
          >
            May 7, 2026 &middot; 9:00 PM ET
          </p>
        </div>
      </FadeIn>

      <FadeIn delay={200}>
        <h2
          className="font-bold mb-4"
          style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: 'clamp(1.8rem, 4vw, 2.5rem)',
          }}
        >
          Be There for the Genesis Round
        </h2>
        <p className="text-[#F0EDFF]/60 text-lg mb-10 max-w-[600px] mx-auto">
          The Genesis Round launches{' '}
          <strong className="text-[#F0EDFF]">May 7, 2026 at 9:00 PM ET</strong> on Arbitrum. Join
          the community to discuss strategy and be ready when it goes live.
        </p>

        <form
          onSubmit={handleSubmit}
          className="flex gap-3 justify-center flex-wrap max-w-[520px] mx-auto"
        >
          <input
            type="email"
            placeholder="your@email.com"
            required
            aria-label="Email address"
            className="flex-1 min-w-[240px] px-6 py-4 rounded-xl border border-[#6C3CE1]/30 bg-[#2D1B69]/30 text-[#F0EDFF] text-base outline-none transition-colors focus:border-[#6C3CE1] placeholder:text-[#F0EDFF]/35"
          />
          <button
            type="submit"
            className="px-8 py-4 rounded-xl font-semibold text-base text-white whitespace-nowrap transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-[#6C3CE1]/50"
            style={{
              background: submitted ? '#00D68F' : 'linear-gradient(135deg, #6C3CE1, #FF3D8A)',
            }}
          >
            {submitted ? 'Subscribed!' : 'Notify Me'}
          </button>
        </form>

        <a
          href="https://discord.gg/cosmicsignature"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 mt-4 px-10 py-4 rounded-xl font-semibold text-base text-[#F0EDFF] border border-[#6C3CE1]/40 transition-all duration-300 hover:bg-[#6C3CE1]/10 hover:border-[#6C3CE1]"
        >
          <svg
            width="20"
            height="16"
            viewBox="0 0 71 55"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M60.1 4.9A58.5 58.5 0 0045.4.2a.2.2 0 00-.2.1 41 41 0 00-1.8 3.7 54 54 0 00-16.2 0A37.4 37.4 0 0025.4.3a.2.2 0 00-.2-.1A58.4 58.4 0 0010.5 4.9a.2.2 0 00-.1.1C1.5 18.7-.9 32.2.3 45.5v.2a58.9 58.9 0 0017.7 9a.2.2 0 00.3-.1 42.1 42.1 0 003.6-5.9.2.2 0 00-.1-.3 38.8 38.8 0 01-5.5-2.7.2.2 0 01 0-.4l1.1-.9a.2.2 0 01.2 0 42 42 0 0035.6 0 .2.2 0 01.2 0l1.1.9a.2.2 0 010 .4 36.4 36.4 0 01-5.5 2.7.2.2 0 00-.1.3 47.3 47.3 0 003.6 5.9.2.2 0 00.3.1 58.7 58.7 0 0017.7-9 .2.2 0 00.1-.2c1.4-15-2.3-28.4-9.8-40.1a.2.2 0 00-.1-.1zM23.7 37.3c-3.5 0-6.3-3.2-6.3-7s2.8-7 6.3-7 6.4 3.2 6.3 7-2.8 7-6.3 7zm23.2 0c-3.5 0-6.3-3.2-6.3-7s2.8-7 6.3-7 6.4 3.2 6.3 7-2.8 7-6.3 7z"
              fill="currentColor"
            />
          </svg>
          Join the Discord
        </a>

        <p className="mt-4 text-sm text-[#F0EDFF]/35">No spam. Unsubscribe anytime.</p>
      </FadeIn>
    </section>
  );
}
