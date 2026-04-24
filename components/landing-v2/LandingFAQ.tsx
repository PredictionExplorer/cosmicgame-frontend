'use client';

import { landingContent } from '@/content/landing';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { JsonLd, faqPageJsonLd } from '@/utils/jsonLd';

import { SectionHeading } from './SectionHeading';

const { faq } = landingContent;

export function LandingFAQ() {
  const faqItems = faq.items.map((item) => ({
    question: item.question,
    answer: item.answer,
  }));

  return (
    <section id="faq" className="relative border-t border-white/10 bg-[#0D0521] py-28 sm:py-40">
      <JsonLd data={faqPageJsonLd(faqItems)} />
      <div className="mx-auto max-w-4xl px-6 lg:px-12">
        <SectionHeading
          eyebrow={faq.eyebrow}
          heading={faq.heading}
          align="center"
          className="mx-auto"
        />
        <div className="mt-16 rounded-2xl border border-white/10 bg-white/[0.02] p-2 backdrop-blur">
          <Accordion type="single" collapsible>
            {faq.items.map((item, idx) => (
              <AccordionItem
                key={idx}
                value={`faq-${idx}`}
                className="border-white/10 last:border-b-0"
              >
                <AccordionTrigger className="px-6 py-5 text-left text-base font-medium text-white hover:no-underline sm:text-lg">
                  {item.question}
                </AccordionTrigger>
                <AccordionContent className="px-6 pb-6 text-sm leading-relaxed text-white/75 sm:text-base">
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
