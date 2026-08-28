import type { ReactNode } from 'react';
import { forwardRef } from 'react';

import { Surface } from '@/components/ui/surface';
import { cn } from '@/lib/utils';

export interface ControlDeskProps {
  header: ReactNode;
  clock: ReactNode;
  latestParticipant: ReactNode;
  chronoEndurance: ReactNode;
  gestureConsole?: ReactNode;
  mobilePrices?: ReactNode;
  personal?: ReactNode;
  allocationLedger: ReactNode;
  className?: string;
}

/**
 * One continuous, participant-first control surface.
 *
 * Internal grid lines replace the previous mosaic's external card gaps. On
 * wide screens clock, latest-participant and gesture action share the first
 * row; Chrono/Endurance then uses the full width so its challenge metrics stay
 * readable instead of leaving an empty area below the action rail. Mobile
 * omits the inline console and keeps decision order before the sheet action.
 */
export const ControlDesk = forwardRef<HTMLDivElement, ControlDeskProps>(
  (
    {
      header,
      clock,
      latestParticipant,
      chronoEndurance,
      gestureConsole,
      mobilePrices,
      personal,
      allocationLedger,
      className,
    },
    ref,
  ) => (
    <div id="deck" ref={ref} className={cn('scroll-mt-24', className)}>
      <Surface
        variant="glass-bordered"
        radius="xl"
        padding="none"
        data-testid="control-desk"
        className="min-w-0"
      >
        <div
          data-testid="control-desk-header"
          className="border-b border-white/[0.08] px-3.5 py-1.5 sm:px-4"
        >
          {header}
        </div>

        <div data-testid="control-desk-grid" className="grid min-w-0 items-stretch lg:grid-cols-12">
          <div
            data-testid="control-desk-clock"
            className="order-1 min-w-0 border-b border-white/[0.08] lg:col-span-5 lg:col-start-1 lg:row-start-1 lg:border-r xl:col-span-3"
          >
            {clock}
          </div>

          {mobilePrices && (
            <div data-testid="control-desk-mobile-prices" className="order-2 min-w-0 lg:hidden">
              {mobilePrices}
            </div>
          )}

          <div
            data-testid="control-desk-latest"
            className={cn(
              'order-3 min-w-0 border-b border-white/[0.08]',
              gestureConsole
                ? 'lg:col-span-6 lg:col-start-1 lg:row-start-2 lg:border-r xl:col-span-5 xl:col-start-4 xl:row-start-1'
                : 'lg:col-span-7 lg:col-start-6 lg:row-start-1 xl:col-span-9 xl:col-start-4',
            )}
          >
            {latestParticipant}
          </div>

          <div
            data-testid="control-desk-chrono"
            className={cn(
              'order-4 min-w-0 border-b border-white/[0.08]',
              gestureConsole
                ? 'lg:col-span-6 lg:col-start-7 lg:row-start-2 xl:col-span-12 xl:col-start-1 xl:row-start-2'
                : 'lg:col-span-12 lg:col-start-1 lg:row-start-2',
            )}
          >
            {chronoEndurance}
          </div>

          {gestureConsole && (
            <div
              data-testid="control-desk-gesture"
              className="order-5 hidden min-w-0 border-b border-white/[0.08] lg:col-span-7 lg:col-start-6 lg:row-start-1 lg:block xl:col-span-4 xl:col-start-9"
            >
              {gestureConsole}
            </div>
          )}
        </div>

        {allocationLedger}

        {personal && (
          <div data-testid="control-desk-personal" className="border-t border-white/[0.08]">
            {personal}
          </div>
        )}
      </Surface>
    </div>
  ),
);

ControlDesk.displayName = 'ControlDesk';
