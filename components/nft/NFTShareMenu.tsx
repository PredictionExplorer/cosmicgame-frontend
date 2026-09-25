'use client';

import { ChevronDown, Film, ImageIcon, Link2, Share2 } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { cn } from '@/lib/utils';
import { useClipboard } from '@/hooks/useClipboard';
import { useNotification } from '@/contexts/NotificationContext';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export interface NFTShareMenuProps {
  /** The artwork's full-size image, when published. */
  imageUrl?: string | null;
  /** The artwork's animation, when published. */
  videoUrl?: string | null;
  className?: string;
}

/**
 * NFTShareMenu — copy the page, image or animation link, with a short
 * "Copied" confirmation.
 */
export function NFTShareMenu({ imageUrl, videoUrl, className }: NFTShareMenuProps) {
  const t = useTranslations('detail');
  const tCommon = useTranslations('common');
  const { copy } = useClipboard();
  const { setNotification } = useNotification();

  const copyLink = async (url: string) => {
    // Confirm only a copy that happened (useClipboard resolves false when every route failed).
    if (!(await copy(url))) return;
    setNotification({ text: tCommon('actions.copied'), type: 'success', visible: true });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className={cn('group px-3 font-medium normal-case', className)}
        >
          <Share2 aria-hidden />
          {t('share.trigger')}
          <ChevronDown
            aria-hidden
            className="transition-transform duration-[var(--duration-fast)] group-data-[state=open]:rotate-180"
          />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        <DropdownMenuItem onSelect={() => void copyLink(window.location.href)}>
          <Link2 aria-hidden className="mr-2 size-4 text-subtle" />
          {t('share.copyPageLink')}
        </DropdownMenuItem>
        {imageUrl ? (
          <DropdownMenuItem onSelect={() => void copyLink(imageUrl)}>
            <ImageIcon aria-hidden className="mr-2 size-4 text-subtle" />
            {t('share.copyImageLink')}
          </DropdownMenuItem>
        ) : null}
        {videoUrl ? (
          <DropdownMenuItem onSelect={() => void copyLink(videoUrl)}>
            <Film aria-hidden className="mr-2 size-4 text-subtle" />
            {t('share.copyVideoLink')}
          </DropdownMenuItem>
        ) : null}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
