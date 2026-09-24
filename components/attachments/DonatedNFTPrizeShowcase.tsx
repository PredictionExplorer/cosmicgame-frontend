'use client';

import type { ReactNode } from 'react';
import { formatUnits } from 'viem';
import { ArrowUpRight, ImageOff } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';

import { getExplorerUrl } from '@/utils';

import { formatAddress, formatNumber } from '@/utils/format';
import { AttachedAssetsIcon } from '@/lib/conceptIcons';
import { cn } from '@/lib/utils';
import type { AttachedNFT, DonatedERC20Token } from '@/services/api/types';
import NFTImage from '@/components/nft/NFTImage';
import { AddressChip } from '@/components/ui/address-chip';
import { Badge } from '@/components/ui/badge';
import { buttonVariants } from '@/components/ui/button';
import { ExplainedTerm } from '@/components/ui/explain-popover';
import { Surface } from '@/components/ui/surface';

import {
  buildOpenSeaAssetUrl,
  getAttachedNftTokenId,
  resolveAttachedNftExplorerLink,
  resolveAttachedNftLink,
} from './attachedNftLinks';
import { useAttachedNftMetadata } from './useAttachedNftMetadata';
import { useAttachedErc20Metadata } from './useAttachedErc20Metadata';
import { useNFTCollectionEstimate } from './useNFTCollectionEstimate';
import { TokenLogo } from './TokenLogo';

const MAX_NFT_PREVIEW = 4;
const MAX_ERC20_PREVIEW = 4;

type ShowcaseVariant = 'default' | 'rail';

/**
 * The frame every asset in the showcase hangs in: a landscape well the same
 * size for an NFT's art (on the black plate) and an ERC-20's logo, so a mixed
 * row lines up.
 */
const ASSET_FRAME_CLASS =
  'relative mx-auto flex aspect-[4/3] max-h-[420px] w-full max-w-3xl items-center justify-center overflow-hidden rounded-edge';

interface AttachedNFTAllocationShowcaseProps {
  nfts: AttachedNFT[];
  erc20Tokens?: DonatedERC20Token[];
  cycleNumber?: number;
  className?: string;
  variant?: ShowcaseVariant;
}

/**
 * The assets attached to a cycle's Signature Allocation: a header that says
 * what travels with the allocation and to whom, one hairline band of facts,
 * then up to four NFTs on black plates and four ERC-20 deposits, each with a
 * wall label (name, collection or token, number and contributor) and its
 * outbound links. `rail` stacks everything for a narrow column.
 */
