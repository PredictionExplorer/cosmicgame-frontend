'use client';

import { Info } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { cn } from '@/lib/utils';
import { ExplainPopover } from '@/components/ui/explain-popover';

interface InfoTooltipProps {
  content: string;
  /** Layout and colour of the icon in its row (margins, `ml-auto`, a text colour). */
  className?: string;
  iconClassName?: string;
  side?: 'top' | 'right' | 'bottom' | 'left';
  maxWidth?: number;
  /** Overrides the accessible name. Prefer `label`. */
  ariaLabel?: string;
  /**
   * What the icon explains, usually the visible label beside it. The button
   * is named "More information about {label}" and the card is headed by it.
   * Pass it at every new call site; without it every icon on a page shares
   * the name "More information" and only its description tells them apart.
   */
  label?: string;
}

/**
 * InfoTooltip — an ⓘ that explains the label or heading it follows.
 *
 * Use it once per section or group, and where a decision depends on the
 * explanation (the Calibration Window, a non-refundable spend). For a coined
 * word in a sentence or a figure label, use `<Term>` or `<ExplainedTerm>`
 * instead: the word itself opens the explanation, so the row gains no icon
 * and no extra tab stop.
 *
 * The 16px icon sets the layout box, so the row keeps its height and a
 * caller's margins and colour apply to the icon as before. Over it sits the
 * button itself, 24px square (the WCAG 2.5.8 minimum, and the box automated
 * audits measure), extended to a 44px hit area on coarse pointers by a
 * transparent pseudo-element. Hover shows the explanation; a click, tap,
 * Enter or Space pins it. The full text is the button's description
 * (`aria-describedby`), so the name stays short and is never a truncated
 * sentence.
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
  const t = useTranslations('tooltips');
  const name = ariaLabel ?? (label ? t('moreInformationAbout', { label }) : t('moreInformation'));

  return (
    <span
      data-slot="info-tooltip"
      className={cn(
        'relative ml-0.5 inline-flex shrink-0 align-middle text-subtle',
        'transition-colors duration-[var(--duration-fast)] ease-[var(--ease-out-soft)] hover:text-foreground has-[[data-state=open]]:text-foreground',
        className,
      )}
    >
      <Info aria-hidden className={cn('size-4', iconClassName)} />
      <ExplainPopover title={label} definition={content} side={side} maxWidth={maxWidth}>
        <button
          type="button"
          aria-label={name}
          // `data-touch-target` tells the mobile audit to measure the real
          // hit area (the pseudo-element) rather than the button's box.
          data-touch-target="extended"
          className={cn(
            'absolute left-1/2 top-1/2 size-6 -translate-x-1/2 -translate-y-1/2 cursor-help rounded-full',
            "pointer-coarse:after:absolute pointer-coarse:after:left-1/2 pointer-coarse:after:top-1/2 pointer-coarse:after:size-11 pointer-coarse:after:-translate-x-1/2 pointer-coarse:after:-translate-y-1/2 pointer-coarse:after:content-['']",
          )}
        />
      </ExplainPopover>
    </span>
  );
}
