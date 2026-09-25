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
import { getSignaturePlateCopy } from '@/components/reading/signaturePlateCopy';
import { SIGNATURE_PLATES } from '@/components/reading/signaturePlates';
import { fillTemplate } from '@/components/reading/template';
import { Badge } from '@/components/ui/badge';
import { SectionHeader } from '@/components/ui/section-header';
import { PageHeader } from '@/components/layout/PageHeader';
import { Link } from '@/i18n/navigation';
import { APP_ORIGIN, LANDING_ORIGIN, localeHref, localizeCrossHostHref } from '@/lib/hostRouting';
import { formatPercent } from '@/utils/format/numbers';
import { JsonLd, breadcrumbJsonLd, jsonLdInLanguage } from '@/utils/jsonLd';
import { createMetadata } from '@/utils/seo';

interface PageProps {
  params: Promise<{ locale: string }>;
}

const ABOUT_PLATE = SIGNATURE_PLATES[ABOUT_PLATE_TOKEN_ID];

/** The resources this page lists: the protocol's own, then the support address. */
const ABOUT_PAGE_RESOURCES: readonly AboutResourceId[] = [
  ...ABOUT_RESOURCE_GROUPS.protocol,
  'support',
];

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
  const plateCopy = await getSignaturePlateCopy(locale);
  const nav = await getTranslations({ locale, namespace: 'nav' });
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

      {/* The reading header every long page uses, top-aligned beside its Signature. */}
      <div className="grid items-start gap-10 border-b border-rule pb-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,36rem)] lg:gap-16 lg:pb-16">
        <PageHeader
          variant="reading"
          eyebrow={content.eyebrow}
          title={content.heading}
          subtitle={content.body.lede}
          className="mb-0 border-b-0 pb-0 sm:mb-0 sm:pb-0"
        >
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
        </PageHeader>
        <SignaturePlate
          art={ABOUT_PLATE}
          priority
          href={localizeCrossHostHref(`${APP_ORIGIN}/detail/${ABOUT_PLATE.tokenId}`, locale)}
          sizes="(min-width: 1024px) 36rem, 100vw"
          copy={plateCopy(ABOUT_PLATE)}
        />
      </div>

      {/* The body opens the Principles it introduces, instead of standing alone
          at half the row's width between the header and the section. */}
      {principles.length > 0 ? (
        <section aria-labelledby="about-principles" className="mt-12 lg:mt-16">
          <SectionHeader
            headingId="about-principles"
            title={content.principlesHeading}
            description={
              <span className="block space-y-3">
                {content.body.paragraphs.map((paragraph) => (
                  <span key={paragraph} className="block">
                    {paragraph}
                  </span>
                ))}
              </span>
            }
          />
          <ol className="mt-8 grid gap-8 md:grid-cols-3 md:gap-10">
            {principles.map((principle, index) => (
              <li key={principle.term} className="border-t border-rule pt-5">
                <p aria-hidden className="type-label tabular-nums text-subtle">
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
      ) : (
        <div className="mt-12 space-y-5 lg:mt-16">
          {content.body.paragraphs.map((paragraph) => (
            <p key={paragraph} className={PROSE_CLASS}>
              {paragraph}
            </p>
          ))}
        </div>
      )}

      <Callout label={content.clarificationsHeading} className="mt-16 lg:mt-20">
        {/* The COSMIC disambiguation sits in the footer of every landing page, just below. */}
        <p>{content.body.denial}</p>
      </Callout>

      <section aria-labelledby="about-resources" className="mt-16 lg:mt-20">
        <SectionHeader headingId="about-resources" title={content.officialResources.heading} />
        {/* The protocol's own resources and a way to write in; community and
            legal links live in the footer right below. */}
        <ul className="mt-6 grid border-t border-rule-faint sm:grid-cols-2 sm:gap-x-10">
          {ABOUT_PAGE_RESOURCES.map((id) => {
            const link = linksById.get(id);
            if (!link) return null;
            const Icon = RESOURCE_ICONS[id];
            // The app's front door takes the one shared name, "Open the app".
            const label = id === 'app' ? nav('cta.openApp') : link.label;
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
                <li key={id} className="border-b border-rule-faint">
                  <a href={link.href} className={rowClass}>
                    {icon}
                    <span className="min-w-0 [overflow-wrap:anywhere]">{label}</span>
                  </a>
                </li>
              );
            }
            const target = landingLink(link.href, locale);
            return (
              <li key={id} className="border-b border-rule-faint">
                <SiteLink
                  href={target.href}
                  kind={target.kind}
                  className={rowClass}
                  externalIconClassName="ml-auto"
                >
                  {icon}
                  <span className="min-w-0">{label}</span>
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
      </section>
    </ReadingMain>
  );
}
