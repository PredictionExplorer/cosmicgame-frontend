'use client';

import type { ReactNode } from 'react';
import { formatUnits } from 'viem';
import { ExternalLink, Gift, ImageOff, Sparkles } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { getExplorerUrl, shortenHex } from '@/utils';

import { Link } from '@/i18n/navigation';
import NFTImage from '@/components/nft/NFTImage';
import { InfoTooltip } from '@/components/ui/info-tooltip';
import { Surface } from '@/components/ui/surface';
import { cn } from '@/lib/utils';
import type { AttachedNFT, DonatedERC20Token } from '@/services/api/types';
import { formatFixed } from '@/utils/format';

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

type AssetTone = 'nft' | 'erc20';

const assetTones: Record<AssetTone, { card: string; media: string; chip: string }> = {
  nft: {
    card: 'bg-[linear-gradient(135deg,rgb(255_255_255/0.046),rgb(255_255_255/0.016)_50%,rgb(var(--nebula-violet-rgb)/0.075))]',
    media: 'shadow-[0_0_70px_-36px_rgb(var(--nebula-violet-rgb)/0.9)]',
    chip: 'border-[rgb(var(--nebula-violet-rgb)/0.24)] bg-[rgb(var(--nebula-violet-rgb)/0.10)] text-[rgb(var(--stellar-white-rgb))]',
  },
  erc20: {
    card: 'bg-[linear-gradient(135deg,rgb(var(--impact-green-rgb)/0.085),rgb(255_255_255/0.018)_54%,rgb(var(--aurora-cyan-rgb)/0.07))]',
    media: 'shadow-[0_0_70px_-36px_rgb(var(--impact-green-rgb)/0.9)]',
    chip: 'border-[rgb(var(--impact-green-rgb)/0.22)] bg-[rgb(var(--impact-green-rgb)/0.10)] text-[rgb(var(--impact-green-rgb))]',
  },
};

interface AttachedNFTAllocationShowcaseProps {
  nfts: AttachedNFT[];
  erc20Tokens?: DonatedERC20Token[];
  cycleNumber?: number;
  className?: string;
  variant?: 'default' | 'rail';
}

