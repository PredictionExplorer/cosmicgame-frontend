'use client';

import { useState, type FC, type ReactNode } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { cn } from '@/lib/utils';
import { TOUCH_TARGET_HEIGHT_CLASS } from '@/lib/touch-target';
import { Button } from '@/components/ui/button';

type CyclePickerSectionProps = {
  /** The current in-progress round number (from dashboard CurRoundNum). */
  currentRoundNum: number;
  /** Optional extra header content rendered after the picker (e.g. an embed link). */
  headerEnd?: (selectedRound: number) => ReactNode;
  /** Chart body for the selected round. */
  children: (selectedRound: number, isLive: boolean) => ReactNode;
};

/**
 * Shared round picker used by the per-round statistics charts. Defaults to the
 * current cycle and lets the user step back through finalized cycles.
 */
export const CyclePickerSection: FC<CyclePickerSectionProps> = ({
  currentRoundNum,
  headerEnd,
  children,
}) => {
  const t = useTranslations('statistics');
  const maxRound = Math.max(0, currentRoundNum);
  // `null` means "follow the live round": the selection is derived from
  // currentRoundNum until the user explicitly navigates, so a new live round
  // (or a late-arriving dashboard response) is picked up automatically.
  const [pinnedRound, setPinnedRound] = useState<number | null>(null);
  const selectedRound = pinnedRound === null ? maxRound : Math.min(pinnedRound, maxRound);
  const setSelectedRound = (round: number) => {
    const clamped = Math.min(Math.max(0, round), maxRound);
    setPinnedRound(clamped >= maxRound ? null : clamped);
  };

  const isLive = selectedRound >= currentRoundNum;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <span className="text-xs uppercase tracking-wider text-muted-foreground">
          {t('charts.cyclePicker.cycle')}
        </span>
        <div className="flex items-center gap-1">
          <Button
            type="button"
            size="icon"
            variant="outline"
            aria-label={t('charts.cyclePicker.previousCycleAria')}
            disabled={selectedRound <= 0}
            onClick={() => setSelectedRound(selectedRound - 1)}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <input
            type="number"
            min={0}
            max={maxRound}
            value={selectedRound}
            aria-label={t('charts.cyclePicker.cycleNumberAria')}
            onChange={(e) => {
              const next = Number(e.target.value);
              if (Number.isFinite(next)) {
                setSelectedRound(Math.floor(next));
              }
            }}
            className={cn(
              'w-20 rounded-md border border-white/10 bg-white/[0.03] px-2 py-1 text-center text-sm text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
              TOUCH_TARGET_HEIGHT_CLASS,
            )}
          />
          <Button
            type="button"
            size="icon"
            variant="outline"
            aria-label={t('charts.cyclePicker.nextCycleAria')}
            disabled={selectedRound >= maxRound}
            onClick={() => setSelectedRound(selectedRound + 1)}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        {isLive ? (
          <span className="inline-flex items-center rounded-full border border-primary/40 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
            {t('charts.cyclePicker.liveCycle')}
          </span>
        ) : (
          <Button type="button" size="sm" variant="ghost" onClick={() => setPinnedRound(null)}>
            {t('charts.cyclePicker.jumpLive')}
          </Button>
        )}
        {headerEnd?.(selectedRound)}
      </div>

      {children(selectedRound, isLive)}
    </div>
  );
};
