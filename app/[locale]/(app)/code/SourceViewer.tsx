'use client';

import { useRef, useState, type ReactNode } from 'react';
import { useTranslations } from 'next-intl';
import { Check, Copy, WrapText } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { useCopyFeedback } from '@/hooks/useCopyFeedback';
import { useMediaQuery } from '@/hooks/useMediaQuery';

/**
 * Below `sm` (40rem), where lines wrap unless the reader turns wrapping off.
 * `false` on the server and without `matchMedia`, where CSS decides.
 */
const PHONE_QUERY = '(max-width: 39.999rem)';

/**
 * The frame around a server-rendered source file (`SourceCode`): a toolbar
 * with the file's facts, a wrap toggle and a copy button (icons alone on
 * phones, so the bar stays one row), over a scroll region that takes
 * keyboard focus, so arrow keys and Page Up/Down scroll the code, and that
 * holds at most 70% of the viewport. Lines wrap on phones until the reader
 * chooses otherwise (in CSS first, so the server HTML already wraps), and
 * scroll sideways from `sm`.
 */
export function SourceViewer({
  meta,
  regionLabel,
  children,
}: {
  /** The file's facts ("Rust · 535 lines"). */
  meta: ReactNode;
  /** The scroll region's accessible name. */
  regionLabel: string;
  /** The highlighted lines. */
  children: ReactNode;
}) {
  const t = useTranslations('code');
  const { copied, copy } = useCopyFeedback();
  // `null`: the reader has not chosen, so phones wrap and wider screens scroll.
  const [wrapChoice, setWrapChoice] = useState<boolean | null>(null);
  const phone = useMediaQuery(PHONE_QUERY);
  const wrap = wrapChoice ?? phone;
  const regionRef = useRef<HTMLPreElement>(null);

  const handleCopy = async () => {
    const region = regionRef.current;
    if (!region) return;
    // The code alone: each line's text, without the line numbers.
    const text = Array.from(region.querySelectorAll('[data-line-code]'))
      .map((line) => line.textContent ?? '')
      .join('\n');
    await copy(text);
  };

  return (
    <div className="overflow-hidden rounded-surface border border-rule bg-surface-sunken">
      <div className="flex items-center justify-between gap-x-4 border-b border-rule-faint bg-surface py-1.5 ps-4 pe-2">
        <p className="min-w-0 truncate type-label text-muted-foreground">{meta}</p>
        <div className="flex shrink-0 items-center gap-x-1">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            aria-pressed={wrap}
            aria-label={t('viewer.wrap')}
            onClick={() => setWrapChoice(!wrap)}
            // Icon alone on phones: a 44px square.
            className="max-sm:min-w-11"
          >
            <WrapText aria-hidden />
            <span aria-hidden className="max-sm:hidden">
              {t('viewer.wrap')}
            </span>
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            aria-label={t('viewer.copy')}
            onClick={() => void handleCopy()}
            className="max-sm:min-w-11"
          >
            {copied ? <Check aria-hidden className="text-positive" /> : <Copy aria-hidden />}
            <span aria-hidden className="max-sm:hidden">
              {copied ? t('viewer.copied') : t('viewer.copy')}
            </span>
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
        data-wrap={wrapChoice === null ? 'auto' : wrapChoice}
        // Every character as written: no programming ligatures (`->` stays two
        // glyphs), since what a reader checks here is what they copy. On phones
        // each line is 24px, so its number is a 24px link target.
        className="group/code max-h-[70vh] overflow-auto type-hash leading-[1.7] [font-feature-settings:'zero'_1,'calt'_0,'liga'_0] [font-variant-ligatures:none] focus-visible:outline-offset-[-2px] max-sm:leading-6"
      >
        {children}
      </pre>
    </div>
  );
}
