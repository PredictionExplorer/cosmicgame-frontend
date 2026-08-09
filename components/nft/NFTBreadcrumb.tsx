import { ChevronRight } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { formatId } from '@/utils';

import { Link } from '@/i18n/navigation';
import { cn } from '@/lib/utils';
import { TOUCH_TARGET_TEXT_LINK_CLASS } from '@/lib/touch-target';

interface NFTBreadcrumbProps {
  tokenId: number;
  tokenName?: string;
}

export function NFTBreadcrumb({ tokenId, tokenName }: NFTBreadcrumbProps) {
  const t = useTranslations('detail');
  const tCommon = useTranslations('common');
  const label = tokenName || t('breadcrumb.tokenFallback', { id: formatId(tokenId) });

  return (
    <nav
      aria-label={tCommon('accessibility.breadcrumb')}
      className="flex items-center gap-1.5 text-sm"
      data-testid="nft-breadcrumb"
    >
      <Link
        href="/"
        className={cn(
          'text-muted-foreground hover:text-primary transition-colors no-underline',
          TOUCH_TARGET_TEXT_LINK_CLASS,
        )}
      >
        {tCommon('breadcrumbs.home')}
      </Link>
      <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/40" />
      <Link
        href="/gallery"
        className={cn(
          'text-muted-foreground hover:text-primary transition-colors no-underline',
          TOUCH_TARGET_TEXT_LINK_CLASS,
        )}
      >
        {tCommon('breadcrumbs.gallery')}
      </Link>
      <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/40" />
      <span className="text-foreground font-medium truncate max-w-[200px]">{label}</span>
    </nav>
  );
}
