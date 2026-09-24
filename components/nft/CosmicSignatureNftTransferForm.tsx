'use client';

import { useRef, useState, type FormEvent } from 'react';
import { ArrowRight } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useQueryClient } from '@tanstack/react-query';
import { getAddress, isAddress, type Address } from 'viem';

import { cosmicSignatureAbi } from '@/contracts/abis';

import { Link } from '@/i18n/navigation';
import { useContractAddresses } from '@/contexts/ContractAddressesContext';
import { useNotify } from '@/hooks/useNotify';
import { useTxFlow, useTxStageLabel } from '@/hooks/useTxFlow';
import { AnchoringIcon } from '@/lib/conceptIcons';
import { cn } from '@/lib/utils';
import { formatId, sameAddress } from '@/utils/format';
import type { CSTTokenInfo } from '@/services/api';
import { NftMarketplaceButton } from '@/components/common/NftMarketplaceButton';
import { RecipientField } from '@/components/tokens/transfer/RecipientField';
import { TransferReview, needsAcknowledgement } from '@/components/tokens/transfer/TransferReview';
import { parseRecipient } from '@/components/tokens/transfer/recipient';
import { useRecipientFacts } from '@/components/tokens/transfer/useRecipientFacts';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { TablePagination } from '@/components/ui/pagination';
import { TxStatus } from '@/components/ui/tx-status';
import { ChainGuard } from '@/components/wallet/NetworkGuard';