export function AttachedNFTAllocationShowcase({
  nfts,
  erc20Tokens = [],
  cycleNumber,
  className,
  variant = 'default',
}: AttachedNFTAllocationShowcaseProps) {
  const t = useTranslations('currentCycle');

  if (nfts.length === 0 && erc20Tokens.length === 0) return null;

  const cycleLabel =
    cycleNumber ?? nfts[0]?.RoundNum ?? erc20Tokens[0]?.RoundNum ?? t('showcase.cycleFallback');
  const previewNfts = nfts.slice(0, MAX_NFT_PREVIEW);
  const previewErc20Tokens = erc20Tokens.slice(0, MAX_ERC20_PREVIEW);
  const totalPreviewCount = previewNfts.length + previewErc20Tokens.length;
  const totalAssetCount = nfts.length + erc20Tokens.length;
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
  const previewCopy =
    totalPreviewCount >= totalAssetCount
      ? t('showcase.summary.previewAll')
      : t('showcase.summary.previewCount', { visible: totalPreviewCount, total: totalAssetCount });
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

  return (
    <section
      data-testid="attached-nft-showcase"
      data-variant={variant}
      aria-labelledby="attached-nft-allocation-title"
      className={cn('print-motion-visible', variant === 'rail' ? 'my-0' : 'my-8', className)}
    >
      <Surface variant="gradient-border-accent" radius="xl" padding="none" className="isolate">
        <div className="pointer-events-none absolute -left-20 top-10 h-52 w-52 rounded-full bg-[rgb(var(--solar-gold-rgb)/0.16)] blur-3xl" />
        <div className="pointer-events-none absolute -right-20 -top-16 h-64 w-64 rounded-full bg-primary/18 blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 left-1/2 h-32 w-3/5 -translate-x-1/2 bg-[radial-gradient(ellipse,rgb(var(--aurora-cyan-rgb)/0.14),transparent_68%)] blur-2xl" />

        <div className={cn('relative p-5', variant === 'rail' ? 'sm:p-6' : 'sm:p-7 lg:p-8')}>
          <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
            <div className="max-w-3xl">
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[rgb(var(--solar-gold-rgb)/0.22)] bg-[rgb(var(--solar-gold-rgb)/0.10)] px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-[rgb(var(--solar-gold-rgb))]">
                <Sparkles className="h-3.5 w-3.5" />
                {t('showcase.badge')}
              </div>
              <h2
                id="attached-nft-allocation-title"
                className={cn(
                  'font-display text-2xl font-bold tracking-tight text-white',
                  variant === 'default' && 'sm:text-3xl',
                )}
              >
                {t('showcase.heading')}
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
                {receiptDescription}
              </p>
            </div>

            <div className="flex items-center gap-2 rounded-2xl border border-white/[0.08] bg-white/[0.04] px-4 py-3 shadow-[0_18px_70px_-48px_rgb(var(--aurora-cyan-rgb)/0.9)]">
              <Gift className="h-5 w-5 text-primary" />
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  {t('showcase.bonusReceipt.label')}
                </p>
                <p className="text-sm font-bold text-white">{allocationSummary}</p>
              </div>
            </div>
          </div>

          <div
            className={cn(
              'mb-6 grid gap-2 sm:grid-cols-2',
              variant === 'default' ? 'lg:grid-cols-4' : 'xl:grid-cols-2 2xl:grid-cols-4',
            )}
          >
            <SummaryChip
              label={t('showcase.summary.assetsIncluded')}
              value={String(totalAssetCount)}
            />
            <SummaryChip
              label={t('showcase.summary.cycle')}
              value={t('showcase.summary.cycleValue', { cycle: cycleLabel })}
            />
            <SummaryChip label={t('showcase.summary.preview')} value={previewCopy} />
            <SummaryChip
              label={t('showcase.summary.recipientRule')}
              value={t('showcase.summary.recipientRuleValue')}
            />
          </div>

          <div
            className={cn(
              'grid items-start gap-4',
              totalPreviewCount === 1
                ? 'grid-cols-1'
                : variant === 'rail'
                  ? 'grid-cols-1'
                  : totalPreviewCount === 3 || totalPreviewCount > 4
                    ? 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3'
                    : 'grid-cols-1 md:grid-cols-2',
            )}
          >
            {previewNfts.map((nft, index) => (
              <AttachedNFTAllocationCard
                key={String(
                  nft.RecordId ?? `${nft.TokenAddr}-${getAttachedNftTokenId(nft) ?? index}`,
                )}
                nft={nft}
                featured={index === 0}
                variant={variant}
              />
            ))}
            {previewErc20Tokens.map((token, index) => (
              <AttachedERC20AllocationCard
                key={String(token.EvtLogId ?? `${token.TokenAddr}-${token.RoundNum}-${index}`)}
                token={token}
                variant={variant}
              />
            ))}
          </div>

          {remainderCopy ? (
            <p className="mt-4 rounded-xl border border-white/[0.06] bg-white/[0.03] px-4 py-3 text-sm text-muted-foreground">
              {remainderCopy}
            </p>
          ) : null}
        </div>
      </Surface>
    </section>
  );
}

function formatDisplayDecimal(value: string) {
  const [whole, fraction] = value.split('.');
  if (!fraction) return whole;
  const trimmedFraction = fraction.replace(/0+$/, '').slice(0, 8).replace(/0+$/, '');
  return trimmedFraction ? `${whole}.${trimmedFraction}` : whole;
}

function formatFiniteAmount(amount: number) {
  if (!Number.isFinite(amount)) return '0';
  const precision = Math.abs(amount) < 1 && amount !== 0 ? 8 : 4;
  return formatDisplayDecimal(amount.toFixed(precision));
}

function getAttachedErc20Amount(token: DonatedERC20Token, decimals: number, unknownLabel: string) {
  if (typeof token.AmountDonatedEth === 'number' && Number.isFinite(token.AmountDonatedEth)) {
    return formatFiniteAmount(token.AmountDonatedEth);
  }
  if (typeof token.AmountEth === 'number' && Number.isFinite(token.AmountEth)) {
    return formatFiniteAmount(token.AmountEth);
  }

  const rawAmount =
    typeof token.Amount === 'string'
      ? token.Amount
      : typeof token.DonateClaimDiffEth === 'string'
        ? token.DonateClaimDiffEth
        : '';
  if (/^\d+$/.test(rawAmount)) {
    try {
      return formatDisplayDecimal(formatUnits(BigInt(rawAmount), decimals));
    } catch {
      return unknownLabel;
    }
  }
  return unknownLabel;
}

