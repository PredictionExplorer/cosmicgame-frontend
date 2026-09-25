'use client';

import { useRef, useState, type FormEvent } from 'react';
import { ArrowRight } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useQueryClient } from '@tanstack/react-query';
import type { Address } from 'viem';

import { cosmicSignatureAbi } from '@/contracts/abis';

import { Link } from '@/i18n/navigation';
import { useContractAddresses } from '@/contexts/ContractAddressesContext';
import { useNotify } from '@/hooks/useNotify';
import { useTxFlow, useTxStageLabel } from '@/hooks/useTxFlow';
import { formatId } from '@/utils/format';
import { RecipientField } from '@/components/tokens/transfer/RecipientField';
import { TransferReview, transferGate } from '@/components/tokens/transfer/TransferReview';
import { parseRecipient } from '@/components/tokens/transfer/recipient';
import { useRecipientFacts } from '@/components/tokens/transfer/useRecipientFacts';
import { Button } from '@/components/ui/button';
import { TxStatus } from '@/components/ui/tx-status';
import { ChainGuard } from '@/components/wallet/NetworkGuard';

import { toSourceAddress } from './nftSendEligibility';

export interface CosmicSignatureNftTransferFormProps {
  sourceAddress: string | null | undefined;
  /** The Signatures chosen on the wall, in the order they were chosen. */
  tokenIds: readonly number[];
  /** After a batch: the ids that left the wallet, so the wall drops them from its choice. */
  onSent?: (ids: number[]) => void;
  /** Every chosen Signature was sent (the sheet holding the form closes). */
  onComplete?: () => void;
  /** A batch started or ended: the sheet stays open and the wall's choice waits meanwhile. */
  onBusyChange?: (busy: boolean) => void;
  historyHref?: string;
}

/** Where a batch stands: how many went, and the token it stopped at, if it stopped. */
interface BatchProgress {
  total: number;
  completed: number;
  stoppedAt: number | null;
}

/**
 * Sends the Signatures chosen on the My NFTs wall to another address: the
 * recipient, checked on-chain as it is typed, the review of what leaves and
 * where it goes, and one commit button that asks the wallet once per NFT
 * through `useTxFlow`. The send waits for the recipient check, and an
 * address the check flags (new, a contract, or not checked) needs an
 * acknowledgement. A batch that stops part-way (a rejected prompt, a
 * failure) reports the sent ones through `onSent`, so the rest stay chosen,
 * and says where it stopped; a batch that sends everything calls
 * `onComplete`.
 */
