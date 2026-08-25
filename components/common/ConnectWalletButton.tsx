import {
  ChevronDown,
  LayoutDashboard,
  Gift,
  Coins,
  Layers,
  History,
  SendHorizontal,
  Wallet,
  Copy,
  Check,
} from 'lucide-react';
import { useState } from 'react';
import { useTranslations } from 'next-intl';

import { shortenHex } from '@/utils';

import { formatFixed } from '@/utils/format';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { AddCstToMetaMaskButton } from '@/components/common/AddCstToMetaMaskButton';
import { ChaosZeroButton } from '@/components/common/ChaosZeroButton';
import { NftMarketplaceButton } from '@/components/common/NftMarketplaceButton';
import { UniswapTradeButton } from '@/components/common/UniswapTradeButton';
import { MobileWallet, NavLink } from '@/components/styled';
import { Button } from '@/components/ui/button';
import { useWalletUi } from '@/contexts/WalletUiContext';
import { useActiveWeb3React } from '@/hooks/web3';

interface Balance {
  ETH: number;
  CosmicToken: number;
  CosmicSignature: number;
  RWLK: number;
}

interface AnchoredTokenCount {
  cst: number;
  rwalk: number;
}

interface ConnectWalletButtonProps {
  isMobileView: boolean;
  loading: boolean;
  balance: Balance;
  stakedTokenCount: AnchoredTokenCount;
  hasUnclaimedRewards?: boolean;
}

