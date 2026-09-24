'use client';

import { useMemo, useEffect, useCallback, useId, useRef, type ReactNode } from 'react';
import { useTranslations } from 'next-intl';
import { getAddress, isAddress } from 'viem';

import { formatId, sameAddress } from '@/utils/format';
import { useCollectionTraits, useNftMetadata } from '@/hooks/useNftTraits';
import { normalizeTraitEntry, type CosmicSignatureMetadata } from '@/lib/nftMetadata';
import { useRouter } from '@/i18n/navigation';
import NameHistoryTable from '@/components/tables/NameHistoryTable';
import { TransferHistoryTable } from '@/components/tables/TransferHistoryTable';
import { useActiveWeb3React } from '@/hooks/web3';
import type { CSTTokenInfo, CSTTransferRecord } from '@/services/api';
import {
  useDashboardInfo,
  useCSTInfo,
  useNameHistory,
  useCTOwnershipTransfers,
} from '@/hooks/useApiQuery';
import { useMetaMaskWatchAsset } from '@/hooks/useMetaMaskWatchAsset';
import { useNow } from '@/hooks/useNow';
import { NftMarketplaceButton } from '@/components/common/NftMarketplaceButton';

import { NFTSeed } from './NFTMetadata';
import { NFTOwnerActions } from './NFTOwnerActions';
import { NFTDetailSkeleton } from './NFTDetailSkeleton';
import { NFTIdentity } from './NFTIdentity';
import { NFTNeighbourNav, neighbourIds } from './NFTNeighbourNav';
import { NFTShareMenu } from './NFTShareMenu';
import { SignatureViewer } from './SignatureViewer';
import { isRenderPending, signatureMedia, useSignatureAlt } from './signatureArt';
import { NftTraitPanel } from './traits/NftTraitPanel';

interface NFTDetailInfo extends CSTTokenInfo {
  WinnerAddr?: string;
  RecordType?: number;
  Staked?: boolean;
}

interface NFTTraitProps {
  tokenId: number;
  /**
   * Server-rendered metadata document (`null` when the media origin has none),
   * so the trait panel is in the first HTML paint. Omit to load on the client.
   */
  initialMetadata?: CosmicSignatureMetadata | null;
  /**
   * The token record the server already read, so the art and its wall label
   * are in the first HTML paint. It is as old as the page's last ISR
   * regeneration, so it is refreshed right after hydration. Omit to load it
   * on the client.
   */
  initialToken?: CSTTokenInfo | null;
}

/** Naming writes land before the indexer catches up, so the refetch is deferred. */
const NAME_REFETCH_DELAY_MS = 3000;

/**
 * The plate's rendered width: the art column beside the 16–22rem wall label
 * from `lg` (at most the 80rem container less the label), the full screen
 * width below.
 */
const PLATE_SIZES = '(min-width: 1280px) 880px, (min-width: 1024px) 62vw, 100vw';

/**
 * Focus inside any of these owns the arrow keys: fields, every focusable
 * control (the Still / In motion segments, buttons, links, scrollable
 * regions), composite widgets that move their own selection, and overlays.
 * The page walks the collection only from the page itself.
 */
const KEY_OWNING_SELECTOR = [
  'input',
  'textarea',
  'select',
  '[contenteditable]:not([contenteditable="false"])',
  'button',
  'a[href]',
  'summary',
  '[tabindex]:not([tabindex="-1"])',
  '[role="button"]',
  '[role="link"]',
  '[role="group"]',
  '[role="toolbar"]',
  '[role="tablist"]',
  '[role="radiogroup"]',
  '[role="menu"]',
  '[role="menubar"]',
  '[role="listbox"]',
  '[role="grid"]',
  '[role="tree"]',
  '[role="slider"]',
  '[role="dialog"]',
  '[role="region"]',
].join(',');

/** The animation (or anything else) fills the screen: arrows belong to it. */
function isFullscreen(): boolean {
  const doc = document as Document & { webkitFullscreenElement?: Element | null };
  return Boolean(doc.fullscreenElement ?? doc.webkitFullscreenElement);
}

