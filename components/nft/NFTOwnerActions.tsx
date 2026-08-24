import { type ChangeEvent } from 'react';
import { ArrowRight, CirclePlus, Pen, Send, WalletCards } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { Link } from '@/i18n/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { InfoTooltip } from '@/components/ui/info-tooltip';
import { SectionDivider } from '@/components/ui/section-divider';

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

  return (
    <div
      className="gradient-border-card rounded-xl bg-white/[0.02] p-6"
      data-testid="owner-actions"
    >
      <div className="flex items-center gap-2 mb-6">
        <h3 className="text-lg font-semibold text-foreground">{t('ownerActions.title')}</h3>
        <InfoTooltip content={t('ownerActions.titleTooltip')} />
      </div>

      {showMetaMaskAction && (
        <>
          <div>
            <div className="flex items-center gap-2 mb-3">
              <WalletCards className="h-4 w-4 text-primary/70" aria-hidden />
              <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                {t('ownerActions.metaMaskHeading')}
              </h4>
              <InfoTooltip content={t('ownerActions.metaMaskTooltip')} />
            </div>
            <Button variant="secondary" onClick={onAddToMetaMask} disabled={addingToMetaMask}>
              {addingToMetaMask
                ? t('ownerActions.addingToMetaMask')
                : t('ownerActions.addToMetaMask')}
              <CirclePlus className="ml-1.5 h-4 w-4" aria-hidden />
            </Button>
          </div>

          <SectionDivider className="my-6" />
        </>
      )}

      {/* Transfer section */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Send className="h-4 w-4 text-primary/70" />
          <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
            {t('ownerActions.transferHeading')}
          </h4>
          <InfoTooltip content={t('ownerActions.transferTooltip')} />
        </div>
        <div className="flex gap-2">
          <Input
            placeholder={t('ownerActions.recipientPlaceholder')}
            className="flex-1 font-mono text-sm"
            value={address}
            onChange={(e) => onAddressChange(e.target.value)}
          />
          <Button variant="secondary" onClick={onTransfer} disabled={disabled}>
            {t('ownerActions.transferButton')}
            <ArrowRight className="ml-1.5 h-4 w-4" />
          </Button>
        </div>
      </div>

      <SectionDivider className="my-6" />

      {/* Rename section */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Pen className="h-4 w-4 text-primary/70" />
          <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
            {nftTokenName ? t('ownerActions.renameHeading') : t('ownerActions.nameHeading')}
          </h4>
          <InfoTooltip content={t('ownerActions.nameTooltip')} />
        </div>
        <div className="flex gap-2">
          <Input
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
        <p className="text-xs text-muted-foreground mt-3">
          {t('ownerActions.namedTokensCount', { count: totalNamedTokens })}{' '}
          <Link href="/named-nfts" className="text-primary hover:underline">
            {t('ownerActions.viewAllNamedTokens')}
          </Link>
        </p>
      </div>
    </div>
  );
}
