'use client';

import { ChevronDown, FileImage, Film, Link2, Share2 } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';

import { useClipboard } from '@/hooks/useClipboard';
import { useNotification } from '@/contexts/NotificationContext';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

import { inkViewHref, type InkView } from './inkLinks';

/** Share the exact view with its artwork context, or the published file alone. */
export function InkShareMenu({
  tokenId,
  view,
  mediaUrl,
}: {
  tokenId: number;
  view: InkView;
  mediaUrl: string;
}) {
  const locale = useLocale();
  const t = useTranslations('detail');
  const tCommon = useTranslations('common');
  const { copy } = useClipboard();
  const { setNotification } = useNotification();

  async function copyLink(url: string) {
    const copied = await copy(url);
    setNotification({
      text: copied ? tCommon('actions.copied') : t('share.copyFailed'),
      type: copied ? 'success' : 'error',
      visible: true,
    });
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="quiet" size="sm" className="group font-normal text-subtle">
          <Share2 aria-hidden />
          {t('share.trigger')}
          <ChevronDown
            aria-hidden
            className="transition-transform duration-[var(--duration-fast)] group-data-[state=open]:rotate-180"
          />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          onSelect={() =>
            void copyLink(new URL(inkViewHref(tokenId, locale, view), window.location.origin).href)
          }
        >
          <Link2 aria-hidden className="me-2 size-4 text-subtle" />
          {t('ink.shareView')}
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => void copyLink(mediaUrl)}>
          {view === 'image' ? (
            <FileImage aria-hidden className="me-2 size-4 text-subtle" />
          ) : (
            <Film aria-hidden className="me-2 size-4 text-subtle" />
          )}
          {t('ink.shareMedia')}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