export function AttachedNFTAllocationShowcase({
  nfts,
  erc20Tokens = [],
  cycleNumber,
  className,
  variant = 'default',
}: AttachedNFTAllocationShowcaseProps) {
  const t = useTranslations('currentCycle');

  if (nfts.length === 0 && erc20Tokens.length === 0) return null;

  const rail = variant === 'rail';
  const cycleLabel =
    cycleNumber ?? nfts[0]?.RoundNum ?? erc20Tokens[0]?.RoundNum ?? t('showcase.cycleFallback');
  const previewNfts = nfts.slice(0, MAX_NFT_PREVIEW);
  const previewErc20Tokens = erc20Tokens.slice(0, MAX_ERC20_PREVIEW);
  const totalPreviewCount = previewNfts.length + previewErc20Tokens.length;
  const allocationSummary =
    nfts.length > 0 && erc20Tokens.length > 0
      ? t('showcase.bonusReceipt.mixed', { nftCount: nfts.length, erc20Count: erc20Tokens.length })
      : nfts.length > 0
        ? t('showcase.bonusReceipt.nftOnly', { nftCount: nfts.length })
        : t('showcase.bonusReceipt.erc20Only', { erc20Count: erc20Tokens.length });
  const receiptDescription =
    nfts.length > 0 && erc20Tokens.length > 0
      ? t('showcase.description.mixed', {
          nftCount: nfts.length,
          erc20Count: erc20Tokens.length,
          cycle: cycleLabel,
        })
      : nfts.length > 0
        ? t('showcase.description.nftOnly', { nftCount: nfts.length, cycle: cycleLabel })
        : t('showcase.description.erc20Only', {
            erc20Count: erc20Tokens.length,
            cycle: cycleLabel,
          });
  const hiddenNftCount = nfts.length - previewNfts.length;
  const hiddenErc20Count = erc20Tokens.length - previewErc20Tokens.length;
  const remainderCopy =
    hiddenNftCount > 0 && hiddenErc20Count > 0
      ? t('showcase.remainder.mixed', { nftCount: hiddenNftCount, erc20Count: hiddenErc20Count })
      : hiddenNftCount > 0
        ? t('showcase.remainder.nftOnly', { nftCount: hiddenNftCount })
        : hiddenErc20Count > 0
          ? t('showcase.remainder.erc20Only', { erc20Count: hiddenErc20Count })
          : '';

  // One asset gets the featured layout (art beside its label at wide sizes);
  // a rail stacks; otherwise the grid follows the count so no row is ragged
  // when it need not be.
  const single = totalPreviewCount === 1;
  const gridClass = rail
    ? 'grid-cols-1'
    : single
      ? 'grid-cols-1'
      : totalPreviewCount === 2
        ? 'sm:grid-cols-2'
        : totalPreviewCount === 4
          ? 'sm:grid-cols-2 xl:grid-cols-4'
          : 'sm:grid-cols-2 lg:grid-cols-3';
  const layout: AssetLayout = single && !rail ? 'featured' : 'tile';

  return (
    <section
      data-testid="attached-nft-showcase"
      data-variant={variant}
      aria-labelledby="attached-nft-allocation-title"
      className={cn('print-motion-visible', rail ? 'my-0' : 'my-8', className)}
    >
      <Surface
        variant="outlined"
        padding="none"
        className={cn('p-5', rail ? 'sm:p-6' : 'sm:p-7 lg:p-8')}
      >
        <header className="max-w-3xl">
          <p className="flex items-center gap-2 type-eyebrow text-secondary">
            <AttachedAssetsIcon aria-hidden className="size-4" />
            {t('showcase.badge')}
          </p>
          <h2
            id="attached-nft-allocation-title"
            className={cn('mt-3 text-foreground', rail ? 'type-heading-3' : 'type-heading-2')}
          >
            {t('showcase.heading')}
          </h2>
          <p
            className={cn(
              'mt-3 max-w-[var(--measure-lede)] text-muted-foreground',
              rail ? 'type-body-sm' : 'type-body-md',
            )}
          >
            {receiptDescription}
          </p>
        </header>

        {/* What travels, in which cycle, to whom. (What is not shown here is
            counted under the assets.) */}
        <dl
          className={cn(
            'mt-6 grid grid-cols-2 gap-x-6 gap-y-4 border-y border-rule-faint py-4',
            !rail && 'sm:grid-cols-3',
          )}
        >
          <SummaryFact
            label={t('showcase.summary.assetsIncluded')}
            value={allocationSummary}
            className={cn('col-span-2', !rail && 'sm:col-span-1')}
          />
          <SummaryFact
            label={t('showcase.summary.cycle')}
            value={t('showcase.summary.cycleValue', { cycle: cycleLabel })}
          />
          <SummaryFact
            label={t('showcase.summary.recipientRule')}
            value={t('showcase.summary.recipientRuleValue')}
          />
        </dl>

        <div className={cn('mt-6 grid items-start gap-x-6 gap-y-10', gridClass)}>
          {previewNfts.map((nft, index) => (
            <AttachedNFTAllocationCard
              key={String(
                nft.RecordId ?? `${nft.TokenAddr}-${getAttachedNftTokenId(nft) ?? index}`,
              )}
              nft={nft}
              featured={index === 0}
              layout={layout}
            />
          ))}
          {previewErc20Tokens.map((token, index) => (
            <AttachedERC20AllocationCard
              key={String(token.EvtLogId ?? `${token.TokenAddr}-${token.RoundNum}-${index}`)}
              token={token}
              layout={layout}
            />
          ))}
        </div>

        {remainderCopy ? (
          <p className="mt-8 border-t border-rule-faint pt-4 type-body-sm text-muted-foreground">
            {remainderCopy}
          </p>
        ) : null}
      </Surface>
    </section>
  );
}

