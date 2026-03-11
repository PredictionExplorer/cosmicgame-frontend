import { formatSeconds } from '@/utils';

import { useCurrentSpecialWinners } from '@/hooks/useApiQuery';

export const SpecialPrizeWinners = () => {
  const { data: specialWinners } = useCurrentSpecialWinners();

  return (
    <>
      <h3 className="text-primary mt-8 mb-4 text-base font-medium">
        Potential winners of Special Prizes
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 mb-4 items-center">
        <div className="sm:col-span-4">
          <p>Endurance Champion</p>
        </div>
        <div className="sm:col-span-8">
          <p>
            {specialWinners?.EnduranceChampionAddress ? (
              <a
                href={`/user/${specialWinners.EnduranceChampionAddress}`}
                className="text-white break-all"
              >
                {specialWinners.EnduranceChampionAddress}
              </a>
            ) : (
              <span className="text-muted-foreground">N/A</span>
            )}
            {(specialWinners?.EnduranceChampionDuration ?? 0) > 0 && (
              <>{` (Lasted ${formatSeconds(specialWinners?.EnduranceChampionDuration ?? 0)})`}</>
            )}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 mb-4 items-center">
        <div className="sm:col-span-4">
          <p>Chrono Warrior</p>
        </div>
        {specialWinners?.EnduranceChampionAddress && (
          <div className="sm:col-span-8">
            <p>
              <a
                href={`/user/${specialWinners.EnduranceChampionAddress}`}
                className="text-white break-all"
              >
                {specialWinners.EnduranceChampionAddress}
              </a>
              {(specialWinners?.EnduranceChampionDuration ?? 0) > 0 && (
                <>{` (Lasted ${formatSeconds(specialWinners?.EnduranceChampionDuration ?? 0)})`}</>
              )}
            </p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 mb-4 items-center">
        <div className="sm:col-span-4">
          <p>Last Cst Bidder</p>
        </div>
        <div className="sm:col-span-8">
          <p>
            {specialWinners?.LastCstBidderAddress ? (
              <a
                href={`/user/${specialWinners.LastCstBidderAddress}`}
                className="text-white break-all"
              >
                {specialWinners.LastCstBidderAddress}
              </a>
            ) : (
              <span className="text-muted-foreground">N/A</span>
            )}
          </p>
        </div>
      </div>
    </>
  );
};
