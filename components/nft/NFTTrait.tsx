'use client';

import {
  useState,
  useMemo,
  useEffect,
  useCallback,
  useId,
  useRef,
  type ChangeEvent,
  type ReactNode,
} from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { usePublicClient } from 'wagmi';
import { isAddress } from 'viem';

import { formatId } from '@/utils';

import { useCollectionTraits, useNftMetadata } from '@/hooks/useNftTraits';
import {
  normalizeTraitEntry,
  type CosmicSignatureMetadata,
  type TraitTranslator,
} from '@/lib/nftMetadata';
import { useRouter } from '@/i18n/navigation';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import NameHistoryTable from '@/components/tables/NameHistoryTable';
import { TransferHistoryTable } from '@/components/tables/TransferHistoryTable';
import { useActiveWeb3React } from '@/hooks/web3';
import { useRequireChain } from '@/hooks/useRequireChain';
import useCosmicSignatureContract from '@/hooks/useCosmicSignatureContract';
import { useNotification } from '@/contexts/NotificationContext';
import type { CSTTokenInfo, CSTTransferRecord } from '@/services/api';
import { isUserRejection, getEthErrorMessage, reportError } from '@/utils/errors';
import { assertSuccessfulTransactionReceipt, assertTransactionHash } from '@/utils/transactions';
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
import { composeSignatureAlt, isRenderPending, signatureMedia } from './signatureArt';
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
  const tCommon = useTranslations('common');
  const tToasts = useTranslations('toasts');
  const tTraits = useTranslations('traits');
  const locale = useLocale();
  const [openDialog, setOpenDialog] = useState(false);
  const [address, setAddress] = useState('');
  const [tokenName, setTokenName] = useState('');

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
  const nftContract = useCosmicSignatureContract();
  const { account } = useActiveWeb3React();
  const publicClient = usePublicClient();
  const { setNotification } = useNotification();
  const { ensureCorrectChain } = useRequireChain();
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

  const isOwner = account != null && account === nft?.CurOwnerAddr;
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

  const handleClickTransfer = async () => {
    if (!isAddress(address)) {
      setNotification({
        text: tToasts('transfer.common.invalidRecipient'),
        type: 'error',
        visible: true,
      });
      return;
    }
    const { ethereum } = window as Window & {
      ethereum?: { request: (args: { method: string; params: unknown[] }) => Promise<unknown> };
    };
    if (!ethereum) {
      setNotification({
        text: tToasts('wallet.notReady'),
        type: 'error',
        visible: true,
      });
      return;
    }
    try {
      const txCount = await ethereum.request({
        method: 'eth_getTransactionCount',
        params: [address, 'latest'],
      });
      if (Number(txCount) === 0) {
        setOpenDialog(true);
      } else {
        await handleTransfer();
      }
    } catch (err) {
      reportError(err, 'check transfer destination');
      setNotification({
        text: tToasts('transfer.nft.recipientCheckFailed'),
        type: 'error',
        visible: true,
      });
    }
  };

  const handleCloseDialog = () => setOpenDialog(false);

  const handleTransfer = async () => {
    handleCloseDialog();
    if (!nftContract || !account) return;
    if (!isAddress(address)) {
      setNotification({
        text: tToasts('transfer.common.invalidRecipient'),
        type: 'error',
        visible: true,
      });
      return;
    }
    if (!(await ensureCorrectChain())) return;
    try {
      const hash = await nftContract.write.transferFrom?.([account, address, tokenId]);
      assertTransactionHash(hash);
      const receipt = await publicClient?.waitForTransactionReceipt({ hash });
      assertSuccessfulTransactionReceipt(receipt);
      await Promise.all([refetchCSTInfo(), refetchTransferHistory()]);
      setAddress('');
      setNotification({
        text: tToasts('transfer.nft.detailTransferConfirmed'),
        type: 'success',
        visible: true,
      });
    } catch (err) {
      if (isUserRejection(err)) {
        setNotification({
          text: tToasts('walletTransactionCancelled'),
          type: 'info',
          visible: true,
        });
      } else {
        reportError(err, 'transfer Cosmic Signature NFT');
        setNotification({
          text: getEthErrorMessage(err, tToasts('transfer.nft.failed'), { locale }),
          type: 'error',
          visible: true,
        });
      }
    }
  };

  const handleSetTokenName = async () => {
    if (!nftContract) return;
    if (!(await ensureCorrectChain())) return;
    try {
      const hash = await nftContract.write.setNftName?.([tokenId, tokenName]);
      assertTransactionHash(hash);
      const receipt = await publicClient?.waitForTransactionReceipt({ hash });
      assertSuccessfulTransactionReceipt(receipt);
      scheduleNameRefetch(() => {
        void Promise.all([refetchCSTInfo(), refetchNameHistory()]);
      });
      setTokenName('');
      setNotification({
        text: tToasts('transfer.nft.nameSet'),
        type: 'success',
        visible: true,
      });
    } catch (err) {
      if (isUserRejection(err)) {
        setNotification({
          visible: true,
          type: 'info',
          text: tToasts('walletTransactionCancelled'),
        });
      } else {
        reportError(err, 'set Cosmic Signature NFT name');
        const msg = getEthErrorMessage(err, tToasts('transfer.nft.nameSetFailed'), { locale });
        setNotification({ visible: true, type: 'error', text: msg });
      }
    }
  };

  const handleClearName = async () => {
    if (!nftContract) return;
    if (!(await ensureCorrectChain())) return;
    try {
      const hash = await nftContract.write.setNftName?.([tokenId, '']);
      assertTransactionHash(hash);
      const receipt = await publicClient?.waitForTransactionReceipt({ hash });
      assertSuccessfulTransactionReceipt(receipt);
      scheduleNameRefetch(() => {
        void Promise.all([refetchCSTInfo(), refetchNameHistory()]);
      });
      setTokenName('');
      setNotification({
        text: tToasts('transfer.nft.nameCleared'),
        type: 'success',
        visible: true,
      });
    } catch (err) {
      if (isUserRejection(err)) {
        setNotification({
          visible: true,
          type: 'info',
          text: tToasts('walletTransactionCancelled'),
        });
      } else {
        reportError(err, 'clear Cosmic Signature NFT name');
        const msg = getEthErrorMessage(err, tToasts('transfer.nft.nameClearFailed'), { locale });
        setNotification({ visible: true, type: 'error', text: msg });
      }
    }
  };

  const handleChangeName = (e: ChangeEvent<HTMLInputElement>) => {
    const inputName = e.target.value;
    let len = 0;
    let i;
    for (i = 0; i < inputName.length; i++) {
      if (inputName.charCodeAt(i) > 255) {
        len += 3;
      } else {
        len++;
      }
      if (len > 32) {
        i--;
        break;
      }
    }
    setTokenName(inputName.slice(0, i));
  };

  if (!nft && loadingNFT) {
    return <NFTDetailSkeleton />;
  }

  // The name history is newest first; before it loads, the token record's name.
  const currentName =
    (nameHistory.length > 0 ? nameHistory[0]?.TokenName : nft?.TokenName)?.trim() || null;
  const id = formatId(tokenId);
  const subject = currentName ?? tTraits('quickView.title', { id });
  const alt = composeSignatureAlt(tTraits as unknown as TraitTranslator, {
    id,
    name: currentName,
    entry: traitEntry,
  });

  return (
    <div className="site-container">
      <section
        aria-label={subject}
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
          className="mx-auto w-full max-w-[max(20rem,calc((100svh_-_var(--header-height)_-_11rem)_*_3456_/_2234))] max-sm:-mx-[var(--gutter)] max-sm:w-auto max-sm:max-w-none"
          plateClassName="max-sm:rounded-none"
          controlsClassName="max-sm:px-[var(--gutter)]"
        />

        <NFTIdentity
          tokenId={tokenId}
          name={currentName}
          nft={nft}
          entry={traitEntry}
          rarity={rarity}
          rarityTotal={collectionTraits?.rarity.total ?? 0}
          className="lg:sticky lg:top-[var(--sticky-offset)]"
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

      {isOwner && (
        <section className="mt-16">
          <NFTOwnerActions
            address={address}
            tokenName={tokenName}
            nftTokenName={nft?.TokenName ?? ''}
            nameHistoryCount={nameHistory.length}
            currentName={nameHistory[0]?.TokenName ?? ''}
            totalNamedTokens={dashboard?.MainStats.TotalNamedTokens ?? 0}
            disabled={!address || address === account}
            showMetaMaskAction={isMetaMaskConnected}
            addingToMetaMask={isAddingNft}
            onAddressChange={setAddress}
            onTokenNameChange={handleChangeName}
            onAddToMetaMask={() => void addCosmicSignatureNft(tokenId)}
            onTransfer={handleClickTransfer}
            onSetName={handleSetTokenName}
            onClearName={handleClearName}
          />
        </section>
      )}

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

      {/* Transfer confirmation dialog */}
      <Dialog open={openDialog} onOpenChange={(open) => !open && handleCloseDialog()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('transferDialog.title')}</DialogTitle>
            <DialogDescription>{t('transferDialog.description')}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={handleTransfer}>{t('transferDialog.confirm')}</Button>
            <Button variant="outline" onClick={handleCloseDialog}>
              {tCommon('actions.cancel')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default NFTTrait;
