'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Lock, Tag } from 'lucide-react';

import { formatId, getAssetsUrl, convertTimestampToDateTime } from '@/utils';

import { cn } from '@/lib/utils';
import NFTImage from '@/components/nft/NFTImage';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

import type { ViewMode } from './GalleryViewToggle';

export interface GalleryNFTData {
  TokenId: number;
  Seed?: string | number;
  TokenName?: string;
  RoundNum?: number;
  Staked?: boolean;
  MintTimeStamp?: number;
}

interface GalleryNFTCardProps {
  nft: GalleryNFTData;
  index: number;
  variant: ViewMode;
}

function formatMintAge(timestamp: number): string {
  const seconds = Math.floor(Date.now() / 1000) - timestamp;
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ago`;
  const years = Math.floor(days / 365);
  return `${years}y ago`;
}

export function GalleryNFTCard({ nft, index, variant }: GalleryNFTCardProps) {
  const image = getAssetsUrl(`cosmicsignature/0x${nft.Seed ?? ''}.png`);
  const hasName = Boolean(nft.TokenName && nft.TokenName !== '');

  if (variant === 'list') {
    return <ListRow nft={nft} image={image} hasName={hasName} index={index} />;
  }

  return <GridCard nft={nft} image={image} hasName={hasName} index={index} />;
}

interface CardInnerProps {
  nft: GalleryNFTData;
  image: string;
  hasName: boolean;
  index: number;
}

function GridCard({ nft, image, hasName, index }: CardInnerProps) {
  return (
    <TooltipProvider delayDuration={300}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: Math.min(index * 0.04, 0.4), ease: 'easeOut' }}
        className="group relative rounded-xl border border-white/[0.06] bg-white/[0.02] overflow-hidden transition-all duration-300 hover:border-primary/30 hover:shadow-[0_0_24px_rgba(21,191,253,0.08)]"
      >
        <Link href={`/detail/${nft.TokenId}`} className="block">
          <div className="relative overflow-hidden">
            <div className="transition-transform duration-300 group-hover:scale-[1.03]">
              <NFTImage src={image} alt={`Cosmic Signature ${formatId(nft.TokenId)}`} />
            </div>
            {nft.RoundNum !== undefined && nft.RoundNum !== null && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="absolute top-2 left-2 inline-flex items-center rounded-md bg-black/60 backdrop-blur-sm px-2 py-0.5 text-[10px] font-medium text-white/80 border border-white/[0.08]">
                    R{nft.RoundNum}
                  </span>
                </TooltipTrigger>
                <TooltipContent side="right">
                  <p>Minted in game round {nft.RoundNum}</p>
                </TooltipContent>
              </Tooltip>
            )}
            <div className="absolute top-2 right-2 flex items-center gap-1">
              {nft.Staked && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="inline-flex items-center rounded-md bg-[#9C37FD]/20 backdrop-blur-sm px-1.5 py-0.5 border border-[#9C37FD]/30">
                      <Lock className="h-3 w-3 text-[#C77DFF]" />
                    </span>
                  </TooltipTrigger>
                  <TooltipContent side="left">
                    <p>Currently staked and earning rewards</p>
                  </TooltipContent>
                </Tooltip>
              )}
              {hasName && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="inline-flex items-center rounded-md bg-[#06AEEC]/20 backdrop-blur-sm px-1.5 py-0.5 border border-[#06AEEC]/30">
                      <Tag className="h-3 w-3 text-[#35C9FF]" />
                    </span>
                  </TooltipTrigger>
                  <TooltipContent side="left">
                    <p>This NFT has a custom name</p>
                  </TooltipContent>
                </Tooltip>
              )}
            </div>
          </div>
          <div className="p-3 space-y-1">
            <div className="flex items-center justify-between">
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="text-xs font-mono text-muted-foreground cursor-help">
                    {formatId(nft.TokenId)}
                  </span>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  <p>Unique sequential identifier for this COSMIC NFT</p>
                </TooltipContent>
              </Tooltip>
              {nft.MintTimeStamp && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="text-[10px] text-muted-foreground/60 cursor-help">
                      {formatMintAge(nft.MintTimeStamp)}
                    </span>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">
                    <p>Minted on {convertTimestampToDateTime(nft.MintTimeStamp)}</p>
                  </TooltipContent>
                </Tooltip>
              )}
            </div>
            {hasName && <p className="text-sm font-medium text-white truncate">{nft.TokenName}</p>}
          </div>
        </Link>
      </motion.div>
    </TooltipProvider>
  );
}

function ListRow({ nft, image, hasName, index }: CardInnerProps) {
  return (
    <TooltipProvider delayDuration={300}>
      <motion.div
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.25, delay: Math.min(index * 0.03, 0.3), ease: 'easeOut' }}
      >
        <Link
          href={`/detail/${nft.TokenId}`}
          className={cn(
            'flex items-center gap-4 rounded-xl border border-white/[0.06] bg-white/[0.02] p-3',
            'transition-all duration-200 hover:border-primary/30 hover:bg-white/[0.04] group',
          )}
        >
          <div className="h-14 w-24 shrink-0 rounded-lg overflow-hidden">
            <NFTImage
              src={image}
              alt={`Cosmic Signature ${formatId(nft.TokenId)}`}
              className="h-full w-full object-cover"
            />
          </div>
          <div className="flex flex-1 items-center gap-3 md:gap-6 min-w-0">
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="text-xs font-mono text-muted-foreground shrink-0 cursor-help">
                  {formatId(nft.TokenId)}
                </span>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <p>Unique sequential identifier for this COSMIC NFT</p>
              </TooltipContent>
            </Tooltip>
            {hasName ? (
              <span className="text-sm font-medium text-white truncate">{nft.TokenName}</span>
            ) : (
              <span className="text-sm text-muted-foreground/50 italic">Unnamed</span>
            )}
            <div className="hidden sm:flex items-center gap-1.5 ml-auto shrink-0">
              {nft.RoundNum !== undefined && nft.RoundNum !== null && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="inline-flex items-center rounded-md bg-white/[0.04] px-2 py-0.5 text-[10px] font-medium text-muted-foreground border border-white/[0.06] cursor-help">
                      R{nft.RoundNum}
                    </span>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">
                    <p>Minted in game round {nft.RoundNum}</p>
                  </TooltipContent>
                </Tooltip>
              )}
              {nft.Staked && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="inline-flex items-center rounded-md bg-[#9C37FD]/20 px-1.5 py-0.5 border border-[#9C37FD]/30">
                      <Lock className="h-3 w-3 text-[#C77DFF]" />
                    </span>
                  </TooltipTrigger>
                  <TooltipContent side="left">
                    <p>Currently staked and earning rewards</p>
                  </TooltipContent>
                </Tooltip>
              )}
              {hasName && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="inline-flex items-center rounded-md bg-[#06AEEC]/20 px-1.5 py-0.5 border border-[#06AEEC]/30">
                      <Tag className="h-3 w-3 text-[#35C9FF]" />
                    </span>
                  </TooltipTrigger>
                  <TooltipContent side="left">
                    <p>This NFT has a custom name</p>
                  </TooltipContent>
                </Tooltip>
              )}
            </div>
            {nft.MintTimeStamp && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="hidden md:block text-[10px] text-muted-foreground/60 shrink-0 cursor-help">
                    {formatMintAge(nft.MintTimeStamp)}
                  </span>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  <p>Minted on {convertTimestampToDateTime(nft.MintTimeStamp)}</p>
                </TooltipContent>
              </Tooltip>
            )}
          </div>
        </Link>
      </motion.div>
    </TooltipProvider>
  );
}
