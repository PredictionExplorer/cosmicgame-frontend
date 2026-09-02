'use client';

import 'yet-another-react-lightbox/styles.css';

import { useState, useMemo, useEffect, useCallback, useRef, type ChangeEvent } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import Lightbox from 'yet-another-react-lightbox';
import { usePublicClient } from 'wagmi';
import { isAddress } from 'viem';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, ChevronUp, ChevronDown, Expand, Trophy } from 'lucide-react';

import { formatId, getAssetsUrl, getOriginUrl, getWebImageUrl } from '@/utils';

import { useCollectionTraits, useNftMetadata } from '@/hooks/useNftTraits';
import { normalizeTraitEntry, type CosmicSignatureMetadata } from '@/lib/nftMetadata';
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { InfoTooltip } from '@/components/ui/info-tooltip';
import { SectionDivider } from '@/components/ui/section-divider';
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
import { useClipboard } from '@/hooks/useClipboard';
import { useMetaMaskWatchAsset } from '@/hooks/useMetaMaskWatchAsset';
import { GradientText } from '@/components/styled';
import VideoPlayerDialog from '@/components/common/VideoPlayerDialog';
import { NftMarketplaceButton } from '@/components/common/NftMarketplaceButton';

import NFTImage from './NFTImage';
import NFTVideo from './NFTVideo';
import { NFTMetadata } from './NFTMetadata';
import { NFTOwnerActions } from './NFTOwnerActions';
import { NFTDetailSkeleton } from './NFTDetailSkeleton';
import { NFTBreadcrumb } from './NFTBreadcrumb';
import { HueStrip, RarityRankChip, SpectralClassBadge } from './traits';
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
}

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

/** Naming writes land before the indexer catches up, so the refetch is deferred. */
const NAME_REFETCH_DELAY_MS = 3000;

function getAllocationTypeConfig(recordType?: number) {
  switch (recordType) {
    case 1:
      return {
        labelKey: 'badges.stellarSelectionRecipient',
        className: 'bg-accent/20 text-accent border-accent/30',
      } as const;
    case 2:
      return {
        labelKey: 'badges.anchorRecipient',
        className: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
      } as const;
    case 3:
      return {
        labelKey: 'badges.cycleRecipient',
        className: 'bg-primary/20 text-primary border-primary/30',
      } as const;
    case 4:
      return {
        labelKey: 'badges.enduranceChampion',
        className: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
      } as const;
    default:
      return null;
  }
}

