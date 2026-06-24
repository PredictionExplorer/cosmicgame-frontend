import { formatSeconds } from '@/utils';

import { getCstAuctionProgress } from '@/utils/cstGesture';

interface AuctionInfoProps {
  secondsElapsed: number;
  auctionDuration: number;
  title?: string;
  subtitle?: string;
  endedMessage?: string;
}

/** Displays Calibration Window duration, remaining time, and progress without hardcoded timing assumptions. */
export function AuctionInfo({
  secondsElapsed,
  auctionDuration,
  title = 'Calibration Window',
  subtitle = 'Gesture cost descends as this window progresses.',
  endedMessage = 'Calibration Window closed.',
}: AuctionInfoProps) {
  const progress = getCstAuctionProgress({
    AuctionDuration: auctionDuration,
    SecondsElapsed: secondsElapsed,
  });
  const progressLabel = `${title} progress`;

  return (
    <section
      aria-label={title}
      className="rounded-xl border border-primary/15 bg-primary/[0.045] p-4"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-primary">{title}</p>
          <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
        </div>
        <div className="text-right">
          <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
            Dynamic Duration
          </p>
          <p className="font-mono text-lg font-semibold tabular-nums text-white">
            {formatSeconds(progress.auctionDuration)}
          </p>
        </div>
      </div>

      {progress.isEnded ? (
        <p className="mt-4 rounded-lg border border-emerald-400/20 bg-emerald-400/[0.06] px-3 py-2 text-sm font-medium text-emerald-300">
          {endedMessage}
        </p>
      ) : (
        <div className="mt-4 space-y-3">
          <div className="flex items-center justify-between gap-3 text-sm">
            <span className="text-muted-foreground">Progress</span>
            <span className="font-mono font-medium tabular-nums text-primary">
              {progress.percentCompleteRounded}% complete
            </span>
          </div>
          <div
            role="progressbar"
            aria-label={progressLabel}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={progress.percentCompleteRounded}
            className="h-2.5 overflow-hidden rounded-full bg-white/[0.08]"
          >
            <div
              className="h-full rounded-full bg-gradient-to-r from-primary via-accent to-emerald-300 transition-all duration-500"
              style={{ width: `${progress.percentComplete}%` }}
            />
          </div>
        </div>
      )}

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <div className="rounded-lg border border-white/[0.06] bg-white/[0.025] px-3 py-2">
          <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
            Calibration Window Duration
          </p>
          <p className="mt-1 font-mono text-sm tabular-nums">
            {formatSeconds(progress.auctionDuration)}
          </p>
        </div>
        <div className="rounded-lg border border-white/[0.06] bg-white/[0.025] px-3 py-2">
          <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
            Elapsed
          </p>
          <p className="mt-1 font-mono text-sm tabular-nums">
            {formatSeconds(progress.secondsElapsed)}
          </p>
        </div>
        <div className="rounded-lg border border-white/[0.06] bg-white/[0.025] px-3 py-2">
          <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
            Remaining
          </p>
          <p className="mt-1 font-mono text-sm tabular-nums">
            {formatSeconds(progress.secondsRemaining)}
          </p>
        </div>
      </div>
    </section>
  );
}