interface CosmicSignatureNftTransferFormProps {
  sourceAddress: string | null | undefined;
  tokens: CSTTokenInfo[];
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
 * Sends Cosmic Signature NFTs from the connected wallet: pick tokens, enter
 * the recipient (checked on-chain as it is typed), review, then one commit
 * button that asks the wallet once per NFT through `useTxFlow`. A batch that
 * stops part-way (a rejected prompt, a failure) keeps the NFTs still to send
 * selected and says where it stopped.
 */
export function CosmicSignatureNftTransferForm({
  sourceAddress,
  tokens,
  description,
  historyHref,
}: CosmicSignatureNftTransferFormProps) {
  const t = useTranslations('myPages.nftTransfer');
  const tToast = useTranslations('toasts');
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

  const recipientRef = useRef<HTMLInputElement>(null);
  const acknowledgementRef = useRef<HTMLInputElement>(null);
  const pickerRef = useRef<HTMLDivElement>(null);

  const recipient = parseRecipient(recipientText, { from: source });
  const check = useRecipientFacts(recipient.address);

  const transferableIds = tokens
    .filter((token) => !disabledReason(token, source))
    .map((token) => token.TokenId);
  // A token that stopped being transferable (released elsewhere, sold) drops out.
  const selected = selectedIds.filter((id) => transferableIds.includes(id));
  const pageItems = tokens.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const toggle = (token: CSTTokenInfo) => {
    if (isBusy || disabledReason(token, source)) return;
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
    setProgress({ total: ids.length, completed: 0, stoppedAt: null });
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
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
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
    if (needsAcknowledgement(check) && !acknowledged) {
      setAcknowledgementMissing(true);
      acknowledgementRef.current?.focus();
      return;
    }
    await sendBatch(recipient.address, selected);
  };

  const idsLabel = selected.map((id) => formatId(id)).join(', ');
  const busyLabel = isBusy ? stageLabel(stage) : null;

  return (
    <form noValidate onSubmit={handleSubmit} className="flex flex-col gap-8">
      <div className="flex flex-col gap-3 border-b border-rule-faint pb-6 sm:flex-row sm:items-center sm:justify-between">
        <p className="max-w-prose type-body-sm text-muted-foreground">
          {description ?? t('defaultDescription')} {t('marketplacePrompt')}
        </p>
        <NftMarketplaceButton
          variant="compact"
          label={t('marketplace')}
          className="self-start sm:self-auto"
        />
      </div>

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
          className="flex flex-col gap-3 focus-ring-none"
        >
          <div className="flex flex-wrap items-end justify-between gap-x-4 gap-y-2">
            <div>
              <h3 id="nft-transfer-picker-title" className="type-title text-foreground">
                {t('pickerTitle')}
              </h3>
              <p className="type-caption text-subtle tabular-nums" aria-live="polite">
                {t('pickerSummary', { selected: selected.length, total: transferableIds.length })}
              </p>
            </div>
            <div className="flex flex-wrap gap-1">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                disabled={isBusy || transferableIds.length === 0}
                onClick={() => {
                  setSelectedIds(transferableIds);
                  setSelectionMissing(false);
                }}
              >
                {t('selectAll')}
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                disabled={isBusy || selected.length === 0}
                onClick={() => setSelectedIds([])}
              >
                {t('clear')}
              </Button>
            </div>
          </div>

          <ul
            aria-label={t('listAria')}
            className="divide-y divide-rule-faint border-y border-rule-faint"
          >
            {pageItems.map((token) => {
              const reason = disabledReason(token, source);
              const isSelected = selected.includes(token.TokenId);
              return (
                <li
                  key={`${token.EvtLogId}-${token.TokenId}`}
                  data-testid={`nft-row-${token.TokenId}`}
                  onClick={() => toggle(token)}
                  className={cn(
                    'grid grid-cols-[auto_minmax(0,1fr)] items-center gap-x-4 gap-y-1 px-1 py-3 transition-colors duration-fast sm:grid-cols-[auto_6rem_minmax(0,1fr)_auto_auto]',
                    reason || isBusy
                      ? 'cursor-not-allowed'
                      : 'cursor-pointer hover:bg-surface-raised/60',
                    isSelected && 'bg-primary/[0.06] shadow-[inset_2px_0_0_0_hsl(var(--primary))]',
                  )}
                >
                  <Checkbox
                    checked={isSelected}
                    disabled={Boolean(reason) || isBusy}
                    aria-label={t('selectAria', { id: formatId(token.TokenId) })}
                    onClick={(event) => event.stopPropagation()}
                    onChange={() => toggle(token)}
                  />
                  <Link
                    href={`/detail/${token.TokenId}`}
                    onClick={(event) => event.stopPropagation()}
                    className="link-quiet type-mono text-foreground sm:order-none"
                  >
                    {formatId(token.TokenId)}
                  </Link>
                  <span
                    className={cn(
                      'col-start-2 min-w-0 truncate type-body-sm sm:col-start-auto',
                      token.TokenName ? 'text-foreground' : 'text-subtle',
                    )}
                  >
                    {token.TokenName || t('noCustomName')}
                  </span>
                  <span className="col-start-2 type-caption text-subtle sm:col-start-auto">
                    {token.RoundNum != null ? (
                      <Link
                        href={`/allocation/${token.RoundNum}`}
                        onClick={(event) => event.stopPropagation()}
                        className="link-quiet"
                      >
                        {t('cycle', { cycle: token.RoundNum })}
                      </Link>
                    ) : (
                      t('cycleUnavailable')
                    )}
                  </span>
                  <span className="col-start-2 sm:col-start-auto sm:justify-self-end">
                    {reason === 'anchored' ? (
                      <Badge size="sm" icon={<AnchoringIcon />}>
                        {t('statusLabels.anchored')}
                      </Badge>
                    ) : reason === 'ownerChanged' ? (
                      <Badge size="sm" tone="attention">
                        {t('statusLabels.ownerChanged')}
                      </Badge>
                    ) : null}
                  </span>
                </li>
              );
            })}
          </ul>

          <TablePagination
            page={page}
            pageSize={PAGE_SIZE}
            total={tokens.length}
            onPageChange={setPage}
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
        disabled={isBusy}
      />

      {recipient.address && selected.length > 0 ? (
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

      <div className="flex flex-col gap-3">
        <ChainGuard requireConnection buttonClassName="w-full sm:w-auto">
          <Button
            type="submit"
            variant="commit"
            size="lg"
            loading={isBusy}
            className="w-full sm:w-auto sm:self-start"
          >
            {busyLabel ??
              (selected.length > 0 ? t('sendCount', { count: selected.length }) : t('send'))}
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
