'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { useTranslations } from 'next-intl';
import { Check, Copy, WrapText } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { useClipboard } from '@/hooks/useClipboard';

const COPIED_FEEDBACK_MS = 2_000;

/**
 * The frame around a server-rendered source file (`SourceCode`): a toolbar
 * with the file's facts and links, a wrap toggle and a copy button, over a
 * scroll region that takes keyboard focus, so arrow keys and Page Up/Down
 * scroll the code, and that holds at most 70% of the viewport.
 */
export function SourceViewer({
  meta,
  links,
  regionLabel,
  children,
}: {
  /** The file's facts ("Rust · 535 lines"). */
  meta: ReactNode;
  /** Where else the file is published. */
  links?: ReactNode;
  /** The scroll region's accessible name. */
  regionLabel: string;
  /** The highlighted lines. */
  children: ReactNode;
}) {
  const t = useTranslations('code');
  const { copy } = useClipboard();
  const [wrap, setWrap] = useState(false);
  const [copied, setCopied] = useState(false);
  const regionRef = useRef<HTMLPreElement>(null);
  const resetTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (resetTimer.current) clearTimeout(resetTimer.current);
    },
    [],
  );

  const handleCopy = async () => {
    const region = regionRef.current;
    if (!region) return;
    // The code alone: each line's text, without the line numbers.
    const text = Array.from(region.querySelectorAll('[data-line-code]'))
      .map((line) => line.textContent ?? '')
      .join('\n');
    await copy(text);
    setCopied(true);
    if (resetTimer.current) clearTimeout(resetTimer.current);
    resetTimer.current = setTimeout(() => setCopied(false), COPIED_FEEDBACK_MS);
  };

  return (
    <div className="overflow-hidden rounded-surface border border-rule bg-surface-sunken">
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 border-b border-rule-faint bg-surface px-4 py-1.5">
        <p className="type-label text-muted-foreground">{meta}</p>
        <div className="-me-2 flex flex-wrap items-center gap-x-1">
          {links}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            aria-pressed={wrap}
            onClick={() => setWrap((value) => !value)}
          >
            <WrapText aria-hidden />
            {t('viewer.wrap')}
          </Button>
          <Button type="button" variant="ghost" size="sm" onClick={() => void handleCopy()}>
            {copied ? <Check aria-hidden className="text-positive" /> : <Copy aria-hidden />}
            {copied ? t('viewer.copied') : t('viewer.copy')}
          </Button>
          <span role="status" className="sr-only">
            {copied ? t('viewer.copied') : ''}
          </span>
        </div>
      </div>
      <pre
        ref={regionRef}
        // A focusable scroll region: keyboard users scroll the file with the arrow keys.
        tabIndex={0}
        role="region"
        aria-label={regionLabel}
        data-wrap={wrap}
        className="group/code max-h-[70vh] overflow-auto type-hash leading-[1.7] focus-visible:outline-offset-[-2px]"
      >
        {children}
      </pre>
    </div>
  );
}
