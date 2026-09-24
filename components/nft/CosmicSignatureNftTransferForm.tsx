'use client';

import { useRef, useState, type FormEvent } from 'react';
import { ArrowRight } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { useQueryClient } from '@tanstack/react-query';
import { getAddress, isAddress, type Address } from 'viem';

import { cosmicSignatureAbi } from '@/contracts/abis';

import { Link } from '@/i18n/navigation';
import { useContractAddresses } from '@/contexts/ContractAddressesContext';
import { useNotify } from '@/hooks/useNotify';
import { useTxFlow, useTxStageLabel } from '@/hooks/useTxFlow';
import { AnchoringIcon } from '@/lib/conceptIcons';
import { cn } from '@/lib/utils';
import { formatCount, formatId, sameAddress } from '@/utils/format';
import type { CSTTokenInfo } from '@/services/api';
import { RecipientField } from '@/components/tokens/transfer/RecipientField';
import { TransferReview, transferGate } from '@/components/tokens/transfer/TransferReview';
import { parseRecipient } from '@/components/tokens/transfer/recipient';
import { useRecipientFacts } from '@/components/tokens/transfer/useRecipientFacts';
import { ArtFrame } from '@/components/ui/art-frame';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { TablePagination } from '@/components/ui/pagination';
import { TxStatus } from '@/components/ui/tx-status';
import { ChainGuard } from '@/components/wallet/NetworkGuard';

import { signatureCardSources } from './SignatureCard';

interface CosmicSignatureNftTransferFormProps {
  sourceAddress: string | null | undefined;
  tokens: CSTTokenInfo[];
  /** A line above the form; the page's own heading usually says enough. */
  description?: string;
  historyHref?: string;
}

type DisabledReason = 'anchored' | 'ownerChanged';

/** Where a batch stands: how many went, and the token it stopped at, if it stopped. */
interface BatchProgress {
  total: number;
  completed: number;
  stoppedAt: number | null;
}

/** Signatures shown per page of the picker: two full rows of four. */
const PAGE_SIZE = 8;

function toAddress(value: string | null | undefined): Address | null {
  const trimmed = value?.trim() ?? '';
  return isAddress(trimmed, { strict: false }) ? getAddress(trimmed) : null;
}

function disabledReason(token: CSTTokenInfo, source: Address | null): DisabledReason | null {
  if (token.Staked) return 'anchored';
  if (source && token.CurOwnerAddr && !sameAddress(token.CurOwnerAddr, source)) {
    return 'ownerChanged';
  }
  return null;
}

/**
 * Sends Signatures from the connected wallet to another address. The picker
 * shows each piece on its plate with a checkbox in its label row (never over
 * the art); anchored pieces and pieces whose owner changed stay visible but
 * cannot be chosen. The recipient is checked on-chain as it is typed and the
 * send is reviewed before one commit button asks the wallet once per NFT
 * through `useTxFlow`. The send waits for the recipient check, and an address
 * the check flags (new, a contract, or not checked) needs an acknowledgement.
 * A batch that stops part-way (a rejected prompt, a failure) keeps the NFTs
 * still to send selected and says where it stopped.
 */
