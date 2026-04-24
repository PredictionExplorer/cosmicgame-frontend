import { formatSeconds } from '@/utils';

interface AuctionInfoProps {
  secondsElapsed: number;
  auctionDuration: number;
  endedMessage?: string;
}

/** Displays elapsed Calibration Window time and duration, or a closed message when the window exceeds its duration. */
export function AuctionInfo({
  secondsElapsed,
  auctionDuration,
  endedMessage = 'Calibration Window closed.',
}: AuctionInfoProps) {
  return (
    <div className="ml-4">
      {secondsElapsed > auctionDuration ? (
        <p className="text-base font-medium">{endedMessage}</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mb-4 items-center">
          <div className="md:col-span-5">
            <p className="text-base font-medium">Elapsed Time:</p>
          </div>
          <div className="md:col-span-7">
            <p>{formatSeconds(secondsElapsed)}</p>
          </div>
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mb-4 items-center">
        <div className="md:col-span-5">
          <p className="text-base font-medium">Calibration Window Duration:</p>
        </div>
        <div className="md:col-span-7">
          <p>{formatSeconds(auctionDuration)}</p>
        </div>
      </div>
    </div>
  );
}
