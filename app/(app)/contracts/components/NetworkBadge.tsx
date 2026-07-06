import { Globe } from 'lucide-react';

import { Badge } from '@/components/ui/badge';

interface NetworkBadgeProps {
  chainName: string;
  chainId: number;
}

export function NetworkBadge({ chainName, chainId }: NetworkBadgeProps) {
  return (
    <Badge
      variant="outline"
      className="mt-4 inline-flex items-center gap-2 rounded-full border-primary/20 bg-primary/5 px-4 py-1.5 text-sm"
    >
      <Globe className="h-3.5 w-3.5 text-primary" />
      <span className="font-medium">{chainName}</span>
      <span className="text-muted-foreground">Chain {chainId}</span>
    </Badge>
  );
}
