import { type ChangeEvent } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

/** Props for the NFT owner actions panel. */
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

/** Transfer and rename controls shown only to the token's current owner. */
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
    <>
      <div className="flex mt-6">
        <Input
          placeholder="Enter address here"
          className="flex-1"
          value={address}
          onChange={(e) => onAddressChange(e.target.value)}
        />
        <Button variant="secondary" onClick={onTransfer} className="ml-2" disabled={disabled}>
          Transfer
          <ArrowRight className="ml-1 h-4 w-4" />
        </Button>
      </div>

      <div className="mt-6">
        <h6 className="text-lg font-medium text-left">
          {nftTokenName ? 'Rename the token' : 'Set a name to the token'}
        </h6>
        <div className="flex">
          <Input
            placeholder="Enter token name here"
            value={tokenName}
            className="flex-1"
            maxLength={32}
            onChange={onTokenNameChange}
          />
          <Button
            variant="secondary"
            onClick={onSetName}
            className="ml-2 whitespace-nowrap"
            disabled={!tokenName}
          >
            {nftTokenName === '' ? 'Set Name' : 'Change Name'}
          </Button>
          {nameHistoryCount > 0 && currentName && (
            <Button variant="secondary" onClick={onClearName} className="ml-2 whitespace-nowrap">
              Clear name
            </Button>
          )}
        </div>
        <p className="text-sm mt-2 italic">
          There are {totalNamedTokens} tokens with a name, click{' '}
          <Link href="/named-nfts" className="text-primary hover:underline">
            here
          </Link>{' '}
          for a full list.
        </p>
      </div>
    </>
  );
}
