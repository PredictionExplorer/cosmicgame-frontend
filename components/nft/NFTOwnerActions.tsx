import { type ChangeEvent } from 'react';
import { ArrowRight, CirclePlus, Pen, Send, WalletCards } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { Link } from '@/i18n/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { InfoTooltip } from '@/components/ui/info-tooltip';

export interface NFTOwnerActionsProps {
  address: string;
  tokenName: string;
  nftTokenName: string;
  nameHistoryCount: number;
  currentName: string;
  totalNamedTokens: number;
  disabled: boolean;
  showMetaMaskAction: boolean;
  addingToMetaMask: boolean;
  onAddressChange: (value: string) => void;
  onTokenNameChange: (e: ChangeEvent<HTMLInputElement>) => void;
  onAddToMetaMask: () => void;
  onTransfer: () => void;
  onSetName: () => void;
  onClearName: () => void;
}

export function NFTOwnerActions({
  address,
  tokenName,
  nftTokenName,
  nameHistoryCount,
  currentName,
  totalNamedTokens,
  disabled,
  showMetaMaskAction,
  addingToMetaMask,
  onAddressChange,
  onTokenNameChange,
  onAddToMetaMask,
  onTransfer,
  onSetName,
  onClearName,
}: NFTOwnerActionsProps) {
  const t = useTranslations('detail');

  const nameHeading = nftTokenName
    ? t('ownerActions.renameHeading')
    : t('ownerActions.nameHeading');

  // The one quiet surface of the page: the owner's tools, grouped by
  // hairlines inside it rather than by nested boxes.
  return (
    <div className="rounded-surface bg-surface p-5 sm:p-6" data-testid="owner-actions">
      <div className="mb-6 flex items-center gap-2">
        <h2 className="type-heading-3 text-foreground">{t('ownerActions.title')}</h2>
        <InfoTooltip content={t('ownerActions.titleTooltip')} />
      </div>

      {showMetaMaskAction && (
        <>
          <div>
            <div className="mb-3 flex items-center gap-2">
              <WalletCards className="size-4 text-subtle" aria-hidden />
              <h3 className="type-label text-muted-foreground">
                {t('ownerActions.metaMaskHeading')}
              </h3>
              <InfoTooltip content={t('ownerActions.metaMaskTooltip')} />
            </div>
            <Button variant="secondary" onClick={onAddToMetaMask} disabled={addingToMetaMask}>
              {addingToMetaMask
                ? t('ownerActions.addingToMetaMask')
                : t('ownerActions.addToMetaMask')}
              <CirclePlus className="ml-1.5 h-4 w-4" aria-hidden />
            </Button>
          </div>

          <hr className="my-6 border-rule-faint" />
        </>
      )}

      {/* Transfer section */}
      <div>
        <div className="mb-3 flex items-center gap-2">
          <Send className="size-4 text-subtle" aria-hidden />
          <h3 className="type-label text-muted-foreground">{t('ownerActions.transferHeading')}</h3>
          <InfoTooltip content={t('ownerActions.transferTooltip')} />
        </div>
        <div className="flex gap-2">
          <Input
            aria-label={t('ownerActions.transferHeading')}
            placeholder={t('ownerActions.recipientPlaceholder')}
            className="flex-1 font-mono text-sm"
            value={address}
            onChange={(e) => onAddressChange(e.target.value)}
          />
          <Button variant="secondary" onClick={onTransfer} disabled={disabled}>
            {t('ownerActions.transferButton')}
            <ArrowRight className="ml-1.5 h-4 w-4" aria-hidden />
          </Button>
        </div>
      </div>

      <hr className="my-6 border-rule-faint" />

      {/* Rename section */}
      <div>
        <div className="mb-3 flex items-center gap-2">
          <Pen className="size-4 text-subtle" aria-hidden />
          <h3 className="type-label text-muted-foreground">{nameHeading}</h3>
          <InfoTooltip content={t('ownerActions.nameTooltip')} />
        </div>
        <div className="flex gap-2">
          <Input
            aria-label={nameHeading}
            placeholder={t('ownerActions.namePlaceholder')}
            value={tokenName}
            className="flex-1"
            maxLength={32}
            onChange={onTokenNameChange}
          />
          <Button
            variant="secondary"
            onClick={onSetName}
            className="whitespace-nowrap"
            disabled={!tokenName}
          >
            {nftTokenName === '' ? t('ownerActions.setName') : t('ownerActions.changeName')}
          </Button>
          {nameHistoryCount > 0 && currentName && (
            <Button variant="outline" onClick={onClearName} className="whitespace-nowrap">
              {t('ownerActions.clearName')}
            </Button>
          )}
        </div>
        <p className="mt-3 type-caption text-subtle">
          {t('ownerActions.namedTokensCount', { count: totalNamedTokens })}{' '}
          <Link href="/named-nfts" className="link">
            {t('ownerActions.viewAllNamedTokens')}
          </Link>
        </p>
      </div>
    </div>
  );
}