type AssetLayout = 'featured' | 'tile';

/** Display precision: up to 8 decimals below 1 (small balances), 4 above. */
function amountDigits(amount: number): number {
  return Math.abs(amount) < 1 && amount !== 0 ? 8 : 4;
}

function formatAttachedAmount(amount: number, locale: string): string {
  return formatNumber(amount, locale, { maximumFractionDigits: amountDigits(amount) });
}

function getAttachedErc20Amount(
  token: DonatedERC20Token,
  decimals: number,
  locale: string,
): string | null {
  if (typeof token.AmountDonatedEth === 'number' && Number.isFinite(token.AmountDonatedEth)) {
    return formatAttachedAmount(token.AmountDonatedEth, locale);
  }
  if (typeof token.AmountEth === 'number' && Number.isFinite(token.AmountEth)) {
    return formatAttachedAmount(token.AmountEth, locale);
  }

  const rawAmount =
    typeof token.Amount === 'string'
      ? token.Amount
      : typeof token.DonateClaimDiffEth === 'string'
        ? token.DonateClaimDiffEth
        : '';
  if (/^\d+$/.test(rawAmount)) {
    try {
      const amount = Number(formatUnits(BigInt(rawAmount), decimals));
      return Number.isFinite(amount) ? formatAttachedAmount(amount, locale) : null;
    } catch {
      return null;
    }
  }
  return null;
}

function SummaryFact({
  label,
  value,
  className,
}: {
  label: string;
  value: string;
  className?: string;
}) {
  return (
    <div className={cn('min-w-0', className)}>
      <dt className="type-caption text-subtle">{label}</dt>
      <dd className="mt-1 type-body-sm font-medium text-foreground [overflow-wrap:anywhere]">
        {value}
      </dd>
    </div>
  );
}

/** The featured layout puts the frame beside the label once the card is wide enough. */
function AssetLayoutGrid({ layout, children }: { layout: AssetLayout; children: ReactNode }) {
  return (
    <article className="@container min-w-0">
      <div
        className={cn(
          'grid min-w-0 gap-5',
          layout === 'featured' &&
            '@2xl:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] @2xl:items-center @2xl:gap-10',
        )}
      >
        {children}
      </div>
    </article>
  );
}

function AssetFacts({ children }: { children: ReactNode }) {
  return (
    <dl className="mt-4 grid grid-cols-2 gap-x-4 border-t border-rule-faint pt-3">{children}</dl>
  );
}

function AssetFact({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="min-w-0">
      <dt className="type-caption text-subtle">{label}</dt>
      {/* min-h-6 matches the address link's touch height, so both values share a baseline. */}
      <dd className="mt-0.5 flex min-h-6 min-w-0 items-center overflow-hidden whitespace-nowrap type-mono-sm text-foreground">
        {value}
      </dd>
    </div>
  );
}

function AssetAction({
  href,
  label,
  primary = false,
}: {
  href: string;
  label: string;
  primary?: boolean;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        buttonVariants({ variant: primary ? 'outline' : 'ghost', size: 'sm' }),
        'gap-1.5',
      )}
    >
      {label}
      <ArrowUpRight aria-hidden className="size-3.5 text-subtle" />
    </a>
  );
}

