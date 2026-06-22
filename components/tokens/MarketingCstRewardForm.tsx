'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import { writeContract } from '@wagmi/core';
import { useQueryClient } from '@tanstack/react-query';
import { ArrowUpRight, Loader2, SendHorizontal } from 'lucide-react';
import { toast } from 'sonner';
import { formatUnits, getAddress, isAddress, parseUnits, zeroAddress } from 'viem';
import { useConfig, usePublicClient } from 'wagmi';

import { cosmicTokenAbi, marketingWalletAbi } from '@/contracts/abis';
import { getExplorerUrl, shortenHex } from '@/utils';

import { activeChain } from '@/config/chains';
import { useContractAddresses } from '@/contexts/ContractAddressesContext';
import { useActiveWeb3React } from '@/hooks/web3';
import {
  getEthErrorMessage,
  isUserRejection,
  reportError,
  WALLET_TRANSACTION_CANCELLED_MESSAGE,
} from '@/utils/errors';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface MarketingCstRewardFormProps {
  marketingWalletAddress: string | null | undefined;
  ownerAddress: string | null | undefined;
  treasurerAddress: string | null | undefined;
  historyHref?: string;
}

interface ValidReward {
  recipient: `0x${string}`;
  amountWei: bigint;
}

function normalizeAddress(value: string | null | undefined): `0x${string}` | null {
  const trimmed = value?.trim() ?? '';
  if (!isAddress(trimmed)) return null;
  return getAddress(trimmed) as `0x${string}`;
}

function formatCstUnits(value: bigint | null, decimals: number): string {
  if (value == null) return '...';
  const formatted = Number(formatUnits(value, decimals));
  if (!Number.isFinite(formatted)) return formatUnits(value, decimals);
  return formatted < 10 ? formatted.toFixed(4) : formatted.toFixed(2);
}

