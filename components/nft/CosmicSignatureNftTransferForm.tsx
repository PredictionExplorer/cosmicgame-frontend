'use client';

import { useEffect, useId, useMemo, useState, type FormEvent } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { useQueryClient } from '@tanstack/react-query';
import { ArrowUpRight, SendHorizontal } from 'lucide-react';
import { toast } from 'sonner';
import { getAddress, isAddress, zeroAddress, type Hash } from 'viem';

import { cosmicSignatureAbi } from '@/contracts/abis';
import { getExplorerUrl } from '@/utils';

import { formatCount } from '@/utils/format';
import { formatId } from '@/utils/format/ids';
import { useContractAddresses } from '@/contexts/ContractAddressesContext';
import { useActiveWeb3React } from '@/hooks/web3';
import { useTxFlow, useTxStageLabel } from '@/hooks/useTxFlow';
import { cn } from '@/lib/utils';
import { Link } from '@/i18n/navigation';
import type { CSTTokenInfo } from '@/services/api';
import { reportError } from '@/utils/errors';
import { AddressChip } from '@/components/ui/address-chip';
import { ArtFrame } from '@/components/ui/art-frame';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { TablePagination } from '@/components/ui/pagination';
import { ChainGuard } from '@/components/wallet/NetworkGuard';

import { signatureCardSources } from './SignatureCard';

interface CosmicSignatureNftTransferFormProps {
  sourceAddress: string | null | undefined;
  tokens: CSTTokenInfo[];
  description?: string;
  historyHref?: string;
}

interface ValidTransfer {
  recipient: `0x${string}`;
  tokenIds: number[];
}

interface TransferProgress {
  total: number;
  completed: number;
  currentTokenId: number | null;
  failedTokenId: number | null;
}

type DisabledReason = 'anchored' | 'ownerChanged';

interface EthereumProvider {
  request: (args: { method: string; params: unknown[] }) => Promise<unknown>;
}

/** Signatures shown per page of the picker: two full rows of four. */
const PAGE_SIZE = 8;

function normalizeAddress(value: string): `0x${string}` | null {
  const trimmed = value.trim();
  if (!isAddress(trimmed)) return null;
  return getAddress(trimmed) as `0x${string}`;
}

function isSameAddress(a: string | null | undefined, b: string | null | undefined): boolean {
  return !!a && !!b && a.toLowerCase() === b.toLowerCase();
}

function getDisabledReason(
  token: CSTTokenInfo,
  sourceAddress: string | null,
): DisabledReason | null {
  if (token.Staked) return 'anchored';
  if (sourceAddress && token.CurOwnerAddr && !isSameAddress(token.CurOwnerAddr, sourceAddress)) {
    return 'ownerChanged';
  }
  return null;
}

/**
 * Sends Signatures from the connected wallet to another address. The picker
 * shows each piece on its plate with a checkbox in its label row (never over
 * the art); anchored pieces and pieces whose owner changed stay visible but
 * cannot be chosen. Each transfer is its own transaction through useTxFlow
 * (chain guard, wallet prompt, pending, confirmed), one after another; a
 * failure stops the run and keeps the transfers already confirmed.
 */