export function CosmicSignatureNftTransferForm({
  sourceAddress,
  tokens,
  description,
  historyHref,
}: CosmicSignatureNftTransferFormProps) {
  const t = useTranslations('myPages.nftTransfer');
  const tToast = useTranslations('toasts');
  const tReview = useTranslations('forms.transfer.review');
  const tDetail = useTranslations('detail');
  const locale = useLocale();
  const queryClient = useQueryClient();
  const { cosmicSignature } = useContractAddresses();
  const { notify } = useNotify();
  const { run, stage, isBusy } = useTxFlow();
  const stageLabel = useTxStageLabel();

  const source = toAddress(sourceAddress);
  const [recipientText, setRecipientText] = useState('');
  const [recipientTouched, setRecipientTouched] = useState(false);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [selectionMissing, setSelectionMissing] = useState(false);
  const [page, setPage] = useState(1);
  const [acknowledged, setAcknowledged] = useState(false);
  const [acknowledgementMissing, setAcknowledgementMissing] = useState(false);
  const [progress, setProgress] = useState<BatchProgress | null>(null);
  // The batch as a whole: between two NFTs the flow is briefly idle.
  const [running, setRunning] = useState(false);

  const recipientRef = useRef<HTMLInputElement>(null);
  const acknowledgementRef = useRef<HTMLInputElement>(null);
  const pickerRef = useRef<HTMLDivElement>(null);

  const recipient = parseRecipient(recipientText, { from: source });
  const check = useRecipientFacts(recipient.address);
  const gate = transferGate(check, acknowledged);
  const busy = running || isBusy;

  const transferableIds = tokens
    .filter((token) => !disabledReason(token, source))
    .map((token) => token.TokenId);
  // A token that stopped being transferable (released elsewhere, sold) drops out.
  const selected = selectedIds.filter((id) => transferableIds.includes(id));
  const pageCount = Math.max(1, Math.ceil(tokens.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const pageItems = tokens.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const choose = (ids: number[]) => {
    setSelectedIds(ids);
    if (ids.length > 0) setSelectionMissing(false);
  };

  const toggle = (token: CSTTokenInfo) => {
    if (busy || disabledReason(token, source)) return;
    setSelectionMissing(false);
    setSelectedIds((current) =>
      current.includes(token.TokenId)
        ? current.filter((id) => id !== token.TokenId)
        : [...current, token.TokenId],
    );
  };

  const changeRecipient = (value: string) => {
    setRecipientText(value);
    setAcknowledged(false);
    setAcknowledgementMissing(false);
  };

  const sendBatch = async (to: Address, ids: number[]) => {
    if (!source || !cosmicSignature) {
      notify('error', tToast('transfer.nft.contractUnavailable'));
      return;
    }
    const sent: number[] = [];
    setRunning(true);
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
      setSelectedIds((current) => current.filter((id) => !sent.includes(id)));
      if (sent.length === ids.length) {
        setRecipientText('');
        setRecipientTouched(false);
        setAcknowledged(false);
      }
      await Promise.all(
        [
          ['cstTokensByUser'],
          ['cstTransfers'],
          ['ctOwnershipTransfers'],
          ...sent.map((id) => ['cstInfo', id]),
        ].map((queryKey) => queryClient.invalidateQueries({ queryKey })),
      );
    } finally {
      setRunning(false);
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (busy) return;
    setRecipientTouched(true);
    // In the order the form reads: the NFTs, then where they go.
    if (selected.length === 0) {
      setSelectionMissing(true);
      pickerRef.current?.focus();
      return;
    }
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
    await sendBatch(recipient.address, selected);
  };

  const idsLabel = selected.map((id) => formatId(id)).join(', ');
  const busyLabel = busy ? (stageLabel(stage) ?? t('sending')) : null;
  const reviewShown = recipient.address !== null && selected.length > 0;
  const checkingRecipient = !busy && recipient.address !== null && gate === 'checking';

  return (
    <form noValidate onSubmit={handleSubmit} className="flex flex-col gap-8">
      {description ? (
        <p className="max-w-[var(--measure-lede)] type-body-sm text-muted-foreground">
          {description}
        </p>
      ) : null}

      {tokens.length === 0 ? (
        <p className="type-body-sm text-muted-foreground">{t('empty')}</p>
      ) : (
        <div
          ref={pickerRef}
          tabIndex={-1}
          role="group"
          aria-labelledby="nft-transfer-picker-title"
          aria-describedby={selectionMissing ? 'nft-transfer-picker-error' : undefined}
          data-testid="nft-transfer-picker"
          className="flex flex-col gap-5 focus-ring-none"
        >
          <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-3 border-b border-rule-faint pb-4">
            <div className="min-w-0">
              <h3 id="nft-transfer-picker-title" className="type-title text-foreground">
                {t('pickerTitle')}
              </h3>
              <p role="status" className="mt-1 type-caption tabular-nums text-subtle">
                {t('pickerSummary', {
                  selected: formatCount(selected.length, locale),
                  total: formatCount(transferableIds.length, locale),
                })}
              </p>
            </div>
            {/* Ghost buttons: -mx-3 lines their labels up with the rule's edges. */}
            <div className="-mx-3 flex flex-wrap gap-x-1">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                disabled={busy || transferableIds.length === 0}
                onClick={() => choose(transferableIds)}
              >
                {t('selectAll')}
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                disabled={busy || pageItems.length === 0}
                onClick={() =>
                  choose(
                    pageItems
                      .filter((token) => !disabledReason(token, source))
                      .map((token) => token.TokenId),
                  )
                }
              >
                {t('selectPage')}
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                disabled={busy || selected.length === 0}
                onClick={() => setSelectedIds([])}
              >
                {t('clear')}
              </Button>
            </div>
          </div>

          <ul
            className="grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-3 lg:grid-cols-4"
            aria-label={t('listAria')}
          >
            {pageItems.map((token) => {
              const reason = disabledReason(token, source);
              const isSelected = selected.includes(token.TokenId);
              const id = formatId(token.TokenId);
              return (
                <li
                  key={`${token.EvtLogId}-${token.TokenId}`}
                  data-testid={`nft-row-${token.TokenId}`}
                  onClick={() => toggle(token)}
                  className={cn(
                    'min-w-0 rounded-control p-2 transition-colors duration-[var(--duration-fast)]',
                    reason === null && !busy
                      ? 'cursor-pointer hover:bg-surface-raised'
                      : 'cursor-not-allowed',
                    isSelected && 'bg-primary/10 hover:bg-primary/15',
                  )}
                >
                  <ArtFrame
                    sources={signatureCardSources(token.Seed)}
                    alt=""
                    sizes="(min-width: 1024px) 12rem, (min-width: 640px) 30vw, 45vw"
                    density="compact"
                    unavailableLabel={tDetail('image.artworkUnavailable')}
                    className={cn(
                      isSelected &&
                        'after:shadow-[inset_0_0_0_2px_var(--color-primary)] hover:after:shadow-[inset_0_0_0_2px_var(--color-primary)]',
                      reason !== null && 'opacity-50',
                    )}
                  />
                  <div className="mt-2.5 flex items-start gap-2.5">
                    <span className="mt-0.5 inline-flex">
                      <Checkbox
                        checked={isSelected}
                        disabled={reason !== null || busy}
                        aria-label={t('selectAria', { id })}
                        onChange={() => toggle(token)}
                        onClick={(event) => event.stopPropagation()}
                      />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate type-body-sm font-medium text-foreground">
                        {token.TokenName ? (
                          token.TokenName
                        ) : (
                          <span className="tabular-nums">{id}</span>
                        )}
                      </p>
                      <p className="type-caption text-subtle">
                        {token.TokenName ? <span className="type-mono">{id}</span> : null}
                        {token.TokenName ? ' · ' : null}
                        {token.RoundNum != null ? (
                          <Link
                            href={`/allocation/${token.RoundNum}`}
                            className="link-quiet"
                            onClick={(event) => event.stopPropagation()}
                          >
                            {t('cycle', { cycle: formatCount(token.RoundNum, locale) })}
                          </Link>
                        ) : (
                          t('cycleUnavailable')
                        )}
                      </p>
                      {reason === 'anchored' ? (
                        <Badge size="sm" icon={<AnchoringIcon />} className="mt-1.5">
                          {t('statusLabels.anchored')}
                        </Badge>
                      ) : reason === 'ownerChanged' ? (
                        <Badge size="sm" tone="attention" className="mt-1.5">
                          {t('statusLabels.ownerChanged')}
                        </Badge>
                      ) : null}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>

          <TablePagination
            page={currentPage}
            pageSize={PAGE_SIZE}
            total={tokens.length}
            onPageChange={setPage}
            className="sm:pl-0"
          />

          {selectionMissing ? (
            <p id="nft-transfer-picker-error" className="type-caption text-critical">
              {tToast('transfer.nft.selectOne')}
            </p>
          ) : null}
        </div>
      )}

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
              <span>{t('review.count', { count: selected.length })}</span>
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
        <ChainGuard requireConnection buttonClassName="w-full sm:w-auto">
          <Button
            type="submit"
            variant="commit"
            size="lg"
            loading={busy || checkingRecipient}
            className="w-full sm:w-auto sm:self-start"
          >
            {busyLabel ??
              (checkingRecipient
                ? tReview('checking')
                : selected.length > 0
                  ? t('sendCount', { count: selected.length })
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
