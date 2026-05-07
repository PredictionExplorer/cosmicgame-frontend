'use client';

import { ArrowDownUp } from 'lucide-react';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

export type SortKey = 'newest' | 'oldest' | 'cycle-desc' | 'cycle-asc';

interface GallerySortSelectProps {
  value: SortKey;
  onChange: (sort: SortKey) => void;
}

const sortOptions: { value: SortKey; label: string }[] = [
  { value: 'newest', label: 'Newest First' },
  { value: 'oldest', label: 'Oldest First' },
  { value: 'cycle-desc', label: 'Cycle (High → Low)' },
  { value: 'cycle-asc', label: 'Cycle (Low → High)' },
];

export function GallerySortSelect({ value, onChange }: GallerySortSelectProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className="flex items-center gap-2">
          <ArrowDownUp className="h-4 w-4 text-muted-foreground shrink-0 hidden sm:block" />
          <Select value={value} onValueChange={(v) => onChange(v as SortKey)}>
            <SelectTrigger
              className="w-[170px] h-9 text-xs border-white/[0.06] bg-white/[0.03]"
              aria-label="Sort order"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {sortOptions.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </TooltipTrigger>
      <TooltipContent side="bottom">
        <p>Change the order NFTs are displayed</p>
      </TooltipContent>
    </Tooltip>
  );
}
