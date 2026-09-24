'use client';

import type { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { Database, Eye, Lock, Shield, UserCheck, type LucideIcon } from 'lucide-react';

import { PageHeader } from '@/components/layout/PageHeader';
import { ReviewedStamp } from '@/components/layout/ReviewedStamp';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { PageShell } from '@/components/ui/page-shell';
import { cn } from '@/lib/utils';

import { LegalSectionHeading } from './LegalSectionHeading';
import { TRUST_DOCUMENT_DATES } from './trustCenter';

export type PrivacySectionId = 'collection' | 'use' | 'security' | 'sharing' | 'rights';

export interface PrivacyItem {
  readonly id: string;
  readonly subtitle: string;
  readonly text: string;
}

export interface PrivacySection {
  readonly id: PrivacySectionId;
  readonly title: string;
  readonly content: readonly PrivacyItem[];
}

export interface PrivacyCopy {
  readonly title: string;
  readonly subtitle: string;
  readonly introductionTitle: string;
  readonly introduction: readonly string[];
  readonly sections: readonly PrivacySection[];
  readonly additionalTitle: string;
  readonly additional: readonly PrivacyItem[];
  readonly notice: {
    readonly title: string;
    readonly text: string;
  };
}

const legalCard = 'rounded-2xl border border-border bg-card shadow-none';

const SECTION_ICONS: Record<PrivacySectionId, LucideIcon> = {
  collection: Database,
  use: Lock,
  security: Shield,
  sharing: Eye,
  rights: UserCheck,
};

/**
 * The privacy policy in the Trust Center template: the reading header with
 * the document date and the Trust Center tabs, then the sections.
 */
export function PrivacyContent({ copy, tabs }: { copy: PrivacyCopy; tabs?: ReactNode }) {
  const documentDate = TRUST_DOCUMENT_DATES.privacy;
  return (
    <PageShell variant="form" className="max-sm:pb-16">
      <PageHeader
        variant="reading"
        section="trust"
        title={copy.title}
        subtitle={copy.subtitle}
        meta={
          documentDate ? (
            <ReviewedStamp date={documentDate.date} kind={documentDate.kind} />
          ) : undefined
        }
        tabs={tabs}
      />

      <div className="mx-auto max-w-4xl space-y-8">
        <Card className={legalCard}>
          <CardHeader>
            <LegalSectionHeading icon={Shield}>{copy.introductionTitle}</LegalSectionHeading>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground">
            {copy.introduction.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </CardContent>
        </Card>

        {copy.sections.map((section, index) => {
          const Icon = SECTION_ICONS[section.id];
          return (
            <motion.div
              key={section.id}
              initial={false}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className={legalCard}>
                <CardHeader>
                  <LegalSectionHeading icon={Icon}>{section.title}</LegalSectionHeading>
                </CardHeader>
                <CardContent className="space-y-6">
                  {section.content.map((item) => (
                    <div key={item.id} className="space-y-2">
                      <h3 className="font-semibold text-foreground">{item.subtitle}</h3>
                      <p className="leading-8 text-muted-foreground">{item.text}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </motion.div>
          );
        })}

        <Card className={legalCard}>
          <CardHeader>
            <LegalSectionHeading>{copy.additionalTitle}</LegalSectionHeading>
          </CardHeader>
          <CardContent className="space-y-6 text-muted-foreground">
            {copy.additional.map((item) => (
              <div key={item.id} className="space-y-2">
                <h3 className="font-semibold text-foreground">{item.subtitle}</h3>
                <p className="leading-relaxed">{item.text}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className={cn(legalCard, 'border-primary/25 bg-primary/[0.06]')}>
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <Shield className="mt-0.5 h-6 w-6 shrink-0 text-primary" aria-hidden />
              <div className="space-y-2">
                <h3 className="font-semibold text-foreground">{copy.notice.title}</h3>
                <p className="leading-8 text-muted-foreground">{copy.notice.text}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageShell>
  );
}