function AttachedNFTAllocationCard({
  nft,
  featured,
  layout,
}: {
  nft: AttachedNFT;
  featured: boolean;
  layout: AssetLayout;
}) {
  const t = useTranslations('currentCycle');
  const tStatistics = useTranslations('statistics');
  const locale = useLocale();
  const { data: metadata, isError } = useAttachedNftMetadata(nft.NFTTokenURI, {
    tokenAddr: nft.TokenAddr,
    tokenId: getAttachedNftTokenId(nft),
  });
  const tokenId = getAttachedNftTokenId(nft);
  const linkLabels = {
    viewNft: tStatistics('attachedNftLinks.viewNft'),
    viewOpenSea: tStatistics('attachedNftLinks.viewOpenSea'),
    viewContract: tStatistics('attachedNftLinks.viewContract'),
    detailsUnavailable: tStatistics('attachedNftLinks.detailsUnavailable'),
    contractUnavailable: tStatistics('attachedNftLinks.contractUnavailable'),
  };
  const primaryLink = resolveAttachedNftLink({ nft, metadata, labels: linkLabels });
  const primaryLabel =
    primaryLink.kind === 'project'
      ? t('showcase.nftCard.links.project')
      : primaryLink.kind === 'opensea'
        ? t('showcase.nftCard.links.opensea')
        : t('showcase.nftCard.links.explorer');
  const explorerLink = resolveAttachedNftExplorerLink(nft, linkLabels);
  const openSeaUrl = buildOpenSeaAssetUrl(nft.TokenAddr, tokenId);
  const { data: estimate } = useNFTCollectionEstimate({
    tokenAddr: nft.TokenAddr,
    tokenId,
    enabled: featured,
  });

  const title =
    metadata?.name ??
    (tokenId
      ? t('showcase.nftCard.fallbackTitle', { id: tokenId })
      : t('showcase.nftCard.fallbackTitleUnknown'));
  const subtitle =
    metadata?.collection_name ?? metadata?.platform ?? t('showcase.nftCard.fallbackSubtitle');
  const imageAlt = metadata?.name
    ? t('showcase.nftCard.imageAlt', { name: metadata.name })
    : t('showcase.nftCard.imageAltFallback');
  const frameClassName = cn(
    ASSET_FRAME_CLASS,
    'group/media bg-art-ground shadow-[var(--art-edge)] transition-shadow duration-[var(--duration-fast)]',
    primaryLink.href && 'hover:shadow-[var(--art-edge-active)]',
  );
  const image = (
    <NFTImage
      src={metadata?.image}
      fallbackSrc={metadata?.imageFallback}
      alt={imageAlt}
      priority={featured}
      sizes={
        layout === 'featured'
          ? '(min-width: 1024px) 40rem, 100vw'
          : '(min-width: 1280px) 20rem, (min-width: 640px) 50vw, 100vw'
      }
      className="h-full w-full bg-transparent object-contain"
    />
  );

  return (
    <AssetLayoutGrid layout={layout}>
      {primaryLink.href ? (
        <a
          href={primaryLink.href}
          target="_blank"
          rel="noopener noreferrer"
          className={frameClassName}
          aria-label={t('showcase.nftCard.mediaAria', { label: primaryLabel, title })}
          data-testid="nft-allocation-media"
        >
          {image}
        </a>
      ) : (
        <div className={frameClassName} data-testid="nft-allocation-media">
          {image}
        </div>
      )}

      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone="neutral" size="sm">
            {t('showcase.nftCard.badge')}
          </Badge>
          {estimate ? (
            <Badge tone="neutral" size="sm">
              {/* The estimate explains itself: its source and what it leaves out. */}
              <ExplainedTerm definition={t('showcase.nftCard.floorTooltip')}>
                {t('showcase.nftCard.floorEstimate', {
                  price: formatNumber(estimate.floorPriceEth, locale, { maximumFractionDigits: 3 }),
                  currency: estimate.currency,
                })}
              </ExplainedTerm>
            </Badge>
          ) : null}
        </div>

        <h3 className="mt-3 truncate type-title text-foreground">{title}</h3>
        <p className="mt-0.5 truncate type-caption text-subtle">{subtitle}</p>

        {isError ? (
          <p className="mt-3 flex items-center gap-2 type-caption text-subtle">
            <ImageOff aria-hidden className="size-3.5 shrink-0" />
            {t('showcase.nftCard.metadataUnavailable')}
          </p>
        ) : metadata?.description && layout === 'featured' ? (
          <p className="mt-3 line-clamp-3 type-body-sm text-muted-foreground">
            {metadata.description}
          </p>
        ) : null}

        <AssetFacts>
          <AssetFact
            label={t('showcase.facts.tokenId')}
            value={
              tokenId
                ? t('showcase.facts.tokenIdValue', { id: tokenId })
                : t('showcase.facts.unknown')
            }
          />
          <AssetFact
            label={t('showcase.facts.attachedBy')}
            value={
              nft.DonorAddr ? (
                <AddressChip address={nft.DonorAddr} variant="plain" showCopy={false} />
              ) : (
                t('showcase.facts.unknown')
              )
            }
          />
        </AssetFacts>

        <div className="mt-4 flex flex-wrap gap-1">
          {primaryLink.href ? (
            <AssetAction href={primaryLink.href} label={primaryLabel} primary />
          ) : null}
          {openSeaUrl && primaryLink.href !== openSeaUrl ? (
            <AssetAction href={openSeaUrl} label={t('showcase.nftCard.openSea')} />
          ) : null}
          {explorerLink.href ? (
            <AssetAction href={explorerLink.href} label={t('showcase.nftCard.explorer')} />
          ) : null}
        </div>
      </div>
    </AssetLayoutGrid>
  );
}

