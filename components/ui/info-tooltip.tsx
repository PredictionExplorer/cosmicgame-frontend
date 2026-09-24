'use client';

import { Info } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { cn } from '@/lib/utils';
import { ExplainPopover } from '@/components/ui/term';

interface InfoTooltipProps {
  content: string;
  className?: string;
  iconClassName?: string;
  side?: 'top' | 'right' | 'bottom' | 'left';
  maxWidth?: number;
  /** Overrides the accessible name. Prefer `label`. */
  ariaLabel?: string;
  /**
   * What the icon explains, usually the visible label beside it. The button
   * is named "More information about {label}" and the card is headed by it.
   */
  label?: string;
}

/**
 * InfoTooltip — an ⓘ that explains the label or heading it follows.
 *
 * Use it once per section or group, and where a decision depends on the
 * explanation (the Calibration Window, a non-refundable spend). For a coined
 * word in a sentence or a figure label, use `<Term>` instead: the word itself
 * opens the explanation, so the row gains no icon and no extra tab stop.
 *
 * The icon is 16px in the subtle tier; its hit area is 24px at every width
 * and 44px on coarse pointers, drawn by a transparent pseudo-element so the
 * row keeps its height. Hover shows the explanation; a click, tap, Enter or
 * Space pins it. The full text is the button's description, so the name stays
 * short and is never a truncated sentence.
 */
export function InfoTooltip({
  content,
  className,
  iconClassName,
  side = 'top',
  maxWidth = 280,
  ariaLabel,
  label,
}: InfoTooltipProps) {
  const tTooltips = useTranslations('tooltips');
  const tGlossary = useTranslations('glossary');
  const name =
    ariaLabel ??
    (label ? tTooltips('moreInformationAbout', { label }) : tGlossary('ui.moreInformation'));

  return (
    <ExplainPopover title={label} definition={content} side={side} maxWidth={maxWidth}>
      <button
        type="button"
        aria-label={name}
        // `data-touch-target` tells the mobile audit to measure the real
        // hit area (the pseudo-element) rather than the icon's box.
        data-touch-target="extended"
        className={cn(
          'relative inline-flex shrink-0 cursor-help items-center justify-center rounded-full align-middle text-subtle',
          'transition-colors duration-[var(--duration-fast)] ease-[var(--ease-out-soft)] hover:text-foreground data-[state=open]:text-foreground',
          "after:absolute after:left-1/2 after:top-1/2 after:size-6 after:-translate-x-1/2 after:-translate-y-1/2 after:content-[''] pointer-coarse:after:size-11",
          className,
        )}
      >
        <Info aria-hidden className={cn('size-4', iconClassName)} />
      </button>
    </ExplainPopover>
  );
}
