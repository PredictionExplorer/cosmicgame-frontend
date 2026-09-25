'use client';

import { useEffect } from 'react';

import ConnectWalletButton from '@/components/common/ConnectWalletButton';
import { WrongNetworkChip } from '@/components/wallet/NetworkGuard';

import { useAccountSummary } from './useAccountSummary';

/**
 * The header's connected wallet: the wrong-network chip, then the wallet pill
 * with its account menu (a sheet on phones). The header loads this module
 * only while a wallet is connected, so the balance reads, the contract hooks
 * and the account menu stay out of every visitor's first download. It tells
 * the header whether something waits to be retrieved, for the menu button's
 * mark and the drawer's My Allocations row.
 */
export default function HeaderAccount({
  onRetrievableChange,
}: {
  onRetrievableChange: (hasRetrievable: boolean) => void;
}) {
  const summary = useAccountSummary();

  useEffect(() => {
    onRetrievableChange(summary.hasRetrievable);
  }, [onRetrievableChange, summary.hasRetrievable]);
  useEffect(() => () => onRetrievableChange(false), [onRetrievableChange]);

  return (
    <>
      {/* From 1024px the wallet pill carries the wrong-network badge. */}
      <div className="lg:hidden">
        <WrongNetworkChip />
      </div>
      <div className="min-w-0">
        <ConnectWalletButton
          balance={summary.balance}
          loading={summary.loading}
          stakedTokenCount={summary.anchored}
          hasUnclaimedRewards={summary.hasRetrievable}
          retrievableEth={summary.retrievableEth}
          className="whitespace-nowrap"
        />
      </div>
    </>
  );
}
