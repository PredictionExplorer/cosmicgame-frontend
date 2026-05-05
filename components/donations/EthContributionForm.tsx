'use client';

import { useMemo, useState } from 'react';
import { ConnectButton as RainbowConnectButton } from '@rainbow-me/rainbowkit';
import { parseEther } from 'viem';

import { useNotification } from '@/contexts/NotificationContext';
import { useActiveWeb3React } from '@/hooks/web3';
import useCosmicGameContract from '@/hooks/useCosmicGameContract';
import { cn } from '@/lib/utils';
import { asWriteFn } from '@/utils/contractWrite';
import { isUserRejection, reportError, WALLET_TRANSACTION_CANCELLED_MESSAGE } from '@/utils/errors';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Surface } from '@/components/ui/surface';

interface EthContributionFormProps {
  className?: string;
  description?: string;
  onSuccess?: () => void | Promise<unknown>;
  title?: string;
}

function hasValidAmount(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return false;
  if (!/^\d+(\.\d+)?$/.test(trimmed)) return false;
  const numericValue = Number(trimmed);
  return Number.isFinite(numericValue) && numericValue > 0;
}

function hasValidUrl(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return true;

  try {
    const url = new URL(trimmed);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

export function EthContributionForm({
  className,
  description = 'Contributions are recorded for the active cycle by the contract.',
  onSuccess,
  title = 'Make an ETH Contribution',
}: EthContributionFormProps) {
  const [amount, setAmount] = useState('');
  const [metadataTitle, setMetadataTitle] = useState('');
  const [message, setMessage] = useState('');
  const [url, setUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { account } = useActiveWeb3React();
  const cosmicGameContract = useCosmicGameContract();
  const { setNotification } = useNotification();

  const amountIsValid = useMemo(() => hasValidAmount(amount), [amount]);
  const urlIsValid = useMemo(() => hasValidUrl(url), [url]);
  const hasMetadata = [metadataTitle, message, url].some((value) => value.trim().length > 0);
  const canSubmit =
    !!account && !!cosmicGameContract && amountIsValid && urlIsValid && !isSubmitting;

  const handleSubmit = async () => {
    if (!account) {
      setNotification({
        text: 'Please connect your wallet to contribute ETH.',
        type: 'error',
        visible: true,
      });
      return;
    }

    if (!amountIsValid) {
      setNotification({
        text: 'Enter an ETH amount greater than 0.',
        type: 'error',
        visible: true,
      });
      return;
    }

    if (!urlIsValid) {
      setNotification({
        text: 'Enter a valid URL beginning with http:// or https://.',
        type: 'error',
        visible: true,
      });
      return;
    }

    if (!cosmicGameContract) {
      setNotification({
        text: 'Please connect your wallet and ensure you are on the correct network.',
        type: 'error',
        visible: true,
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const value = parseEther(amount.trim());

      if (hasMetadata) {
        const payload = JSON.stringify({
          title: metadataTitle.trim(),
          message: message.trim(),
          url: url.trim(),
        });
        await asWriteFn(cosmicGameContract.write.donateEthWithInfo)([payload], { value });
      } else {
        await asWriteFn(cosmicGameContract.write.donateEth)([], { value });
      }

      setNotification({
        text: `${amount.trim()} ETH contribution submitted successfully.`,
        type: 'success',
        visible: true,
      });
      setAmount('');
      setMetadataTitle('');
      setMessage('');
      setUrl('');
      await onSuccess?.();
    } catch (error: unknown) {
      if (isUserRejection(error)) {
        setNotification({
          text: WALLET_TRANSACTION_CANCELLED_MESSAGE,
          type: 'info',
          visible: true,
        });
      } else {
        reportError(error, 'ETH contribution error');
        setNotification({
          text: 'ETH contribution failed, please check your input and try again.',
          type: 'error',
          visible: true,
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Surface variant="solar" radius="xl" padding="lg" className={cn('mb-12 space-y-5', className)}>
      <div className="space-y-2">
        <h3 className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
          {title}
        </h3>
        <p className="type-body-sm text-muted-foreground">{description}</p>
      </div>

      {!account ? (
        <div className="flex flex-col gap-3 rounded-lg border border-white/[0.08] bg-black/20 p-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted-foreground">Connect your wallet to contribute ETH.</p>
          <div className="sm:shrink-0">
            <RainbowConnectButton />
          </div>
        </div>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-[220px_1fr]">
        <div>
          <Label
            htmlFor="eth-contribution-amount"
            className="mb-1.5 block text-xs text-muted-foreground"
          >
            Amount (ETH)
          </Label>
          <div className="flex items-center gap-2">
            <Input
              id="eth-contribution-amount"
              inputMode="decimal"
              placeholder="0.0"
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              aria-invalid={amount.length > 0 && !amountIsValid}
            />
            <span className="text-sm text-muted-foreground">ETH</span>
          </div>
          {amount.length > 0 && !amountIsValid ? (
            <p className="mt-1.5 text-xs text-destructive">Enter an amount greater than 0.</p>
          ) : null}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label
              htmlFor="eth-contribution-title"
              className="mb-1.5 block text-xs text-muted-foreground"
            >
              Title <span className="opacity-50">(optional)</span>
            </Label>
            <Input
              id="eth-contribution-title"
              placeholder="Contribution title"
              value={metadataTitle}
              onChange={(event) => setMetadataTitle(event.target.value)}
            />
          </div>
          <div>
            <Label
              htmlFor="eth-contribution-url"
              className="mb-1.5 block text-xs text-muted-foreground"
            >
              URL <span className="opacity-50">(optional)</span>
            </Label>
            <Input
              id="eth-contribution-url"
              placeholder="https://example.com"
              value={url}
              onChange={(event) => setUrl(event.target.value)}
              aria-invalid={!urlIsValid}
            />
            {!urlIsValid ? (
              <p className="mt-1.5 text-xs text-destructive">Use an http:// or https:// URL.</p>
            ) : null}
          </div>
        </div>
      </div>

      <div>
        <Label
          htmlFor="eth-contribution-message"
          className="mb-1.5 block text-xs text-muted-foreground"
        >
          Message <span className="opacity-50">(optional)</span>
        </Label>
        <textarea
          id="eth-contribution-message"
          value={message}
          rows={3}
          className="flex w-full rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2.5 text-sm transition-colors ring-offset-background placeholder:text-muted-foreground/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          placeholder="Leave an optional note with your contribution"
          onChange={(event) => setMessage(event.target.value)}
        />
      </div>

      <div className="flex flex-col gap-2 pt-1 sm:flex-row sm:items-center">
        <Button disabled={!canSubmit} onClick={handleSubmit}>
          {isSubmitting
            ? 'Submitting...'
            : hasMetadata
              ? 'Contribute with Message'
              : 'Contribute ETH'}
        </Button>
        <p className="text-xs text-muted-foreground">
          Optional fields are stored as structured JSON for contribution detail pages.
        </p>
      </div>
    </Surface>
  );
}
