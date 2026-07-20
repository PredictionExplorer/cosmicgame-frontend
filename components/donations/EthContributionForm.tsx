'use client';

import { useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { ConnectButton as RainbowConnectButton } from '@rainbow-me/rainbowkit';
import { parseEther } from 'viem';
import { usePublicClient } from 'wagmi';

import { useNotification } from '@/contexts/NotificationContext';
import { useActiveWeb3React } from '@/hooks/web3';
import useCosmicGameContract from '@/hooks/useCosmicGameContract';
import { cn } from '@/lib/utils';
import { asWriteFn } from '@/utils/contractWrite';
import { isUserRejection, reportError } from '@/utils/errors';
import { assertSuccessfulTransactionReceipt } from '@/utils/transactions';
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
  description,
  onSuccess,
  title,
}: EthContributionFormProps) {
  const t = useTranslations('ethContribution');
  const tToast = useTranslations('toasts');
  const resolvedDescription = description ?? t('form.defaultDescription');
  const resolvedTitle = title ?? t('form.defaultTitle');
  const [amount, setAmount] = useState('');
  const [metadataTitle, setMetadataTitle] = useState('');
  const [message, setMessage] = useState('');
  const [url, setUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { account } = useActiveWeb3React();
  const cosmicGameContract = useCosmicGameContract();
  const publicClient = usePublicClient();
  const { setNotification } = useNotification();

  const amountIsValid = useMemo(() => hasValidAmount(amount), [amount]);
  const urlIsValid = useMemo(() => hasValidUrl(url), [url]);
  const hasMetadata = [metadataTitle, message, url].some((value) => value.trim().length > 0);
  const canSubmit =
    !!account && !!cosmicGameContract && amountIsValid && urlIsValid && !isSubmitting;

  const handleSubmit = async () => {
    if (!account) {
      setNotification({
        text: tToast('contribution.connectWallet'),
        type: 'error',
        visible: true,
      });
      return;
    }

    if (!amountIsValid) {
      setNotification({
        text: tToast('contribution.invalidAmount'),
        type: 'error',
        visible: true,
      });
      return;
    }

    if (!urlIsValid) {
      setNotification({
        text: tToast('contribution.invalidUrl'),
        type: 'error',
        visible: true,
      });
      return;
    }

    if (!cosmicGameContract) {
      setNotification({
        text: tToast('contribution.contractUnavailable'),
        type: 'error',
        visible: true,
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const value = parseEther(amount.trim());
      let hash: `0x${string}`;

      if (hasMetadata) {
        const payload = JSON.stringify({
          title: metadataTitle.trim(),
          message: message.trim(),
          url: url.trim(),
        });
        hash = await asWriteFn(cosmicGameContract.write.donateEthWithInfo)([payload], { value });
      } else {
        hash = await asWriteFn(cosmicGameContract.write.donateEth)([], { value });
      }
      const receipt = await publicClient?.waitForTransactionReceipt({ hash });
      assertSuccessfulTransactionReceipt(receipt);

      setNotification({
        text: tToast(
          hasMetadata ? 'contribution.formSubmittedWithInfo' : 'contribution.formSubmitted',
          {
            amount: amount.trim(),
          },
        ),
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
          text: tToast('walletTransactionCancelled'),
          type: 'info',
          visible: true,
        });
      } else {
        reportError(error, 'ETH contribution error');
        setNotification({
          text: tToast('contribution.formFailed'),
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
          {resolvedTitle}
        </h3>
        <p className="type-body-sm text-muted-foreground">{resolvedDescription}</p>
      </div>

      {!account ? (
        <div className="flex flex-col gap-3 rounded-lg border border-white/[0.08] bg-black/20 p-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted-foreground">
            {tToast('contribution.connectWalletInline')}
          </p>
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
            {t('form.amountLabel')}
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
            <p className="mt-1.5 text-xs text-destructive">
              {tToast('contribution.invalidAmount')}
            </p>
          ) : null}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label
              htmlFor="eth-contribution-title"
              className="mb-1.5 block text-xs text-muted-foreground"
            >
              {t('form.titleLabel')} <span className="opacity-50">{t('form.optional')}</span>
            </Label>
            <Input
              id="eth-contribution-title"
              placeholder={t('form.titlePlaceholder')}
              value={metadataTitle}
              onChange={(event) => setMetadataTitle(event.target.value)}
            />
          </div>
          <div>
            <Label
              htmlFor="eth-contribution-url"
              className="mb-1.5 block text-xs text-muted-foreground"
            >
              {t('form.urlLabel')} <span className="opacity-50">{t('form.optional')}</span>
            </Label>
            <Input
              id="eth-contribution-url"
              placeholder="https://example.com"
              value={url}
              onChange={(event) => setUrl(event.target.value)}
              aria-invalid={!urlIsValid}
            />
            {!urlIsValid ? (
              <p className="mt-1.5 text-xs text-destructive">
                {tToast('contribution.invalidUrlInline')}
              </p>
            ) : null}
          </div>
        </div>
      </div>

      <div>
        <Label
          htmlFor="eth-contribution-message"
          className="mb-1.5 block text-xs text-muted-foreground"
        >
          {t('form.messageLabel')} <span className="opacity-50">{t('form.optional')}</span>
        </Label>
        <textarea
          id="eth-contribution-message"
          value={message}
          rows={3}
          className="flex w-full rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2.5 text-sm transition-colors ring-offset-background placeholder:text-muted-foreground/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          placeholder={t('form.messagePlaceholder')}
          onChange={(event) => setMessage(event.target.value)}
        />
      </div>

      <div className="flex flex-col gap-2 pt-1 sm:flex-row sm:items-center">
        <Button disabled={!canSubmit} onClick={handleSubmit}>
          {isSubmitting
            ? tToast('contribution.submitting')
            : hasMetadata
              ? t('form.contributeWithMessage')
              : t('form.contributeEth')}
        </Button>
        <p className="text-xs text-muted-foreground">{t('form.structuredHelp')}</p>
      </div>
    </Surface>
  );
}
