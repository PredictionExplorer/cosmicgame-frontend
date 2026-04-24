interface BidEntry {
  TimeStamp: number;
  BidderAddr: string;
  [key: string]: unknown;
}

export interface EnduranceChampion {
  participant: string;
  championTime: number;
  chronoWarrior: number;
}

interface EnduranceRecord {
  address: string;
  championTime: number;
  startTime: number;
  endTime: number;
  chronoWarrior: number;
}

/**
 * Computes "endurance champions" from a sorted bid list: each champion held the lead
 * for the longest uninterrupted period. Bids are sorted by timestamp; gaps between
 * consecutive bids define endurance windows. The last bidder's window runs until
 * roundEndTimeStamp (or now). chronoWarrior is the overlap of each champion's window
 * with the next champion's start.
 */
export const getEnduranceChampions = (
  bidList: BidEntry[],
  roundEndTimeStamp: number = 0,
): EnduranceChampion[] => {
  const currentTime = roundEndTimeStamp > 0 ? roundEndTimeStamp : Math.floor(Date.now() / 1000);

  if (!bidList || bidList.length === 0) {
    return [];
  }

  let currentRoundBids = [...bidList].sort((a, b) => a.TimeStamp - b.TimeStamp);

  if (currentRoundBids.length === 1) {
    return [
      {
        participant: currentRoundBids[0]!.BidderAddr,
        championTime: currentTime - currentRoundBids[0]!.TimeStamp,
        chronoWarrior: 0,
      },
    ];
  }

  let enduranceChampions: EnduranceRecord[] = [];

  for (let i = 1; i < currentRoundBids.length; i++) {
    const enduranceDuration = currentRoundBids[i]!.TimeStamp - currentRoundBids[i - 1]!.TimeStamp;

    if (
      enduranceChampions.length === 0 ||
      enduranceDuration > enduranceChampions[enduranceChampions.length - 1]!.championTime
    ) {
      enduranceChampions.push({
        address: currentRoundBids[i - 1]!.BidderAddr,
        championTime: enduranceDuration,
        startTime: currentRoundBids[i - 1]!.TimeStamp,
        endTime: currentRoundBids[i]!.TimeStamp,
        chronoWarrior: 0,
      });
    }
  }

  const lastBid = currentRoundBids[currentRoundBids.length - 1]!;
  const lastEnduranceDuration = currentTime - lastBid.TimeStamp;

  if (
    enduranceChampions.length === 0 ||
    lastEnduranceDuration > enduranceChampions[enduranceChampions.length - 1]!.championTime
  ) {
    enduranceChampions.push({
      address: lastBid.BidderAddr,
      championTime: lastEnduranceDuration,
      startTime: lastBid.TimeStamp,
      endTime: currentTime,
      chronoWarrior: 0,
    });
  }

  for (let i = 0; i < enduranceChampions.length; i++) {
    let chronoStartTime =
      i === 0
        ? enduranceChampions[i]!.startTime
        : enduranceChampions[i]!.startTime + enduranceChampions[i - 1]!.championTime;
    let chronoEndTime =
      i < enduranceChampions.length - 1
        ? enduranceChampions[i + 1]!.startTime + enduranceChampions[i]!.championTime
        : currentTime;

    enduranceChampions[i]!.chronoWarrior = Math.max(0, chronoEndTime - chronoStartTime);
  }

  return enduranceChampions.map((champion) => ({
    participant: champion.address,
    championTime: champion.championTime,
    chronoWarrior: champion.chronoWarrior,
  }));
};