function SummaryChip({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/[0.06] bg-white/[0.025] px-3 py-2.5">
      <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
        {label}
      </p>
      <p className="mt-1 truncate text-sm font-semibold text-white">{value}</p>
    </div>
  );
}

function AssetCardShell({ tone, children }: { tone: AssetTone; children: ReactNode }) {
  return (
    <article
      className={cn(
        '@container group relative min-w-0 overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.035] p-4 transition-all duration-300',
        'hover:-translate-y-0.5 hover:border-white/[0.14] hover:bg-white/[0.05]',
        'before:pointer-events-none before:absolute before:inset-x-5 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-white/30 before:to-transparent',
        assetTones[tone].card,
      )}
    >
      {children}
    </article>
  );
}

function AssetTypeBadge({
  tone,
  children,
  tooltip,
}: {
  tone: AssetTone;
  children: ReactNode;
  tooltip?: string;
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium',
        assetTones[tone].chip,
      )}
    >
      {children}
      {tooltip ? <InfoTooltip content={tooltip} /> : null}
    </span>
  );
}

function AttachedNFTAllocationCard({
  nft,
  featured,
  variant,
}: {
  nft: AttachedNFT;
  featured: boolean;
  variant: AttachedNFTAllocationShowcaseProps['variant'];
}) {
  const t = useTranslations('currentCycle');
  const tStatistics = useTranslations('statistics');
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
  const mediaClassName = cn(
    'group/media mx-auto flex aspect-[4/3] max-h-[420px] w-full max-w-3xl items-center justify-center overflow-hidden rounded-xl border border-white/[0.08] bg-black/25 p-2',
    assetTones.nft.media,
  );

  return (
    <AssetCardShell tone="nft">
      <div
        className={cn(
          'grid min-w-0 items-start gap-4',
          variant === 'default' && '@xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]',
        )}
      >
        <div>
          {primaryLink.href ? (
            <a
              href={primaryLink.href}
              target="_blank"
              rel="noopener noreferrer"
              className={mediaClassName}
              aria-label={t('showcase.nftCard.mediaAria', { label: primaryLabel, title })}
              data-testid="nft-allocation-media"
            >
              <NFTImage
                src={metadata?.image}
                fallbackSrc={metadata?.imageFallback}
                alt={imageAlt}
                priority={featured}
                sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 720px"
                className="max-h-[396px] transition-transform duration-500 group-hover/media:scale-[1.025]"
              />
            </a>
          ) : (
            <div className={mediaClassName} data-testid="nft-allocation-media">
              <NFTImage
                src={metadata?.image}
                fallbackSrc={metadata?.imageFallback}
                alt={imageAlt}
                priority={featured}
                sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 720px"
                className="max-h-[396px]"
              />
            </div>
          )}
        </div>

        <div className="flex min-w-0 flex-col justify-between gap-4">
          <div>
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <AssetTypeBadge tone="nft">{t('showcase.nftCard.badge')}</AssetTypeBadge>
              {estimate ? (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-[rgb(var(--solar-gold-rgb)/0.25)] bg-[rgb(var(--solar-gold-rgb)/0.10)] px-2.5 py-1 text-xs font-medium text-[rgb(var(--solar-gold-rgb))]">
                  {t('showcase.nftCard.floorEstimate', {
                    price: formatFixed(estimate.floorPriceEth, 3),
                    currency: estimate.currency,
                  })}
                  <InfoTooltip content={t('showcase.nftCard.floorTooltip')} />
                </span>
              ) : null}
            </div>

            <h3 className="truncate font-display text-xl font-bold tracking-tight text-white">
              {title}
            </h3>
            <p className="mt-1 truncate text-sm text-muted-foreground">{subtitle}</p>

            {isError ? (
              <p className="mt-3 inline-flex items-center gap-2 rounded-lg border border-white/[0.06] bg-white/[0.03] px-3 py-2 text-xs text-muted-foreground">
                <ImageOff className="h-3.5 w-3.5" />
                {t('showcase.nftCard.metadataUnavailable')}
              </p>
            ) : metadata?.description && featured ? (
              <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-muted-foreground">
                {metadata.description}
              </p>
            ) : null}
          </div>

          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2 text-xs">
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
                    <Link href={`/user/${nft.DonorAddr}`} className="hover:text-primary">
                      {shortenHex(nft.DonorAddr, 5)}
                    </Link>
                  ) : (
                    t('showcase.facts.unknown')
                  )
                }
              />
            </div>

            <div className="flex flex-wrap gap-2">
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
        </div>
      </div>
    </AssetCardShell>
  );
}

