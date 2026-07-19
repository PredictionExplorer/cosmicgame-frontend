import { ChevronRight } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { formatId } from '@/utils';

import { Link } from '@/i18n/navigation';

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
        className="text-muted-foreground hover:text-primary transition-colors no-underline"
      >
        {tCommon('breadcrumbs.home')}
      </Link>
      <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/40" />
      <Link
        href="/gallery"
        className="text-muted-foreground hover:text-primary transition-colors no-underline"
      >
        {tCommon('breadcrumbs.gallery')}
      </Link>
      <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/40" />
      <span className="text-foreground font-medium truncate max-w-[200px]">{label}</span>
    </nav>
  );
}
