import {
  ChevronDown,
  LayoutDashboard,
  Gift,
  Coins,
  Layers,
  History,
  Wallet,
  Copy,
  Check,
} from 'lucide-react';
import { useState } from 'react';
import { ConnectButton as RainbowConnectButton } from '@rainbow-me/rainbowkit';

import { shortenHex } from '@/utils';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MobileWallet, NavLink } from '@/components/styled';
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
  const { account } = useActiveWeb3React();
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
        <DropdownMenuContent className="z-[10003] w-[280px]" align="end">
          {/* Address header */}
          <div className="flex items-center justify-between px-3 py-2">
            <span className="text-xs font-mono text-muted-foreground">
              {shortenHex(account, 8)}
            </span>
            <button
              onClick={handleCopy}
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
              Account
            </p>
            <DropdownMenuItem className="cursor-pointer p-0">
              <NavLink
                href="/my-statistics"
                className="flex w-full items-center gap-2.5 px-2 py-1.5 text-sm"
              >
                <LayoutDashboard className="h-3.5 w-3.5 text-muted-foreground" />
                My Dashboard
              </NavLink>
            </DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer p-0">
              <NavLink
                href="/my-allocations"
                className="flex w-full items-center gap-2.5 px-2 py-1.5 text-sm"
              >
                <Gift className="h-3.5 w-3.5 text-muted-foreground" />
                My Rewards
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
                My Tokens
              </NavLink>
            </DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer p-0">
              <NavLink
                href="/my-anchors"
                className="flex w-full items-center gap-2.5 px-2 py-1.5 text-sm"
              >
                <Layers className="h-3.5 w-3.5 text-muted-foreground" />
                My Anchors
              </NavLink>
            </DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer p-0">
              <NavLink
                href="/recipient-history"
                className="flex w-full items-center gap-2.5 px-2 py-1.5 text-sm"
              >
                <History className="h-3.5 w-3.5 text-muted-foreground" />
                Winning History
              </NavLink>
            </DropdownMenuItem>
          </div>

          <DropdownMenuSeparator />

          {/* Balances */}
          <div className="px-3 py-2 space-y-1.5">
            <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground/50">
              Balances
            </p>
            {loading ? (
              <p className="text-xs text-primary">Loading...</p>
            ) : (
              <>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">ETH</span>
                  <span className="font-medium">{balance.ETH.toFixed(4)}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">CST</span>
                  <span className="font-medium">{balance.CosmicToken.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">COSMIC NFTs</span>
                  <span className="font-medium">{balance.CosmicSignature}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">RWLK NFTs</span>
                  <span className="font-medium">{balance.RWLK}</span>
                </div>
              </>
            )}
          </div>

          <DropdownMenuSeparator />

          {/* Staking */}
          <div className="px-3 py-2 space-y-1.5">
            <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground/50">
              Anchored
            </p>
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">CST NFTs</span>
              <span className="font-medium text-primary">{stakedTokenCount.cst}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">RWLK NFTs</span>
              <span className="font-medium text-primary">{stakedTokenCount.rwalk}</span>
            </div>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <div className="ml-auto">
      <RainbowConnectButton />
    </div>
  );
};

export default ConnectWalletButton;
