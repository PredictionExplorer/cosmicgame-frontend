'use client';

import { useRef, type KeyboardEvent } from 'react';
import { useTranslations } from 'next-intl';

import { setSiteTheme, useSiteTheme } from '@/lib/theme/client';
import { SITE_THEMES } from '@/lib/theme/config';
import { cn } from '@/lib/utils';

/**
 * The five palettes as a compact swatch radio group, for surfaces with no
 * room for the full palette menu (the mobile drawers). Arrow keys move and
 * select, like any radio group. Each swatch is a 44px target whose visible
 * mark is the 24px swatch: the selection ring is drawn on the swatch, so a
 * row pulled out by its padding (`-ml-2.5`) lines the swatches up with the
 * text above and keeps the ring off the edge. The selected palette's name
 * shows beside the row, so the choice reads without hovering.
 */
export function PalettePicker({ className }: { className?: string }) {
  const t = useTranslations('common');
  const theme = useSiteTheme();
  const buttons = useRef<(HTMLButtonElement | null)[]>([]);

  const onKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    const step =
      event.key === 'ArrowRight' || event.key === 'ArrowDown'
        ? 1
        : event.key === 'ArrowLeft' || event.key === 'ArrowUp'
          ? -1
          : 0;
    if (!step) return;
    event.preventDefault();
    const next = (index + step + SITE_THEMES.length) % SITE_THEMES.length;
    setSiteTheme(SITE_THEMES[next]!);
    buttons.current[next]?.focus();
  };

  return (
    <div className={cn('flex min-w-0 items-center gap-2', className)}>
      <div
        role="radiogroup"
        aria-label={t('themeSwitcher.label')}
        className="flex shrink-0 items-center"
      >
        {SITE_THEMES.map((option, index) => {
          const selected = option === theme;
          const name = t(`themeSwitcher.themes.${option}.name`);
          return (
            <button
              key={option}
              ref={(node) => {
                buttons.current[index] = node;
              }}
              type="button"
              role="radio"
              aria-checked={selected}
              aria-label={name}
              title={name}
              tabIndex={selected ? 0 : -1}
              onClick={() => setSiteTheme(option)}
              onKeyDown={(event) => onKeyDown(event, index)}
              className="group/swatch flex size-11 items-center justify-center rounded-control focus-ring-inset"
            >
              <span
                data-palette={option}
                aria-hidden
                className={cn(
                  'relative size-6 overflow-hidden rounded-edge border bg-background transition-shadow duration-150',
                  selected
                    ? 'border-primary ring-2 ring-primary ring-offset-2 ring-offset-background'
                    : 'border-input group-hover/swatch:border-foreground/40',
                )}
              >
                <span className="absolute inset-0 bg-[image:var(--gradient-atmosphere)] opacity-[var(--atmosphere-strength)]" />
                <span className="absolute inset-x-0.5 bottom-0.5 h-1.5 rounded-edge bg-signature-gradient" />
              </span>
            </button>
          );
        })}
      </div>
      {/* Seen, not heard: the checked radio already announces its name. */}
      <span aria-hidden className="type-caption min-w-0 truncate text-muted-foreground">
        {t(`themeSwitcher.themes.${theme}.name`)}
      </span>
    </div>
  );
}
