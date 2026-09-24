'use client';

import { useRef, type KeyboardEvent } from 'react';
import { useTranslations } from 'next-intl';

import { setSiteTheme, useSiteTheme } from '@/lib/theme/client';
import { SITE_THEMES } from '@/lib/theme/config';
import { cn } from '@/lib/utils';

/**
 * The five palettes as a compact swatch radio group, for surfaces with no
 * room for the full palette menu (the mobile drawer). Arrow keys move and
 * select, like any radio group.
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
    <div
      role="radiogroup"
      aria-label={t('themeSwitcher.label')}
      className={cn('flex items-center gap-1', className)}
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
            className={cn(
              'flex size-11 items-center justify-center rounded-control border transition-colors duration-150',
              selected ? 'border-primary bg-primary/10' : 'border-transparent hover:border-input',
            )}
          >
            <span
              data-palette={option}
              aria-hidden
              className="relative size-6 overflow-hidden rounded-edge border border-input bg-background"
            >
              <span className="absolute inset-0 bg-[image:var(--gradient-atmosphere)] opacity-[var(--atmosphere-strength)]" />
              <span className="absolute inset-x-0.5 bottom-0.5 h-1.5 rounded-edge bg-signature-gradient" />
            </span>
          </button>
        );
      })}
    </div>
  );
}
