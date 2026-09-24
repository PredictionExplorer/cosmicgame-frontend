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
 * button itself, absolutely positioned: 24px square on fine pointers (the
 * WCAG 2.5.8 minimum) and a real 44px square on coarse pointers, so the box
 * a finger hits is the box hit-testing and the tap-target audit measure. Its
 * focus ring is drawn 10px inside that box, so it hugs the icon at every
 * size. Hover shows the explanation; a click, tap, Enter or Space pins it.
 * The full text is the button's description (`aria-describedby`), so the
 * name stays short and is never a truncated sentence.
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
          className={cn(
            'absolute left-1/2 top-1/2 size-6 -translate-x-1/2 -translate-y-1/2 cursor-help rounded-full',
            'pointer-coarse:size-11 pointer-coarse:[outline-offset:calc(var(--focus-ring-offset)-0.625rem)]',
          )}
        />
      </ExplainPopover>
    </span>
  );
}
