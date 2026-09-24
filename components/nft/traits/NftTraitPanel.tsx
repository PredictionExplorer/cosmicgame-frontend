'use client';

import { useId, useState, type ReactNode } from 'react';
import { Check, Copy, ExternalLink } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';

import type { CollectionTraits } from '@/hooks/useNftTraits';
import type { CosmicSignatureMetadata, NftTraitEntry } from '@/lib/nftMetadata';
import { cn } from '@/lib/utils';
import { TOUCH_TARGET_ICON_CLASS } from '@/lib/touch-target';
import { toIntlLocale } from '@/utils/format';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import { TRAIT_GRID_CLASS, TRAIT_TILE_CLASS } from './layout';
import { RarityRankChip } from './RarityRankChip';
import { TraitSheet } from './TraitSheet';
import { hueColor } from './palette';
import { useTraitLabels } from './useTraitLabels';

/** Props for {@link NftTraitPanel}. */
export interface NftTraitPanelProps {
  tokenId: number;
  /** Full metadata document; `undefined` while loading, `null` when the origin has none. */
  metadata: CosmicSignatureMetadata | null | undefined;
  /** Normalized trait entry derived from `metadata`. */
  entry: NftTraitEntry | null;
  isError?: boolean;
  onRetry?: () => void;
  /** Collection index for rarity rank and value shares (optional). */
  collectionTraits?: CollectionTraits | null;
  /** Shown under the introduction, above the tabs (the detail page puts the seed here). */
  lead?: ReactNode;
  className?: string;
}

function Fact({
  label,
  children,
  wide = false,
}: {
  label: string;
  children: ReactNode;
  wide?: boolean;
}) {
  return (
    <div className={cn(TRAIT_TILE_CLASS, wide && 'col-span-2')}>
      <dt className="mb-1 type-label text-subtle">{label}</dt>
      <dd className="type-body-sm text-foreground">{children}</dd>
    </div>
  );
}

function HashValue({
  value,
  copyLabel,
  copiedLabel,
}: {
  value: string;
  copyLabel: string;
  copiedLabel: string;
}) {
  const [copied, setCopied] = useState(false);
  async function handleCopy() {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }
  return (
    <span className="flex items-start gap-2">
      <code className="min-w-0 flex-1 type-hash text-muted-foreground">{value}</code>
      <button
        type="button"
        onClick={handleCopy}
        aria-label={copied ? copiedLabel : copyLabel}
        className={cn(
          'shrink-0 rounded-control p-1.5 text-subtle transition-colors hover:bg-surface hover:text-foreground',
          TOUCH_TARGET_ICON_CLASS,
        )}
      >
        {copied ? (
          <Check className="h-3.5 w-3.5 text-positive" aria-hidden />
        ) : (
          <Copy className="h-3.5 w-3.5" aria-hidden />
        )}
      </button>
    </span>
  );
}

function MediaLink({ href, label, hint }: { href: string; label: string; hint: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      title={hint}
      className="flex min-h-11 items-center justify-between gap-3 rounded-control bg-surface-sunken px-4 py-2 type-body-sm text-foreground no-underline transition-colors duration-[var(--duration-fast)] hover:bg-surface"
    >
      <span>{label}</span>
      <ExternalLink className="h-3.5 w-3.5 shrink-0 text-subtle" aria-hidden />
    </a>
  );
}

/**
 * NftTraitPanel — the detail page's trait section: composition, orbital
 * physics, provenance, and media, drawn from the token's metadata document.
 */
