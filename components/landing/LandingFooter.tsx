import Image from 'next/image';

const FOOTER_LINKS = [
  { label: 'GitHub', href: 'https://github.com/cosmic-signature' },
  { label: 'Twitter / X', href: 'https://twitter.com/CosmicSignatureNFT' },
  { label: 'Discord', href: 'https://discord.gg/cosmicsignature' },
  { label: 'Docs', href: 'https://app.cosmicsignature.com/how-to-play' },
];

export function LandingFooter() {
  return (
    <footer className="relative z-[1] px-6 py-12 border-t border-[#6C3CE1]/10">
      <div className="max-w-[1100px] mx-auto flex flex-col sm:flex-row justify-between items-center gap-6">
        <Image
          src="/images/logo2.svg"
          width={180}
          height={36}
          alt="Cosmic Signature"
          loading="lazy"
          className="h-8 w-auto max-w-[140px] object-contain"
        />

        <ul className="flex flex-wrap justify-center gap-6 list-none">
          {FOOTER_LINKS.map((link) => (
            <li key={link.label}>
              <a
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#F0EDFF]/50 text-sm hover:text-[#F0EDFF] transition-colors duration-300"
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>

        <div className="text-[#F0EDFF]/30 text-sm">CC0 1.0 Universal &middot; Cosmic Signature</div>
      </div>
    </footer>
  );
}