function AttachedERC20AllocationCard({
  token,
  variant,
}: {
  token: DonatedERC20Token;
  variant: AttachedNFTAllocationShowcaseProps['variant'];
}) {
  const t = useTranslations('currentCycle');
  const { data: metadata } = useAttachedErc20Metadata(token.TokenAddr);
  const symbol = metadata?.symbol || t('showcase.erc20Card.symbolFallback');
  const amount = getAttachedErc20Amount(
    token,
    metadata?.decimals ?? 18,
    t('showcase.erc20Card.unknownAmount'),
  );
  const tokenName = metadata?.name || t('showcase.erc20Card.nameFallback');
  const explorerHref = token.TokenAddr ? getExplorerUrl('token', token.TokenAddr) : '';
  const logoSource = metadata?.logoSource ?? t('showcase.erc20Card.logoSourceFallback');

  return (
    <AssetCardShell tone="erc20">
      <div
        className={cn(
          'grid min-w-0 items-start gap-4',
          variant === 'default' && '@xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]',
        )}
      >
        <TokenLogo
          logoURI={metadata?.logoURI}
          symbol={symbol}
          name={tokenName}
          className={assetTones.erc20.media}
        />

        <div className="flex min-w-0 flex-col justify-between gap-4">
          <div>
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <AssetTypeBadge
                tone="erc20"
                tooltip={
                  metadata?.logoURI
                    ? t('showcase.erc20Card.badgeTooltipLogo', { source: logoSource })
                    : t('showcase.erc20Card.badgeTooltipDefault')
                }
              >
                {t('showcase.erc20Card.badge')}
              </AssetTypeBadge>
            </div>

            <h3
              className="mt-4 inline-flex max-w-full items-baseline gap-2 rounded-2xl border border-[rgb(var(--impact-green-rgb)/0.24)] bg-[linear-gradient(135deg,rgb(var(--impact-green-rgb)/0.13),rgb(var(--aurora-cyan-rgb)/0.08))] px-4 py-3 shadow-[0_0_70px_-34px_rgb(var(--impact-green-rgb)/0.9)]"
              data-testid="erc20-attached-amount"
              aria-label={`${amount} ${symbol}`}
            >
              <span className="font-display text-3xl font-bold tracking-tight bg-gradient-to-r from-[rgb(var(--impact-green-rgb))] via-[rgb(var(--aurora-cyan-rgb))] to-primary bg-clip-text text-transparent sm:text-4xl">
                {amount}
              </span>{' '}
              <span className="text-base font-semibold text-white/85 sm:text-lg">{symbol}</span>
            </h3>
            <p className="mt-1 truncate text-sm text-muted-foreground">{tokenName}</p>
          </div>

          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2 text-xs">
              <AssetFact
                label={t('showcase.facts.token')}
                value={
                  explorerHref ? (
                    <a
                      href={explorerHref}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-primary"
                    >
                      {shortenHex(token.TokenAddr, 5)}
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
                    <Link href={`/user/${token.DonorAddr}`} className="hover:text-primary">
                      {shortenHex(token.DonorAddr, 5)}
                    </Link>
                  ) : (
                    t('showcase.facts.unknown')
                  )
                }
              />
            </div>

            <div className="flex flex-wrap gap-2">
              {explorerHref ? (
                <AssetAction
                  href={explorerHref}
                  label={t('showcase.erc20Card.viewToken', { symbol })}
                  primary
                />
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </AssetCardShell>
  );
}

function AssetFact({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-3 transition-colors group-hover:bg-white/[0.045]">
      <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
        {label}
      </p>
      <div className="mt-1 truncate font-mono text-xs text-white">{value}</div>
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
        'inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors',
        primary
          ? 'border-primary/30 bg-primary/12 text-primary hover:bg-primary/18'
          : 'border-white/[0.08] bg-white/[0.035] text-muted-foreground hover:border-primary/25 hover:text-primary',
      )}
    >
      {label}
      <ExternalLink className="h-3.5 w-3.5" />
    </a>
  );
}
