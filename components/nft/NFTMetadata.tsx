'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Calendar, Trophy, Award, User, Copy, Check } from 'lucide-react';

import { getExplorerUrl, convertTimestampToDateTime, getRelativeTime } from '@/utils';

import { StatCard } from '@/components/ui/stat-card';
import { AddressChip } from '@/components/ui/address-chip';
import { InfoTooltip } from '@/components/ui/info-tooltip';
import { SectionDivider } from '@/components/ui/section-divider';

export interface NFTMetadataProps {
  nft: {
    TimeStamp?: number;
    TxHash?: string;
    WinnerAddr?: string;
    CurOwnerAddr?: string;
    Seed?: string | number;
    RecordType?: number;
    RoundNum?: number;
    Staked?: boolean;
    WasUnstaked?: boolean;
  } | null;
}

function SeedBlock({ seed }: { seed?: string | number }) {
  const [copied, setCopied] = useState(false);
  const seedStr = String(seed ?? '');

  const handleCopy = async () => {
    await navigator.clipboard.writeText(seedStr);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!seed) return null;

  return (
    <div className="flex items-center gap-3 rounded-lg border border-white/[0.06] bg-white/[0.02] px-4 py-3">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 mb-1">
          <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
            Seed
          </span>
          <InfoTooltip content="The unique random seed used to generate this token's artwork and traits." />
        </div>
        <p
          className="font-mono text-sm text-foreground break-all leading-relaxed"
          data-testid="seed-value"
        >
          {seedStr}
        </p>
      </div>
      <button
        onClick={handleCopy}
        className="shrink-0 rounded-md p-2 text-muted-foreground/50 hover:text-primary hover:bg-white/[0.04] transition-colors"
        aria-label="Copy seed"
        data-testid="copy-seed-button"
      >
        {copied ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
      </button>
    </div>
  );
}

export function NFTMetadata({ nft }: NFTMetadataProps) {
  const imprintedRelative = nft?.TimeStamp ? getRelativeTime(nft.TimeStamp) : undefined;
  const imprintedAbsolute = nft?.TimeStamp ? convertTimestampToDateTime(nft.TimeStamp) : undefined;
  const imprintedDisplay =
    imprintedRelative && imprintedAbsolute
      ? `${imprintedRelative} (${imprintedAbsolute})`
      : (imprintedAbsolute ?? '—');

  const roundDisplay =
    nft?.RoundNum != null ? (
      <Link
        href={`/allocation/${nft.RoundNum}`}
        className="text-inherit transition-colors no-underline print:!text-foreground hover:text-primary"
      >
        Round #{nft.RoundNum}
      </Link>
    ) : (
      '—'
    );

  const recipientDisplay = nft?.WinnerAddr ? <AddressChip address={nft.WinnerAddr} /> : '—';

  const ownerDisplay = nft?.CurOwnerAddr ? <AddressChip address={nft.CurOwnerAddr} /> : '—';

  return (
    <div data-testid="nft-metadata">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Imprinted"
          value={
            nft?.TimeStamp ? (
              <a
                href={getExplorerUrl('tx', nft.TxHash!)}
                target="_blank"
                rel="noopener noreferrer"
                className="text-inherit transition-colors no-underline print:!text-foreground hover:text-primary"
              >
                {imprintedDisplay}
              </a>
            ) : (
              '—'
            )
          }
          icon={<Calendar className="h-4 w-4" />}
          tooltip="When this token was imprinted on-chain. Click to view the transaction."
        />
        <StatCard
          label="Cycle"
          value={roundDisplay}
          icon={<Trophy className="h-4 w-4" />}
          tooltip="The Performance Cycle in which this token was allocated. Click to view cycle details."
        />
        <StatCard
          label="Recipient"
          value={recipientDisplay}
          icon={<Award className="h-4 w-4" />}
          tooltip="The address that originally received this token during the Performance Cycle."
        />
        <StatCard
          label="Owner"
          value={ownerDisplay}
          icon={<User className="h-4 w-4" />}
          tooltip="The current holder of this token. May differ from the recipient if the token was transferred."
        />
      </div>

      <SectionDivider className="my-6" />

      <SeedBlock seed={nft?.Seed} />
    </div>
  );
}