/** Whether an arrow key press walks the collection. */
function isPageLevelArrow(event: KeyboardEvent): boolean {
  if (event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) {
    return false;
  }
  if (isFullscreen()) return false;
  const target = event.target;
  return !(target instanceof Element && target.closest(KEY_OWNING_SELECTOR));
}

/** A titled block below the hero. */
function DetailSection({
  title,
  children,
  testId,
}: {
  title: string;
  children: ReactNode;
  testId?: string;
}) {
  const headingId = useId();
  return (
    <section aria-labelledby={headingId} className="mt-16" data-testid={testId}>
      <h2 id={headingId} className="mb-6 type-section text-foreground">
        {title}
      </h2>
      {children}
    </section>
  );
}

/**
 * The NFT detail page: the Signature on its plate with the Still / In motion
 * viewer beside its wall label (name, number, traits, provenance ledger and
 * actions), then the seed, the trait panel, the owner's tools, and the name
 * and ownership histories.
 */
const NFTTrait = ({ tokenId, initialMetadata, initialToken }: NFTTraitProps) => {
  const t = useTranslations('detail');
  const tTraits = useTranslations('traits');
  const signatureAlt = useSignatureAlt();
  const titleId = useId();

  // The count only bounds the "next" link, so it need not poll on an art page.
  const { data: dashboard } = useDashboardInfo(undefined, { poll: false });
  const {
    data: nftRaw,
    isLoading: loadingNFT,
    refetch: refetchCSTInfo,
  } = useCSTInfo(tokenId, initialToken, { seedIsStale: true });
  const { data: nameHistory = [], refetch: refetchNameHistory } = useNameHistory(tokenId);
  const { data: transferHistoryRaw = [], refetch: refetchTransferHistory } =
    useCTOwnershipTransfers(tokenId);

  const nft = (nftRaw as NFTDetailInfo | null) ?? null;
  const transferHistory = transferHistoryRaw as (CSTTransferRecord & { TransferType?: number })[];

  const {
    data: metadata,
    isError: metadataError,
    refetch: refetchMetadata,
  } = useNftMetadata(tokenId, { initialData: initialMetadata });
  const traitEntry = useMemo(
    () => (metadata ? normalizeTraitEntry(metadata, tokenId) : null),
    [metadata, tokenId],
  );
  const { traits: collectionTraits } = useCollectionTraits();
  const rarity = collectionTraits?.rarity.byId.get(tokenId) ?? null;

  const media = useMemo(() => signatureMedia(nft?.Seed), [nft?.Seed]);
  // A token imprinted moments ago may not have its render published yet.
  const nowMs = useNow(60_000);
  const renderPending = isRenderPending(nft?.TimeStamp, nowMs);

  const router = useRouter();
  const { account } = useActiveWeb3React();
  const { isMetaMaskConnected, isAddingNft, addCosmicSignatureNft } = useMetaMaskWatchAsset();

  const nameRefetchTimers = useRef(new Set<ReturnType<typeof setTimeout>>());

  useEffect(
    () => () => {
      for (const timerId of nameRefetchTimers.current) clearTimeout(timerId);
      nameRefetchTimers.current.clear();
    },
    [],
  );

  /** Schedules the deferred refetch, cancelling it if the page unmounts first. */
  const scheduleNameRefetch = useCallback((task: () => void) => {
    const timers = nameRefetchTimers.current;
    const timerId = setTimeout(() => {
      timers.delete(timerId);
      task();
    }, NAME_REFETCH_DELAY_MS);
    timers.add(timerId);
  }, []);

  // The connected wallet, when it owns this token: the owner's tools appear.
  const owner =
    account && nft?.CurOwnerAddr && sameAddress(account, nft.CurOwnerAddr) && isAddress(account)
      ? getAddress(account)
      : null;
  const totalImprints = dashboard?.MainStats?.NumCSTokenMints ?? null;
  const { previous: previousId, next: nextId } = neighbourIds(tokenId, totalImprints);

  // The arrow keys walk the collection, as the labelled links do: no read
  // before navigating, and never while a control or full screen owns them.
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isPageLevelArrow(event)) return;
      if (event.key === 'ArrowLeft' && previousId !== null) router.push(`/detail/${previousId}`);
      if (event.key === 'ArrowRight' && nextId !== null) router.push(`/detail/${nextId}`);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [previousId, nextId, router]);

  if (!nft && loadingNFT) {
    return <NFTDetailSkeleton />;
  }

  // The name history is newest first; before it loads, the token record's name.
  const currentName =
    (nameHistory.length > 0 ? nameHistory[0]?.TokenName : nft?.TokenName)?.trim() || null;
  const id = formatId(tokenId);
  const subject = currentName ?? tTraits('quickView.title', { id });
  const alt = signatureAlt({ id, name: currentName, entry: traitEntry });

  return (
    <div className="site-container">
      <section
        aria-labelledby={titleId}
        className="grid items-start gap-x-10 gap-y-8 lg:grid-cols-[minmax(0,1fr)_minmax(16rem,20rem)] xl:grid-cols-[minmax(0,1fr)_minmax(18rem,22rem)] xl:gap-x-16"
        data-testid="hero-section"
      >
        <SignatureViewer
          media={media}
          alt={alt}
          subject={subject}
          tokenLabel={id}
          unavailableLabel={renderPending ? t('image.rendering') : t('image.artworkUnavailable')}
          sizes={PLATE_SIZES}
          navigation={<NFTNeighbourNav tokenId={tokenId} total={totalImprints} />}
          // Never taller than the screen leaves room for; full-bleed on phones.
          className="mx-auto w-full max-w-[max(20rem,calc((100svh_-_var(--header-height)_-_11rem)_*_var(--art-ratio)))] max-sm:-mx-[var(--gutter)] max-sm:w-auto max-sm:max-w-none"
          plateClassName="max-sm:rounded-none"
          controlsClassName="max-sm:px-[var(--gutter)]"
        />

        {/* The wall label, and for the owner their tools, beside the plate. */}
        <div className="flex min-w-0 flex-col gap-8 lg:sticky lg:top-[var(--sticky-offset)]">
          <NFTIdentity
            tokenId={tokenId}
            name={currentName}
            titleId={titleId}
            nft={nft}
            entry={traitEntry}
            rarity={rarity}
            rarityTotal={collectionTraits?.rarity.total ?? 0}
            actions={
              <>
                <NFTShareMenu imageUrl={media?.sourceImage} videoUrl={media?.video} />
                <NftMarketplaceButton
                  variant="card"
                  label={t('actions.buyOrSellNfts')}
                  className="h-11 border-input bg-transparent px-3 text-sm font-medium normal-case text-foreground hover:bg-surface sm:h-9"
                />
              </>
            }
          />
          {owner ? (
            <NFTOwnerActions
              tokenId={tokenId}
              owner={owner}
              currentName={currentName ?? ''}
              totalNamedTokens={dashboard?.MainStats?.TotalNamedTokens ?? null}
              showMetaMaskAction={isMetaMaskConnected}
              addingToMetaMask={isAddingNft}
              onAddToMetaMask={() => void addCosmicSignatureNft(tokenId)}
              onTransferred={() => Promise.all([refetchCSTInfo(), refetchTransferHistory()])}
              onRenamed={() =>
                scheduleNameRefetch(() => {
                  void Promise.all([refetchCSTInfo(), refetchNameHistory()]);
                })
              }
            />
          ) : null}
        </div>
      </section>

      {/* The traits and the seed they all derive from, verification data first. */}
      <section className="mt-16" data-testid="traits-section">
        <NftTraitPanel
          tokenId={tokenId}
          metadata={metadata}
          entry={traitEntry}
          isError={metadataError}
          onRetry={() => void refetchMetadata()}
          collectionTraits={collectionTraits}
          lead={<NFTSeed seed={nft?.Seed} headingLevel={3} />}
        />
      </section>

      {nameHistory.length > 0 && (
        <DetailSection title={t('sections.nameHistory')}>
          <NameHistoryTable list={nameHistory} />
        </DetailSection>
      )}

      {transferHistory.length > 0 && !transferHistory[0]?.TransferType && (
        <DetailSection title={t('sections.ownershipHistory')}>
          <TransferHistoryTable list={transferHistory} />
        </DetailSection>
      )}
    </div>
  );
};

export default NFTTrait;
