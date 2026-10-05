import type { ReactNode } from 'react';
import { ArrowLeftRight, ArrowRight } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { AnchoringIcon, GestureIcon, StellarSelectionIcon } from '@/lib/conceptIcons';
import { Link } from '@/i18n/navigation';
import { cn } from '@/lib/utils';

interface ActionItem {
  key: string;
  label: string;
  description: string;
  href: string;
  icon: ReactNode;
}

export interface QuickActionsProps {
  address: string;
  className?: string;
}

/**
 * Where to go next from your own statistics: four outlined link rows (the
 * only boxes a region may draw are whole links), each a concept icon, a
 * title, one line and an arrow.
 */
export function QuickActions({ address, className }: QuickActionsProps) {
  const t = useTranslations('myPages');
  const actions: ActionItem[] = [
    {
      key: 'gesture',
      label: t('statistics.quickActions.gesture.label'),
      description: t('statistics.quickActions.gesture.description'),
      href: '/',
      icon: <GestureIcon />,
    },
    {
      key: 'anchor',
      label: t('statistics.quickActions.anchor.label'),
      description: t('statistics.quickActions.anchor.description'),
      href: '/my-anchors',
      icon: <AnchoringIcon />,
    },
    {
      key: 'stellarSelection',
      label: t('statistics.quickActions.stellarSelection.label'),
      description: t('statistics.quickActions.stellarSelection.description'),
      href: `/user/stellar-selection-eth/${address}`,
      icon: <StellarSelectionIcon />,
    },
    {
      key: 'transfers',
      label: t('statistics.quickActions.transfers.label'),
      description: t('statistics.quickActions.transfers.description'),
      href: `/cosmic-signature-transfer/${address}`,
      icon: <ArrowLeftRight />,
    },
  ];

  return (
    <nav aria-label={t('statistics.quickActions.label')} className={className}>
      <ul
        className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4"
        data-testid="quick-actions"
      >
        {actions.map((action) => (
          <li key={action.key} className="min-w-0">
            <Link
              href={action.href}
              className={cn(
                'group flex h-full items-start gap-3 rounded-surface border border-rule p-4 no-underline',
                'transition-colors duration-fast hover:border-input hover:bg-surface',
              )}
            >
              <span
                aria-hidden
                className="mt-0.5 shrink-0 text-subtle transition-colors duration-fast group-hover:text-foreground [&_svg]:size-4"
              >
                {action.icon}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block type-title text-foreground">{action.label}</span>
                <span className="mt-1 block type-body-sm text-muted-foreground">
                  {action.description}
                </span>
              </span>
              <ArrowRight
                aria-hidden
                className="mt-1 size-4 shrink-0 text-subtle transition-transform duration-fast group-hover:translate-x-0.5 group-hover:text-foreground motion-reduce:transition-none"
              />
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
