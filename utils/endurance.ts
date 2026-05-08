interface GestureEntry {
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
 * for the longest uninterrupted period. Gestures are sorted by timestamp; gaps between
 * consecutive gestures define endurance windows. The last bidder's window runs until
 * roundEndTimeStamp (or now). chronoWarrior is the overlap of each champion's window
 * with the next champion's start.
 */
export const getEnduranceChampions = (
  gestureList: GestureEntry[],
  roundEndTimeStamp: number = 0,
  nowTimeStamp: number = Math.floor(Date.now() / 1000),
): EnduranceChampion[] => {
  const currentTime = roundEndTimeStamp > 0 ? roundEndTimeStamp : nowTimeStamp;

  if (!gestureList || gestureList.length === 0) {
    return [];
  }

  let currentCycleGestures = [...gestureList].sort((a, b) => a.TimeStamp - b.TimeStamp);

  if (currentCycleGestures.length === 1) {
    return [
      {
        participant: currentCycleGestures[0]!.BidderAddr,
        championTime: currentTime - currentCycleGestures[0]!.TimeStamp,
        chronoWarrior: 0,
      },
    ];
  }

  let enduranceChampions: EnduranceRecord[] = [];

  for (let i = 1; i < currentCycleGestures.length; i++) {
    const enduranceDuration =
      currentCycleGestures[i]!.TimeStamp - currentCycleGestures[i - 1]!.TimeStamp;

    if (
      enduranceChampions.length === 0 ||
      enduranceDuration > enduranceChampions[enduranceChampions.length - 1]!.championTime
    ) {
      enduranceChampions.push({
        address: currentCycleGestures[i - 1]!.BidderAddr,
        championTime: enduranceDuration,
        startTime: currentCycleGestures[i - 1]!.TimeStamp,
        endTime: currentCycleGestures[i]!.TimeStamp,
        chronoWarrior: 0,
      });
    }
  }

  const lastGesture = currentCycleGestures[currentCycleGestures.length - 1]!;
  const lastEnduranceDuration = currentTime - lastGesture.TimeStamp;

  if (
    enduranceChampions.length === 0 ||
    lastEnduranceDuration > enduranceChampions[enduranceChampions.length - 1]!.championTime
  ) {
    enduranceChampions.push({
      address: lastGesture.BidderAddr,
      championTime: lastEnduranceDuration,
      startTime: lastGesture.TimeStamp,
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
