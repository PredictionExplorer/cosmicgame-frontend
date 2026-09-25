'use client';

import { useCallback, useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { ChevronDown, Menu, Search, Wallet } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { Link } from '@/i18n/navigation';
import { cn } from '@/lib/utils';
import { ThemeSwitcher } from '@/components/theme/ThemeSwitcher';
import { ConnectWalletAction } from '@/components/wallet/ConnectWalletAction';
import { WALLET_PILL_ADDRESS_CLASS, WALLET_PILL_CLASS } from '@/components/wallet/walletPill';
import { useSystemMode } from '@/contexts/SystemModeContext';
import { useActiveWeb3React } from '@/hooks/web3';
import { formatAddress } from '@/utils/format/addresses';

import { useCommandPaletteShortcut, useCommandShortcut } from './commandShortcut';
import { HeaderNavigation } from './HeaderNavigation';
import { LanguageSwitcher } from './LanguageSwitcher';
import { SiteDrawer } from './SiteDrawer';
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

/**
 * The palette (its list, search and record jumps) loads on demand: once the
 * page is idle, so the first ⌘K is instant, and never on the critical path.
 */
const loadCommandPalette = () => import('./CommandPalette');
const CommandPalette = dynamic(() => loadCommandPalette().then((module) => module.CommandPalette), {
  ssr: false,
});

/**
 * The wallet pill as it will arrive (its box, the short address, the menu
 * chevron from 768px), quiet and inert until HeaderAccount's chunk lands.
 */
function WalletPillPlaceholder() {
  const { account } = useActiveWeb3React();
  return (
    <span aria-hidden data-testid="wallet-pill-placeholder" className={WALLET_PILL_CLASS}>
      <Wallet className="size-4 shrink-0 text-subtle" />
      <span className={cn(WALLET_PILL_ADDRESS_CLASS, 'text-subtle')}>{formatAddress(account)}</span>
      <ChevronDown className="hidden size-3.5 shrink-0 text-subtle md:inline" />
    </span>
  );
}

/**
 * The connected wallet (balances, the account menu, the network chip) loads
 * while a wallet is connected; until its chunk arrives a placeholder of the
 * pill's own size holds its place, so nothing in the header moves.
 */
const HeaderAccount = dynamic(() => import('./HeaderAccount'), {
  ssr: false,
  loading: WalletPillPlaceholder,
});

/**
 * The connect button, shortened to "Connect" where the header is tightest:
 * under 640px, and from 1024px until the wide layout at 1280px. The wallet
 * list is a lazy chunk that mounts on demand; hover and focus warm it, so
 * the click still feels instant.
 */
function HeaderConnect() {
  const t = useTranslations('wallet');
  return (
    <div className="ml-auto min-w-0">
      <ConnectWalletAction
        showIcon={false}
        label={
          <>
            <span className="sm:hidden lg:inline xl:hidden">{t('connect.buttonShort')}</span>
            <span className="hidden sm:inline lg:hidden xl:inline">{t('connect.button')}</span>
          </>
        }
        className="min-h-11 whitespace-nowrap sm:min-h-10"
      />
    </div>
  );
}

function SearchTrigger({ onOpen }: { onOpen: () => void }) {
  const t = useTranslations('nav');
  const shortcut = useCommandShortcut();
  return (
    <button
      type="button"
      onClick={onOpen}
      aria-label={t('search.triggerLabel')}
      aria-keyshortcuts={shortcut?.keys}
      data-site-search-trigger
      className="hidden size-10 shrink-0 items-center justify-center gap-2 rounded-pill border border-input bg-surface-sunken text-muted-foreground transition-colors duration-150 hover:border-foreground/40 hover:bg-muted hover:text-foreground sm:inline-flex xl:w-auto xl:justify-start xl:pl-3 xl:pr-2"
    >
      <Search aria-hidden className="size-4 shrink-0" />
      <span className="hidden text-sm xl:inline">{t('search.trigger')}</span>
      {/* The glyph is known only on the client ("⌘K" or "Ctrl K"). The key cap
          is always rendered at a width that fits either, invisible until
          then, so the pill does not grow after hydration. It is a hint, not
          part of the label: drawn as generated content, so the button's
          text is "Search" alone, inside its name (WCAG 2.5.3), and
          aria-keyshortcuts announces the platform's own chord. */}
      <kbd
        aria-hidden
        data-testid="search-shortcut"
        data-keys={shortcut?.label ?? '⌘K'}
        className={cn(
          'type-caption ml-3 hidden h-6 min-w-12 items-center justify-center rounded-edge border border-rule px-1.5 font-sans text-subtle after:content-[attr(data-keys)] xl:inline-flex',
          !shortcut && 'invisible',
        )}
      />
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
  const location = useSiteLocation();
  const { account } = useActiveWeb3React();
  const [retrievable, setRetrievable] = useState(false);
  const hasRetrievable = !!account && retrievable;
  const systemMode = useSystemMode()?.data ?? 0;

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  // The palette mounts on the first request and stays mounted after it.
  const [searchRequested, setSearchRequested] = useState(false);
  const openSearch = useCallback(() => {
    setSearchRequested(true);
    setSearchOpen(true);
  }, []);
  useCommandPaletteShortcut(openSearch);
  useEffect(() => {
    const warm = () => void loadCommandPalette().catch(() => undefined);
    if (typeof window.requestIdleCallback !== 'function') {
      const timer = window.setTimeout(warm, 2000);
      return () => window.clearTimeout(timer);
    }
    const idle = window.requestIdleCallback(warm, { timeout: 4000 });
    return () => window.cancelIdleCallback(idle);
  }, []);

  const retrieveBadge = hasRetrievable ? (
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
          className="hidden lg:block"
        />

        <div className="ml-auto flex min-w-0 items-center gap-2">
          <SearchTrigger onOpen={openSearch} />
          <div className="hidden items-center gap-2 sm:flex">
            <ThemeSwitcher />
            <LanguageSwitcher variant="responsive" />
          </div>
          {account ? <HeaderAccount onRetrievableChange={setRetrievable} /> : <HeaderConnect />}
          <SiteDrawer
            open={drawerOpen}
            onOpenChange={setDrawerOpen}
            location={location}
            onOpenSearch={openSearch}
            showAccount={!!account}
            badges={retrieveBadge ? { myAllocations: retrieveBadge } : undefined}
            trigger={
              <button
                type="button"
                data-site-menu-trigger
                aria-label={hasRetrievable ? t('menuLabelWithAlert') : t('menuLabel')}
                className="relative -mr-2 inline-flex size-11 shrink-0 items-center justify-center rounded-control text-foreground transition-colors duration-150 hover:bg-muted lg:hidden"
              >
                <Menu aria-hidden className="size-5" />
                {hasRetrievable ? (
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
      {searchRequested ? <CommandPalette open={searchOpen} onOpenChange={setSearchOpen} /> : null}
    </header>
  );
};

export default Header;
