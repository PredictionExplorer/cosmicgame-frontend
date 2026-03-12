import { type ChangeEvent } from 'react';
import Link from 'next/link';
import { ArrowRight, Pen, Send } from 'lucide-react';

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
  onAddressChange: (value: string) => void;
  onTokenNameChange: (e: ChangeEvent<HTMLInputElement>) => void;
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
  onAddressChange,
  onTokenNameChange,
  onTransfer,
  onSetName,
  onClearName,
}: NFTOwnerActionsProps) {
  return (
    <div
      className="gradient-border-card rounded-xl bg-white/[0.02] p-6"
      data-testid="owner-actions"
    >
      <div className="flex items-center gap-2 mb-6">
        <h3 className="text-lg font-semibold text-foreground">Manage Your Token</h3>
        <InfoTooltip content="As the current owner, you can transfer this token to another address or set a custom name for it." />
      </div>

      {/* Transfer section */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Send className="h-4 w-4 text-primary/70" />
          <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
            Transfer
          </h4>
          <InfoTooltip content="Send this token to another Ethereum address. Double-check the address before confirming — transfers are irreversible." />
        </div>
        <div className="flex gap-2">
          <Input
            placeholder="Recipient address (0x...)"
            className="flex-1 font-mono text-sm"
            value={address}
            onChange={(e) => onAddressChange(e.target.value)}
          />
          <Button variant="secondary" onClick={onTransfer} disabled={disabled}>
            Transfer
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
            {nftTokenName ? 'Rename Token' : 'Name Token'}
          </h4>
          <InfoTooltip content="Give your token a custom name (max 32 bytes). Named tokens appear on the Named NFTs page." />
        </div>
        <div className="flex gap-2">
          <Input
            placeholder="Enter token name"
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
            {nftTokenName === '' ? 'Set Name' : 'Change Name'}
          </Button>
          {nameHistoryCount > 0 && currentName && (
            <Button variant="outline" onClick={onClearName} className="whitespace-nowrap">
              Clear
            </Button>
          )}
        </div>
        <p className="text-xs text-muted-foreground mt-3">
          There are {totalNamedTokens} tokens with a name.{' '}
          <Link href="/named-nfts" className="text-primary hover:underline">
            View all named tokens
          </Link>
        </p>
      </div>
    </div>
  );
}
