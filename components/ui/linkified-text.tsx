'use client';

import { useMemo, useState } from 'react';
import { Check, Copy, ExternalLink, ShieldAlert } from 'lucide-react';

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
        <DialogContent className="max-w-md rounded-xl border-white/10">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ShieldAlert aria-hidden="true" className="h-5 w-5 shrink-0 text-amber-300" />
              Leaving Cosmic Signature
            </DialogTitle>
            <DialogDescription>
              This link comes from a participant message stored on-chain. It has not been reviewed
              or verified &mdash; check that the destination below is what you expect.
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-start gap-2 rounded-lg border border-white/[0.08] bg-white/[0.03] p-3">
            <p
              data-testid="external-link-destination"
              className="min-w-0 flex-1 break-all font-mono text-sm text-foreground/95"
            >
              {pendingUrl}
            </p>
            <button
              type="button"
              onClick={handleCopy}
              aria-label={copied ? 'Link copied' : 'Copy link'}
              className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-muted-foreground/60 transition-colors hover:bg-white/[0.06] hover:text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              {copied ? (
                <Check className="h-4 w-4 text-emerald-400" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </button>
          </div>
          <p className="text-xs text-muted-foreground">
            Never enter your wallet seed phrase or private keys on an external site.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={closeDialog}>
              Cancel
            </Button>
            <Button onClick={handleOpen}>
              Open Link <ExternalLink aria-hidden="true" className="h-4 w-4" />
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