export function CosmicSignatureNftTransferForm({
  sourceAddress,
  tokenIds,
  onSent,
  onComplete,
  onBusyChange,
  historyHref,
}: CosmicSignatureNftTransferFormProps) {
  const t = useTranslations('myPages.nftTransfer');
  const tToast = useTranslations('toasts');
  const tReview = useTranslations('forms.transfer.review');
  const queryClient = useQueryClient();
  const { cosmicSignature } = useContractAddresses();
  const { notify } = useNotify();
  const { run, stage, isBusy } = useTxFlow();
  const stageLabel = useTxStageLabel();

  const source = toSourceAddress(sourceAddress);
  const [recipientText, setRecipientText] = useState('');
  const [recipientTouched, setRecipientTouched] = useState(false);
  const [acknowledged, setAcknowledged] = useState(false);
  const [acknowledgementMissing, setAcknowledgementMissing] = useState(false);
  const [progress, setProgress] = useState<BatchProgress | null>(null);
  // The batch as a whole: between two NFTs the flow is briefly idle.
  const [running, setRunning] = useState(false);

  const recipientRef = useRef<HTMLInputElement>(null);
  const acknowledgementRef = useRef<HTMLInputElement>(null);

  const recipient = parseRecipient(recipientText, { from: source });
  const check = useRecipientFacts(recipient.address);
  const gate = transferGate(check, acknowledged);
  const busy = running || isBusy;

  const changeRecipient = (value: string) => {
    setRecipientText(value);
    setAcknowledged(false);
    setAcknowledgementMissing(false);
  };

  const setBatchRunning = (value: boolean) => {
    setRunning(value);
    onBusyChange?.(value);
  };

  const sendBatch = async (to: Address, ids: readonly number[]) => {
    if (!source || !cosmicSignature) {
      notify('error', tToast('transfer.nft.contractUnavailable'));
      return;
    }
    const sent: number[] = [];
    setBatchRunning(true);
    setProgress({ total: ids.length, completed: 0, stoppedAt: null });
    try {
      for (const tokenId of ids) {
        const last = sent.length === ids.length - 1;
        const result = await run({
          write: (ctx) =>
            ctx.writeContract({
              address: cosmicSignature as Address,
              abi: cosmicSignatureAbi,
              functionName: 'transferFrom',
              args: [ctx.account, to, BigInt(tokenId)],
            }),
          // One toast for the batch: each NFT's closes as the next one opens.
          successMessage: last ? tToast('transfer.nft.confirmed', { count: ids.length }) : null,
          failureMessage: tToast('transfer.nft.failedToken', { tokenId: formatId(tokenId) }),
          errorContext: 'nft-transfer',
        });
        if (result.status !== 'confirmed') {
          setProgress({ total: ids.length, completed: sent.length, stoppedAt: tokenId });
          break;
        }
        sent.push(tokenId);
        setProgress({ total: ids.length, completed: sent.length, stoppedAt: null });
      }

      if (sent.length === 0) return;
      onSent?.(sent);
      await Promise.all(
        [
          ['cstTokensByUser'],
          ['cstTransfers'],
          ['ctOwnershipTransfers'],
          ...sent.map((id) => ['cstInfo', id]),
        ].map((queryKey) => queryClient.invalidateQueries({ queryKey })),
      );
      if (sent.length === ids.length) onComplete?.();
    } finally {
      setBatchRunning(false);
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (busy || tokenIds.length === 0) return;
    setRecipientTouched(true);
    if (recipient.error || !recipient.address) {
      recipientRef.current?.focus();
      return;
    }
    // Never race the recipient check: its answer decides whether the send
    // needs an acknowledgement. The button says it is checking meanwhile.
    if (gate === 'checking') return;
    if (gate === 'acknowledge') {
      setAcknowledgementMissing(true);
      acknowledgementRef.current?.focus();
      return;
    }
    await sendBatch(recipient.address, tokenIds);
  };

  const idsLabel = tokenIds.map((id) => formatId(id)).join(', ');
  const busyLabel = busy ? (stageLabel(stage) ?? t('sending')) : null;
  const reviewShown = recipient.address !== null && tokenIds.length > 0;
  const checkingRecipient = !busy && recipient.address !== null && gate === 'checking';

  return (
    <form noValidate onSubmit={handleSubmit} className="flex flex-col gap-6">
      <RecipientField
        inputRef={recipientRef}
        value={recipientText}
        onChange={changeRecipient}
        onBlur={() => setRecipientTouched(true)}
        error={recipientTouched ? recipient.error : null}
        check={check}
        reviewShown={reviewShown}
        disabled={busy}
      />

      {recipient.address && reviewShown ? (
        <TransferReview
          sending={
            <span className="flex flex-col items-end gap-0.5">
              <span>{t('review.count', { count: tokenIds.length })}</span>
              <span className="type-mono text-muted-foreground [overflow-wrap:anywhere]">
                {idsLabel}
              </span>
            </span>
          }
          recipient={recipient.address}
          check={check}
          acknowledged={acknowledged}
          onAcknowledgedChange={(next) => {
            setAcknowledged(next);
            if (next) setAcknowledgementMissing(false);
          }}
          acknowledgementMissing={acknowledgementMissing}
          acknowledgementRef={acknowledgementRef}
        />
      ) : null}

      <div className="flex flex-col gap-3 border-t border-rule-faint pt-6">
        <ChainGuard requireConnection buttonClassName="w-full">
          <Button
            type="submit"
            variant="commit"
            size="lg"
            loading={busy || checkingRecipient}
            className="w-full"
          >
            {busyLabel ??
              (checkingRecipient
                ? tReview('checking')
                : tokenIds.length > 0
                  ? t('sendCount', { count: tokenIds.length })
                  : t('send'))}
          </Button>
        </ChainGuard>
        {progress && progress.total > 1 ? (
          <p className="type-body-sm text-muted-foreground tabular-nums" role="status">
            {progress.stoppedAt !== null
              ? t('progress.stopped', {
                  completed: progress.completed,
                  total: progress.total,
                  id: formatId(progress.stoppedAt),
                })
              : t('progress.transferred', { completed: progress.completed, total: progress.total })}
          </p>
        ) : null}
        <TxStatus stage={stage} />
        {historyHref ? (
          <Link
            href={historyHref}
            className="link-quiet inline-flex min-h-6 items-center gap-1.5 self-start type-body-sm text-foreground"
          >
            {t('viewHistory')}
            <ArrowRight aria-hidden className="size-3.5 text-subtle" />
          </Link>
        ) : null}
      </div>
    </form>
  );
}
