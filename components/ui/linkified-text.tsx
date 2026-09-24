'use client';

import { useMemo, useState } from 'react';
import { Check, Copy, ExternalLink, ShieldAlert } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { linkifyMessage } from '@/utils/linkify';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface LinkifiedTextProps {
  /** Untrusted message text; http(s) URLs become confirm-gated external links. */
  text: string;
}

/**
 * Renders untrusted message text with http(s) URLs as clickable links.
 * Because gesture messages are permissionless on-chain content, clicking a
 * link first opens a confirmation dialog showing the full destination URL,
 * and the link itself is a button (no href) so the confirm step cannot be
 * bypassed with middle/modified clicks.
 */
export function LinkifiedText({ text }: LinkifiedTextProps) {
  const t = useTranslations('common');
  const segments = useMemo(() => linkifyMessage(text), [text]);
  const [pendingUrl, setPendingUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const closeDialog = () => {
    setPendingUrl(null);
    setCopied(false);
  };

  const handleCopy = async () => {
    if (!pendingUrl) return;
    await navigator.clipboard.writeText(pendingUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleOpen = () => {
    if (pendingUrl) window.open(pendingUrl, '_blank', 'noopener,noreferrer');
    closeDialog();
  };

  return (
    <>
      {segments.map((segment, index) =>
        segment.type === 'url' && segment.href ? (
          <button
            key={index}
            type="button"
            onClick={() => setPendingUrl(segment.href ?? null)}
            className="inline break-all text-left align-baseline font-medium text-primary underline decoration-primary/40 underline-offset-2 transition-colors hover:decoration-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            {segment.value}
            <ExternalLink aria-hidden="true" className="ml-1 inline-block h-3 w-3 align-[-1.5px]" />
          </button>
        ) : (
          <span key={index}>{segment.value}</span>
        ),
      )}

      <Dialog
        open={pendingUrl !== null}
        onOpenChange={(open) => {
          if (!open) closeDialog();
        }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ShieldAlert aria-hidden="true" className="h-5 w-5 shrink-0 text-attention" />
              {t('externalLink.title')}
            </DialogTitle>
            <DialogDescription>{t('externalLink.description')}</DialogDescription>
          </DialogHeader>
          <div className="flex items-start gap-2 rounded-control border border-rule-faint bg-surface-sunken p-3">
            <p
              data-testid="external-link-destination"
              className="min-w-0 flex-1 break-all font-mono text-sm text-foreground/95"
            >
              {pendingUrl}
            </p>
            <button
              type="button"
              onClick={handleCopy}
              aria-label={copied ? t('externalLink.copied') : t('externalLink.copy')}
              className="relative inline-flex size-6 shrink-0 items-center justify-center rounded-control text-subtle transition-colors duration-[var(--duration-fast)] after:absolute after:left-1/2 after:top-1/2 after:size-11 after:-translate-x-1/2 after:-translate-y-1/2 after:content-[''] hover:bg-surface-raised hover:text-foreground"
            >
              {copied ? <Check className="h-4 w-4 text-positive" /> : <Copy className="h-4 w-4" />}
            </button>
          </div>
          <p className="type-caption text-muted-foreground">{t('externalLink.warning')}</p>
          <DialogFooter>
            <Button variant="outline" onClick={closeDialog}>
              {t('actions.cancel')}
            </Button>
            <Button onClick={handleOpen}>
              {t('externalLink.open')} <ExternalLink aria-hidden="true" className="h-4 w-4" />
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
