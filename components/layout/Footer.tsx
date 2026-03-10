'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Network } from 'lucide-react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDiscord, faTwitter } from '@fortawesome/free-brands-svg-icons';

import { FooterWrapper } from '@/components/styled';
import { Button } from '@/components/ui/button';

const Footer = () => (
  <FooterWrapper>
    <div className="mx-auto w-full max-w-7xl px-4">
      <div className="flex flex-col items-center justify-between py-6 lg:flex-row">
        <Image src="/images/logo2.svg" width={240} height={48} alt="logo" />

        <div className="flex flex-col-reverse items-center lg:flex-row">
          <div className="flex flex-wrap items-center justify-center">
            <p className="w-full text-center text-sm leading-[4] text-muted-foreground lg:mr-20 lg:w-auto">
              Copyright &copy; 2025 Cosmic Signature
            </p>

            <a
              className="text-[13px] text-muted-foreground no-underline lg:mr-20"
              target="_blank"
              href="#"
              rel="noreferrer"
            >
              Terms and conditions
            </a>

            <a
              className="text-[13px] text-muted-foreground no-underline"
              target="_blank"
              href="#"
              rel="noreferrer"
            >
              Privacy policy
            </a>
          </div>

          <div className="lg:ml-12">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/site-map" aria-label="site-map">
                <Network className="h-5 w-5 text-[#A9AAB5]" />
              </Link>
            </Button>

            <Button variant="ghost" size="icon" asChild>
              <a
                href="https://x.com/CosmicSignatureNFT"
                target="_blank"
                rel="noreferrer"
                aria-label="twitter"
              >
                <FontAwesomeIcon icon={faTwitter} color="#A9AAB5" width={24} height={24} />
              </a>
            </Button>

            <Button variant="ghost" size="icon" asChild>
              <a
                href="https://discord.gg/bGnPn96Qwt"
                target="_blank"
                rel="noreferrer"
                aria-label="discord"
              >
                <FontAwesomeIcon icon={faDiscord} color="#A9AAB5" width={24} height={24} />
              </a>
            </Button>
          </div>
        </div>
      </div>
    </div>
  </FooterWrapper>
);

export default Footer;
