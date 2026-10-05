import type { Metadata } from 'next';
import { AppWindow, ArrowRight, Code2, FileCode2, Mail, type LucideIcon } from 'lucide-react';
import { getTranslations, setRequestLocale } from 'next-intl/server';

import {
  ABOUT_MILESTONE_IDS,
  ABOUT_PLATE_TOKEN_ID,
  ABOUT_RESOURCE_IDS,
  getAboutContent,
  type AboutResourceId,
} from '@/content/about';
import { getLearnContent } from '@/content/learn';
import { protocolFacts } from '@/content/protocol-facts';
import { WHITE_PAPER_PATH } from '@/content/white-paper';

import { PageHeader } from '@/components/layout/PageHeader';
import { SiteLink } from '@/components/layout/SiteLink';
import { landingLink } from '@/components/learn/guides';
import { Callout, PROSE_CLASS } from '@/components/reading/prose';
import { ReadingMain } from '@/components/reading/ReadingMain';
import { SignaturePlate } from '@/components/reading/SignaturePlate';
import { getSignaturePlateCopy } from '@/components/reading/signaturePlateCopy';
import { SIGNATURE_PLATES } from '@/components/reading/signaturePlates';
import { fillTemplate } from '@/components/reading/template';
import { SectionHeader } from '@/components/ui/section-header';
import { Link } from '@/i18n/navigation';
import { APP_ORIGIN, LANDING_ORIGIN, localeHref, localizeCrossHostHref } from '@/lib/hostRouting';
import { formatPercent } from '@/utils/format/numbers';
import { JsonLd, breadcrumbJsonLd, jsonLdInLanguage } from '@/utils/jsonLd';
import { createMetadata } from '@/utils/seo';

interface PageProps {
  params: Promise<{ locale: string }>;
}

const ABOUT_PLATE = SIGNATURE_PLATES[ABOUT_PLATE_TOKEN_ID];

/** The white paper's introduction, where the design's own account continues. */
const WHITE_PAPER_INTRODUCTION = `${WHITE_PAPER_PATH}#introduction`;

const RESOURCE_ICONS: Readonly<Record<AboutResourceId, LucideIcon>> = {
  app: AppWindow,
  contracts: FileCode2,
  code: Code2,
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
  const readWhitePaperLabel = getLearnContent(locale).hub.whitePaper.readLabel;
  const linksById = new Map(content.officialResources.links.map((link) => [link.id, link]));
  const facts = [
    { label: content.facts.licenseLabel, value: content.facts.license },
    { label: content.facts.networkLabel, value: content.facts.network },
    {
      label: content.facts.publicGoodsLabel,
      value: fillTemplate(content.facts.publicGoodsTemplate, {
        percent: formatPercent(protocolFacts.publicGoodsPercentage, locale),
      }),
    },
  ];

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

      {/*
       * The one page header, like every reading page: the page's name as the
       * eyebrow, a statement as the H1, the lede and the facts, with the
       * Signature that introduces the protocol beside it from lg.
       */}
      <div className="border-b border-rule lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,30rem)] lg:items-end lg:gap-12 xl:gap-16">
        <PageHeader
          variant="reading"
          host="landing"
          eyebrow={content.eyebrow}
          title={content.heading}
          subtitle={content.body.lede}
          className="mb-0 border-b-0 sm:mb-0"
        >
          <dl className="mt-8 grid grid-cols-2 gap-x-8 gap-y-5 border-t border-rule-faint pt-5 sm:flex sm:flex-wrap sm:gap-x-10">
            {facts.map((fact) => (
              <div key={fact.label} className="min-w-0 last:max-sm:col-span-2">
                <dt className="type-label text-subtle">{fact.label}</dt>
                <dd className="mt-1 type-body-md text-foreground">{fact.value}</dd>
              </div>
            ))}
          </dl>
        </PageHeader>
        <div className="pb-10 max-lg:mt-2">
          <SignaturePlate
            art={ABOUT_PLATE}
            priority
            href={localizeCrossHostHref(`${APP_ORIGIN}/detail/${ABOUT_PLATE.tokenId}`, locale)}
            sizes="(min-width: 1024px) 30rem, 100vw"
            copy={plateCopy(ABOUT_PLATE)}
          />
        </div>
      </div>

      <section aria-labelledby="about-origin" className="mt-12 lg:mt-16">
        <SectionHeader headingId="about-origin" title={content.origin.heading} />
        <div className="mt-5 space-y-5">
          {content.origin.paragraphs.map((paragraph) => (
            <p key={paragraph} className={PROSE_CLASS}>
              {paragraph}
            </p>
          ))}
        </div>
        <Link
          href={WHITE_PAPER_INTRODUCTION}
          className="link-quiet mt-6 inline-flex min-h-6 items-center gap-1.5 type-label text-primary"
        >
          {readWhitePaperLabel}
          <ArrowRight aria-hidden className="size-3.5" />
        </Link>
      </section>

      <section aria-labelledby="about-milestones" className="mt-16 lg:mt-20">
        <SectionHeader headingId="about-milestones" title={content.milestones.heading} />
        <ol className="mt-6 max-w-[60rem] divide-y divide-rule-faint border-y border-rule-faint">
          {ABOUT_MILESTONE_IDS.map((id) => {
            const milestone = content.milestones.items[id];
            return (
              <li
                key={id}
                className="grid gap-x-8 gap-y-1.5 py-5 sm:grid-cols-[minmax(0,11rem)_minmax(0,1fr)]"
              >
                <p className="flex items-baseline gap-3">
                  <span className="type-title text-foreground">{milestone.label}</span>
                  <span className="type-label text-subtle">{milestone.status}</span>
                </p>
                <p className="type-body-md text-muted-foreground">{milestone.text}</p>
              </li>
            );
          })}
        </ol>
      </section>

      <Callout label={content.clarificationsHeading} className="mt-16 lg:mt-20">
        {/* The COSMIC disambiguation sits in the footer of every landing page, just below. */}
        <p>{content.body.denial}</p>
      </Callout>

      <section aria-labelledby="about-resources" className="mt-16 lg:mt-20">
        <SectionHeader headingId="about-resources" title={content.officialResources.heading} />
        {/* The protocol's own resources and a way to write in; community and
            legal links live in the footer right below. */}
        <ul className="mt-6 grid border-t border-rule-faint sm:grid-cols-2 sm:gap-x-10">
          {ABOUT_RESOURCE_IDS.map((id) => {
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
