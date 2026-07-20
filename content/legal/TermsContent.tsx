'use client';

import { motion } from 'framer-motion';
import {
  AlertTriangle,
  Coins,
  FileText,
  Scale,
  Shield,
  Users,
  type LucideIcon,
} from 'lucide-react';

import { PageHeader } from '@/components/layout/PageHeader';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PageShell } from '@/components/ui/page-shell';
import { cn } from '@/lib/utils';

export type TermsSectionId =
  | 'acceptance'
  | 'eligibility'
  | 'mechanics'
  | 'allocations'
  | 'risks'
  | 'prohibited';

export interface LegalParagraph {
  readonly id: string;
  readonly subtitle?: string;
  readonly text: string;
}

export interface TermsSection {
  readonly id: TermsSectionId;
  readonly title: string;
  readonly content: readonly LegalParagraph[];
}

export interface TermsCopy {
  readonly title: string;
  readonly subtitle: string;
  readonly homeLabel: string;
  readonly lastUpdated: string;
  readonly sections: readonly TermsSection[];
  readonly additionalTitle: string;
  readonly additional: readonly Required<LegalParagraph>[];
  readonly warning: {
    readonly title: string;
    readonly text: string;
  };
  readonly acknowledgment: {
    readonly title: string;
    readonly text: string;
  };
}

const legalCard =
  'rounded-xl border border-white/[0.06] bg-white/[0.02] shadow-none backdrop-blur-sm';

const SECTION_ICONS: Record<TermsSectionId, LucideIcon> = {
  acceptance: FileText,
  eligibility: Users,
  mechanics: Coins,
  allocations: Scale,
  risks: Shield,
  prohibited: AlertTriangle,
};

export function TermsContent({ copy }: { copy: TermsCopy }) {
  return (
    <PageShell variant="form" className="max-sm:pb-16">
      <PageHeader
        title={copy.title}
        subtitle={copy.subtitle}
        breadcrumbs={[{ label: copy.homeLabel, href: '/' }, { label: copy.title }]}
        className="mb-10 max-w-3xl md:mx-auto md:text-center"
      />

      <div className="mb-8 flex justify-center md:mx-auto md:max-w-3xl md:text-center">
        <Badge
          variant="outline"
          className="border-primary/35 bg-primary/10 px-3 py-1 text-xs font-medium text-primary"
        >
          {copy.lastUpdated}
        </Badge>
      </div>

      <div className="mx-auto max-w-4xl space-y-8">
        {copy.sections.map((section, index) => {
          const Icon = SECTION_ICONS[section.id];
          return (
            <motion.div
              key={section.id}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className={legalCard}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 font-display text-xl font-semibold tracking-tight">
                    <Icon className="h-6 w-6 shrink-0 text-primary" aria-hidden />
                    <span>{section.title}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {section.content.map((item) => (
                    <div key={item.id} className="space-y-2">
                      {item.subtitle ? (
                        <h3 className="font-semibold text-foreground">{item.subtitle}</h3>
                      ) : null}
                      <p className="leading-relaxed text-muted-foreground">{item.text}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </motion.div>
          );
        })}

        <Card className={legalCard}>
          <CardHeader>
            <CardTitle className="font-display text-xl font-semibold tracking-tight">
              {copy.additionalTitle}
            </CardTitle>
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

        <Card
          className={cn(
            legalCard,
            'border-amber-500/35 bg-amber-500/[0.06] dark:border-amber-400/25 dark:bg-amber-400/[0.06]',
          )}
        >
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <AlertTriangle
                className="mt-0.5 h-6 w-6 shrink-0 text-amber-600 dark:text-amber-400"
                aria-hidden
              />
              <div className="space-y-2">
                <h3 className="font-semibold text-foreground">{copy.warning.title}</h3>
                <p className="leading-relaxed text-muted-foreground">{copy.warning.text}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={cn(legalCard, 'border-primary/25 bg-primary/[0.06]')}>
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <Shield className="mt-0.5 h-6 w-6 shrink-0 text-primary" aria-hidden />
              <div className="space-y-2">
                <h3 className="font-semibold text-foreground">{copy.acknowledgment.title}</h3>
                <p className="leading-relaxed text-muted-foreground">{copy.acknowledgment.text}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageShell>
  );
}
