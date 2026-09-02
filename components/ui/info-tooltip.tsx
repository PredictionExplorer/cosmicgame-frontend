'use client';

import { Info } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';

import { getLocaleConfig } from '@/i18n/localeConfig';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface InfoTooltipProps {
  content: string;
  className?: string;
  iconClassName?: string;
  side?: 'top' | 'right' | 'bottom' | 'left';
  maxWidth?: number;
  ariaLabel?: string;
  label?: string;
}

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
  const locale = useLocale();
  const defaultAriaLabel =
    content.length > 72
      ? `${content.slice(0, 69).trimEnd()}${getLocaleConfig(locale).ellipsis}`
      : content;
  const resolvedAriaLabel =
    ariaLabel ??
    (label
      ? t('moreInformationAbout', { label })
      : t('moreInformation', { content: defaultAriaLabel }));

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          aria-label={resolvedAriaLabel}
          // The icon sits inline beside a label, so it cannot grow to 44px
          // without pushing that row taller. Instead a transparent
          // pseudo-element extends the hit area to 44px around the icon,
          // leaving layout untouched. `data-touch-target` tells the mobile
          // audit to verify the real hit area rather than the icon's box.
          data-touch-target="extended"
          className={cn(
            'relative inline-flex cursor-help appearance-none items-center border-0 bg-transparent p-0 align-middle text-muted-foreground/50 transition-colors hover:text-primary/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
            "after:absolute after:left-1/2 after:top-1/2 after:h-11 after:w-11 after:-translate-x-1/2 after:-translate-y-1/2 after:content-[''] sm:after:hidden",
            className,
          )}
        >
          <Info className={cn('h-3.5 w-3.5 text-current', iconClassName)} />
        </button>
      </TooltipTrigger>
      <TooltipContent side={side}>
        <p className="text-xs leading-relaxed" style={{ maxWidth }}>
          {content}
        </p>
      </TooltipContent>
    </Tooltip>
  );
}
