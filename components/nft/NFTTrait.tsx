import 'yet-another-react-lightbox/styles.css';

import { useState, useMemo, type ChangeEvent } from 'react';
import { useRouter } from 'next/navigation';
import Lightbox from 'yet-another-react-lightbox';
import { usePublicClient } from 'wagmi';
import { ArrowLeft, ArrowRight, ChevronUp, ChevronDown } from 'lucide-react';

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
import NameHistoryTable from '@/components/tables/NameHistoryTable';
import { TransferHistoryTable } from '@/components/tables/TransferHistoryTable';
import { useActiveWeb3React } from '@/hooks/web3';
import useCosmicSignatureContract from '@/hooks/useCosmicSignatureContract';
import { useNotification } from '@/contexts/NotificationContext';
import type { CSTTokenInfo, CSTTransferRecord } from '@/services/api';
import { isUserRejection, getEthErrorMessage, reportError } from '@/utils/errors';
import {
  useDashboardInfo,
  useCSTInfo,
  useNameHistory,
  useCTOwnershipTransfers,
} from '@/hooks/useApiQuery';
import { useClipboard } from '@/hooks/useClipboard';
import { StyledCard, SectionWrapper, NFTInfoWrapper } from '@/components/styled';
import VideoPlayerDialog from '@/components/common/VideoPlayerDialog';

import NFTImage from './NFTImage';
import NFTVideo from './NFTVideo';
import { NFTMetadata } from './NFTMetadata';
import { NFTOwnerActions } from './NFTOwnerActions';

interface NFTDetailInfo extends CSTTokenInfo {
  WinnerAddr?: string;
  RecordType?: number;
  Staked?: boolean;
}

interface NFTTraitProps {
  tokenId: number;
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

  const handlePlay = async (videoUrl: string) => {
    try {
      const res = await fetch(videoUrl, { method: 'HEAD' });
      if (res.ok) {
        setVideoPath(videoUrl);
        setOpenVideo(true);
      } else {
        setNotification({
          visible: true,
          type: 'info',
          text: 'Video is being generated, come back later!',
        });
      }
    } catch {
      setNotification({
        visible: true,
        type: 'info',
        text: 'Video is being generated, come back later!',
      });
    }
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
      if (!isUserRejection(err)) {
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
      if (!isUserRejection(err)) {
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
      if (!isUserRejection(err)) {
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

  const handlePrev = () => router.push(`/detail/${Math.max(tokenId - 1, 0)}`);

  const handleNext = async () => {
    if (!nftContract) return;
    const totalSupply = await nftContract.read.totalSupply?.();
    router.push(`/detail/${Math.min(tokenId + 1, Number(totalSupply ?? 0) - 1)}`);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4">
        <h6 className="text-lg font-medium text-foreground">Loading...</h6>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4">
      <SectionWrapper>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="mx-auto w-full max-w-lg">
            <StyledCard>
              <div className="cursor-pointer" onClick={() => setImageOpen(true)}>
                <NFTImage src={image} />
                <NFTInfoWrapper>
                  <p className="text-base text-white">{formatId(tokenId)}</p>
                </NFTInfoWrapper>
                {nameHistory.length > 0 && (
                  <NFTInfoWrapper className="w-[calc(100%-40px)]">
                    <p className="text-base text-white text-center">{nameHistory[0]?.TokenName}</p>
                  </NFTInfoWrapper>
                )}
              </div>
            </StyledCard>
            <div className="mt-4">
              <div className="grid grid-cols-2 gap-4">
                <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen}>
                  <DropdownMenuTrigger asChild>
                    <Button variant="text" className="w-full">
                      Copy link
                      {menuOpen ? (
                        <ChevronUp className="ml-1 h-4 w-4" />
                      ) : (
                        <ChevronDown className="ml-1 h-4 w-4" />
                      )}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="center">
                    <DropdownMenuItem
                      onClick={() => {
                        copy(getOriginUrl(video));
                        setMenuOpen(false);
                      }}
                    >
                      Video
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => {
                        copy(getOriginUrl(image));
                        setMenuOpen(false);
                      }}
                    >
                      Image
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => {
                        copy(window.location.href);
                        setMenuOpen(false);
                      }}
                    >
                      Detail Page
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <div className="grid grid-cols-2 gap-4">
                  <Button onClick={handlePrev} disabled={tokenId === 0}>
                    <ArrowLeft className="h-4 w-4 mr-1" />
                    Prev
                  </Button>
                  <Button
                    onClick={handleNext}
                    disabled={
                      dashboard != null && tokenId === dashboard.MainStats.NumCSTokenMints - 1
                    }
                  >
                    Next
                    <ArrowRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <div>
            <NFTMetadata nft={nft} />

            <div className="mt-12">
              <Button variant="outline" onClick={() => router.push(`/prize/${nft?.RoundNum ?? 0}`)}>
                View Round Details
              </Button>
            </div>

            {account === nft?.CurOwnerAddr && (
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
            )}
          </div>
        </div>

        {nameHistory.length !== 0 && (
          <div className="mt-10">
            <h6 className="text-lg font-medium mb-4 text-foreground">History of Name Changes</h6>
            <NameHistoryTable list={nameHistory} />
          </div>
        )}

        {transferHistory.length !== 0 && !transferHistory[0]?.TransferType && (
          <div className="mt-10">
            <h6 className="text-lg font-medium mb-4 text-foreground">
              History of Ownership Changes
            </h6>
            <TransferHistoryTable list={transferHistory} />
          </div>
        )}

        <div className="mt-20">
          <NFTVideo image_thumb={image} onClick={() => handlePlay(video)} />
        </div>

        <Lightbox open={imageOpen} close={() => setImageOpen(false)} slides={[{ src: image }]} />
        <VideoPlayerDialog
          open={openVideo}
          videoPath={videoPath}
          onClose={() => {
            setOpenVideo(false);
            setVideoPath(null);
          }}
        />
      </SectionWrapper>

      <Dialog open={openDialog} onOpenChange={(open) => !open && handleCloseDialog()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Are you sure you want to send the token to the destination address?
            </DialogTitle>
            <DialogDescription>
              The destination account doesn&apos;t exist. Please check the provided address.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={handleTransfer}>Yes</Button>
            <Button variant="outline" onClick={handleCloseDialog}>
              No
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default NFTTrait;
