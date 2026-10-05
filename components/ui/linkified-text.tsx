'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowUpRight, Check, Copy, ShieldAlert } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { hostOfSafeHref, linkifyMessage } from '@/utils/linkify';
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

/** How long "Link copied" shows before the copy button returns (ms). */
const COPIED_MS = 2_000;

/**
 * Renders untrusted message text with http(s) URLs as clickable links.
 * Because gesture messages are permissionless on-chain content, clicking a
 * link first opens a confirmation dialog, and the link itself is a button
 * (no href) so the confirm step cannot be bypassed with middle/modified
 * clicks.
 *
 * The dialog leads with the site the link really opens, in its ASCII
 * (punycode) form: a lookalike host typed with Cyrillic or Greek letters
 * ("аpple.com") shows as `xn--pple-43d.com`, not as the brand it imitates.
 * The full address follows it.
 */
export function LinkifiedText({ text }: LinkifiedTextProps) {
  const t = useTranslations('common');
  const segments = useMemo(() => linkifyMessage(text), [text]);
  const [pendingUrl, setPendingUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const copiedTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingHost = pendingUrl ? hostOfSafeHref(pendingUrl) : null;

  useEffect(
    () => () => {
      if (copiedTimer.current) clearTimeout(copiedTimer.current);
    },
    [],
  );

  const closeDialog = () => {
    if (copiedTimer.current) clearTimeout(copiedTimer.current);
    setPendingUrl(null);
    setCopied(false);
  };

  const handleCopy = async () => {
    if (!pendingUrl) return;
    try {
      await navigator.clipboard.writeText(pendingUrl);
    } catch {
      // Clipboard access denied: the address stays selectable on screen.
      return;
    }
    setCopied(true);
    if (copiedTimer.current) clearTimeout(copiedTimer.current);
    copiedTimer.current = setTimeout(() => setCopied(false), COPIED_MS);
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
            className="inline break-all text-left align-baseline font-medium text-primary underline decoration-primary/40 underline-offset-2 transition-colors hover:decoration-primary"
          >
            {segment.value}
            <ArrowUpRight
              aria-hidden="true"
              className="ml-0.5 inline-block size-3.5 align-[-2px]"
            />
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
          <div className="space-y-2 rounded-control border border-rule-faint bg-surface-sunken p-3">
            {pendingHost && (
              <p className="flex flex-wrap items-baseline gap-x-2">
                <span className="type-label text-subtle">{t('externalLink.site')}</span>
                <span
                  data-testid="external-link-host"
                  className="type-body-md break-all font-mono font-semibold text-foreground"
                >
                  {pendingHost}
                </span>
              </p>
            )}
            <div className="flex items-start gap-2">
              <p
                data-testid="external-link-destination"
                className="type-body-sm min-w-0 flex-1 break-all font-mono text-muted-foreground"
              >
                {pendingUrl}
              </p>
              <button
                type="button"
                onClick={handleCopy}
                aria-label={copied ? t('externalLink.copied') : t('externalLink.copy')}
                className="relative inline-flex size-6 shrink-0 items-center justify-center rounded-control text-subtle transition-colors duration-[var(--duration-fast)] after:absolute after:left-1/2 after:top-1/2 after:size-11 after:-translate-x-1/2 after:-translate-y-1/2 after:content-[''] hover:bg-surface-raised hover:text-foreground"
              >
                {copied ? (
                  <Check aria-hidden="true" className="h-4 w-4 text-positive" />
                ) : (
                  <Copy aria-hidden="true" className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>
          <p className="type-caption text-muted-foreground">{t('externalLink.warning')}</p>
          <DialogFooter>
            <Button variant="outline" onClick={closeDialog}>
              {t('actions.cancel')}
            </Button>
            <Button onClick={handleOpen}>
              {t('externalLink.open')} <ArrowUpRight aria-hidden="true" className="size-4" />
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
