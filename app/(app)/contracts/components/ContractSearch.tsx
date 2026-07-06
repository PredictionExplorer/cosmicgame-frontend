'use client';

import { Search, X } from 'lucide-react';

import { cn } from '@/lib/utils';

interface ContractSearchProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export function ContractSearch({ value, onChange, className }: ContractSearchProps) {
  return (
    <div className={cn('relative mb-4', className)}>
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/50" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search contracts by name or address..."
        className="flex h-10 w-full rounded-lg border border-white/[0.06] bg-white/[0.03] pl-9 pr-9 text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-primary/30 focus:outline-none focus:ring-1 focus:ring-primary/20 transition-colors"
        aria-label="Search contracts"
      />
      {value && (
        <button
          onClick={() => onChange('')}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/50 hover:text-muted-foreground transition-colors"
          aria-label="Clear search"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
