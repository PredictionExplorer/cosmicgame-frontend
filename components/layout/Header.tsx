'use client';

import { useState, useEffect, useMemo, type FC } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Menu } from 'lucide-react';
import { formatEther } from 'viem';

import { cn } from '@/lib/utils';
import getNAVs from '@/config/nav';
import ConnectWalletButton from '@/components/common/ConnectWalletButton';
import { AppBarWrapper, DrawerList } from '@/components/styled';
import ListNavItem from '@/components/common/ListNavItem';
import ListItemButton from '@/components/common/ListItemButton';
import { useApiData } from '@/contexts/ApiDataContext';
import { useActiveWeb3React } from '@/hooks/web3';
import { useUserBalance, useUserInfo } from '@/hooks/useApiQuery';
import { useStakedToken } from '@/contexts/StakedTokenContext';
import { useSystemMode } from '@/contexts/SystemModeContext';
import useRWLKNFTContract from '@/hooks/useRWLKNFTContract';
import { HEADER_POLL_INTERVAL_MS } from '@/config/constants';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';

interface Balance {
  CosmicToken: number;
  ETH: number;
  CosmicSignature: number;
  RWLK: number;
}

const Header: FC = () => {
  const [mobileView, setMobileView] = useState<boolean>(false);
  const [drawerOpen, setDrawerOpen] = useState<boolean>(false);

  const { apiData: status } = useApiData();
  const { account } = useActiveWeb3React();
  const nftContract = useRWLKNFTContract();

  const { data: userBalance, isLoading: isLoadingBalance } = useUserBalance(account);
  const { data: userInfo, isLoading: isLoadingUserInfo } = useUserInfo(account);

  const [rwlkCount, setRwlkCount] = useState<number>(0);
  useEffect(() => {
    if (!account || !nftContract) return;
    const fetchRwlk = async () => {
      try {
        const tokens = (await nftContract.read.walletOfOwner?.([account as `0x${string}`])) as
          | readonly bigint[]
          | undefined;
        setRwlkCount(tokens?.length ?? 0);
      } catch {
        setRwlkCount(0);
      }
    };
    fetchRwlk();
    const intervalId = setInterval(fetchRwlk, HEADER_POLL_INTERVAL_MS);
    return () => clearInterval(intervalId);
  }, [account, nftContract]);

  const balance = useMemo<Balance>(
    () => ({
      CosmicToken: userBalance ? Number(formatEther(BigInt(userBalance.CosmicTokenBalance))) : 0,
      ETH: userBalance ? Number(formatEther(BigInt(userBalance.ETH_Balance))) : 0,
      CosmicSignature: userInfo?.UserInfo?.TotalCSTokensWon ?? 0,
      RWLK: rwlkCount,
    }),
    [userBalance, userInfo, rwlkCount],
  );

  const loading = (!!account && !!nftContract && (isLoadingBalance || isLoadingUserInfo)) || false;

  const { cstokens: stakedCSTokens, rwlktokens: stakedRWLKTokens } = useStakedToken();

  const systemModeCtx = useSystemMode();
  const systemMode = systemModeCtx?.data ?? 0;

  useEffect(() => {
    const handleWindowResize = () => {
      setMobileView(window.innerWidth < 1024);
    };

    handleWindowResize();

    window.addEventListener('resize', handleWindowResize);
    return () => {
      window.removeEventListener('resize', handleWindowResize);
    };
  }, []);

  const navs = getNAVs(status, account);

  const handleDrawerOpen = () => setDrawerOpen(true);

  const renderDesktop = () => (
    <nav className="flex items-center">
      <Link href="/">
        <Image src="/images/logo2.svg" width={48} height={48} alt="logo" />
      </Link>

      {navs.map((nav, i) => (
        <ListNavItem key={i} nav={nav} />
      ))}

      <ConnectWalletButton
        isMobileView={false}
        loading={loading}
        balance={balance}
        stakedTokenCount={{
          cst: stakedCSTokens?.length,
          rwalk: stakedRWLKTokens?.length,
        }}
      />
    </nav>
  );

  const renderMobile = () => {
    const hasNotifications =
      account &&
      (status?.ETHRaffleToClaim > 0 ||
        status?.NumDonatedNFTToClaim > 0 ||
        (status?.UnclaimedStakingReward > 0 && (status?.claimableActionIds?.length ?? 0) > 0));

    return (
      <nav className="flex items-center">
        <Button
          variant="ghost"
          size="icon"
          aria-label="menu"
          aria-haspopup="true"
          onClick={handleDrawerOpen}
          className="mr-2"
        >
          {hasNotifications ? (
            <span className="relative inline-flex">
              <Menu className="h-6 w-6" />
              <span className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-destructive" />
            </span>
          ) : (
            <Menu className="h-6 w-6" />
          )}
        </Button>

        <Link href="/">
          <Image src="/images/logo2.svg" width={48} height={48} alt="logo" />
        </Link>

        <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
          <SheetContent side="left" className="w-[265px] p-0 sm:max-w-[265px]">
            <SheetTitle className="sr-only">Navigation</SheetTitle>
            <DrawerList>
              <div className="px-4 py-2">
                <ConnectWalletButton
                  isMobileView
                  balance={balance}
                  loading={loading}
                  stakedTokenCount={{
                    cst: stakedCSTokens?.length,
                    rwalk: stakedRWLKTokens?.length,
                  }}
                />
              </div>

              {navs.map((nav, i) => (
                <ListItemButton key={i} nav={nav} />
              ))}

              {account && (
                <>
                  <Separator />

                  <ListItemButton nav={{ title: 'My Statistics', route: '/my-statistics' }} />
                  <ListItemButton nav={{ title: 'My Tokens', route: '/my-tokens' }} />
                  <ListItemButton nav={{ title: 'My Staking', route: '/my-staking' }} />
                  <ListItemButton
                    nav={{
                      title: 'History of Winnings',
                      route: '/winning-history',
                    }}
                  />

                  <Separator />

                  <div className="block px-4 py-2">
                    <p className="text-base text-foreground">BALANCE:</p>
                    {loading ? (
                      <p className="text-primary">Loading...</p>
                    ) : (
                      <>
                        <div className="mt-2 flex justify-between">
                          <span className="text-sm italic font-semibold text-secondary">ETH:</span>
                          <span className="text-sm italic font-semibold text-secondary">
                            {balance.ETH.toFixed(2)}
                          </span>
                        </div>

                        <div className="mt-2 flex justify-between">
                          <span className="text-sm italic font-semibold text-secondary">
                            CST (ERC20):
                          </span>
                          <span className="text-sm italic font-semibold text-secondary">
                            {balance.CosmicToken.toFixed(2)}
                          </span>
                        </div>

                        <div className="mt-2 flex justify-between">
                          <span className="text-sm italic font-semibold text-secondary">
                            CS NFT (ERC721):
                          </span>
                          <span className="text-sm italic font-semibold text-secondary">
                            {balance.CosmicSignature} tokens
                          </span>
                        </div>

                        <div className="mt-2 flex justify-between">
                          <span className="text-sm italic font-semibold text-secondary">
                            RWLK (ERC721):
                          </span>
                          <span className="text-sm italic font-semibold text-secondary">
                            {balance.RWLK} tokens
                          </span>
                        </div>
                      </>
                    )}
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between px-4 py-2">
                    <p className="text-base text-foreground">STAKED CST NFT:</p>
                    <p className="text-base font-semibold text-secondary">
                      {stakedCSTokens?.length}
                    </p>
                  </div>
                  <div className="flex items-center justify-between px-4 py-2">
                    <p className="text-base text-foreground">STAKED RWALK NFT:</p>
                    <p className="text-base font-semibold text-secondary">
                      {stakedRWLKTokens?.length}
                    </p>
                  </div>
                </>
              )}
            </DrawerList>
          </SheetContent>
        </Sheet>
      </nav>
    );
  };

  return (
    <AppBarWrapper>
      <div className="mx-auto w-full max-w-7xl px-4">
        {systemMode > 0 && (
          <div
            className={cn(
              'fixed left-0 right-0 bg-[#F3D217] px-8 py-2 text-black',
              mobileView ? 'top-[88px]' : 'top-[96px]',
            )}
          >
            <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr]">
              <p className="text-base">
                {systemMode === 1
                  ? 'The system will enter maintenance mode as soon as prize claim transaction is executed. The administrator will make adjustments to the parameters of the system and after that you will be able to play again.'
                  : 'The system is in maintenance mode. The administrator will make adjustments to the parameters of the system and after that you will be able to play again.'}
              </p>
              <h5 className="self-center text-center text-xl font-bold">
                {systemMode === 1 ? 'MAINTENANCE PENDING' : 'MAINTENANCE MODE'}
              </h5>
            </div>
          </div>
        )}

        {mobileView ? renderMobile() : renderDesktop()}
      </div>
    </AppBarWrapper>
  );
};

export default Header;
