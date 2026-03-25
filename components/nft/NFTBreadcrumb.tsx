import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

import { formatId } from '@/utils';

interface NFTBreadcrumbProps {
  tokenId: number;
  tokenName?: string;
}

export function NFTBreadcrumb({ tokenId, tokenName }: NFTBreadcrumbProps) {
  const label = tokenName || `Token ${formatId(tokenId)}`;

  return (
    <nav
      aria-label="Breadcrumb"
      className="flex items-center gap-1.5 text-sm"
      data-testid="nft-breadcrumb"
    >
      <Link
        href="/"
        className="text-muted-foreground hover:text-primary transition-colors no-underline"
      >
        Home
      </Link>
      <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/40" />
      <Link
        href="/gallery"
        className="text-muted-foreground hover:text-primary transition-colors no-underline"
      >
        Gallery
      </Link>
      <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/40" />
      <span className="text-foreground font-medium truncate max-w-[200px]">{label}</span>
    </nav>
  );
}
