import type { Metadata } from 'next';
import {
  AppWindow,
  ArrowRight,
  AtSign,
  CircleHelp,
  Code2,
  FileCode2,
  GitBranch,
  Lock,
  Mail,
  MessagesSquare,
  Scale,
  type LucideIcon,
} from 'lucide-react';
import { getTranslations, setRequestLocale } from 'next-intl/server';

import {
  ABOUT_PLATE_TOKEN_ID,
  ABOUT_RESOURCE_GROUPS,
  getAboutContent,
  type AboutResourceGroupId,
  type AboutResourceId,
} from '@/content/about';
import { getLearnContent } from '@/content/learn';
import { protocolFacts } from '@/content/protocol-facts';
import { WHITE_PAPER_PATH, getWhitePaperContent } from '@/content/white-paper';

import { SiteLink } from '@/components/layout/SiteLink';
import { landingLink } from '@/components/learn/guides';
import { Callout, PROSE_CLASS, splitRunIn, termLabel } from '@/components/reading/prose';
import { ReadingMain } from '@/components/reading/ReadingMain';
import { SignaturePlate } from '@/components/reading/SignaturePlate';
import { SIGNATURE_PLATES } from '@/components/reading/signaturePlates';
import { fillTemplate } from '@/components/reading/template';
import { Badge } from '@/components/ui/badge';
import { SectionHeader } from '@/components/ui/section-header';
import { Link } from '@/i18n/navigation';
import { APP_ORIGIN, LANDING_ORIGIN, localeHref, localizeCrossHostHref } from '@/lib/hostRouting';
import { formatOgCycle } from '@/lib/og/copy';
import { formatId } from '@/utils/format/ids';
import { formatPercent } from '@/utils/format/numbers';
import { JsonLd, breadcrumbJsonLd, jsonLdInLanguage } from '@/utils/jsonLd';
import { createMetadata } from '@/utils/seo';

interface PageProps {
  params: Promise<{ locale: string }>;
}

const ABOUT_PLATE = SIGNATURE_PLATES[ABOUT_PLATE_TOKEN_ID];

const RESOURCE_ICONS: Readonly<Record<AboutResourceId, LucideIcon>> = {
  app: AppWindow,
  contracts: FileCode2,
  code: Code2,
  x: AtSign,
  discord: MessagesSquare,
  github: GitBranch,
  faq: CircleHelp,
  terms: Scale,
  privacy: Lock,
  support: Mail,
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  setRequestLocale(locale);
  const { metadata } = getAboutContent(locale);
  const t = await getTranslations({ locale, namespace: 'meta' });

  return createMetadata(t('about.title'), t('about.description'), undefined, metadata.path, {
    canonicalHost: 'landing',
    locale,
  });
}

/** The white paper's three design properties ("Determinism. The artwork…"), split into term and text. */
function principlesOf(locale: string) {
  const introduction = getWhitePaperContent(locale).sections.find(
    (section) => section.id === 'introduction',
  );
  const list = introduction?.blocks.find((block) => block.kind === 'list');
  if (list?.kind !== 'list') return [];
  return list.items.map(splitRunIn).filter((item) => item.term !== null);
}