export function NftTraitPanel({
  tokenId,
  metadata,
  entry,
  isError = false,
  onRetry,
  collectionTraits,
  lead,
  className,
}: NftTraitPanelProps) {
  const t = useTranslations('traits');
  const locale = useLocale();
  const headingId = useId();
  const { typeLabel } = useTraitLabels();
  const intl = toIntlLocale(locale);
  const number = (value: number, digits = 2) =>
    value.toLocaleString(intl, { maximumFractionDigits: digits });

  const rarity = collectionTraits?.rarity.byId.get(tokenId) ?? null;
  const rarityTotal = collectionTraits?.rarity.total ?? 0;

  let body: ReactNode;
  if (metadata === undefined && !isError) {
    body = (
      <div role="status" className="space-y-4" aria-busy="true" aria-label={t('panel.loading')}>
        <Skeleton className="h-9 w-72" />
        <div className={TRAIT_GRID_CLASS}>
          {Array.from({ length: 8 }, (_, i) => (
            <Skeleton key={i} className="h-[4.5rem] w-full rounded-control" />
          ))}
        </div>
      </div>
    );
  } else if (isError && !metadata) {
    body = (
      <div className="flex flex-wrap items-center gap-3 rounded-control bg-surface-sunken px-4 py-3 type-body-sm text-muted-foreground">
        <span>{t('panel.error')}</span>
        {onRetry ? (
          <Button variant="outline" size="sm" className="normal-case" onClick={onRetry}>
            {t('panel.retry')}
          </Button>
        ) : null}
      </div>
    );
  } else if (!metadata || !entry?.hasArtTraits) {
    body = (
      <p className="max-w-[var(--measure-prose)] rounded-control bg-surface-sunken px-4 py-3 type-body-sm text-muted-foreground">
        {t('panel.unavailable')}
      </p>
    );
  } else {
    const generation = metadata.properties?.generation;
    const simulation = metadata.properties?.simulation;
    const media = metadata.properties?.media;
    const palette = generation?.palette;
    const masses = simulation?.masses ?? [];
    const maxMass = masses.length > 0 ? Math.max(...masses) : 0;
    const facets = collectionTraits?.facets ?? null;

    body = (
      <Tabs defaultValue="composition" className="w-full">
        {/* Underline tabs on one line: they scroll sideways on a phone rather
            than wrapping a lone tab onto a second row. */}
        <TabsList className="flex h-auto w-full justify-start gap-6 overflow-x-auto rounded-none border-b border-rule bg-transparent p-0 scrollbar-none max-sm:[mask-image:linear-gradient(to_right,black_calc(100%-2.5rem),transparent)] sm:h-auto">
          {[
            ['composition', t('groups.composition')],
            ['physics', t('groups.physics')],
            ['provenance', t('groups.provenance')],
            ...(media ? [['media', t('groups.media')]] : []),
          ].map(([value, label]) => (
            <TabsTrigger
              key={value}
              value={value!}
              className={cn(
                'relative shrink-0 whitespace-nowrap rounded-none bg-transparent px-0 pb-3 pt-2 type-body-sm font-medium text-muted-foreground focus-ring-inset hover:text-foreground',
                'data-[state=active]:bg-transparent data-[state=active]:text-foreground data-[state=active]:shadow-none',
                "after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:bg-primary after:opacity-0 after:content-[''] data-[state=active]:after:opacity-100",
              )}
            >
              {label}
            </TabsTrigger>
          ))}
          {/* Room past the last tab, so it can scroll clear of the edge fade. */}
          <span aria-hidden className="w-4 shrink-0 sm:hidden" />
        </TabsList>

        <TabsContent value="composition" className="mt-6 space-y-2 sm:space-y-3">
          <TraitSheet
            entry={entry}
            facets={facets}
            total={rarityTotal}
            groups={['composition']}
            hideHeadings
          />
          <dl className={TRAIT_GRID_CLASS}>
            {typeof palette?.dominant_wavelength_nm === 'number' ? (
              <Fact label={t('panel.dominantWavelength')}>
                {t('panel.nanometres', { value: number(palette.dominant_wavelength_nm, 0) })}
              </Fact>
            ) : null}
            {typeof palette?.dispersion_deg === 'number' ? (
              <Fact label={t('panel.hueDispersion')}>
                {t('panel.degrees', { value: number(palette.dispersion_deg, 1) })}
              </Fact>
            ) : null}
            {typeof generation?.finishes?.halation_strength === 'number' ? (
              <Fact label={t('panel.halation')}>
                {number(generation.finishes.halation_strength, 2)}
              </Fact>
            ) : null}
          </dl>
        </TabsContent>

        <TabsContent value="physics" className="mt-6 space-y-2 sm:space-y-3">
          <TraitSheet
            entry={entry}
            facets={facets}
            total={rarityTotal}
            groups={['physics']}
            hideHeadings
          />
          <dl className={TRAIT_GRID_CLASS}>
            {masses.length > 0 ? (
              <Fact label={t('panel.masses')} wide>
                <ul className="space-y-1.5">
                  {masses.map((mass, index) => (
                    <li key={index} className="flex items-center gap-3">
                      <span
                        role="img"
                        aria-label={t('panel.massAria', {
                          index: index + 1,
                          value: number(mass, 1),
                        })}
                        className="relative h-1.5 flex-1 overflow-hidden rounded-full bg-rule-faint"
                      >
                        <span
                          aria-hidden
                          className="absolute inset-y-0 left-0 rounded-full"
                          style={{
                            width: `${maxMass > 0 ? ((mass / maxMass) * 100).toFixed(1) : 0}%`,
                            backgroundColor:
                              entry.hues?.[index] !== undefined
                                ? hueColor(entry.hues[index]!)
                                : 'rgb(var(--aurora-cyan-rgb))',
                          }}
                        />
                      </span>
                      <span
                        aria-hidden
                        className="w-16 shrink-0 text-right type-caption tabular-nums text-muted-foreground"
                      >
                        {number(mass, 1)}
                      </span>
                    </li>
                  ))}
                </ul>
              </Fact>
            ) : null}
            {simulation?.closest_approach?.pair &&
            typeof simulation.closest_approach.distance === 'number' ? (
              <Fact label={t('panel.closestApproach')}>
                {t('panel.closestApproachValue', {
                  a: (simulation.closest_approach.pair[0] ?? 0) + 1,
                  b: (simulation.closest_approach.pair[1] ?? 0) + 1,
                  distance: number(simulation.closest_approach.distance, 2),
                })}
              </Fact>
            ) : null}
            {typeof simulation?.total_energy === 'number' ? (
              <Fact label={t('panel.totalEnergy')}>
                <span className="tabular-nums">{number(simulation.total_energy, 1)}</span>
              </Fact>
            ) : null}
            {typeof simulation?.angular_momentum === 'number' ? (
              <Fact label={t('panel.angularMomentum')}>
                <span className="tabular-nums">{number(simulation.angular_momentum, 1)}</span>
              </Fact>
            ) : null}
            {typeof simulation?.equilateralness === 'number' ? (
              <Fact label={t('panel.equilateralness')}>
                <span className="tabular-nums">{number(simulation.equilateralness, 3)}</span>
              </Fact>
            ) : null}
            {simulation?.integrator ? (
              <Fact label={t('panel.integrator')}>
                <span className="font-mono">{simulation.integrator}</span>
                {typeof simulation.steps === 'number' ? (
                  <span className="ml-2 type-caption text-subtle">
                    {t('panel.steps', { steps: number(simulation.steps, 0) })}
                  </span>
                ) : null}
              </Fact>
            ) : null}
            {typeof simulation?.fate?.ejection_step === 'number' ? (
              <Fact label={typeLabel('fate')}>
                {t('panel.ejectionStep', { step: number(simulation.fate.ejection_step, 0) })}
                {typeof simulation.fate.horizon_steps === 'number' ? (
                  <span className="ml-2 type-caption text-subtle">
                    {t('panel.horizonSteps', { steps: number(simulation.fate.horizon_steps, 0) })}
                  </span>
                ) : null}
              </Fact>
            ) : null}
            {simulation?.braid?.word ? (
              <Fact label={t('panel.braid')} wide>
                <code className="block type-hash text-muted-foreground">
                  {simulation.braid.word}
                </code>
                {typeof simulation.braid.crossings === 'number' ? (
                  <span className="mt-1 block type-caption text-subtle">
                    {t('panel.braidCrossings', { count: simulation.braid.crossings })}
                  </span>
                ) : null}
              </Fact>
            ) : null}
          </dl>
        </TabsContent>

        <TabsContent value="provenance" className="mt-6 space-y-2 sm:space-y-3">
          {rarity ? (
            <div className="flex flex-wrap items-center gap-2">
              <RarityRankChip rarity={rarity} total={rarityTotal} size="md" verbose />
            </div>
          ) : null}
          <TraitSheet
            entry={entry}
            facets={facets}
            total={rarityTotal}
            groups={['provenance']}
            hideHeadings
          />
          <dl className={TRAIT_GRID_CLASS}>
            {metadata.metadata_version ? (
              <Fact label={t('panel.metadataVersion')}>
                <span className="font-mono">{metadata.metadata_version}</span>
              </Fact>
            ) : null}
            {metadata.image_details ? (
              <Fact label={t('panel.image')} wide>
                <span className="mb-1 block type-caption text-subtle">
                  {metadata.image_details.width && metadata.image_details.height
                    ? t('panel.dimensions', {
                        width: metadata.image_details.width,
                        height: metadata.image_details.height,
                      })
                    : null}
                  {metadata.image_details.format
                    ? ` · ${metadata.image_details.format.toUpperCase()}`
                    : ''}
                </span>
                {metadata.image_details.sha256 ? (
                  <HashValue
                    value={metadata.image_details.sha256}
                    copyLabel={t('panel.copyHash')}
                    copiedLabel={t('panel.copied')}
                  />
                ) : null}
              </Fact>
            ) : null}
            {metadata.animation_details ? (
              <Fact label={t('panel.animation')} wide>
                <span className="mb-1 block type-caption text-subtle">
                  {metadata.animation_details.width && metadata.animation_details.height
                    ? t('panel.dimensions', {
                        width: metadata.animation_details.width,
                        height: metadata.animation_details.height,
                      })
                    : null}
                  {typeof metadata.animation_details.duration_seconds === 'number'
                    ? ` · ${t('panel.duration', { seconds: metadata.animation_details.duration_seconds })}`
                    : ''}
                  {metadata.animation_details.codec ? ` · ${metadata.animation_details.codec}` : ''}
                </span>
                {metadata.animation_details.sha256 ? (
                  <HashValue
                    value={metadata.animation_details.sha256}
                    copyLabel={t('panel.copyHash')}
                    copiedLabel={t('panel.copied')}
                  />
                ) : null}
              </Fact>
            ) : null}
          </dl>
        </TabsContent>

        {media ? (
          <TabsContent value="media" className="mt-6">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {media.web_image ? (
                <MediaLink
                  href={media.web_image}
                  label={t('panel.webImage')}
                  hint={t('panel.external')}
                />
              ) : null}
              {media.source_image ? (
                <MediaLink
                  href={media.source_image}
                  label={t('panel.sourceImage')}
                  hint={t('panel.external')}
                />
              ) : null}
              {media.hq_video ? (
                <MediaLink
                  href={media.hq_video}
                  label={t('panel.hqVideo')}
                  hint={t('panel.external')}
                />
              ) : null}
              {media.spectral_sweep ? (
                <MediaLink
                  href={media.spectral_sweep}
                  label={t('panel.spectralSweep')}
                  hint={t('panel.external')}
                />
              ) : null}
              {media.asset_manifest ? (
                <MediaLink
                  href={media.asset_manifest}
                  label={t('panel.assetManifest')}
                  hint={t('panel.external')}
                />
              ) : null}
              {media.trait_source ? (
                <MediaLink
                  href={media.trait_source}
                  label={t('panel.traitSource')}
                  hint={t('panel.external')}
                />
              ) : null}
            </div>
          </TabsContent>
        ) : null}
      </Tabs>
    );
  }

  return (
    <section className={className} data-testid="nft-trait-panel" aria-labelledby={headingId}>
      <h2 id={headingId} className="type-section text-foreground">
        {t('panel.title')}
      </h2>
      <p className="mt-2 mb-6 max-w-[var(--measure-lede)] type-body-sm text-muted-foreground">
        {t('panel.subtitle')}
      </p>
      {lead ? <div className="mb-8">{lead}</div> : null}
      {body}
    </section>
  );
}
