'use client';

import { useCallback, useState } from 'react';
import { Menu, Search } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { Link, usePathname } from '@/i18n/navigation';
import { cn } from '@/lib/utils';
import ConnectWalletButton from '@/components/common/ConnectWalletButton';
import { ThemeSwitcher } from '@/components/theme/ThemeSwitcher';
import { WrongNetworkChip } from '@/components/wallet/NetworkGuard';
import { useSystemMode } from '@/contexts/SystemModeContext';

import {
  CommandPalette,
  useCommandPaletteShortcut,
  useCommandShortcutLabel,
} from './CommandPalette';
import { HeaderNavigation } from './HeaderNavigation';
import { LanguageSwitcher } from './LanguageSwitcher';
import { SiteDrawer } from './SiteDrawer';
import { useAccountSummary } from './useAccountSummary';
import { useSiteLocation } from './useSiteNav';
import { Wordmark } from './Wordmark';

function MaintenanceBanner({ mode }: { mode: number }) {
  const t = useTranslations('nav');
  return (
    <div
      data-maintenance-banner
      role="status"
      className="fixed inset-x-0 top-[var(--header-height)] z-40 border-b border-rule bg-attention-surface px-6 py-2.5 text-foreground backdrop-blur-sm"
    >
      <div className="site-container flex items-center justify-between gap-4">
        <p className="text-sm">
          {mode === 1 ? t('maintenance.pendingMessage') : t('maintenance.activeMessage')}
        </p>
        <span className="type-label shrink-0 rounded-pill border border-rule px-3 py-1 text-attention">
          {mode === 1 ? t('maintenance.pendingLabel') : t('maintenance.activeLabel')}
        </span>
      </div>
    </div>
  );
}

function SearchTrigger({ onOpen }: { onOpen: () => void }) {
  const t = useTranslations('nav');
  const shortcut = useCommandShortcutLabel();
  return (
    <button
      type="button"
      onClick={onOpen}
      aria-label={t('search.triggerLabel')}
      aria-keyshortcuts="Meta+K Control+K"
      className="hidden size-10 shrink-0 items-center justify-center gap-2 rounded-pill border border-input bg-surface-sunken text-muted-foreground transition-colors duration-150 hover:border-foreground/40 hover:bg-muted hover:text-foreground sm:inline-flex xl:w-auto xl:justify-start xl:pl-3 xl:pr-2"
    >
      <Search aria-hidden className="size-4 shrink-0" />
      <span className="hidden text-sm xl:inline">{t('search.trigger')}</span>
      {/* The glyph is known only on the client ("⌘K" or "Ctrl K"). The key cap
          is always rendered at a width that fits either, invisible until
          then, so the pill does not grow after hydration. */}
      <kbd
        aria-hidden
        data-testid="search-shortcut"
        className={cn(
          'type-caption ml-3 hidden h-6 min-w-12 items-center justify-center rounded-edge border border-rule px-1.5 font-sans text-subtle xl:inline-flex',
          !shortcut && 'invisible',
        )}
      >
        {shortcut ?? '⌘K'}
      </kbd>
    </button>
  );
}

/**
 * The app header. From 1024px: the wordmark, the primary navigation
 * (Observatory, Gallery, Explore, Learn), search, preferences and the
 * wallet. Below it: the wordmark, the wallet and, at the end, the menu
 * button that opens the drawer from the right (the landing header's side);
 * on phones the palette and language move into the drawer so the wordmark
 * keeps its place. The language control names the current language from
 * 1280px. Every breakpoint is CSS, so the server's first paint already
 * matches the viewport.
 */
const Header = () => {
  const t = useTranslations('nav');
  const walletT = useTranslations('wallet');
  const pathname = usePathname();
  const experimentalUi = pathname === '/experimental-ui';
  const location = useSiteLocation();
  const summary = useAccountSummary();
  const systemMode = useSystemMode()?.data ?? 0;

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const openSearch = useCallback(() => setSearchOpen(true), []);
  useCommandPaletteShortcut(openSearch);

  const retrieveBadge = summary.hasRetrievable ? (
    <span className="ml-auto inline-flex items-center gap-1.5">
      <span aria-hidden className="size-2 rounded-full bg-positive" />
      <span className="sr-only">{walletT('account.retrieveReady')}</span>
    </span>
  ) : null;

  return (
    <header className="fixed inset-x-0 top-0 z-50 h-[var(--header-height)] border-b border-rule glass print:static print:z-auto print:w-full">
      {systemMode > 0 ? <MaintenanceBanner mode={systemMode} /> : null}
      <div className="site-container flex h-full items-center gap-2 lg:gap-6">
        <Link
          href="/"
          aria-label={t('brand.homeLabel')}
          className="inline-flex min-h-11 min-w-11 shrink-0 items-center rounded-control no-underline"
        >
          <Wordmark size="md" nameClassName="max-[374px]:hidden max-sm:text-[0.9375rem]" />
        </Link>

        <HeaderNavigation
          location={location}
          onOpenSearch={openSearch}
          liquid={experimentalUi}
          className="hidden lg:block"
        />

        <div className="ml-auto flex min-w-0 items-center gap-2">
          <SearchTrigger onOpen={openSearch} />
          <div className="hidden items-center gap-2 sm:flex">
            <ThemeSwitcher />
            <LanguageSwitcher
              variant="responsive"
              className={cn(experimentalUi && 'liquid-glass-control')}
            />
          </div>
          {/* From 1024px the wallet pill carries the wrong-network badge. */}
          <div className="lg:hidden">
            <WrongNetworkChip />
          </div>
          <div className="min-w-0">
            <ConnectWalletButton
              presentation="responsive"
              balance={summary.balance}
              loading={summary.loading}
              stakedTokenCount={summary.anchored}
              hasUnclaimedRewards={summary.hasRetrievable}
              retrievableEth={summary.retrievableEth}
              liquid={experimentalUi}
              compactInHeader
              className="whitespace-nowrap"
            />
          </div>
          <SiteDrawer
            open={drawerOpen}
            onOpenChange={setDrawerOpen}
            location={location}
            onOpenSearch={openSearch}
            showAccount={!!summary.account}
            badges={retrieveBadge ? { myAllocations: retrieveBadge } : undefined}
            trigger={
              <button
                type="button"
                aria-label={summary.hasRetrievable ? t('menuLabelWithAlert') : t('menuLabel')}
                className="relative -mr-2 inline-flex size-11 shrink-0 items-center justify-center rounded-control text-foreground transition-colors duration-150 hover:bg-muted lg:hidden"
              >
                <Menu aria-hidden className="size-5" />
                {summary.hasRetrievable ? (
                  <span
                    aria-hidden
                    className="absolute right-2 top-2 size-2 rounded-full bg-positive ring-2 ring-background"
                  />
                ) : null}
              </button>
            }
          />
        </div>
      </div>
      <CommandPalette open={searchOpen} onOpenChange={setSearchOpen} />
    </header>
  );
};

export default Header;