function AttachedERC20AllocationCard({
  token,
  layout,
}: {
  token: DonatedERC20Token;
  layout: AssetLayout;
}) {
  const t = useTranslations('currentCycle');
  const locale = useLocale();
  const { data: metadata } = useAttachedErc20Metadata(token.TokenAddr);
  const symbol = metadata?.symbol || t('showcase.erc20Card.symbolFallback');
  const amount =
    getAttachedErc20Amount(token, metadata?.decimals ?? 18, locale) ??
    t('showcase.erc20Card.unknownAmount');
  const tokenName = metadata?.name || t('showcase.erc20Card.nameFallback');
  const explorerHref = token.TokenAddr ? getExplorerUrl('token', token.TokenAddr) : '';
  const logoSource = metadata?.logoSource ?? t('showcase.erc20Card.logoSourceFallback');

  return (
    <AssetLayoutGrid layout={layout}>
      <TokenLogo
        logoURI={metadata?.logoURI}
        symbol={symbol}
        name={tokenName}
        className={cn(ASSET_FRAME_CLASS, 'bg-surface-sunken')}
      />

      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone="neutral" size="sm">
            <ExplainedTerm
              definition={
                metadata?.logoURI
                  ? t('showcase.erc20Card.badgeTooltipLogo', { source: logoSource })
                  : t('showcase.erc20Card.badgeTooltipDefault')
              }
            >
              {t('showcase.erc20Card.badge')}
            </ExplainedTerm>
          </Badge>
        </div>

        <h3
          className="mt-3 flex min-w-0 flex-wrap items-baseline gap-x-2"
          data-testid="erc20-attached-amount"
          aria-label={`${amount} ${symbol}`}
        >
          <span className="type-figure-lg tabular-nums text-foreground">{amount}</span>{' '}
          <span className="type-title text-muted-foreground">{symbol}</span>
        </h3>
        <p className="mt-0.5 truncate type-caption text-subtle">{tokenName}</p>

        <AssetFacts>
          <AssetFact
            label={t('showcase.facts.token')}
            value={
              explorerHref ? (
                <a
                  href={explorerHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="link-quiet"
                >
                  {formatAddress(token.TokenAddr)}
                </a>
              ) : (
                t('showcase.facts.unknown')
              )
            }
          />
          <AssetFact
            label={t('showcase.facts.attachedBy')}
            value={
              token.DonorAddr ? (
                <AddressChip address={token.DonorAddr} variant="plain" showCopy={false} />
              ) : (
                t('showcase.facts.unknown')
              )
            }
          />
        </AssetFacts>

        {explorerHref ? (
          <div className="mt-4 flex flex-wrap gap-1">
            <AssetAction
              href={explorerHref}
              label={t('showcase.erc20Card.viewToken', { symbol })}
              primary
            />
          </div>
        ) : null}
      </div>
    </AssetLayoutGrid>
  );
}
