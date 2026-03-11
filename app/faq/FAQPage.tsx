'use client';

import { MessageCircle } from 'lucide-react';

import { MainWrapper } from '@/components/styled';
import { PageHeader } from '@/components/layout/PageHeader';
import FAQ from '@/components/common/FAQ';

const FAQPage = () => {
  return (
    <MainWrapper>
      <PageHeader
        title="Frequently Asked Questions"
        subtitle="Everything you need to know about Cosmic Signature"
      />

      <div className="space-y-12">
        <FAQ />

        <div className="rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/[0.06] to-accent/[0.04] p-8 sm:p-10 flex flex-col sm:flex-row items-center gap-6">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary/10">
            <MessageCircle className="h-7 w-7 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-bold">Still have a question?</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Reach out to us on{' '}
              <a
                className="no-underline font-semibold text-white hover:text-primary transition-colors"
                href="https://x.com/RandomWalkNFT"
                target="_blank"
                rel="noopener noreferrer"
              >
                Twitter
              </a>{' '}
              or{' '}
              <a
                className="no-underline font-semibold text-white hover:text-primary transition-colors"
                href="https://discord.gg/bGnPn96Qwt"
                target="_blank"
                rel="noopener noreferrer"
              >
                Discord
              </a>{' '}
              and we&apos;ll be happy to help.
            </p>
          </div>
        </div>
      </div>
    </MainWrapper>
  );
};

export default FAQPage;
