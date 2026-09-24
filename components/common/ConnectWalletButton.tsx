'use client';

import { forwardRef, useState, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { Check, ChevronDown, Copy, Wallet } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';

import {
  ACCOUNT_ROUTE_IDS,
  getSiteRoute,
  locateSitePath,
  outboundLinks,
  type SiteRouteId,
} from '@/config/siteNav';
import { OUTBOUND_ICONS, SITE_ROUTE_ICONS } from '@/config/siteNavIcons';
import { usePathname } from '@/i18n/navigation';
import { cn } from '@/lib/utils';
import { formatAmount, formatAddress, formatCount } from '@/utils/format';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { UnknownValue } from '@/components/ui/unknown-value';
import { AddCstToMetaMaskButton } from '@/components/common/AddCstToMetaMaskButton';
import { NavRowContent } from '@/components/layout/NavRow';
import { SiteLink } from '@/components/layout/SiteLink';
import { useSiteNavCopy } from '@/components/layout/useSiteNav';
import { ConnectWalletAction } from '@/components/wallet/ConnectWalletAction';
import { WrongNetworkBadge } from '@/components/wallet/NetworkGuard';
import {
  WalletAccountMenuItems,
  WalletAccountPanel,
  WalletNetworkMenuItems,
} from '@/components/wallet/WalletAccountPanel';
import { useWalletAccount } from '@/hooks/useWalletAccount';
import { useActiveWeb3React } from '@/hooks/web3';

/** A figure the header could not read is `null` and renders as unavailable, never as 0. */
interface Balance {
  ETH: number | null;
  CosmicToken: number | null;
  /** Cosmic Signature NFTs the wallet holds now. */
  CosmicSignature: number | null;
  RWLK: number | null;
}

interface AnchoredTokenCount {
  cst?: number;
  rwalk?: number;
}

export type ConnectWalletPresentation = 'menu' | 'sheet' | 'responsive';

interface ConnectWalletButtonProps {
  /**
   * How a connected wallet opens its account: a dropdown `menu`, a bottom
   * `sheet` for phones, or `responsive` (sheet under 768px, menu above,
   * chosen by CSS so the first paint is right at every width).
   */
  presentation?: ConnectWalletPresentation;
  className?: string;
  loading: boolean;
  balance: Balance;
  stakedTokenCount: AnchoredTokenCount;
  /** Something waits in My Allocations. */
  hasUnclaimedRewards?: boolean;
  /** The ETH part of it, shown on the My Allocations row. */
  retrievableEth?: number | null;
  /** Applies the experimental liquid-glass material without changing other routes. */
  liquid?: boolean;
  /**
   * Shorten the connect label to "Connect" where the header is tightest:
   * under 640px, and from 1024px until the wide layout at 1280px.
   */
  compactInHeader?: boolean;
}

interface AccountDetailsProps {
  loading: boolean;
  balance: Balance;
  stakedTokenCount: AnchoredTokenCount;
  hasUnclaimedRewards: boolean;
  retrievableEth: number | null;
}

/** The retrieve signal, in words: visible under My Allocations, and read aloud. */
function RetrieveNote({ retrievableEth }: { retrievableEth: number | null }) {
  const t = useTranslations('wallet');
  const locale = useLocale();
  return (
    <span className="type-caption mt-0.5 inline-flex items-center gap-1.5 text-positive">
      <span aria-hidden className="size-1.5 shrink-0 rounded-full bg-positive" />
      {retrievableEth !== null
        ? t('account.retrieveAmount', {
            amount: formatAmount(retrievableEth, { unit: 'ETH', locale, context: 'card' }),
          })
        : t('account.retrieveReady')}
    </span>
  );
}

function useCurrentRoute(): SiteRouteId | null {
  const pathname = usePathname();
  const location = locateSitePath(pathname);
  return location.exact ? (location.route?.id ?? null) : null;
}

/** The account pages as menu items (menu) or plain links (sheet). */
function AccountPages({
  variant,
  hasUnclaimedRewards,
  retrievableEth,
  onNavigate,
}: {
  variant: 'menu' | 'list';
  hasUnclaimedRewards: boolean;
  retrievableEth: number | null;
  /** The sheet closes itself when a page is picked (the menu closes on select). */
  onNavigate?: () => void;
}) {
  const copy = useSiteNavCopy();
  const currentRoute = useCurrentRoute();

  return (
    <>
      {ACCOUNT_ROUTE_IDS.map((id) => {
        const current = currentRoute === id;
        const alert = hasUnclaimedRewards && id === 'myAllocations';
        const link = (
          <SiteLink
            href={getSiteRoute(id).path}
            kind="internal"
            aria-current={current ? 'page' : undefined}
            onClick={onNavigate}
            className={cn(
              'group/row flex w-full cursor-pointer items-center gap-3 rounded-control px-2 no-underline',
              variant === 'menu' ? 'py-1.5' : 'min-h-11 py-2 hover:bg-muted',
            )}
          >
            <NavRowContent
              iconStyle="inline"
              icon={SITE_ROUTE_ICONS[id]}
              current={current}
              label={
                <span className="flex flex-col">
                  <span>{copy.routeLabel(id)}</span>
                  {alert ? <RetrieveNote retrievableEth={retrievableEth} /> : null}
                </span>
              }
            />
          </SiteLink>
        );
        return variant === 'menu' ? (
          <DropdownMenuItem
            key={id}
            asChild
            className="p-0 data-[highlighted]:bg-muted focus:bg-muted focus:text-foreground"
          >
            {link}
          </DropdownMenuItem>
        ) : (
          <li key={id}>{link}</li>
        );
      })}
    </>
  );
}

function BalanceFigure({
  label,
  value,
  loading,
}: {
  label: string;
  /** `null`: the read failed, so the figure is unknown rather than zero. */
  value: string | null;
  loading: boolean;
}) {
  const commonT = useTranslations('common');
  return (
    <div className="flex min-w-0 flex-col">
      <dt className="type-caption text-subtle">{label}</dt>
      <dd className="type-figure-sm text-foreground">
        {loading ? (
          '…'
        ) : value === null ? (
          <UnknownValue label={commonT('status.unavailable')} />
        ) : (
          value
        )}
      </dd>
    </div>
  );
}

/** Balances and anchored NFTs as a small spec sheet. */
function AccountBalances({ loading, balance, stakedTokenCount }: AccountDetailsProps) {
  const t = useTranslations('wallet');
  const locale = useLocale();
  const count = (value: number | null | undefined) =>
    value === undefined ? '…' : value === null ? null : formatCount(value, locale);
  const amount = (value: number | null, unit: 'ETH' | 'CST') =>
    value === null ? null : formatAmount(value, { unit, locale, context: 'card', withUnit: false });
  return (
    <section className="px-2 py-2">
      <h3 className="type-eyebrow pb-2 text-subtle">{t('labels.balancesHeading')}</h3>
      <dl className="grid grid-cols-2 gap-x-4 gap-y-2.5">
        <BalanceFigure
          loading={loading}
          label={t('balances.eth')}
          value={amount(balance.ETH, 'ETH')}
        />
        <BalanceFigure
          loading={loading}
          label={t('balances.cst')}
          value={amount(balance.CosmicToken, 'CST')}
        />
        <BalanceFigure
          loading={loading}
          label={t('balances.cosmicNfts')}
          value={count(balance.CosmicSignature)}
        />
        <BalanceFigure
          loading={loading}
          label={t('balances.rwlkNfts')}
          value={count(balance.RWLK)}
        />
        <BalanceFigure
          loading={false}
          label={t('balances.anchoredCst')}
          value={count(stakedTokenCount.cst)}
        />
        <BalanceFigure
          loading={false}
          label={t('balances.anchoredRwlk')}
          value={count(stakedTokenCount.rwalk)}
        />
      </dl>
    </section>
  );
}

/** Trading destinations that belong with a wallet: CST on Uniswap, NFTs on Axiom Zero. */
const WALLET_OUTBOUND = outboundLinks('ecosystem').filter(
  (link) => link.id === 'uniswap' || link.id === 'axiomZero',
);

function AccountMenu(props: AccountDetailsProps & { trigger: ReactNode }) {
  const t = useTranslations('wallet');
  const copy = useSiteNavCopy();
  const account = useWalletAccount();

  return (
    <DropdownMenu modal={false}>
      {props.trigger}
      {/* Sits in the chrome layer with the header it drops out of. */}
      <DropdownMenuContent
        align="end"
        sideOffset={10}
        collisionPadding={16}
        className="z-50 max-h-[var(--radix-dropdown-menu-content-available-height)] w-80 overflow-y-auto rounded-surface border-rule bg-popover p-1.5 shadow-float"
      >
        {account.address ? (
          <div className="flex items-center justify-between gap-3 px-2 pb-1 pt-1.5">
            <div className="min-w-0">
              {account.walletName ? (
                <p className="type-caption text-subtle">{account.walletName}</p>
              ) : null}
              <p className="type-mono truncate text-foreground" title={account.address}>
                {formatAddress(account.address)}
              </p>
            </div>
            <DropdownMenuItem
              onSelect={(event) => {
                event.preventDefault();
                void account.copyAddress();
              }}
              aria-label={
                account.copied ? t('accessibility.addressCopied') : t('accessibility.copyAddress')
              }
              className="size-9 shrink-0 cursor-pointer justify-center rounded-control p-0 text-subtle data-[highlighted]:bg-muted data-[highlighted]:text-foreground"
            >
              {account.copied ? (
                <Check aria-hidden className="size-4 text-positive" />
              ) : (
                <Copy aria-hidden className="size-4" />
              )}
            </DropdownMenuItem>
          </div>
        ) : null}
        <WalletNetworkMenuItems />

        <DropdownMenuSeparator className="bg-rule-faint" />
        <DropdownMenuGroup>
          <DropdownMenuLabel className="type-eyebrow px-2 pb-1 pt-1.5 font-medium text-subtle">
            {copy.sectionTitle('account')}
          </DropdownMenuLabel>
          <AccountPages
            variant="menu"
            hasUnclaimedRewards={props.hasUnclaimedRewards}
            retrievableEth={props.retrievableEth}
          />
        </DropdownMenuGroup>

        <DropdownMenuSeparator className="bg-rule-faint" />
        <AccountBalances {...props} />

        <DropdownMenuSeparator className="bg-rule-faint" />
        <DropdownMenuGroup>
          <AddCstToMetaMaskButton />
          {WALLET_OUTBOUND.map((link) => {
            const Icon = OUTBOUND_ICONS[link.id];
            return (
              <DropdownMenuItem
                key={link.id}
                asChild
                className="cursor-pointer gap-2.5 px-2 data-[highlighted]:bg-muted focus:bg-muted focus:text-foreground"
              >
                <SiteLink href={link.href} kind="external" externalIconClassName="ml-auto">
                  <Icon aria-hidden className="size-3.5 text-muted-foreground" />
                  {copy.outboundLabel(link.id)}
                </SiteLink>
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuGroup>

        <DropdownMenuSeparator className="bg-rule-faint" />
        <WalletAccountMenuItems />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function AccountSheet(props: AccountDetailsProps & { trigger: ReactNode }) {
  const t = useTranslations('wallet');
  const copy = useSiteNavCopy();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  // The header stays mounted across client navigation, so any route change
  // (a link here, browser back or forward) closes the sheet over the old page.
  const [openedOn, setOpenedOn] = useState(pathname);
  if (openedOn !== pathname) {
    setOpenedOn(pathname);
    setOpen(false);
  }
  const close = () => setOpen(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      {props.trigger}
      <SheetContent
        side="bottom"
        aria-describedby={undefined}
        className="max-h-[88dvh] overflow-y-auto rounded-t-surface border-t border-rule bg-background p-0 pb-[env(safe-area-inset-bottom)]"
      >
        <div className="flex h-[var(--header-height)] items-center border-b border-rule-faint pl-5 pr-16">
          <SheetTitle className="type-eyebrow text-subtle">{t('account.heading')}</SheetTitle>
        </div>
        <div className="px-5 pb-4 pt-4">
          <WalletAccountPanel />
        </div>
        {/* The sheet's title already says "Account": the pages need no second heading. */}
        <nav
          aria-label={copy.sectionTitle('account')}
          className="border-t border-rule-faint px-3 py-2"
        >
          <ul>
            <AccountPages
              variant="list"
              hasUnclaimedRewards={props.hasUnclaimedRewards}
              retrievableEth={props.retrievableEth}
              onNavigate={close}
            />
          </ul>
        </nav>
        <div className="border-t border-rule-faint px-3 pt-1">
          <AccountBalances {...props} />
        </div>
        <ul className="border-t border-rule-faint px-3 pb-4 pt-2">
          <li>
            <AddCstToMetaMaskButton
              variant="drawer"
              className="min-h-11 rounded-control px-2 text-foreground hover:bg-muted hover:text-foreground"
            />
          </li>
          {WALLET_OUTBOUND.map((link) => {
            const Icon = OUTBOUND_ICONS[link.id];
            return (
              <li key={link.id}>
                <SiteLink
                  href={link.href}
                  kind="external"
                  externalIconClassName="ml-auto"
                  className="flex min-h-11 items-center gap-3 rounded-control px-2 text-sm text-foreground no-underline transition-colors duration-150 hover:bg-muted"
                >
                  <Icon aria-hidden className="size-4 text-subtle" />
                  {copy.outboundLabel(link.id)}
                </SiteLink>
              </li>
            );
          })}
        </ul>
      </SheetContent>
    </Sheet>
  );
}

interface WalletPillProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  address: string;
  hasUnclaimedRewards: boolean;
  withChevron: boolean;
  liquid: boolean;
  testId: string;
  /**
   * Visibility of the wrong-network badge: it shows only where the header's
   * `WrongNetworkChip` does not (phones under 360px, and from 1024px).
   */
  badgeClassName?: string;
}

/** The connected wallet's trigger. Forwards ref and props for Radix `asChild`. */
const WalletPill = forwardRef<HTMLButtonElement, WalletPillProps>(function WalletPill(
  { address, hasUnclaimedRewards, withChevron, liquid, className, testId, badgeClassName, ...rest },
  ref,
) {
  const t = useTranslations('wallet');
  const short = formatAddress(address);
  return (
    <button
      ref={ref}
      type="button"
      data-testid={testId}
      aria-label={
        hasUnclaimedRewards
          ? t('account.menuLabelWithAlert', { address: short })
          : t('account.menuLabel', { address: short })
      }
      {...rest}
      className={cn(
        'relative inline-flex min-h-11 min-w-11 items-center justify-center gap-2 rounded-pill border border-input bg-surface-sunken px-3 text-sm text-foreground transition-colors duration-150 hover:border-foreground/40 hover:bg-muted data-[state=open]:border-primary/50 data-[state=open]:bg-muted md:min-h-10',
        liquid && 'liquid-glass-control',
        className,
      )}
    >
      <Wallet aria-hidden className="size-4 shrink-0 text-subtle" />
      {/* The address shows wherever the header has room for it. */}
      <span className="type-mono hidden text-foreground min-[400px]:inline lg:hidden xl:inline">
        {short}
      </span>
      {hasUnclaimedRewards ? (
        <span
          aria-hidden
          className="absolute right-1 top-1 size-2 rounded-full bg-positive ring-2 ring-background"
        />
      ) : null}
      {withChevron ? <ChevronDown aria-hidden className="size-3.5 shrink-0 text-subtle" /> : null}
      <WrongNetworkBadge className={badgeClassName} />
    </button>
  );
});

/**
 * The header wallet control. Disconnected, it is the shared connect button.
 * Connected, the pill opens the account: the address, the network, the
 * account pages (grouped, with the retrieve signal in words), balances,
 * wallet actions and Switch wallet / Disconnect. A dropdown menu from
 * 768px, a bottom sheet on phones.
 */
const ConnectWalletButton = ({
  presentation = 'responsive',
  className,
  loading,
  balance,
  stakedTokenCount,
  hasUnclaimedRewards = false,
  retrievableEth = null,
  liquid = false,
  compactInHeader = false,
}: ConnectWalletButtonProps) => {
  const t = useTranslations('wallet');
  const { account } = useActiveWeb3React();
  const mode: ConnectWalletPresentation = presentation;

  if (!account) {
    return (
      // The wallet modal UI is a lazy chunk that mounts on demand; hover and
      // focus warm it, so the click still feels instant.
      <div className="ml-auto">
        <ConnectWalletAction
          showIcon={false}
          label={
            compactInHeader ? (
              <>
                <span className="sm:hidden lg:inline xl:hidden">{t('connect.buttonShort')}</span>
                <span className="hidden sm:inline lg:hidden xl:inline">{t('connect.button')}</span>
              </>
            ) : undefined
          }
          className={cn('min-h-11 sm:min-h-10', liquid && 'liquid-glass-cta', className)}
        />
      </div>
    );
  }

  const details: AccountDetailsProps = {
    loading,
    balance,
    stakedTokenCount,
    hasUnclaimedRewards,
    retrievableEth,
  };

  const sheet = (
    <AccountSheet
      {...details}
      trigger={
        <SheetTrigger asChild>
          <WalletPill
            address={account}
            hasUnclaimedRewards={hasUnclaimedRewards}
            withChevron={false}
            liquid={liquid}
            testId="wallet-account-trigger"
            badgeClassName="min-[360px]:hidden"
            className={cn(mode === 'responsive' && 'md:hidden', className)}
          />
        </SheetTrigger>
      }
    />
  );
  const menu = (
    <AccountMenu
      {...details}
      trigger={
        <DropdownMenuTrigger asChild>
          <WalletPill
            address={account}
            hasUnclaimedRewards={hasUnclaimedRewards}
            withChevron
            liquid={liquid}
            testId="wallet-menu-trigger"
            badgeClassName={mode === 'responsive' ? 'hidden lg:inline-flex' : undefined}
            className={cn(mode === 'responsive' && 'hidden md:inline-flex', className)}
          />
        </DropdownMenuTrigger>
      }
    />
  );

  if (mode === 'sheet') return sheet;
  if (mode === 'menu') return menu;
  return (
    <>
      {sheet}
      {menu}
    </>
  );
};

export default ConnectWalletButton;
