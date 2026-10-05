'use client';

import { useMemo, useState } from 'react';
import { ArrowRight, Send } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';

import { isAnchorable } from '@/utils/anchoringStats';
import { formatCount, formatId } from '@/utils/format';
import { useCSTTokensByUser } from '@/hooks/useApiQuery';
import { useCollectionTraits } from '@/hooks/useNftTraits';
import { useActiveWeb3React } from '@/hooks/web3';
import { Link } from '@/i18n/navigation';
import { AnchoringIcon } from '@/lib/conceptIcons';
import { cn } from '@/lib/utils';
import { PageHeader } from '@/components/layout/PageHeader';
import { NftMarketplaceButton } from '@/components/common/NftMarketplaceButton';
import { NftSendBar } from '@/components/nft/NftSendBar';
import { NftSendSheet } from '@/components/nft/NftSendSheet';
import { wallReadFailed } from '@/components/nft/PagedWall';
import type { SignatureCardSelect } from '@/components/nft/SignatureCard';
import { signatureCardSources } from '@/components/nft/SignatureCard';
import { SignatureWall, type SignatureWallItem } from '@/components/nft/SignatureWall';
import { nftSendBlock, toSourceAddress } from '@/components/nft/nftSendEligibility';
import { useTraitLabels } from '@/components/nft/traits';
import { useWallPage } from '@/components/nft/useWallPage';
import { ArtFrame } from '@/components/ui/art-frame';
import { Button, buttonVariants } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { ErrorState } from '@/components/ui/error-state';
import { PageShell } from '@/components/ui/page-shell';
import { WalletRequiredState } from '@/components/wallet/WalletRequiredState';

/** One of the collection's newest imprints, for the disconnected state. */
export interface NewestPlate {
  tokenId: number;
  seed: string | number;
}

export interface MyTokensProps {
  /** The newest imprints, hung small while no wallet is connected. */
  newest?: readonly NewestPlate[];
  /** The page in the URL (`MyTokensRoute`); without it the page is local. */
  page?: number;
  onPageChange?: (page: number) => void;
}

/**
 * My NFTs: the Signatures in the connected wallet, hung as a personal
 * collection (the art on its plates, how each one arrived in its caption).
 * Sending is a mode of the same wall: "Transfer NFTs" puts a checkbox in
 * each wall label (never over the art) and raises a bar at the foot of the
 * screen, whose send step opens the recipient and the review in a sheet.
 * While a Signature here has never been anchored, the header offers to
 * anchor it.
 */
