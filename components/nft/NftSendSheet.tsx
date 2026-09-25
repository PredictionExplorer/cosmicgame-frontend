'use client';

import { useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';

import { formatCount } from '@/utils/format';
import { ArtFrame } from '@/components/ui/art-frame';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';

import { CosmicSignatureNftTransferForm } from './CosmicSignatureNftTransferForm';
import { signatureCardSources } from './SignatureCard';

/** A Signature chosen to send: its number and the seed its plate is drawn from. */
export interface NftSendItem {
  tokenId: number;
  seed?: string | number | null;
}

export interface NftSendSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sourceAddress: string;
  /** The chosen Signatures, in the order they were chosen. */
  items: readonly NftSendItem[];
  /** After a batch: the ids that left the wallet. */
  onSent: (ids: number[]) => void;
  /** Every chosen Signature was sent. */
  onComplete: () => void;
  historyHref?: string;
}

/** Plates the sheet shows before it counts the rest ("+3"). */
const PLATES_SHOWN = 8;

/**
 * NftSendSheet — where the Signatures chosen on the My NFTs wall are sent
 * from: the chosen plates, small, so the owner sees what leaves, then the
 * recipient, the review and the one commit button
 * (`CosmicSignatureNftTransferForm`). While a batch runs the sheet cannot be
 * dismissed, so its progress and wallet prompts stay in view.
 */
export function NftSendSheet({
  open,
  onOpenChange,
  sourceAddress,
  items,
  onSent,
  onComplete,
  historyHref,
}: NftSendSheetProps) {
  const t = useTranslations('myPages.nftTransfer');
  const tDetail = useTranslations('detail');
  const locale = useLocale();
  const [busy, setBusy] = useState(false);
  const shown = items.slice(0, items.length > PLATES_SHOWN ? PLATES_SHOWN - 1 : PLATES_SHOWN);
  const rest = items.length - shown.length;

  return (
    <Sheet
      open={open}
      onOpenChange={(next) => {
        if (!next && busy) return;
        onOpenChange(next);
      }}
    >
      <SheetContent
        side="right"
        // The review states every number; the title says how many.
        aria-describedby={undefined}
        className="flex w-full flex-col gap-6 overflow-y-auto sm:max-w-md"
        onEscapeKeyDown={(event) => {
          if (busy) event.preventDefault();
        }}
        onInteractOutside={(event) => {
          if (busy) event.preventDefault();
        }}
        data-testid="nft-send-sheet"
      >
        <SheetHeader className="pe-10 text-start sm:text-start">
          <SheetTitle>{t('sendCount', { count: items.length })}</SheetTitle>
        </SheetHeader>

        {/* What leaves, as plates; the review below names each number. */}
        <ul aria-hidden className="grid grid-cols-4 gap-2" data-testid="nft-send-plates">
          {shown.map((item) => (
            <li key={item.tokenId}>
              <ArtFrame
                sources={signatureCardSources(item.seed)}
                alt=""
                sizes="6rem"
                density="compact"
                unavailableLabel={tDetail('image.artworkUnavailable')}
              />
            </li>
          ))}
          {rest > 0 ? (
            <li className="flex aspect-art items-center justify-center rounded-edge border border-rule-faint type-figure-sm text-subtle">
              +{formatCount(rest, locale)}
            </li>
          ) : null}
        </ul>

        <CosmicSignatureNftTransferForm
          sourceAddress={sourceAddress}
          tokenIds={items.map((item) => item.tokenId)}
          onSent={onSent}
          onComplete={onComplete}
          onBusyChange={setBusy}
          historyHref={historyHref}
        />
      </SheetContent>
    </Sheet>
  );
}
