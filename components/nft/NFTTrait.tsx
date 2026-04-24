'use client';

import 'yet-another-react-lightbox/styles.css';

import { useState, useMemo, useEffect, useCallback, type ChangeEvent } from 'react';
import { useRouter } from 'next/navigation';
import Lightbox from 'yet-another-react-lightbox';
import { usePublicClient } from 'wagmi';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, ChevronUp, ChevronDown, Expand, Trophy } from 'lucide-react';

import { formatId, getAssetsUrl, getOriginUrl } from '@/utils';

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
import useCosmicSignatureContract from '@/hooks/useCosmicSignatureContract';
import { useNotification } from '@/contexts/NotificationContext';
import type { CSTTokenInfo, CSTTransferRecord } from '@/services/api';
import {
  isUserRejection,
  getEthErrorMessage,
  reportError,
  WALLET_TRANSACTION_CANCELLED_MESSAGE,
} from '@/utils/errors';
import {
  useDashboardInfo,
  useCSTInfo,
  useNameHistory,
  useCTOwnershipTransfers,
} from '@/hooks/useApiQuery';
import { useClipboard } from '@/hooks/useClipboard';
import { GradientText } from '@/components/styled';
import VideoPlayerDialog from '@/components/common/VideoPlayerDialog';

import NFTImage from './NFTImage';
import NFTVideo from './NFTVideo';
import { NFTMetadata } from './NFTMetadata';
import { NFTOwnerActions } from './NFTOwnerActions';
import { NFTDetailSkeleton } from './NFTDetailSkeleton';
import { NFTBreadcrumb } from './NFTBreadcrumb';

interface NFTDetailInfo extends CSTTokenInfo {
  WinnerAddr?: string;
  RecordType?: number;
  Staked?: boolean;
}

interface NFTTraitProps {
  tokenId: number;
}

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

function getPrizeTypeConfig(recordType?: number) {
  switch (recordType) {
    case 1:
      return {
        label: 'Stellar Selection Recipient',
        className: 'bg-accent/20 text-accent border-accent/30',
      };
    case 2:
      return {
        label: 'Anchor Recipient',
        className: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
      };
    case 3:
      return {
        label: 'Cycle Recipient',
        className: 'bg-primary/20 text-primary border-primary/30',
      };
    case 4:
      return {
        label: 'Endurance Champion',
        className: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
      };
    default:
      return null;
  }
}