export default function MyTokens({ newest = [], page, onPageChange }: MyTokensProps) {
  const t = useTranslations('myPages');
  const tTransfer = useTranslations('myPages.nftTransfer');
  const tWallet = useTranslations('wallet');
  const locale = useLocale();
  const { valueLabel } = useTraitLabels();
  const { account, active } = useActiveWeb3React();
  const connected = Boolean(active && account);
  const {
    data: tokensRaw,
    isLoading,
    isError,
    refetch,
  } = useCSTTokensByUser(connected ? account : undefined);
  const {
    traits: collectionTraits,
    isLoading: traitsLoading,
    isError: traitsError,
  } = useCollectionTraits();
  const traitsForUi = traitsError ? null : traitsLoading ? undefined : (collectionTraits ?? null);
  const tokens = useMemo(() => tokensRaw ?? [], [tokensRaw]);
  const source = toSourceAddress(account);

  const items = useMemo<SignatureWallItem[]>(
    () =>
      [...tokens]
        .sort((a, b) => b.TokenId - a.TokenId)
        .map((token) => {
          const allocation = collectionTraits?.byId.get(token.TokenId)?.allocation;
          return {
            tokenId: token.TokenId,
            seed: token.Seed,
            name: token.TokenName,
            anchored: Boolean(token.Staked),
            imprintedAt: token.MintTimeStamp ?? token.TimeStamp,
            // How the Signature first arrived: Stellar Selection, the Final Gesture…
            extraMeta: allocation ? [valueLabel('allocation', allocation)] : undefined,
          };
        }),
    [tokens, collectionTraits, valueLabel],
  );
  const blocks = useMemo(
    () => new Map(tokens.map((token) => [token.TokenId, nftSendBlock(token, source)])),
    [tokens, source],
  );
  const transferableIds = useMemo(
    () => items.filter((item) => blocks.get(item.tokenId) === null).map((item) => item.tokenId),
    [items, blocks],
  );

  // Send mode: the wall's checkboxes, the bar and the sheet. It ends with a
  // wallet change, so a choice never carries over to another account.
  const [sendMode, setSendMode] = useState(false);
  const [chosen, setChosen] = useState<number[]>([]);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [modeAccount, setModeAccount] = useState(account);
  if (modeAccount !== account) {
    setModeAccount(account);
    setSendMode(false);
    setChosen([]);
    setSheetOpen(false);
  }
  const endSendMode = () => {
    setSendMode(false);
    setChosen([]);
    setSheetOpen(false);
  };
  // A Signature that stopped being sendable (anchored elsewhere, sold) drops out.
  const selected = chosen.filter((id) => transferableIds.includes(id));

  // A failed refetch (after a send, on Retry) keeps the wall it already has.
  const readFailed = wallReadFailed({ isError, data: tokensRaw });
  const loaded = connected && tokensRaw !== undefined;
  const anchoredCount = tokens.filter((token) => token.Staked).length;
  // The anchoring rule: not anchored now, and never released (each NFT is anchored once, ever).
  const anchorableCount = tokens.filter(isAnchorable).length;

  const select = sendMode
    ? (item: SignatureWallItem): SignatureCardSelect => {
        const block = blocks.get(item.tokenId) ?? null;
        return {
          checked: selected.includes(item.tokenId),
          onCheckedChange: (checked) =>
            setChosen((current) => {
              const rest = current.filter((id) => id !== item.tokenId);
              return checked ? [...rest, item.tokenId] : rest;
            }),
          label: tTransfer('selectAria', { id: formatId(item.tokenId) }),
          unavailable:
            block === 'anchored'
              ? tTransfer('statusLabels.anchored')
              : block === 'ownerChanged'
                ? tTransfer('statusLabels.ownerChanged')
                : null,
          unavailableTone: block === 'ownerChanged' ? 'attention' : 'neutral',
          disabled: sheetOpen,
        };
      }
    : undefined;

  return (
    <PageShell variant="data" backdrop="signature">
      <PageHeader
        section="account"
        title={t('tokens.page.title')}
        subtitle={t('tokens.page.subtitle')}
        actions={
          <>
            {loaded && tokens.length > 0 ? (
              <Button
                type="button"
                variant="outline"
                aria-pressed={sendMode}
                onClick={() => (sendMode ? endSendMode() : setSendMode(true))}
                data-testid="nft-send-mode"
              >
                <Send aria-hidden />
                {t('tokens.page.transferTitle')}
              </Button>
            ) : null}
            {loaded && anchorableCount > 0 ? (
              <Link href="/my-anchors" className={buttonVariants({ variant: 'outline' })}>
                <AnchoringIcon aria-hidden />
                {t('tokens.page.anchorLink')}
              </Link>
            ) : null}
            <NftMarketplaceButton />
          </>
        }
        figures={
          loaded && tokens.length > 0
            ? [
                {
                  id: 'owned',
                  label: t('tokens.page.figures.owned'),
                  value: formatCount(tokens.length, locale),
                },
                {
                  id: 'anchored',
                  label: t('tokens.page.figures.anchored'),
                  value: formatCount(anchoredCount, locale),
                },
              ]
            : undefined
        }
      />

      {!connected ? (
        <WalletRequiredState
          title={tWallet('required.nfts.title')}
          description={tWallet('required.nfts.description')}
          publicLink={{ href: '/gallery', label: tWallet('required.nfts.publicLink') }}
          visual={newest.length > 0 ? <NewestPlates plates={newest} /> : undefined}
        />
      ) : (
        <>
          <SignatureWall
            items={items}
            collectionTraits={traitsForUi}
            loading={isLoading}
            page={page}
            onPageChange={onPageChange}
            select={select}
            ariaLabel={t('tokens.page.ownedTitle')}
            // The send bar floats over the foot of the page: keep the pager clear of it.
            className={cn(sendMode && 'pb-36 sm:pb-24')}
            error={
              readFailed ? (
                <ErrorState
                  variant="page"
                  title={t('tokens.page.loadErrorTitle')}
                  message={t('tokens.page.loadErrorMessage')}
                  headingLevel={2}
                  onRetry={() => void refetch()}
                />
              ) : undefined
            }
            empty={
              <EmptyState
                title={t('tokens.page.emptyTitle')}
                description={t('tokens.page.emptyDescription')}
                headingLevel={2}
                variant="page"
                action={
                  <Link href="/gallery" className={buttonVariants({ variant: 'outline' })}>
                    {tWallet('required.nfts.publicLink')}
                    <ArrowRight aria-hidden />
                  </Link>
                }
              />
            }
          />

          {sendMode && loaded ? (
            <NftSendBar
              selected={selected.length}
              transferable={transferableIds.length}
              onSelectAll={() => setChosen(transferableIds)}
              onCancel={endSendMode}
              onContinue={() => setSheetOpen(true)}
            />
          ) : null}

          {account ? (
            <NftSendSheet
              open={sheetOpen && selected.length > 0}
              onOpenChange={setSheetOpen}
              sourceAddress={account}
              items={selected.map((id) => ({
                tokenId: id,
                seed: items.find((item) => item.tokenId === id)?.seed,
              }))}
              onSent={(ids) => setChosen((current) => current.filter((id) => !ids.includes(id)))}
              onComplete={endSendMode}
              historyHref={`/cosmic-signature-transfer/${account}`}
            />
          ) : null}
        </>
      )}
    </PageShell>
  );
}

/**
 * The collection's newest plates, small, in place of the wallet icon while
 * no wallet is connected: an art page shows art, and the caption says whose
 * they are and what will hang here instead.
 */
function NewestPlates({ plates }: { plates: readonly NewestPlate[] }) {
  const t = useTranslations('myPages');
  const tDetail = useTranslations('detail');
  return (
    <div className="mb-8 w-full max-w-md" data-testid="newest-plates">
      <ul aria-hidden className="grid grid-cols-3 gap-3">
        {plates.map((plate) => (
          <li key={plate.tokenId}>
            <ArtFrame
              sources={signatureCardSources(plate.seed)}
              alt=""
              sizes="(min-width: 640px) 9rem, 30vw"
              density="compact"
              unavailableLabel={tDetail('image.artworkUnavailable')}
            />
          </li>
        ))}
      </ul>
      <p className="mt-3 type-caption text-subtle">{t('tokens.page.newestCaption')}</p>
    </div>
  );
}

/**
 * My NFTs with its page number in the URL (`?page=2`), so Back from a
 * Signature returns to the same plates, as on the other walls. The route
 * renders it under Suspense with the first page as the fallback.
 */
export function MyTokensRoute(props: Omit<MyTokensProps, 'page' | 'onPageChange'>) {
  const { page, setPage } = useWallPage();
  return <MyTokens {...props} page={page} onPageChange={setPage} />;
}
