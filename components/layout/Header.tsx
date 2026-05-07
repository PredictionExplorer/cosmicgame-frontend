'use client';

import { useState, useEffect, useMemo, type FC } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowUpRight, Menu } from 'lucide-react';
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
import { useAnchoredToken } from '@/contexts/AnchoredTokenContext';
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

  const { cstokens: anchoredCSTokens, rwlktokens: anchoredRWLKTokens } = useAnchoredToken();

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

  const hasUnclaimedRewards = !!(
    account &&
    ((status?.ETHRaffleToClaim ?? 0) > 0 ||
      (status?.NumDonatedNFTToClaim ?? 0) > 0 ||
      ((status?.UnretrievedAnchorDistribution ?? 0) > 0 &&
        (status?.claimableActionIds?.length ?? 0) > 0))
  );

  const renderDesktop = () => (
    <nav aria-label="Primary" className="flex items-center gap-6 lg:gap-8">
      <Link
        href="/"
        aria-label="Cosmic Signature home"
        className="flex items-center rounded-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[oklch(84.7%_0.149_213)]"
      >
        <Image
          src="/images/logo2.svg"
          width={48}
          height={48}
          alt="Cosmic Signature"
          loading="eager"
          className="h-10 w-auto max-h-10 object-contain"
        />
      </Link>

      {navs.map((nav, i) => (
        <ListNavItem key={i} nav={nav} />
      ))}

      <a
        href="https://cosmicsignature.com"
        className="hidden items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3.5 py-1.5 text-xs font-medium uppercase tracking-[0.18em] text-white/70 transition hover:border-[oklch(84.7%_0.149_213)]/40 hover:bg-white/10 hover:text-white xl:inline-flex"
        rel="noopener"
        aria-label="Discover Cosmic Signature"
      >
        <span className="h-1.5 w-1.5 rounded-full bg-[oklch(84.7%_0.149_213)]" aria-hidden />
        Discover
        <ArrowUpRight className="h-3 w-3 opacity-70" aria-hidden />
      </a>

      <ConnectWalletButton
        isMobileView={false}
        loading={loading}
        balance={balance}
        stakedTokenCount={{
          cst: anchoredCSTokens?.length,
          rwalk: anchoredRWLKTokens?.length,
        }}
        hasUnclaimedRewards={hasUnclaimedRewards}
      />
    </nav>
  );

  const renderMobile = () => {
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
          {hasUnclaimedRewards ? (
            <span className="relative inline-flex">
              <Menu className="h-6 w-6" />
              <span className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-emerald-400" />
            </span>
          ) : (
            <Menu className="h-6 w-6" />
          )}
        </Button>

        <Link href="/">
          <Image
            src="/images/logo2.svg"
            width={48}
            height={48}
            alt="logo"
            loading="eager"
            className="h-10 w-auto max-h-10 object-contain"
          />
        </Link>

        <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
          <SheetContent side="left" className="w-[280px] p-0 sm:max-w-[280px]">
            <SheetTitle className="sr-only">Navigation</SheetTitle>
            <DrawerList>
              <div className="px-4 py-3">
                <ConnectWalletButton
                  isMobileView
                  balance={balance}
                  loading={loading}
                  stakedTokenCount={{
                    cst: anchoredCSTokens?.length,
                    rwalk: anchoredRWLKTokens?.length,
                  }}
                />
              </div>

              <Separator />

              {/* Protocol */}
              <p className="px-4 pt-4 pb-1 text-[10px] font-medium uppercase tracking-wider text-muted-foreground/50">
                Protocol
              </p>
              <ListItemButton nav={{ title: 'Gallery', route: '/gallery' }} />

              <Separator className="my-2" />

              {/* Explore */}
              <p className="px-4 pt-2 pb-1 text-[10px] font-medium uppercase tracking-wider text-muted-foreground/50">
                Explore
              </p>
              <ListItemButton nav={{ title: 'Current Cycle', route: '/current-cycle' }} />
              <ListItemButton nav={{ title: 'Allocation Recipients', route: '/allocation' }} />
              <ListItemButton nav={{ title: 'Anchor Distributions', route: '/anchoring' }} />
              <ListItemButton nav={{ title: 'Outreach Reserve', route: '/marketing' }} />
              <ListItemButton nav={{ title: 'Statistics', route: '/statistics' }} />
              <ListItemButton nav={{ title: 'Contracts', route: '/contracts' }} />

              <Separator className="my-2" />

              {/* Help */}
              <p className="px-4 pt-2 pb-1 text-[10px] font-medium uppercase tracking-wider text-muted-foreground/50">
                Help
              </p>
              <ListItemButton nav={{ title: 'How It Works', route: '/how-it-works' }} />
              <ListItemButton nav={{ title: 'FAQ', route: '/faq' }} />

              <Separator className="my-2" />

              {/* Cross-host link to the marketing site */}
              <a
                href="https://cosmicsignature.com"
                rel="noopener"
                aria-label="Discover Cosmic Signature"
                className="mx-4 mt-2 inline-flex items-center justify-between rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/70 transition hover:border-[oklch(84.7%_0.149_213)]/40 hover:bg-white/10 hover:text-white"
              >
                <span className="flex items-center gap-2">
                  <span
                    className="h-1.5 w-1.5 rounded-full bg-[oklch(84.7%_0.149_213)]"
                    aria-hidden
                  />
                  Discover
                </span>
                <ArrowUpRight className="h-4 w-4 opacity-70" aria-hidden />
              </a>

              {account && (
                <>
                  <Separator className="my-2" />

                  {/* My Account */}
                  <p className="px-4 pt-2 pb-1 text-[10px] font-medium uppercase tracking-wider text-muted-foreground/50">
                    My Account
                  </p>
                  <ListItemButton nav={{ title: 'My Dashboard', route: '/my-statistics' }} />
                  <ListItemButton
                    nav={{
                      title: hasUnclaimedRewards ? (
                        <span className="flex items-center gap-2">
                          My Allocations
                          <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                        </span>
                      ) : (
                        'My Allocations'
                      ),
                      route: '/my-allocations',
                    }}
                  />
                  <ListItemButton nav={{ title: 'My Tokens', route: '/my-tokens' }} />
                  <ListItemButton nav={{ title: 'My Anchors', route: '/my-anchors' }} />
                  <ListItemButton
                    nav={{ title: 'Recipient History', route: '/recipient-history' }}
                  />

                  <Separator className="my-2" />

                  {/* Balances */}
                  <div className="px-4 py-2 space-y-1.5">
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

                  <div className="px-4 py-2 space-y-1.5">
                    <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground/50">
                      Anchored
                    </p>
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">CST NFTs</span>
                      <span className="font-medium text-primary">{anchoredCSTokens?.length}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">RWLK NFTs</span>
                      <span className="font-medium text-primary">{anchoredRWLKTokens?.length}</span>
                    </div>
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
              'fixed left-0 right-0 bg-amber-500/95 backdrop-blur-sm px-6 py-2.5 text-black z-40',
              mobileView ? 'top-[88px]' : 'top-[96px]',
            )}
          >
            <div className="mx-auto max-w-7xl flex items-center justify-between gap-4">
              <p className="text-sm">
                {systemMode === 1
                  ? 'Maintenance mode activates after the current allocation finalizes. The protocol reopens once adjustments are complete.'
                  : 'Protocol is in maintenance mode. Gestures will resume once parameter adjustments are complete.'}
              </p>
              <span className="shrink-0 rounded-full bg-black/10 px-3 py-1 text-xs font-bold uppercase tracking-wider">
                {systemMode === 1 ? 'Pending' : 'Maintenance'}
              </span>
            </div>
          </div>
        )}

        {mobileView ? renderMobile() : renderDesktop()}
      </div>
    </AppBarWrapper>
  );
};

export default Header;
