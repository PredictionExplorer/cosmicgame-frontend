'use client';

import type { ReactNode } from 'react';
import { forwardRef } from 'react';
import { ChevronDown, Layers3 } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { cn } from '@/lib/utils';

export interface ControlDeskProps {
  header: ReactNode;
  clock: ReactNode;
  calibration?: ReactNode;
  orientation?: ReactNode;
  latestParticipant: ReactNode;
  chronoEndurance: ReactNode;
  gestureConsole?: ReactNode;
  personal?: ReactNode;
  allocationLedger: ReactNode;
  className?: string;
}

/** The complete decision dashboard. Required timing and standings never live
 * behind disclosures. Layout grows naturally at zoomed/narrow sizes instead of
 * clipping information to a fixed viewport height.
 */
export const ControlDesk = forwardRef<HTMLDivElement, ControlDeskProps>(
  (
    {
      header,
      clock,
      calibration,
      orientation,
      latestParticipant,
      chronoEndurance,
      gestureConsole,
      personal,
      allocationLedger,
      className,
    },
    ref,
  ) => {
    const t = useTranslations('home');
    return (
      <div data-testid="control-desk" className={cn('min-w-0 space-y-4', className)}>
        <div id="deck" ref={ref} className="scroll-mt-24">
          <div data-testid="control-desk-header" className="pb-3">
            {header}
          </div>
          <div
            data-testid="control-desk-grid"
            className={cn(
              'grid min-w-0 items-start gap-3',
              (gestureConsole || calibration) &&
                'lg:grid-cols-[minmax(0,1fr)_21rem] xl:grid-cols-[minmax(0,1fr)_23rem] 2xl:grid-cols-[minmax(0,1fr)_25rem]',
            )}
          >
            <div className="min-w-0 space-y-3">
              <div
                data-testid="control-desk-overview"
                className="grid min-w-0 items-stretch gap-3 sm:grid-cols-[minmax(0,0.85fr)_minmax(0,1.35fr)]"
              >
                <div
                  data-testid="control-desk-clock"
                  className="min-w-0 rounded-2xl border border-primary/15 bg-[#0b1429]/95"
                >
                  {clock}
                </div>
                <div
                  data-testid="control-desk-latest"
                  className="min-w-0 rounded-2xl border border-emerald-300/15 bg-[#101b2b]/95"
                >
                  {latestParticipant}
                </div>
              </div>
              <div
                data-testid="control-desk-chrono"
                className="min-w-0 rounded-2xl border border-violet-300/15 bg-[#15152c]/95"
              >
                {chronoEndurance}
              </div>
            </div>
            {(gestureConsole || calibration) && (
              <div className="min-w-0 space-y-3">
                {calibration && (
                  <div data-testid="control-desk-calibration" className="min-w-0">
                    {calibration}
                  </div>
                )}
                {gestureConsole && (
                  <div
                    data-testid="control-desk-gesture"
                    className="min-w-0 rounded-2xl border border-primary/20 bg-[#10172c]/95"
                  >
                    {gestureConsole}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
        {personal && (
          <div
            data-testid="control-desk-personal"
            className="rounded-xl border border-white/10 bg-white/[0.02]"
          >
            {personal}
          </div>
        )}
        {orientation}
        <div className="rounded-2xl border border-white/10 bg-[#0b1226]/70">
          <details
            id="allocation-breakdown"
            data-testid="allocations-disclosure"
            className="group/allocations scroll-mt-24"
          >
            <summary className="flex min-h-20 cursor-pointer list-none items-center gap-4 px-5 py-4 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary [&::-webkit-details-marker]:hidden sm:px-6">
              <Layers3 className="h-5 w-5 shrink-0 text-primary" aria-hidden />
              <span className="min-w-0 flex-1">
                <span className="block text-base font-semibold text-foreground">
                  {t('orientation.allocationsTitle')}
                </span>
                <span className="mt-1 block text-sm text-muted-foreground">
                  {t('orientation.allocationsDescription')}
                </span>
              </span>
              <ChevronDown
                className="h-5 w-5 shrink-0 text-muted-foreground transition-transform motion-reduce:transition-none group-open/allocations:rotate-180"
                aria-hidden
              />
            </summary>
            <div className="border-t border-white/10">{allocationLedger}</div>
          </details>
        </div>
      </div>
    );
  },
);
ControlDesk.displayName = 'ControlDesk';