/** Full detail page for a Cosmic Signature NFT, showing metadata, image/video, naming, transfer, and ownership history. */
const NFTTrait = ({ tokenId }: NFTTraitProps) => {
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

  const image = useMemo(() => {
    if (!nft?.Seed) return '/images/qmark.png';
    return getAssetsUrl(`cosmicsignature/0x${nft.Seed}.png`);
  }, [nft]);

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
  const { copy } = useClipboard();

  const isOwner = account != null && account === nft?.CurOwnerAddr;
  const totalMints = dashboard?.MainStats?.NumCSTokenMints ?? 0;
  const canGoPrev = tokenId > 0;
  const canGoNext = totalMints > 0 && tokenId < totalMints - 1;

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
    const { ethereum } = window as Window & {
      ethereum?: { request: (args: { method: string; params: unknown[] }) => Promise<unknown> };
    };
    if (!ethereum) return;
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
    try {
      const hash = await nftContract.write.transferFrom?.([account, address, tokenId]);
      if (hash) await publicClient?.waitForTransactionReceipt({ hash });
      await Promise.all([refetchCSTInfo(), refetchTransferHistory()]);
      setAddress('');
    } catch (err) {
      if (isUserRejection(err)) {
        setNotification({
          text: WALLET_TRANSACTION_CANCELLED_MESSAGE,
          type: 'info',
          visible: true,
        });
      } else {
        setNotification({
          text: 'Please input a valid address for the token receiver!',
          type: 'error',
          visible: true,
        });
      }
    }
  };

  const handleSetTokenName = async () => {
    if (!nftContract) return;
    try {
      const hash = await nftContract.write.setNftName?.([tokenId, tokenName]);
      if (hash) await publicClient?.waitForTransactionReceipt({ hash });
      setTimeout(async () => {
        await Promise.all([refetchCSTInfo(), refetchNameHistory()]);
      }, 3000);
      setTokenName('');
      setNotification({
        text: 'The token name has been changed successfully!',
        type: 'success',
        visible: true,
      });
    } catch (err) {
      if (isUserRejection(err)) {
        setNotification({
          visible: true,
          type: 'info',
          text: WALLET_TRANSACTION_CANCELLED_MESSAGE,
        });
      } else {
        const msg = getEthErrorMessage(err, 'An error occurred while setting the token name.');
        setNotification({ visible: true, type: 'error', text: msg });
      }
    }
  };

  const handleClearName = async () => {
    if (!nftContract) return;
    try {
      const hash = await nftContract.write.setNftName?.([tokenId, '']);
      if (hash) await publicClient?.waitForTransactionReceipt({ hash });
      setTimeout(async () => {
        await Promise.all([refetchCSTInfo(), refetchNameHistory()]);
      }, 3000);
      setTokenName('');
      setNotification({
        text: 'The token name has been cleared successfully!',
        type: 'success',
        visible: true,
      });
    } catch (err) {
      if (isUserRejection(err)) {
        setNotification({
          visible: true,
          type: 'info',
          text: WALLET_TRANSACTION_CANCELLED_MESSAGE,
        });
      } else {
        const msg = getEthErrorMessage(err, 'An error occurred while clearing the token name.');
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
  const prizeConfig = getPrizeTypeConfig(nft?.RecordType);
  const stakingEligible = !nft?.Staked && !nft?.WasUnstaked;

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
              <NFTImage src={image} />
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
            <div className="mt-4 flex items-center gap-3">
              <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen}>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="text-xs">
                    Share
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
                    Copy Video Link
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => {
                      copy(getOriginUrl(image));
                      setMenuOpen(false);
                    }}
                  >
                    Copy Image Link
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => {
                      copy(window.location.href);
                      setMenuOpen(false);
                    }}
                  >
                    Copy Page Link
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <div className="flex gap-2 ml-auto">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePrev}
                  disabled={!canGoPrev}
                  aria-label="Previous token"
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleNext}
                  disabled={!canGoNext}
                  aria-label="Next token"
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
                Unnamed Token
              </h1>
            )}

            {/* Badges row */}
            <div className="flex flex-wrap items-center gap-2" data-testid="token-badges">
              <Badge variant="outline" className="font-mono text-xs">
                {formatId(tokenId)}
              </Badge>

              {prizeConfig && (
                <Badge className={`border text-xs ${prizeConfig.className}`}>
                  {prizeConfig.label}
                  <InfoTooltip
                    content={
                      nft?.RecordType === 3
                        ? `Received as the Cycle Recipient in Cycle #${nft?.RoundNum}`
                        : `Received as a ${prizeConfig.label}`
                    }
                    iconClassName="h-3 w-3 ml-1"
                  />
                </Badge>
              )}

              {stakingEligible ? (
                <Badge className="bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-xs">
                  Eligible for Anchoring
                  <InfoTooltip
                    content="This token has never been anchored and can receive distributions through the Anchor Distribution program."
                    iconClassName="h-3 w-3 ml-1"
                  />
                </Badge>
              ) : (
                <Badge className="bg-red-500/15 text-red-400 border border-red-500/30 text-xs">
                  Already Anchored
                  <InfoTooltip
                    content="This token has already been anchored and cannot be anchored again."
                    iconClassName="h-3 w-3 ml-1"
                  />
                </Badge>
              )}
            </div>

            {/* Round link */}
            {nft?.RoundNum != null && (
              <div className="mt-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => router.push(`/prize/${nft.RoundNum ?? 0}`)}
                  className="text-xs"
                >
                  <Trophy className="h-3.5 w-3.5 mr-1.5" />
                  View Cycle #{nft.RoundNum} Details
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

      {/* Video Preview */}
      <motion.section
        initial="hidden"
        animate="visible"
        variants={fadeUp}
        transition={{ duration: 0.5, delay: 0.35 }}
        className="print-motion-visible mt-12"
      >
        <NFTVideo image_thumb={image} onClick={() => handlePlay(video)} />
      </motion.section>

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
            onAddressChange={setAddress}
            onTokenNameChange={handleChangeName}
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
          <SectionDivider title="Name History" className="mb-6" />
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
          <SectionDivider title="Ownership History" className="mb-6" />
          <TransferHistoryTable list={transferHistory} />
        </motion.section>
      )}

      {/* Lightbox & Video Dialog */}
      <Lightbox open={imageOpen} close={() => setImageOpen(false)} slides={[{ src: image }]} />
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
            <DialogTitle>Confirm Transfer</DialogTitle>
            <DialogDescription>
              The destination account doesn&apos;t appear to have any transaction history. Are you
              sure you want to send the token to this address? Please double-check it.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={handleTransfer}>Yes, Transfer</Button>
            <Button variant="outline" onClick={handleCloseDialog}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default NFTTrait;
