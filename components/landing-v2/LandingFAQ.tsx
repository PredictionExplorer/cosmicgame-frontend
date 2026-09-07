'use client';

import { useLocale } from 'next-intl';

import type { LandingContent } from '@/content/landing';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { JsonLd, faqPageJsonLd, jsonLdInLanguage } from '@/utils/jsonLd';

import { SectionHeading } from './SectionHeading';

export function LandingFAQ({ faq }: { faq: LandingContent['faq'] }) {
  const locale = useLocale();
  const faqItems = faq.items.map((item) => ({
    question: item.question,
    answer: item.answer,
  }));

  return (
    <section id="faq" className="relative border-t border-border bg-card py-16 sm:py-24 lg:py-28">
      <JsonLd data={faqPageJsonLd(faqItems, jsonLdInLanguage(locale))} />
      <div className="mx-auto max-w-4xl px-5 sm:px-6 lg:px-12">
        <SectionHeading
          eyebrow={faq.eyebrow}
          heading={faq.heading}
          align="center"
          className="mx-auto"
        />
        <div className="mt-16 rounded-2xl border border-border bg-foreground/[0.02] p-2 backdrop-blur">
          <Accordion type="single" collapsible>
            {faq.items.map((item, idx) => (
              <AccordionItem
                key={idx}
                value={`faq-${idx}`}
                className="border-border last:border-b-0"
              >
                <AccordionTrigger className="px-6 py-5 text-left text-base font-medium text-foreground hover:no-underline sm:text-lg">
                  {item.question}
                </AccordionTrigger>
                <AccordionContent className="px-6 pb-6 text-sm leading-relaxed text-muted-foreground sm:text-base">
                  {item.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
}