export function CosmicSignatureNftTransferForm({
  sourceAddress,
  tokens,
  description,
  historyHref,
}: CosmicSignatureNftTransferFormProps) {
  const t = useTranslations('myPages');
  const tToast = useTranslations('toasts');
  const tDetail = useTranslations('detail');
  const locale = useLocale();
  const recipientId = useId();
  const resolvedDescription = description ?? t('nftTransfer.defaultDescription');
  const [recipient, setRecipient] = useState('');
  const [page, setPage] = useState(1);
  const [selectedTokenIds, setSelectedTokenIds] = useState<number[]>([]);
  const [progress, setProgress] = useState<TransferProgress | null>(null);
  const [txHashes, setTxHashes] = useState<Hash[]>([]);
  const [warningOpen, setWarningOpen] = useState(false);
  const [pendingTransfer, setPendingTransfer] = useState<ValidTransfer | null>(null);
  const [running, setRunning] = useState(false);

  const flow = useTxFlow();
  const stageLabel = useTxStageLabel();
  const queryClient = useQueryClient();
  const contractAddrs = useContractAddresses();
  const { account, active } = useActiveWeb3React();
  const submitting = running || flow.isBusy;

  const normalizedSource = useMemo(
    () => (sourceAddress ? normalizeAddress(sourceAddress) : null),
    [sourceAddress],
  );

  const pageCount = Math.max(1, Math.ceil(tokens.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const pageItems = useMemo(
    () => tokens.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE),
    [currentPage, tokens],
  );

  const transferableTokenIds = useMemo(
    () =>
      tokens
        .filter((token) => getDisabledReason(token, normalizedSource) === null)
        .map((token) => token.TokenId),
    [normalizedSource, tokens],
  );

  const selectedTransferableIds = useMemo(
    () => selectedTokenIds.filter((id) => transferableTokenIds.includes(id)),
    [selectedTokenIds, transferableTokenIds],
  );

  // A token that stops being transferable (anchored, or sent elsewhere) leaves the selection.
  useEffect(() => {
    setSelectedTokenIds((current) => current.filter((id) => transferableTokenIds.includes(id)));
  }, [transferableTokenIds]);

  const toggle = (token: CSTTokenInfo) => {
    if (submitting || getDisabledReason(token, normalizedSource) !== null) return;
    setSelectedTokenIds((current) =>
      current.includes(token.TokenId)
        ? current.filter((id) => id !== token.TokenId)
        : [...current, token.TokenId],
    );
  };

  const validateTransfer = (): ValidTransfer | null => {
    if (!contractAddrs.cosmicSignature) {
      toast.error(tToast('transfer.nft.contractUnavailable'));
      return null;
    }
    if (!active || !account) {
      toast.error(tToast('transfer.nft.walletRequired'));
      return null;
    }
    if (!normalizedSource) {
      toast.error(tToast('transfer.common.sourceUnavailable'));
      return null;
    }
    if (!isSameAddress(account, normalizedSource)) {
      toast.error(tToast('transfer.nft.sourceWalletRequired'));
      return null;
    }
    const normalizedRecipient = normalizeAddress(recipient);
    if (!normalizedRecipient || normalizedRecipient.toLowerCase() === zeroAddress) {
      toast.error(tToast('transfer.common.invalidRecipient'));
      return null;
    }
    if (isSameAddress(normalizedRecipient, normalizedSource)) {
      toast.error(tToast('transfer.nft.recipientMustDiffer'));
      return null;
    }
    if (selectedTransferableIds.length === 0) {
      toast.error(tToast('transfer.nft.selectOne'));
      return null;
    }
    return { recipient: normalizedRecipient, tokenIds: selectedTransferableIds };
  };

  const shouldWarnForNewRecipient = async (address: `0x${string}`): Promise<boolean> => {
    const ethereum = (window as Window & { ethereum?: EthereumProvider }).ethereum;
    if (!ethereum) return false;
    try {
      const txCount = await ethereum.request({
        method: 'eth_getTransactionCount',
        params: [address, 'latest'],
      });
      return Number(txCount) === 0;
    } catch (err) {
      reportError(err, 'check NFT transfer destination');
      return false;
    }
  };

  const invalidateTransferQueries = async (transferredIds: number[], to: `0x${string}`) => {
    if (!normalizedSource) return;
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ['cstTokensByUser', normalizedSource] }),
      queryClient.invalidateQueries({ queryKey: ['cstTokensByUser', to] }),
      queryClient.invalidateQueries({ queryKey: ['cstTransfers', normalizedSource] }),
      queryClient.invalidateQueries({ queryKey: ['cstTransfers', to] }),
      ...transferredIds.map((tokenId) =>
        queryClient.invalidateQueries({ queryKey: ['cstInfo', tokenId] }),
      ),
    ]);
  };

  const executeTransfer = async ({ recipient: to, tokenIds }: ValidTransfer) => {
    const contract = contractAddrs.cosmicSignature;
    if (!normalizedSource || !contract) return;
    setRunning(true);
    setTxHashes([]);
    const total = tokenIds.length;
    const transferred: number[] = [];
    const hashes: Hash[] = [];

    try {
      for (const [index, tokenId] of tokenIds.entries()) {
        setProgress({ total, completed: index, currentTokenId: tokenId, failedTokenId: null });
        const last = index === total - 1;
        const result = await flow.run({
          write: (ctx) =>
            ctx.writeContract({
              address: contract as `0x${string}`,
              abi: cosmicSignatureAbi,
              functionName: 'transferFrom',
              args: [normalizedSource, to, BigInt(tokenId)],
              account: normalizedSource,
            }),
          // One success toast for the whole run, on the last transfer.
          successMessage: last ? tToast('transfer.nft.confirmed', { count: total }) : null,
          failureMessage: tToast('transfer.nft.failedToken', { tokenId }),
          errorContext: 'Cosmic Signature NFT transfer',
        });
        if (result.status !== 'confirmed') {
          setProgress({
            total,
            completed: index,
            currentTokenId: tokenId,
            failedTokenId: result.status === 'failed' ? tokenId : null,
          });
          break;
        }
        transferred.push(tokenId);
        hashes.push(result.hash);
        setProgress({ total, completed: index + 1, currentTokenId: tokenId, failedTokenId: null });
      }
      if (transferred.length === total) setRecipient('');
    } finally {
      if (transferred.length > 0) {
        setSelectedTokenIds((current) => current.filter((id) => !transferred.includes(id)));
        setTxHashes(hashes);
        await invalidateTransferQueries(transferred, to);
      }
      setRunning(false);
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submitting) return;
    const valid = validateTransfer();
    if (!valid) return;
    if (await shouldWarnForNewRecipient(valid.recipient)) {
      setPendingTransfer(valid);
      setWarningOpen(true);
      return;
    }
    await executeTransfer(valid);
  };

  const handleConfirmNewRecipient = async () => {
    if (!pendingTransfer) return;
    setWarningOpen(false);
    const transfer = pendingTransfer;
    setPendingTransfer(null);
    await executeTransfer(transfer);
  };

  const submitDisabled =
    !active ||
    !account ||
    !normalizedSource ||
    !contractAddrs.cosmicSignature ||
    selectedTransferableIds.length === 0;
  // Between two transfers the flow is briefly idle: the run is still sending.
  const busyLabel = submitting ? (stageLabel(flow.stage) ?? t('nftTransfer.sending')) : null;

  return (
    <>
      <div className="space-y-8">
        <p className="max-w-[var(--measure-lede)] type-body-sm text-muted-foreground">
          {resolvedDescription}
        </p>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="max-w-2xl space-y-2">
            <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
              <Label htmlFor={recipientId}>{t('nftTransfer.recipientAddress')}</Label>
              <p className="flex min-w-0 items-center gap-2 type-caption text-subtle">
                <span>{t('nftTransfer.sourceWallet')}</span>
                {normalizedSource ? (
                  <AddressChip
                    address={normalizedSource}
                    variant="plain"
                    href={false}
                    showCopy={false}
                  />
                ) : (
                  <span>{t('shared.unavailable')}</span>
                )}
              </p>
            </div>
            <Input
              id={recipientId}
              value={recipient}
              onChange={(event) => setRecipient(event.target.value)}
              placeholder="0x…"
              autoComplete="off"
              spellCheck={false}
              disabled={submitting}
              className="font-mono"
            />
          </div>

          {tokens.length === 0 ? (
            <p className="type-body-sm text-muted-foreground">{t('nftTransfer.empty')}</p>
          ) : (
            <fieldset className="space-y-5" data-testid="nft-transfer-picker">
              <legend className="sr-only">{t('nftTransfer.pickerTitle')}</legend>
              <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-3 border-b border-rule-faint pb-4">
                <div className="min-w-0">
                  <p aria-hidden className="type-title text-foreground">
                    {t('nftTransfer.pickerTitle')}
                  </p>
                  <p role="status" className="mt-1 type-caption tabular-nums text-subtle">
                    {t('nftTransfer.pickerSummary', {
                      selected: formatCount(selectedTransferableIds.length, locale),
                      total: formatCount(transferableTokenIds.length, locale),
                    })}
                  </p>
                </div>
                {/* Ghost buttons: -mx-3 lines their labels up with the rule's edges. */}
                <div className="-mx-3 flex flex-wrap gap-x-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    disabled={submitting || transferableTokenIds.length === 0}
                    onClick={() => setSelectedTokenIds(transferableTokenIds)}
                  >
                    {t('nftTransfer.selectAll')}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    disabled={submitting || pageItems.length === 0}
                    onClick={() =>
                      setSelectedTokenIds(
                        pageItems
                          .filter((token) => getDisabledReason(token, normalizedSource) === null)
                          .map((token) => token.TokenId),
                      )
                    }
                  >
                    {t('nftTransfer.selectPage')}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    disabled={submitting || selectedTransferableIds.length === 0}
                    onClick={() => setSelectedTokenIds([])}
                  >
                    {t('nftTransfer.clear')}
                  </Button>
                </div>
              </div>

              <ul
                className="grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-3 lg:grid-cols-4"
                aria-label={t('nftTransfer.listAria')}
              >
                {pageItems.map((token) => {
                  const reason = getDisabledReason(token, normalizedSource);
                  const selected = selectedTokenIds.includes(token.TokenId);
                  const id = formatId(token.TokenId);
                  return (
                    <li
                      key={`${token.EvtLogId}-${token.TokenId}`}
                      data-testid={`nft-row-${token.TokenId}`}
                      onClick={() => toggle(token)}
                      className={cn(
                        'min-w-0 rounded-control p-2 transition-colors duration-[var(--duration-fast)]',
                        reason === null && !submitting
                          ? 'cursor-pointer hover:bg-surface-raised'
                          : 'cursor-not-allowed',
                        selected && 'bg-primary/10 hover:bg-primary/15',
                      )}
                    >
                      <ArtFrame
                        sources={signatureCardSources(token.Seed)}
                        alt=""
                        sizes="(min-width: 1024px) 12rem, (min-width: 640px) 30vw, 45vw"
                        density="compact"
                        unavailableLabel={tDetail('image.artworkUnavailable')}
                        className={cn(
                          selected &&
                            'after:shadow-[inset_0_0_0_2px_var(--color-primary)] hover:after:shadow-[inset_0_0_0_2px_var(--color-primary)]',
                          reason !== null && 'opacity-50',
                        )}
                      />
                      <div className="mt-2.5 flex items-start gap-2.5">
                        <span className="mt-0.5 inline-flex">
                          <Checkbox
                            checked={selected}
                            disabled={reason !== null || submitting}
                            aria-label={t('nftTransfer.selectAria', { id: token.TokenId })}
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
                            {token.TokenName ? ' · ' : null}
                            {token.RoundNum != null ? (
                              <Link
                                href={`/allocation/${token.RoundNum}`}
                                className="link-quiet"
                                onClick={(event) => event.stopPropagation()}
                              >
                                {t('nftTransfer.cycle', {
                                  cycle: formatCount(token.RoundNum, locale),
                                })}
                              </Link>
                            ) : (
                              t('nftTransfer.cycleUnavailable')
                            )}
                          </p>
                          {reason ? (
                            <Badge tone="attention" size="sm" className="mt-1.5">
                              {reason === 'anchored'
                                ? t('nftTransfer.statusLabels.anchored')
                                : t('nftTransfer.statusLabels.ownerChanged')}
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
            </fieldset>
          )}

          {progress ? (
            <p
              role="status"
              className={cn(
                'type-body-sm',
                progress.failedTokenId === null ? 'text-muted-foreground' : 'text-critical',
              )}
            >
              {progress.failedTokenId === null
                ? t('nftTransfer.progress.transferred', {
                    completed: formatCount(progress.completed, locale),
                    total: formatCount(progress.total, locale),
                  })
                : t('nftTransfer.progress.stopped', { id: progress.failedTokenId })}
              {running && progress.currentTokenId !== null ? (
                <span className="text-subtle">
                  {' · '}
                  {t('nftTransfer.progress.current', { id: progress.currentTokenId })}
                </span>
              ) : null}
            </p>
          ) : null}

          {txHashes.length > 0 ? (
            <p className="flex flex-wrap items-center gap-x-3 gap-y-1 type-body-sm">
              <span className="text-positive">
                {txHashes.length === 1
                  ? t('nftTransfer.confirmation.latest')
                  : t('nftTransfer.confirmation.multiple', { count: txHashes.length })}
              </span>
              <a
                href={getExplorerUrl('tx', txHashes[txHashes.length - 1]!)}
                target="_blank"
                rel="noopener noreferrer"
                className="link inline-flex items-center gap-1"
              >
                {t('nftTransfer.confirmation.viewLatest')}
                <ArrowUpRight className="size-3.5" aria-hidden />
              </a>
            </p>
          ) : null}

          <div className="flex flex-col gap-4 border-t border-rule-faint pt-6 sm:flex-row sm:items-center sm:justify-between">
            <ChainGuard>
              <Button type="submit" disabled={submitDisabled} loading={submitting}>
                <SendHorizontal aria-hidden />
                {busyLabel ?? t('nftTransfer.send')}
              </Button>
            </ChainGuard>
            {historyHref ? (
              <Link href={historyHref} className="link type-body-sm">
                {t('nftTransfer.viewHistory')}
              </Link>
            ) : null}
          </div>
        </form>
      </div>

      <Dialog open={warningOpen} onOpenChange={setWarningOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('nftTransfer.warning.title')}</DialogTitle>
            <DialogDescription>{t('nftTransfer.warning.description')}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setWarningOpen(false)}>
              {t('nftTransfer.warning.cancel')}
            </Button>
            <Button onClick={() => void handleConfirmNewRecipient()}>
              {t('nftTransfer.warning.continue')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