export function MarketingCstRewardForm({
  marketingWalletAddress,
  ownerAddress,
  treasurerAddress,
  historyHref,
}: MarketingCstRewardFormProps) {
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [decimals, setDecimals] = useState(18);
  const [balanceWei, setBalanceWei] = useState<bigint | null>(null);
  const [balanceLoading, setBalanceLoading] = useState(false);
  const [balanceError, setBalanceError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [txHash, setTxHash] = useState<`0x${string}` | null>(null);

  const config = useConfig();
  const publicClient = usePublicClient({ chainId: activeChain.id });
  const queryClient = useQueryClient();
  const contractAddrs = useContractAddresses();
  const { account, active } = useActiveWeb3React();

  const normalizedMarketingWallet = useMemo(
    () => normalizeAddress(marketingWalletAddress),
    [marketingWalletAddress],
  );
  const normalizedOwner = useMemo(() => normalizeAddress(ownerAddress), [ownerAddress]);
  const normalizedTreasurer = useMemo(() => normalizeAddress(treasurerAddress), [treasurerAddress]);

  useEffect(() => {
    if (!publicClient || !contractAddrs.cosmicToken || !normalizedMarketingWallet) {
      setBalanceWei(null);
      return;
    }

    let cancelled = false;
    const loadBalance = async () => {
      setBalanceLoading(true);
      setBalanceError(null);

      try {
        let nextDecimals = 18;
        try {
          nextDecimals = Number(
            await publicClient.readContract({
              address: contractAddrs.cosmicToken as `0x${string}`,
              abi: cosmicTokenAbi,
              functionName: 'decimals',
            }),
          );
        } catch (err) {
          reportError(err, 'MarketingWallet CST decimals read');
          toast.warning('Unable to read CST decimals; assuming 18 decimal places.');
        }

        const balance = (await publicClient.readContract({
          address: contractAddrs.cosmicToken as `0x${string}`,
          abi: cosmicTokenAbi,
          functionName: 'balanceOf',
          args: [normalizedMarketingWallet],
        })) as bigint;

        if (!cancelled) {
          setDecimals(Number.isFinite(nextDecimals) ? nextDecimals : 18);
          setBalanceWei(balance);
        }
      } catch (err) {
        reportError(err, 'MarketingWallet CST balance read');
        if (!cancelled) {
          setBalanceWei(null);
          setBalanceError('Unable to read the outreach reserve CST balance. Please try again.');
        }
      } finally {
        if (!cancelled) setBalanceLoading(false);
      }
    };

    void loadBalance();

    return () => {
      cancelled = true;
    };
  }, [contractAddrs.cosmicToken, normalizedMarketingWallet, publicClient]);

  const validateReward = (): ValidReward | null => {
    if (!contractAddrs.cosmicToken) {
      toast.error('CST token address is not available yet.');
      return null;
    }
    if (!active || !account) {
      toast.error('Connect your wallet before paying a CST reward.');
      return null;
    }
    if (!normalizedMarketingWallet) {
      toast.error('Outreach reserve wallet is not available.');
      return null;
    }
    if (!normalizedTreasurer) {
      toast.error('Marketing wallet treasurer is not available.');
      return null;
    }
    if (account.toLowerCase() !== normalizedTreasurer.toLowerCase()) {
      toast.error('Connect the current marketing wallet treasurer before paying CST rewards.');
      return null;
    }

    const normalizedRecipient = normalizeAddress(recipient);
    if (!normalizedRecipient || normalizedRecipient.toLowerCase() === zeroAddress) {
      toast.error('Enter a valid recipient address.');
      return null;
    }

    const amountText = amount.trim();
    if (!/^\d+(\.\d+)?$/.test(amountText)) {
      toast.error('Enter a valid CST amount.');
      return null;
    }

    let amountWei: bigint;
    try {
      amountWei = parseUnits(amountText, decimals);
    } catch {
      toast.error('Enter a CST amount with a valid number of decimals.');
      return null;
    }

    if (amountWei <= 0n) {
      toast.error('Enter an amount greater than zero.');
      return null;
    }
    if (balanceWei == null) {
      toast.error('Outreach reserve CST balance is still loading. Please try again in a moment.');
      return null;
    }
    if (amountWei > balanceWei) {
      toast.error('Insufficient outreach reserve CST balance.');
      return null;
    }

    return { recipient: normalizedRecipient, amountWei };
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const validReward = validateReward();
    if (!validReward || !normalizedMarketingWallet) return;

    setSubmitting(true);
    setTxHash(null);
    try {
      const hash = await writeContract(config, {
        address: normalizedMarketingWallet,
        abi: marketingWalletAbi,
        functionName: 'payReward',
        args: [validReward.recipient, validReward.amountWei],
        account: account as `0x${string}`,
        chainId: activeChain.id,
      });

      await publicClient?.waitForTransactionReceipt({ hash });
      setTxHash(hash);
      setRecipient('');
      setAmount('');
      setBalanceWei((current) => (current == null ? current : current - validReward.amountWei));

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['userBalance', normalizedMarketingWallet] }),
        queryClient.invalidateQueries({ queryKey: ['userBalance', validReward.recipient] }),
        queryClient.invalidateQueries({ queryKey: ['ctTransfers', normalizedMarketingWallet] }),
        queryClient.invalidateQueries({ queryKey: ['ctTransfers', validReward.recipient] }),
        queryClient.invalidateQueries({ queryKey: ['ctBalancesDistribution'] }),
        queryClient.invalidateQueries({ queryKey: ['dashboardInfo'] }),
      ]);

      toast.success('Marketing CST reward confirmed.');
    } catch (err) {
      if (isUserRejection(err)) {
        toast.info(WALLET_TRANSACTION_CANCELLED_MESSAGE);
        return;
      }
      reportError(err, 'MarketingWallet payReward');
      toast.error(getEthErrorMessage(err, 'Unable to pay CST reward. Please try again.'));
    } finally {
      setSubmitting(false);
    }
  };

  const submitDisabled =
    submitting ||
    balanceLoading ||
    !active ||
    !account ||
    !normalizedMarketingWallet ||
    !normalizedTreasurer ||
    !contractAddrs.cosmicToken ||
    Boolean(balanceError);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pay CST Reward</CardTitle>
        <CardDescription>
          Calls the outreach reserve contract&apos;s `payReward` function. The connected wallet must
          be the current treasurer.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-6 grid gap-3 rounded-lg border border-white/[0.06] bg-white/[0.025] p-4 text-sm sm:grid-cols-2">
          <div>
            <p className="text-xs uppercase tracking-wider text-muted-foreground">
              Outreach reserve
            </p>
            <p className="mt-1 font-mono text-foreground">
              {normalizedMarketingWallet ? shortenHex(normalizedMarketingWallet, 6) : 'Unavailable'}
            </p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wider text-muted-foreground">Available CST</p>
            <p className="mt-1 font-semibold text-foreground">
              {balanceLoading ? 'Loading...' : `${formatCstUnits(balanceWei, decimals)} CST`}
            </p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wider text-muted-foreground">Owner</p>
            <p className="mt-1 font-mono text-foreground">
              {normalizedOwner ? shortenHex(normalizedOwner, 6) : 'Unavailable'}
            </p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wider text-muted-foreground">Treasurer</p>
            <p className="mt-1 font-mono text-foreground">
              {normalizedTreasurer ? shortenHex(normalizedTreasurer, 6) : 'Unavailable'}
            </p>
          </div>
        </div>

        {balanceError ? <p className="mb-4 text-sm text-destructive">{balanceError}</p> : null}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="marketing-cst-recipient">Recipient address</Label>
            <Input
              id="marketing-cst-recipient"
              value={recipient}
              onChange={(event) => setRecipient(event.target.value)}
              placeholder="0x..."
              autoComplete="off"
              disabled={submitting}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="marketing-cst-amount">Amount</Label>
            <Input
              id="marketing-cst-amount"
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              placeholder="0.00"
              inputMode="decimal"
              autoComplete="off"
              disabled={submitting}
            />
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <Button type="submit" disabled={submitDisabled} aria-label="Pay CST reward">
              {submitting ? (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
              ) : (
                <SendHorizontal className="h-4 w-4" aria-hidden />
              )}
              {submitting ? 'Paying...' : 'Pay CST Reward'}
            </Button>

            {historyHref ? (
              <a
                href={historyHref}
                className="text-sm font-medium text-primary underline-offset-4 hover:underline"
              >
                View outreach reserve transfers
              </a>
            ) : null}
          </div>
        </form>

        {txHash ? (
          <div className="mt-5 rounded-lg border border-emerald-400/20 bg-emerald-400/[0.06] p-4 text-sm">
            <p className="font-medium text-emerald-200">Marketing CST reward confirmed.</p>
            <a
              href={getExplorerUrl('tx', txHash)}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-flex items-center gap-1 text-primary underline-offset-4 hover:underline"
            >
              View transaction
              <ArrowUpRight className="h-3.5 w-3.5" aria-hidden />
            </a>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
