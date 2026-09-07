'use client';

import { Palette } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { setSiteTheme, useSiteTheme } from '@/lib/theme/client';
import { SITE_THEMES } from '@/lib/theme/config';
import { cn } from '@/lib/utils';

/** One accessible, keyboard-navigable palette menu for every site header. */
export function ThemeSwitcher({ className }: { className?: string }) {
  const t = useTranslations('common');
  const theme = useSiteTheme();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          aria-label={t('themeSwitcher.label')}
          title={t('themeSwitcher.label')}
          className={cn(
            'h-11 w-11 shrink-0 rounded-full border border-foreground/12 bg-foreground/5 text-secondary shadow-[inset_0_1px_0_rgb(255_255_255/0.05)] hover:border-primary/40 hover:bg-primary/10 hover:text-primary data-[state=open]:border-primary/40 data-[state=open]:bg-primary/10 sm:h-10 sm:w-10',
            className,
          )}
        >
          <Palette className="h-4 w-4" aria-hidden />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        sideOffset={10}
        collisionPadding={12}
        className="max-h-[var(--radix-dropdown-menu-content-available-height)] w-80 max-w-[calc(100vw-1.5rem)] overflow-y-auto rounded-2xl border-border p-2 shadow-2xl"
      >
        <DropdownMenuLabel className="px-3 pt-2 text-sm">
          {t('themeSwitcher.label')}
        </DropdownMenuLabel>
        <p className="px-3 pb-2 text-xs leading-relaxed text-muted-foreground">
          {t('themeSwitcher.description')}
        </p>
        <DropdownMenuSeparator className="mx-1" />
        <DropdownMenuRadioGroup value={theme} onValueChange={setSiteTheme}>
          {SITE_THEMES.map((option) => (
            <DropdownMenuRadioItem
              key={option}
              value={option}
              textValue={t(`themeSwitcher.themes.${option}.name`)}
              className="my-1 min-h-16 cursor-pointer gap-3 rounded-xl py-2 pl-7 pr-3 focus:bg-primary/10 data-[state=checked]:bg-primary/8 [&>span:first-child]:text-primary"
            >
              <span
                data-palette={option}
                aria-hidden
                className="relative flex h-11 w-14 shrink-0 items-end overflow-hidden rounded-lg border border-foreground/15 bg-background p-1.5 shadow-sm"
              >
                <span className="absolute inset-x-0 top-0 h-5 bg-primary/15" />
                <span className="h-3 w-5 rounded-sm bg-primary" />
                <span className="ml-1 h-3 w-3 rounded-sm bg-secondary/70" />
              </span>
              <span className="min-w-0">
                <span className="block text-sm font-medium text-foreground">
                  {t(`themeSwitcher.themes.${option}.name`)}
                </span>
                <span className="mt-0.5 block text-[11px] leading-relaxed text-muted-foreground">
                  {t(`themeSwitcher.themes.${option}.description`)}
                </span>
              </span>
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
        <DropdownMenuSeparator className="mx-1" />
        <p className="px-3 py-2 text-[11px] leading-relaxed text-muted-foreground">
          {t('themeSwitcher.sitewide')}
        </p>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
