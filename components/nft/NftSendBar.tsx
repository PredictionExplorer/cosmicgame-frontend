'use client';

import { ArrowRight } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';

import { formatCount } from '@/utils/format';
import { Button } from '@/components/ui/button';

export interface NftSendBarProps {
  /** How many Signatures are chosen. */
  selected: number;
  /** How many of the wallet's Signatures can be sent. */
  transferable: number;
  onSelectAll: () => void;
  onCancel: () => void;
  /** Opens the send sheet for the chosen Signatures. */
  onContinue: () => void;
}

/**
 * NftSendBar — the My NFTs wall's send mode, pinned to the bottom of the
 * screen while it lasts: how many are chosen of those that can be sent, a
 * way to choose them all or leave the mode, and the step to the recipient.
 * It floats over the page, so it takes the raised surface and the float
 * shadow; the page reserves its height under the wall.
 */
export function NftSendBar({
  selected,
  transferable,
  onSelectAll,
  onCancel,
  onContinue,
}: NftSendBarProps) {
  const t = useTranslations('myPages.nftTransfer');
  const tCommon = useTranslations('common');
  const locale = useLocale();

  return (
    <div
      role="region"
      aria-label={t('pickerTitle')}
      data-testid="nft-send-bar"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-rule bg-surface-raised pb-[env(safe-area-inset-bottom)] shadow-float"
    >
      <div className="site-container grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 gap-y-2 py-3 sm:flex sm:justify-between">
        <p role="status" className="type-body-sm tabular-nums text-muted-foreground">
          {t('pickerSummary', {
            selected: formatCount(selected, locale),
            total: formatCount(transferable, locale),
          })}
        </p>
        <Button type="button" variant="ghost" size="sm" onClick={onCancel} className="sm:hidden">
          {tCommon('actions.cancel')}
        </Button>
        <div className="col-span-2 flex items-center gap-2 max-sm:[&>*]:flex-1">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onCancel}
            className="max-sm:hidden"
          >
            {tCommon('actions.cancel')}
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={transferable === 0 || selected === transferable}
            onClick={onSelectAll}
          >
            {t('selectAll')}
          </Button>
          <Button type="button" size="sm" disabled={selected === 0} onClick={onContinue}>
            {selected > 0 ? t('sendCount', { count: selected }) : t('send')}
            <ArrowRight aria-hidden />
          </Button>
        </div>
      </div>
    </div>
  );
}