export default async function AboutPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const content = getAboutContent(locale);
  const traits = await getTranslations({ locale, namespace: 'traits' });
  const detail = await getTranslations({ locale, namespace: 'detail' });
  const inLanguage = jsonLdInLanguage(locale);
  const pageUrl = localeHref(LANDING_ORIGIN, content.metadata.path, locale);
  const aboutJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'AboutPage',
    name: content.jsonLd.name,
    url: pageUrl,
    description: content.jsonLd.description,
    inLanguage,
    publisher: {
      '@id': `${LANDING_ORIGIN}/#organization`,
    },
  };
  const principles = principlesOf(locale);
  const readWhitePaperLabel = getLearnContent(locale).hub.whitePaper.readLabel;
  const plateId = formatId(ABOUT_PLATE.tokenId);
  const linksById = new Map(content.officialResources.links.map((link) => [link.id, link]));

  return (
    <ReadingMain>
      <JsonLd
        data={[
          breadcrumbJsonLd(
            [
              { name: 'Cosmic Signature', path: '/' },
              { name: content.breadcrumbLabel, path: content.metadata.path },
            ],
            localeHref(LANDING_ORIGIN, '/', locale),
          ),
          aboutJsonLd,
        ]}
      />

      <header className="grid items-center gap-10 border-b border-rule pb-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,36rem)] lg:gap-16 lg:pb-16">
        <div className="min-w-0">
          <p className="type-eyebrow text-secondary">{content.eyebrow}</p>
          <h1 className="mt-3 type-display-md text-foreground sm:mt-4">{content.heading}</h1>
          <p className="mt-5 type-lede text-muted-foreground max-sm:text-base">
            {content.body.lede}
          </p>
          <ul className="mt-6 flex flex-wrap gap-2">
            {[
              content.facts.license,
              content.facts.network,
              fillTemplate(content.facts.publicGoodsTemplate, {
                percent: formatPercent(protocolFacts.publicGoodsPercentage, locale),
              }),
            ].map((fact) => (
              <li key={fact}>
                <Badge tone="neutral">{fact}</Badge>
              </li>
            ))}
          </ul>
        </div>
        <SignaturePlate
          art={ABOUT_PLATE}
          priority
          href={localizeCrossHostHref(`${APP_ORIGIN}/detail/${ABOUT_PLATE.tokenId}`, locale)}
          sizes="(min-width: 1024px) 36rem, 100vw"
          copy={{
            alt: traits('quickView.title', { id: plateId }),
            title: traits('quickView.title', { id: plateId }),
            cycle: formatOgCycle(locale, ABOUT_PLATE.cycle),
            unavailable: detail('image.artworkUnavailable'),
          }}
        />
      </header>

      <div className="mt-12 space-y-5 lg:mt-16">
        {content.body.paragraphs.map((paragraph) => (
          <p key={paragraph} className={PROSE_CLASS}>
            {paragraph}
          </p>
        ))}
      </div>

      {principles.length > 0 ? (
        <section aria-labelledby="about-principles" className="mt-16 lg:mt-20">
          <SectionHeader headingId="about-principles" title={content.principlesHeading} />
          <ol className="mt-6 grid gap-8 md:grid-cols-3 md:gap-10">
            {principles.map((principle, index) => (
              <li key={principle.term} className="border-t border-rule pt-5">
                <p aria-hidden className="type-mono text-subtle">
                  {String(index + 1).padStart(2, '0')}
                </p>
                <h3 className="mt-3 type-heading-3 text-foreground">
                  {termLabel(principle.term ?? '')}
                </h3>
                <p className="mt-2 type-body-md text-muted-foreground">{principle.text}</p>
              </li>
            ))}
          </ol>
          <Link
            href={WHITE_PAPER_PATH}
            className="link-quiet mt-8 inline-flex min-h-6 items-center gap-1.5 type-label text-primary"
          >
            {readWhitePaperLabel}
            <ArrowRight aria-hidden className="size-3.5" />
          </Link>
        </section>
      ) : null}

      <Callout label={content.clarificationsHeading} className="mt-16 lg:mt-20">
        <p>{content.body.disambiguation}</p>
        <p className="mt-2">{content.body.denial}</p>
      </Callout>

      <section aria-labelledby="about-resources" className="mt-16 lg:mt-20">
        <SectionHeader headingId="about-resources" title={content.officialResources.heading} />
        <div className="mt-6 grid gap-10 md:grid-cols-3 md:gap-10">
          {(Object.keys(ABOUT_RESOURCE_GROUPS) as AboutResourceGroupId[]).map((groupId) => (
            <div key={groupId} className="min-w-0">
              <h3 className="type-label text-subtle">
                {content.officialResources.groups[groupId]}
              </h3>
              <ul className="mt-3 divide-y divide-rule-faint border-y border-rule-faint">
                {ABOUT_RESOURCE_GROUPS[groupId].map((id) => {
                  const link = linksById.get(id);
                  if (!link) return null;
                  const Icon = RESOURCE_ICONS[id];
                  const rowClass =
                    'group flex min-h-12 items-center gap-3 py-2.5 type-body-sm text-foreground transition-colors duration-fast hover:text-primary';
                  const icon = (
                    <Icon
                      aria-hidden
                      className="size-4 shrink-0 text-subtle transition-colors group-hover:text-primary"
                    />
                  );
                  if (link.href.startsWith('mailto:')) {
                    return (
                      <li key={id}>
                        <a href={link.href} className={rowClass}>
                          {icon}
                          <span className="min-w-0 [overflow-wrap:anywhere]">{link.label}</span>
                        </a>
                      </li>
                    );
                  }
                  const target = landingLink(link.href, locale);
                  return (
                    <li key={id}>
                      <SiteLink
                        href={target.href}
                        kind={target.kind}
                        className={rowClass}
                        externalIconClassName="ml-auto"
                      >
                        {icon}
                        <span className="min-w-0">{link.label}</span>
                        {target.kind === 'external' ? null : (
                          <ArrowRight
                            aria-hidden
                            className="ml-auto size-3.5 shrink-0 text-subtle transition-colors group-hover:text-primary"
                          />
                        )}
                      </SiteLink>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      </section>
    </ReadingMain>
  );
}
