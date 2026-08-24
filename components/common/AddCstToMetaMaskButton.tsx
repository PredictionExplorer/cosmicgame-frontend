'use client';

import { CirclePlus } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { useMetaMaskWatchAsset } from '@/hooks/useMetaMaskWatchAsset';
import { cn } from '@/lib/utils';
import { DropdownMenuItem } from '@/components/ui/dropdown-menu';

type AddCstToMetaMaskButtonVariant = 'menu' | 'drawer';

interface AddCstToMetaMaskButtonProps {
  variant?: AddCstToMetaMaskButtonVariant;
  className?: string;
}

export function AddCstToMetaMaskButton({
  variant = 'menu',
  className,
}: AddCstToMetaMaskButtonProps) {
  const t = useTranslations('wallet');
  const { isMetaMaskConnected, isAddingCst, addCst } = useMetaMaskWatchAsset();

  if (!isMetaMaskConnected) return null;

  const button = (
    <button
      type="button"
      onClick={() => void addCst()}
      disabled={isAddingCst}
      className={cn(
        'flex w-full cursor-pointer items-center text-left text-white transition-colors hover:text-primary disabled:cursor-wait disabled:opacity-60',
        variant === 'menu' ? 'gap-2.5 px-2 py-1.5 text-sm' : 'gap-3 px-5 py-2.5 text-sm',
        className,
      )}
    >
      <CirclePlus
        className={cn(
          'shrink-0 text-muted-foreground',
          variant === 'menu' ? 'h-3.5 w-3.5' : 'h-4 w-4',
        )}
        aria-hidden
      />
      {isAddingCst ? t('account.addingCstToMetaMask') : t('account.addCstToMetaMask')}
    </button>
  );

  if (variant === 'menu') {
    return (
      <DropdownMenuItem asChild disabled={isAddingCst} className="cursor-pointer p-0">
        {button}
      </DropdownMenuItem>
    );
  }

  return button;
}