const ConnectWalletButton = ({
  isMobileView,
  loading,
  balance,
  stakedTokenCount,
  hasUnclaimedRewards = false,
}: ConnectWalletButtonProps) => {
  const t = useTranslations('wallet');
  const { account } = useActiveWeb3React();
  const { requestConnectModal, warmConnectModal } = useWalletUi();
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!account) return;
    await navigator.clipboard.writeText(account);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (account) {
    if (isMobileView) {
      return <MobileWallet label={shortenHex(account)} />;
    }

    return (
      <DropdownMenu>
        <DropdownMenuTrigger className="ml-auto inline-flex h-auto cursor-pointer items-center gap-2 rounded-full border border-white/[0.1] bg-white/[0.03] px-4 py-2 text-sm outline-none hover:bg-white/[0.06] transition-colors">
          <Wallet className="h-3.5 w-3.5 text-muted-foreground" />
          {shortenHex(account)}
          {hasUnclaimedRewards && (
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
          )}
          <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
        </DropdownMenuTrigger>
        {/* Sits in the chrome layer with the header it drops out of; the
            previous z-[10003] was outside any scale and beat the skip link. */}
        <DropdownMenuContent className="z-50 w-[280px]" align="end">
          {/* Address header */}
          <div className="flex items-center justify-between px-3 py-2">
            <span className="text-xs font-mono text-muted-foreground">
              {shortenHex(account, 8)}
            </span>
            <button
              onClick={handleCopy}
              aria-label={
                copied ? t('accessibility.addressCopied') : t('accessibility.copyAddress')
              }
              className="text-muted-foreground/50 hover:text-muted-foreground transition-colors"
            >
              {copied ? (
                <Check className="h-3.5 w-3.5 text-emerald-400" />
              ) : (
                <Copy className="h-3.5 w-3.5" />
              )}
            </button>
          </div>

          <DropdownMenuSeparator />

          {/* Account links */}
          <div className="px-1 py-1">
            <p className="px-2 py-1 text-[10px] font-medium uppercase tracking-wider text-muted-foreground/50">
              {t('account.heading')}
            </p>
            <DropdownMenuItem className="cursor-pointer p-0">
              <NavLink
                href="/my-statistics"
                className="flex w-full items-center gap-2.5 px-2 py-1.5 text-sm"
              >
                <LayoutDashboard className="h-3.5 w-3.5 text-muted-foreground" />
                {t('account.myDashboard')}
              </NavLink>
            </DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer p-0">
              <NavLink
                href="/my-allocations"
                className="flex w-full items-center gap-2.5 px-2 py-1.5 text-sm"
              >
                <Gift className="h-3.5 w-3.5 text-muted-foreground" />
                {t('account.myRewards')}
                {hasUnclaimedRewards && (
                  <span className="ml-auto h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                )}
              </NavLink>
            </DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer p-0">
              <NavLink
                href="/my-tokens"
                className="flex w-full items-center gap-2.5 px-2 py-1.5 text-sm"
              >
                <Coins className="h-3.5 w-3.5 text-muted-foreground" />
                {t('account.myNfts')}
              </NavLink>
            </DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer p-0">
              <NftMarketplaceButton variant="menu" />
            </DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer p-0">
              <NavLink
                href="/transfer-cst"
                className="flex w-full items-center gap-2.5 px-2 py-1.5 text-sm"
              >
                <SendHorizontal className="h-3.5 w-3.5 text-muted-foreground" />
                {t('account.transferCst')}
              </NavLink>
            </DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer p-0">
              <UniswapTradeButton variant="menu" />
            </DropdownMenuItem>
            <AddCstToMetaMaskButton />
            <DropdownMenuItem className="cursor-pointer p-0">
              <ChaosZeroButton variant="menu" />
            </DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer p-0">
              <NavLink
                href="/my-anchors"
                className="flex w-full items-center gap-2.5 px-2 py-1.5 text-sm"
              >
                <Layers className="h-3.5 w-3.5 text-muted-foreground" />
                {t('account.myAnchors')}
              </NavLink>
            </DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer p-0">
              <NavLink
                href="/recipient-history"
                className="flex w-full items-center gap-2.5 px-2 py-1.5 text-sm"
              >
                <History className="h-3.5 w-3.5 text-muted-foreground" />
                {t('account.winningHistory')}
              </NavLink>
            </DropdownMenuItem>
          </div>

          <DropdownMenuSeparator />

          {/* Balances */}
          <div className="px-3 py-2 space-y-1.5">
            <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground/50">
              {t('labels.balancesHeading')}
            </p>
            {loading ? (
              <p className="text-xs text-primary">{t('labels.loading')}</p>
            ) : (
              <>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">{t('balances.eth')}</span>
                  <span className="font-medium">{formatFixed(balance.ETH, 4)}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">{t('balances.cst')}</span>
                  <span className="font-medium">{formatFixed(balance.CosmicToken, 2)}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">{t('balances.cosmicNfts')}</span>
                  <span className="font-medium">
                    {t('labels.nftCount', { count: balance.CosmicSignature })}
                  </span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">{t('balances.rwlkNfts')}</span>
                  <span className="font-medium">
                    {t('labels.nftCount', { count: balance.RWLK })}
                  </span>
                </div>
              </>
            )}
          </div>

          <DropdownMenuSeparator />

          {/* Staking */}
          <div className="px-3 py-2 space-y-1.5">
            <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground/50">
              {t('labels.anchoredHeading')}
            </p>
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">{t('balances.anchoredCst')}</span>
              <span className="font-medium text-primary">
                {t('labels.nftCount', { count: stakedTokenCount.cst })}
              </span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">{t('balances.anchoredRwlk')}</span>
              <span className="font-medium text-primary">
                {t('labels.nftCount', { count: stakedTokenCount.rwalk })}
              </span>
            </div>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    // Our own trigger (not RainbowKit's ConnectButton): the wallet modal UI
    // is deferred to a lazy chunk that mounts on demand, so nothing from
    // RainbowKit can render before intent. Hover/focus warms the chunk so
    // the click still feels instant.
    <div className="ml-auto">
      <Button
        onClick={requestConnectModal}
        onPointerEnter={warmConnectModal}
        onFocus={warmConnectModal}
        className="min-h-11 sm:min-h-0"
        data-testid="connect-wallet-button"
      >
        {t('connect.button')}
      </Button>
    </div>
  );
};

export default ConnectWalletButton;
