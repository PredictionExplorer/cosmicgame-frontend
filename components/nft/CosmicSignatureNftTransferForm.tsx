'use client';

import { FormEvent, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { writeContract } from '@wagmi/core';
import { useQueryClient } from '@tanstack/react-query';
import { ArrowUpRight, ChevronDown, ChevronUp, Loader2, SendHorizontal } from 'lucide-react';
import { Tr } from 'react-super-responsive-table';
import { toast } from 'sonner';
import { getAddress, isAddress, zeroAddress } from 'viem';
import { useConfig, usePublicClient } from 'wagmi';

import { cosmicSignatureAbi } from '@/contracts/abis';
import { getExplorerUrl, shortenHex } from '@/utils';

import { activeChain } from '@/config/chains';
import { useContractAddresses } from '@/contexts/ContractAddressesContext';
import { useActiveWeb3React } from '@/hooks/web3';
import { cn } from '@/lib/utils';
import type { CSTTokenInfo } from '@/services/api';
import {
  getEthErrorMessage,
  isUserRejection,
  reportError,
  WALLET_TRANSACTION_CANCELLED_MESSAGE,
} from '@/utils/errors';
import { AddressLink } from '@/components/common/AddressLink';
import { CustomPagination } from '@/components/common/CustomPagination';
import {
  TablePrimary,
  TablePrimaryCell,
  TablePrimaryContainer,
  TablePrimaryHead,
  TablePrimaryHeadCell,
  TablePrimaryRow,
} from '@/components/styled';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

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

interface EthereumProvider {
  request: (args: { method: string; params: unknown[] }) => Promise<unknown>;
}

function normalizeAddress(value: string): `0x${string}` | null {
  const trimmed = value.trim();
  if (!isAddress(trimmed)) return null;
  return getAddress(trimmed) as `0x${string}`;
}

function isSameAddress(a: string | null | undefined, b: string | null | undefined): boolean {
  return !!a && !!b && a.toLowerCase() === b.toLowerCase();
}

function isTokenTransferable(token: CSTTokenInfo, sourceAddress: string | null): boolean {
  if (token.Staked) return false;
  if (!sourceAddress || !token.CurOwnerAddr) return true;
  return isSameAddress(token.CurOwnerAddr, sourceAddress);
}

function getDisabledReason(token: CSTTokenInfo, sourceAddress: string | null): string | null {
  if (token.Staked) return 'Anchored - release before transfer';
  if (sourceAddress && token.CurOwnerAddr && !isSameAddress(token.CurOwnerAddr, sourceAddress)) {
    return 'Owner changed - refresh before transfer';
  }
  return null;
}

export function CosmicSignatureNftTransferForm({
  sourceAddress,
  tokens,
  description = 'Select one or more Cosmic Signature NFTs and send them to another wallet address.',
  historyHref,
}: CosmicSignatureNftTransferFormProps) {
  const [recipient, setRecipient] = useState('');
  const [page, setPage] = useState(1);
  const [menuOpen, setMenuOpen] = useState(false);
  const [selectedTokenIds, setSelectedTokenIds] = useState<number[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [progress, setProgress] = useState<TransferProgress | null>(null);
  const [txHashes, setTxHashes] = useState<`0x${string}`[]>([]);
  const [warningOpen, setWarningOpen] = useState(false);
  const [pendingTransfer, setPendingTransfer] = useState<ValidTransfer | null>(null);
  const headerCheckboxRef = useRef<HTMLInputElement>(null);

  const config = useConfig();
  const publicClient = usePublicClient({ chainId: activeChain.id });
  const queryClient = useQueryClient();
  const contractAddrs = useContractAddresses();
  const { account, active } = useActiveWeb3React();

  const normalizedSource = useMemo(() => {
    if (!sourceAddress) return null;
    return normalizeAddress(sourceAddress);
  }, [sourceAddress]);

  const perPage = 8;
  const pageItems = useMemo(() => {
    const startIndex = (page - 1) * perPage;
    return tokens.slice(startIndex, startIndex + perPage);
  }, [page, tokens]);

  const transferableTokenIds = useMemo(
    () =>
      tokens
        .filter((token) => isTokenTransferable(token, normalizedSource))
        .map((token) => token.TokenId),
    [normalizedSource, tokens],
  );

  const selectedTransferableIds = useMemo(
    () => selectedTokenIds.filter((id) => transferableTokenIds.includes(id)),
    [selectedTokenIds, transferableTokenIds],
  );

  const isIndeterminate =
    selectedTransferableIds.length > 0 &&
    selectedTransferableIds.length < transferableTokenIds.length;
  const isAllTransferableSelected =
    transferableTokenIds.length > 0 &&
    selectedTransferableIds.length === transferableTokenIds.length;

  useEffect(() => {
    setSelectedTokenIds((current) => current.filter((id) => transferableTokenIds.includes(id)));
  }, [transferableTokenIds]);

  useEffect(() => {
    if (headerCheckboxRef.current) {
      headerCheckboxRef.current.indeterminate = isIndeterminate;
    }
  }, [isIndeterminate]);

  const isSelected = (id: number) => selectedTokenIds.includes(id);

  const handleSelectToggle = (token: CSTTokenInfo) => {
    if (submitting || !isTokenTransferable(token, normalizedSource)) return;
    setSelectedTokenIds((current) =>
      current.includes(token.TokenId)
        ? current.filter((id) => id !== token.TokenId)
        : [...current, token.TokenId],
    );
  };

  const handleSelectAll = () => setSelectedTokenIds(transferableTokenIds);

  const handleSelectCurrentPage = () =>
    setSelectedTokenIds(
      pageItems
        .filter((token) => isTokenTransferable(token, normalizedSource))
        .map((token) => token.TokenId),
    );

  const handleSelectNone = () => setSelectedTokenIds([]);

  const validateTransfer = (): ValidTransfer | null => {
    if (!contractAddrs.cosmicSignature) {
      toast.error('Cosmic Signature NFT contract address is not available yet.');
      return null;
    }
    if (!active || !account) {
      toast.error('Connect your wallet before sending NFTs.');
      return null;
    }
    if (!normalizedSource) {
      toast.error('Source wallet is not available.');
      return null;
    }
    if (!isSameAddress(account, normalizedSource)) {
      toast.error('Connect the source wallet before sending NFTs from it.');
      return null;
    }

    const normalizedRecipient = normalizeAddress(recipient);
    if (!normalizedRecipient || normalizedRecipient.toLowerCase() === zeroAddress) {
      toast.error('Enter a valid recipient address.');
      return null;
    }
    if (isSameAddress(normalizedRecipient, normalizedSource)) {
      toast.error('Enter a recipient address different from your connected wallet.');
      return null;
    }

    if (selectedTransferableIds.length === 0) {
      toast.error('Select at least one transferable NFT.');
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

  const invalidateTransferQueries = async (
    transferredIds: number[],
    recipientAddress: `0x${string}`,
  ) => {
    if (!normalizedSource) return;
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ['cstTokensByUser', normalizedSource] }),
      queryClient.invalidateQueries({ queryKey: ['cstTokensByUser', recipientAddress] }),
      queryClient.invalidateQueries({ queryKey: ['cstTransfers', normalizedSource] }),
      queryClient.invalidateQueries({ queryKey: ['cstTransfers', recipientAddress] }),
      ...transferredIds.map((tokenId) =>
        queryClient.invalidateQueries({ queryKey: ['cstInfo', tokenId] }),
      ),
    ]);
  };

  const executeTransfer = async (validTransfer: ValidTransfer) => {
    if (!normalizedSource || !contractAddrs.cosmicSignature) return;

    setSubmitting(true);
    setTxHashes([]);
    setProgress({
      total: validTransfer.tokenIds.length,
      completed: 0,
      currentTokenId: validTransfer.tokenIds[0] ?? null,
      failedTokenId: null,
    });

    const transferredIds: number[] = [];
    const confirmedHashes: `0x${string}`[] = [];
    let currentTokenId: number | null = null;

    try {
      for (const [index, tokenId] of validTransfer.tokenIds.entries()) {
        currentTokenId = tokenId;
        setProgress({
          total: validTransfer.tokenIds.length,
          completed: index,
          currentTokenId: tokenId,
          failedTokenId: null,
        });

        const hash = await writeContract(config, {
          address: contractAddrs.cosmicSignature as `0x${string}`,
          abi: cosmicSignatureAbi,
          functionName: 'transferFrom',
          args: [normalizedSource, validTransfer.recipient, BigInt(tokenId)],
          account: normalizedSource,
          chainId: activeChain.id,
        });

        await publicClient?.waitForTransactionReceipt({ hash });
        transferredIds.push(tokenId);
        confirmedHashes.push(hash);
        setProgress({
          total: validTransfer.tokenIds.length,
          completed: index + 1,
          currentTokenId: tokenId,
          failedTokenId: null,
        });
      }

      setSelectedTokenIds([]);
      setRecipient('');
      toast.success(
        validTransfer.tokenIds.length === 1
          ? 'NFT transfer confirmed.'
          : `${validTransfer.tokenIds.length} NFT transfers confirmed.`,
      );
    } catch (err) {
      setProgress((current) =>
        current
          ? {
              ...current,
              failedTokenId: currentTokenId,
            }
          : current,
      );

      if (isUserRejection(err)) {
        toast.info(WALLET_TRANSACTION_CANCELLED_MESSAGE);
      } else {
        reportError(err, 'Cosmic Signature NFT transfer');
        toast.error(
          getEthErrorMessage(
            err,
            currentTokenId == null
              ? 'Unable to send selected NFTs. Please try again.'
              : `Unable to transfer NFT #${currentTokenId}. Please try again.`,
          ),
        );
      }

      if (transferredIds.length > 0) {
        setSelectedTokenIds((current) => current.filter((id) => !transferredIds.includes(id)));
      }
    } finally {
      if (transferredIds.length > 0) {
        setTxHashes(confirmedHashes);
        await invalidateTransferQueries(transferredIds, validTransfer.recipient);
      }
      setSubmitting(false);
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const validTransfer = validateTransfer();
    if (!validTransfer) return;

    if (await shouldWarnForNewRecipient(validTransfer.recipient)) {
      setPendingTransfer(validTransfer);
      setWarningOpen(true);
      return;
    }

    await executeTransfer(validTransfer);
  };

  const handleConfirmNewRecipient = async () => {
    if (!pendingTransfer) return;
    setWarningOpen(false);
    setPendingTransfer(null);
    await executeTransfer(pendingTransfer);
  };

  const submitDisabled =
    submitting ||
    !active ||
    !account ||
    !normalizedSource ||
    !contractAddrs.cosmicSignature ||
    selectedTransferableIds.length === 0;

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Transfer Cosmic Signature NFTs</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-6 grid gap-3 rounded-lg border border-white/[0.06] bg-white/[0.025] p-4 text-sm sm:grid-cols-3">
            <div>
              <p className="text-xs uppercase tracking-wider text-muted-foreground">
                Source wallet
              </p>
              <p className="mt-1 font-mono text-foreground">
                {normalizedSource ? shortenHex(normalizedSource, 6) : 'Unavailable'}
              </p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider text-muted-foreground">Owned NFTs</p>
              <p className="mt-1 font-semibold text-foreground">{tokens.length}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider text-muted-foreground">Selected</p>
              <p className="mt-1 font-semibold text-foreground">{selectedTransferableIds.length}</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="nft-recipient">Recipient address</Label>
              <Input
                id="nft-recipient"
                value={recipient}
                onChange={(event) => setRecipient(event.target.value)}
                placeholder="0x..."
                autoComplete="off"
                disabled={submitting}
              />
            </div>

            {tokens.length === 0 ? (
              <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-5 text-sm text-muted-foreground">
                You do not have any Cosmic Signature NFTs in this wallet.
              </div>
            ) : (
              <>
                <TablePrimaryContainer>
                  <TablePrimary>
                    <colgroup>
                      <col width="5%" />
                      <col width="14%" />
                      <col width="26%" />
                      <col width="15%" />
                      <col width="20%" />
                      <col width="20%" />
                    </colgroup>
                    <TablePrimaryHead>
                      <Tr>
                        <TablePrimaryHeadCell align="left" className="!px-3 !py-2">
                          <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen}>
                            <DropdownMenuTrigger asChild>
                              <div className="hidden cursor-pointer items-center sm:flex">
                                <Checkbox
                                  ref={headerCheckboxRef}
                                  checked={isAllTransferableSelected}
                                  readOnly
                                  aria-label="Select Cosmic Signature NFTs"
                                  className="h-4 w-4"
                                />
                                {menuOpen ? (
                                  <ChevronUp className="h-5 w-5" aria-hidden />
                                ) : (
                                  <ChevronDown className="h-5 w-5" aria-hidden />
                                )}
                              </div>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="start" className="min-w-[166px]">
                              <DropdownMenuItem onSelect={handleSelectAll}>
                                Select All Transferable
                              </DropdownMenuItem>
                              <DropdownMenuItem onSelect={handleSelectCurrentPage}>
                                Select Current Page
                              </DropdownMenuItem>
                              <DropdownMenuItem onSelect={handleSelectNone}>
                                Select None
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TablePrimaryHeadCell>
                        <TablePrimaryHeadCell>Token ID</TablePrimaryHeadCell>
                        <TablePrimaryHeadCell>Token Name</TablePrimaryHeadCell>
                        <TablePrimaryHeadCell>Cycle</TablePrimaryHeadCell>
                        <TablePrimaryHeadCell>Current Owner</TablePrimaryHeadCell>
                        <TablePrimaryHeadCell>Status</TablePrimaryHeadCell>
                      </Tr>
                    </TablePrimaryHead>
                    <tbody>
                      {pageItems.map((token) => {
                        const disabledReason = getDisabledReason(token, normalizedSource);
                        const transferable = disabledReason == null;
                        return (
                          <TablePrimaryRow
                            key={`${token.EvtLogId}-${token.TokenId}`}
                            role="checkbox"
                            aria-checked={isSelected(token.TokenId)}
                            tabIndex={transferable && !submitting ? 0 : -1}
                            onClick={() => handleSelectToggle(token)}
                            onKeyDown={(event) => {
                              if (event.key === 'Enter' || event.key === ' ') {
                                event.preventDefault();
                                handleSelectToggle(token);
                              }
                            }}
                            className={cn(
                              transferable && !submitting
                                ? 'cursor-pointer'
                                : 'cursor-not-allowed opacity-60',
                              isSelected(token.TokenId) && 'bg-white/5',
                            )}
                          >
                            <TablePrimaryCell className="!px-3 !py-2">
                              <Checkbox
                                checked={isSelected(token.TokenId)}
                                readOnly
                                disabled={!transferable || submitting}
                                aria-label={`Select NFT #${token.TokenId}`}
                                className="h-4 w-4"
                              />
                            </TablePrimaryCell>
                            <TablePrimaryCell align="center">
                              <Link
                                href={`/detail/${token.TokenId}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-inherit underline-offset-4 hover:underline"
                                onClick={(event) => event.stopPropagation()}
                              >
                                {token.TokenId}
                              </Link>
                            </TablePrimaryCell>
                            <TablePrimaryCell>{token.TokenName || 'Unnamed'}</TablePrimaryCell>
                            <TablePrimaryCell align="center">
                              {token.RoundNum ? (
                                <Link
                                  href={`/allocation/${token.RoundNum}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-inherit underline-offset-4 hover:underline"
                                  onClick={(event) => event.stopPropagation()}
                                >
                                  {token.RoundNum}
                                </Link>
                              ) : (
                                ' '
                              )}
                            </TablePrimaryCell>
                            <TablePrimaryCell>
                              {token.CurOwnerAddr ? (
                                <AddressLink
                                  address={String(token.CurOwnerAddr)}
                                  url={`/user/${token.CurOwnerAddr}`}
                                />
                              ) : (
                                'Unknown'
                              )}
                            </TablePrimaryCell>
                            <TablePrimaryCell>
                              {disabledReason ??
                                (isSelected(token.TokenId) ? 'Selected' : 'Transferable')}
                            </TablePrimaryCell>
                          </TablePrimaryRow>
                        );
                      })}
                    </tbody>
                  </TablePrimary>
                </TablePrimaryContainer>
                <CustomPagination
                  page={page}
                  setPage={setPage}
                  totalLength={tokens.length}
                  perPage={perPage}
                />
              </>
            )}

            {progress ? (
              <div
                className={cn(
                  'rounded-lg border p-4 text-sm',
                  progress.failedTokenId == null
                    ? 'border-white/[0.08] bg-white/[0.03]'
                    : 'border-destructive/30 bg-destructive/10',
                )}
                role="status"
              >
                <p className="font-medium text-foreground">
                  {progress.failedTokenId == null
                    ? `Transferred ${progress.completed} of ${progress.total} NFTs`
                    : `Transfer stopped at NFT #${progress.failedTokenId}`}
                </p>
                {progress.currentTokenId != null && progress.failedTokenId == null ? (
                  <p className="mt-1 text-muted-foreground">
                    Current NFT: #{progress.currentTokenId}
                  </p>
                ) : null}
              </div>
            ) : null}

            {txHashes.length > 0 ? (
              <div className="rounded-lg border border-emerald-400/20 bg-emerald-400/[0.06] p-4 text-sm">
                <p className="font-medium text-emerald-200">
                  {txHashes.length === 1
                    ? 'Latest transfer confirmed.'
                    : `${txHashes.length} transfers confirmed.`}
                </p>
                <a
                  href={getExplorerUrl('tx', txHashes[txHashes.length - 1]!)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 inline-flex items-center gap-1 text-primary underline-offset-4 hover:underline"
                >
                  View latest transaction
                  <ArrowUpRight className="h-3.5 w-3.5" aria-hidden />
                </a>
              </div>
            ) : null}

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <Button type="submit" disabled={submitDisabled} aria-label="Send selected NFTs">
                {submitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                ) : (
                  <SendHorizontal className="h-4 w-4" aria-hidden />
                )}
                {submitting ? 'Sending...' : 'Send Selected NFTs'}
              </Button>

              {historyHref ? (
                <a
                  href={historyHref}
                  className="text-sm font-medium text-primary underline-offset-4 hover:underline"
                >
                  View NFT transfer history
                </a>
              ) : null}
            </div>
          </form>
        </CardContent>
      </Card>

      <Dialog open={warningOpen} onOpenChange={setWarningOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Recipient has no transaction history</DialogTitle>
            <DialogDescription>
              This address appears to have no transactions yet. Double-check the recipient before
              sending; NFT transfers cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setWarningOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleConfirmNewRecipient}>Continue transfer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
