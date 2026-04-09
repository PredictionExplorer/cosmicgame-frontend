'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Menu, X } from 'lucide-react';

const NAV_LINKS = [
  { label: 'How It Works', href: '#how-it-works' },
  { label: 'Where ETH Goes', href: '#eth-flow' },
  { label: 'Prizes', href: '#prizes' },
  { label: 'Why Different', href: '#why-different' },
  { label: 'Public Goods', href: '#public-goods' },
];

export function LandingNav() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 inset-x-0 z-50 px-6 md:px-10 py-4 md:py-5 flex justify-between items-center transition-all duration-300 ${
        scrolled
          ? 'bg-[#0D0521]/90 backdrop-blur-xl border-b border-[#6C3CE1]/15 shadow-lg shadow-black/20'
          : 'bg-transparent'
      }`}
    >
      <a href="#" aria-label="Cosmic Signature">
        <Image
          src="/images/logo2.svg"
          width={48}
          height={48}
          alt="Cosmic Signature"
          loading="eager"
          className="h-10 w-auto max-h-10 object-contain"
        />
      </a>

      <ul className="hidden lg:flex gap-8 list-none">
        {NAV_LINKS.map((link) => (
          <li key={link.href}>
            <a
              href={link.href}
              className="text-[#F0EDFF]/70 text-sm font-medium hover:text-[#F0EDFF] transition-colors duration-300"
            >
              {link.label}
            </a>
          </li>
        ))}
      </ul>

      <div className="flex items-center gap-3">
        <a
          href="https://app.cosmicsignature.com"
          className="hidden sm:inline-flex px-6 py-2.5 rounded-full font-semibold text-sm text-white transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-[#6C3CE1]/40"
          style={{ background: 'linear-gradient(135deg, #6C3CE1, #FF3D8A)' }}
        >
          Launch App
        </a>

        <button
          className="lg:hidden p-2 text-[#F0EDFF]/70 hover:text-[#F0EDFF]"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle navigation"
        >
          {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {mobileOpen && (
        <div className="absolute top-full left-0 right-0 bg-[#0D0521]/95 backdrop-blur-xl border-b border-[#6C3CE1]/15 lg:hidden">
          <div className="flex flex-col p-6 gap-4">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-[#F0EDFF]/70 text-base font-medium hover:text-[#F0EDFF] transition-colors py-2"
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </a>
            ))}
            <a
              href="https://app.cosmicsignature.com"
              className="mt-2 px-6 py-3 rounded-xl font-semibold text-sm text-white text-center"
              style={{ background: 'linear-gradient(135deg, #6C3CE1, #FF3D8A)' }}
            >
              Launch App
            </a>
          </div>
        </div>
      )}
    </nav>
  );
}
