import { ChevronDown } from 'lucide-react';
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

interface StakedTokenCount {
  cst: number;
  rwalk: number;
}

interface ConnectWalletButtonProps {
  isMobileView: boolean;
  loading: boolean;
  balance: Balance;
  stakedTokenCount: StakedTokenCount;
}

const ConnectWalletButton = ({
  isMobileView,
  loading,
  balance,
  stakedTokenCount,
}: ConnectWalletButtonProps) => {
  const { account } = useActiveWeb3React();

  if (account) {
    if (isMobileView) {
      return <MobileWallet label={shortenHex(account)} />;
    }

    return (
      <DropdownMenu>
        <DropdownMenuTrigger className="ml-auto inline-flex h-auto cursor-pointer items-center rounded-full border border-border px-4 py-2 text-base outline-none">
          {shortenHex(account)} <ChevronDown className="ml-1 h-4 w-4" />
        </DropdownMenuTrigger>
        <DropdownMenuContent className="z-[10003]" align="center">
          <DropdownMenuItem className="min-w-[166px] cursor-pointer p-0">
            <NavLink href="/my-statistics" className="w-full px-2 py-1.5">
              MY STATISTICS
            </NavLink>
          </DropdownMenuItem>
          <DropdownMenuItem className="min-w-[166px] cursor-pointer p-0">
            <NavLink href="/my-tokens" className="w-full px-2 py-1.5">
              MY TOKENS
            </NavLink>
          </DropdownMenuItem>
          <DropdownMenuItem className="min-w-[166px] cursor-pointer p-0">
            <NavLink href="/my-staking" className="w-full px-2 py-1.5">
              MY STAKING
            </NavLink>
          </DropdownMenuItem>
          <DropdownMenuItem className="cursor-pointer p-0">
            <NavLink href="/winning-history" className="w-full px-2 py-1.5">
              HISTORY OF WINNINGS
            </NavLink>
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <div className="block min-w-[240px] px-2 py-1.5">
            <p className="text-sm">BALANCE:</p>
            {loading ? (
              <p className="text-sm text-primary">Loading...</p>
            ) : (
              <>
                <div className="mt-2 flex justify-between">
                  <p className="text-sm font-semibold italic text-secondary">ETH:</p>
                  <p className="text-sm font-semibold italic text-secondary">
                    {balance.ETH.toFixed(2)}
                  </p>
                </div>
                <div className="mt-2 flex justify-between">
                  <p className="text-sm font-semibold italic text-secondary">CST (ERC20):</p>
                  <p className="text-sm font-semibold italic text-secondary">
                    {balance.CosmicToken.toFixed(2)}
                  </p>
                </div>
                <div className="mt-2 flex justify-between">
                  <p className="text-sm font-semibold italic text-secondary">CS NFT (ERC721):</p>
                  <p className="text-sm font-semibold italic text-secondary">
                    {balance.CosmicSignature} tokens
                  </p>
                </div>
                <div className="mt-2 flex justify-between">
                  <p className="text-sm font-semibold italic text-secondary">RWLK (ERC721):</p>
                  <p className="text-sm font-semibold italic text-secondary">
                    {balance.RWLK} tokens
                  </p>
                </div>
              </>
            )}
          </div>

          <DropdownMenuSeparator />

          <div className="flex justify-between px-2 py-1.5 text-sm">
            <span>STAKED CST NFT:</span>
            <span className="text-primary">{stakedTokenCount.cst}</span>
          </div>
          <div className="flex justify-between px-2 py-1.5 text-sm">
            <span>STAKED RWALK NFT:</span>
            <span className="text-primary">{stakedTokenCount.rwalk}</span>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return <RainbowConnectButton />;
};

export default ConnectWalletButton;
