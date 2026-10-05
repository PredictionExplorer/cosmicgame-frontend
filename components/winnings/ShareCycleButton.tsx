'use client';

import { Link2, Share2 } from 'lucide-react';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';

import { Button } from '@/components/ui/button';
import { useClipboard } from '@/hooks/useClipboard';
import { useHydrated } from '@/hooks/useHydrated';

function canShareNatively(): boolean {
  return typeof navigator !== 'undefined' && typeof navigator.share === 'function';
}

interface ShareCycleButtonProps {
  /** The shared page's title ("Cycle 1"). */
  title: string;
  /** A short summary for the share sheet; the link travels with it. */
  text: string;
}

/**
 * Shares a cycle's record: the system share sheet where the browser has one
 * (phones, Safari, most Chromium desktops), with a short summary and the
 * page's link. Where it has none the button says "Copy link" and copies the
 * link alone, confirming only a copy that happened. The label settles after
 * hydration, since only the browser knows which it can do.
 */
export function ShareCycleButton({ title, text }: ShareCycleButtonProps) {
  const t = useTranslations('allocation');
  const { copy } = useClipboard();
  const hydrated = useHydrated();
  const copyOnly = hydrated && !canShareNatively();

  const share = async () => {
    const url = window.location.href;
    if (canShareNatively()) {
      try {
        await navigator.share({ title, text, url });
        return;
      } catch (error) {
        // The reader closed the sheet: nothing to confirm, nothing to fall back to.
        if (error instanceof DOMException && error.name === 'AbortError') return;
      }
    }
    if (await copy(url)) toast.success(t('details.share.linkCopied'));
    else toast.error(t('details.share.failed'));
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() => void share()}
      aria-label={copyOnly ? undefined : t('details.hero.shareAria')}
      data-testid="share-round-button"
    >
      {copyOnly ? (
        <Link2 aria-hidden className="size-4" />
      ) : (
        <Share2 aria-hidden className="size-4" />
      )}
      {copyOnly ? t('details.share.copyLink') : t('details.hero.share')}
    </Button>
  );
}
