'use client';

import { useId } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import type { CycleScope } from './useCycleScope';

/**
 * The page's one cycle picker: previous and next beside a menu of every
 * cycle (newest first), and the live cycle's state as the one pill the
 * design allows, or a way back to it. Every cycle chart on the page follows
 * it (`useCycleScope`).
 */
export function CycleScopeControl({ scope }: { scope: CycleScope }) {
  const t = useTranslations('statistics');
  const labelId = useId();
  const { cycle, isLive, liveCycle, setCycle } = scope;
  if (liveCycle < 0) return null;

  const cycles = Array.from({ length: liveCycle + 1 }, (_, index) => liveCycle - index);
  const label = (value: number) =>
    value === liveCycle
      ? t('charts.cyclePicker.optionLive', { cycle: value })
      : t('charts.cyclePicker.option', { cycle: value });

  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
      <span id={labelId} className="type-label text-subtle">
        {t('charts.cyclePicker.cycle')}
      </span>
      <div className="flex items-center gap-1">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label={t('charts.cyclePicker.previousCycleAria')}
          disabled={cycle <= 0}
          onClick={() => setCycle(cycle - 1)}
        >
          <ChevronLeft />
        </Button>
        <Select value={String(cycle)} onValueChange={(value) => setCycle(Number(value))}>
          <SelectTrigger aria-labelledby={labelId} className="w-auto min-w-36 tabular-nums">
            <SelectValue>{label(cycle)}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            {cycles.map((value) => (
              <SelectItem key={value} value={String(value)} className="tabular-nums">
                {label(value)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label={t('charts.cyclePicker.nextCycleAria')}
          disabled={cycle >= liveCycle}
          onClick={() => setCycle(cycle + 1)}
        >
          <ChevronRight />
        </Button>
      </div>
      {isLive ? (
        <Badge tone="live" shape="pill" dot>
          {t('charts.cyclePicker.liveCycle')}
        </Badge>
      ) : (
        <Button type="button" variant="quiet" size="sm" onClick={() => setCycle(liveCycle)}>
          {t('charts.cyclePicker.jumpLive')}
        </Button>
      )}
    </div>
  );
}