/** Full detail page for a Cosmic Signature NFT, showing metadata, traits, image/video, naming, transfer, and ownership history. */
const NFTTrait = ({ tokenId, initialMetadata }: NFTTraitProps) => {
  const t = useTranslations('detail');
  const tCommon = useTranslations('common');
  const tToasts = useTranslations('toasts');
  const locale = useLocale();
  const [openDialog, setOpenDialog] = useState(false);
  const [openVideo, setOpenVideo] = useState(false);
  const [imageOpen, setImageOpen] = useState(false);
  const [videoPath, setVideoPath] = useState<string | null>(null);
  const [address, setAddress] = useState('');
  const [tokenName, setTokenName] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);

  const { data: dashboard, isLoading: loadingDashboard } = useDashboardInfo();
  const { data: nftRaw, isLoading: loadingNFT, refetch: refetchCSTInfo } = useCSTInfo(tokenId);
  const {
    data: nameHistory = [],
    isLoading: loadingNames,
    refetch: refetchNameHistory,
  } = useNameHistory(tokenId);
  const {
    data: transferHistoryRaw = [],
    isLoading: loadingTransfers,
    refetch: refetchTransferHistory,
  } = useCTOwnershipTransfers(tokenId);

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

  const image = useMemo(() => {
    if (!nft?.Seed) return '';
    return getAssetsUrl(`cosmicsignature/0x${nft.Seed}.png`);
  }, [nft]);

  // Same pixels as the PNG at a fraction of the bytes; the PNG stays the
  // fallback for tokens rendered before the WebP derivative existed.
  const heroImage = useMemo(() => (nft?.Seed ? getWebImageUrl(nft.Seed) : ''), [nft]);

  const video = useMemo(() => {
    if (!nft?.Seed) return '';
    return getAssetsUrl(`cosmicsignature/0x${nft.Seed}.mp4`);
  }, [nft]);

  const loading = loadingDashboard || loadingNFT || loadingNames || loadingTransfers;

  const router = useRouter();
  const nftContract = useCosmicSignatureContract();
  const { account } = useActiveWeb3React();
  const publicClient = usePublicClient();
  const { setNotification } = useNotification();
  const { ensureCorrectChain } = useRequireChain();
  const { copy } = useClipboard();
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
  const totalImprints = dashboard?.MainStats?.NumCSTokenMints ?? 0;
  const canGoPrev = tokenId > 0;
  const canGoNext = totalImprints > 0 && tokenId < totalImprints - 1;

  const handlePrev = useCallback(() => {
    if (canGoPrev) router.push(`/detail/${tokenId - 1}`);
  }, [canGoPrev, tokenId, router]);

  const handleNext = useCallback(async () => {
    if (!nftContract) return;
    const totalSupply = await nftContract.read.totalSupply?.();
    router.push(`/detail/${Math.min(tokenId + 1, Number(totalSupply ?? 0) - 1)}`);
  }, [nftContract, tokenId, router]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key === 'ArrowLeft' && canGoPrev) handlePrev();
      if (e.key === 'ArrowRight' && canGoNext) handleNext();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [canGoPrev, canGoNext, handlePrev, handleNext]);

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

  const handlePlay = (videoUrl: string) => {
    if (!videoUrl) return;
    setVideoPath(videoUrl);
    setOpenVideo(true);
  };

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

  if (loading) {
    return <NFTDetailSkeleton />;
  }

  const currentTokenName = nameHistory.length > 0 ? nameHistory[0]?.TokenName : undefined;
  const allocationConfig = getAllocationTypeConfig(nft?.RecordType);
  const anchoringEligible = !nft?.Staked && !nft?.WasUnstaked;

  return (
    <div className="container mx-auto px-4">
      {/* Breadcrumb */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={fadeUp}
        transition={{ duration: 0.4 }}
        className="print-motion-visible pb-6"
      >
        <NFTBreadcrumb tokenId={tokenId} tokenName={currentTokenName} />
      </motion.div>

      {/* Hero: Image + Token Identity */}
      <motion.section
        initial="hidden"
        animate="visible"
        variants={fadeUp}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="print-motion-visible"
        data-testid="hero-section"
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Image column */}
          <div>
            <div
              className="gradient-border-card rounded-xl overflow-hidden cursor-pointer transition-shadow duration-300 hover:shadow-[0_0_40px_rgba(21,191,253,0.15)]"
              onClick={() => setImageOpen(true)}
              data-testid="nft-image-container"
            >
              <NFTImage
                src={heroImage || image}
                fallbackSrc={heroImage ? image : undefined}
                terminalFallbackSrc={null}
                alt={t('image.defaultAlt')}
                priority
              />
              <HueStrip
                hues={traitEntry?.hues}
                size="sm"
                className="absolute inset-x-0 bottom-0 rounded-none"
              />
              <div className="absolute top-3 left-3">
                <Badge className="bg-black/50 backdrop-blur-sm text-white border-white/20 text-xs font-mono">
                  {formatId(tokenId)}
                </Badge>
              </div>
              <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                <Expand className="h-5 w-5 text-white/70" />
              </div>
            </div>

            {/* Actions bar below image */}
            {/* Wraps on phones: share, marketplace and the prev/next pair do
                not fit one 320px row once each control reaches its 44px touch
                target, and without wrapping the marketplace label spills out
                of its own button. */}
            <div className="mt-4 flex items-center gap-3 max-sm:flex-wrap">
              <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen}>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="text-xs">
                    {t('share.trigger')}
                    {menuOpen ? (
                      <ChevronUp className="ml-1 h-3.5 w-3.5" />
                    ) : (
                      <ChevronDown className="ml-1 h-3.5 w-3.5" />
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                  <DropdownMenuItem
                    onClick={() => {
                      copy(getOriginUrl(video));
                      setMenuOpen(false);
                    }}
                  >
                    {t('share.copyVideoLink')}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => {
                      copy(getOriginUrl(image));
                      setMenuOpen(false);
                    }}
                  >
                    {t('share.copyImageLink')}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => {
                      copy(window.location.href);
                      setMenuOpen(false);
                    }}
                  >
                    {t('share.copyPageLink')}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <NftMarketplaceButton variant="card" label={t('actions.buyOrSellNfts')} />

              <div className="flex gap-2 ml-auto">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePrev}
                  disabled={!canGoPrev}
                  aria-label={t('navigation.previousToken')}
                  // Icon-only, so `px-3` alone leaves it ~42px wide.
                  className="max-sm:min-w-11"
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleNext}
                  disabled={!canGoNext}
                  aria-label={t('navigation.nextToken')}
                  className="max-sm:min-w-11"
                >
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Token Identity column */}
          <div className="flex flex-col gap-4 pt-2" data-testid="token-identity">
            {/* Token name */}
            {currentTokenName ? (
              <h1 className="text-3xl md:text-4xl font-bold font-display tracking-tight">
                <GradientText>{currentTokenName}</GradientText>
              </h1>
            ) : (
              <h1 className="text-3xl md:text-4xl font-bold font-display tracking-tight text-muted-foreground/50">
                {t('hero.unnamedToken')}
              </h1>
            )}

            {/* Badges row */}
            <div className="flex flex-wrap items-center gap-2" data-testid="token-badges">
              <Badge variant="outline" className="font-mono text-xs">
                {formatId(tokenId)}
              </Badge>

              {allocationConfig && (
                <Badge className={`border text-xs ${allocationConfig.className}`}>
                  {t(allocationConfig.labelKey)}
                  <InfoTooltip
                    content={
                      nft?.RecordType === 3
                        ? t('badges.receivedAsCycleRecipient', { round: String(nft?.RoundNum) })
                        : t('badges.receivedAs', { label: t(allocationConfig.labelKey) })
                    }
                    iconClassName="h-3 w-3 ml-1"
                  />
                </Badge>
              )}

              {anchoringEligible ? (
                <Badge className="bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-xs">
                  {t('badges.eligibleForAnchoring')}
                  <InfoTooltip
                    content={t('badges.eligibleForAnchoringTooltip')}
                    iconClassName="h-3 w-3 ml-1"
                  />
                </Badge>
              ) : (
                <Badge className="bg-red-500/15 text-red-400 border border-red-500/30 text-xs">
                  {t('badges.alreadyAnchored')}
                  <InfoTooltip
                    content={t('badges.alreadyAnchoredTooltip')}
                    iconClassName="h-3 w-3 ml-1"
                  />
                </Badge>
              )}
            </div>

            {traitEntry?.hasArtTraits ? (
              <div className="flex flex-wrap items-center gap-2" data-testid="token-trait-badges">
                <SpectralClassBadge value={traitEntry.spectralClass} size="md" withLabel />
                <RarityRankChip
                  rarity={rarity}
                  total={collectionTraits?.rarity.total ?? 0}
                  size="md"
                  verbose
                />
              </div>
            ) : null}

            {/* Round link */}
            {nft?.RoundNum != null && (
              <div className="mt-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => router.push(`/allocation/${nft.RoundNum ?? 0}`)}
                  className="text-xs"
                >
                  <Trophy className="h-3.5 w-3.5 mr-1.5" />
                  {t('actions.viewCycleDetails', { round: nft.RoundNum })}
                </Button>
              </div>
            )}
          </div>
        </div>
      </motion.section>

      {/* Metadata Stat Cards */}
      <motion.section
        initial="hidden"
        animate="visible"
        variants={fadeUp}
        transition={{ duration: 0.5, delay: 0.25 }}
        className="print-motion-visible mt-12"
        data-testid="metadata-section"
      >
        <NFTMetadata nft={nft} />
      </motion.section>

      {/* Traits: composition, orbital physics, provenance, media */}
      <motion.section
        initial="hidden"
        animate="visible"
        variants={fadeUp}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="print-motion-visible mt-12"
        data-testid="traits-section"
      >
        <NftTraitPanel
          tokenId={tokenId}
          metadata={metadata}
          entry={traitEntry}
          isError={metadataError}
          onRetry={() => void refetchMetadata()}
          collectionTraits={collectionTraits}
        />
      </motion.section>

      {/* Video Preview */}
      {video ? (
        <motion.section
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          transition={{ duration: 0.5, delay: 0.35 }}
          className="print-motion-visible mt-12"
        >
          <NFTVideo image_thumb={image} onClick={() => handlePlay(video)} />
        </motion.section>
      ) : null}

      {/* Owner Actions */}
      {isOwner && (
        <motion.section
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          transition={{ duration: 0.5, delay: 0.45 }}
          className="print-motion-visible mt-12"
        >
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
        </motion.section>
      )}

      {/* Name History */}
      {nameHistory.length > 0 && (
        <motion.section
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="print-motion-visible mt-12"
        >
          <SectionDivider title={t('sections.nameHistory')} className="mb-6" />
          <NameHistoryTable list={nameHistory} />
        </motion.section>
      )}

      {/* Transfer History */}
      {transferHistory.length > 0 && !transferHistory[0]?.TransferType && (
        <motion.section
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          transition={{ duration: 0.5, delay: 0.55 }}
          className="print-motion-visible mt-12"
        >
          <SectionDivider title={t('sections.ownershipHistory')} className="mb-6" />
          <TransferHistoryTable list={transferHistory} />
        </motion.section>
      )}

      {/* Lightbox & Video Dialog */}
      {image ? (
        <Lightbox open={imageOpen} close={() => setImageOpen(false)} slides={[{ src: image }]} />
      ) : null}
      <VideoPlayerDialog
        open={openVideo}
        videoPath={videoPath}
        onClose={() => {
          setOpenVideo(false);
          setVideoPath(null);
        }}
      />

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
