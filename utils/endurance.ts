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

/** A single sample of the endurance/chrono evolution over the course of a round. */
export interface EnduranceTimelinePoint {
  /** Unix seconds of this sample. */
  ts: number;
  /** Hours elapsed since the round's first gesture (chart X-axis). */
  hoursIntoRound: number;
  /** Seconds the current leader has held the lead at this instant (sawtooth). */
  lead: number;
  /** Seconds of the longest single lead-stint completed so far (endurance-champion record). */
  enduranceRecord: number;
  /** Seconds of the longest cumulative endurance-champion reign so far (chrono-warrior record). */
  chronoRecord: number;
  /** Address holding the lead at this instant. */
  leader: string;
}

export interface EnduranceTimeline {
  points: EnduranceTimelinePoint[];
  roundStart: number;
  roundEnd: number;
  finalEnduranceRecord: number;
  finalChronoRecord: number;
}

/**
 * Reconstructs how the endurance/chrono durations evolved over a round from the
 * sorted gesture list: `lead` (sawtooth of time since the current leader's gesture),
 * plus `enduranceRecord` and `chronoRecord` (running maxima). Pass a finalized
 * round's claim timestamp as `roundEndTimeStamp`; leave 0 for the live round.
 */
export const getEnduranceTimeline = (
  gestureList: GestureEntry[],
  roundEndTimeStamp: number = 0,
  nowTimeStamp: number = Math.floor(Date.now() / 1000),
): EnduranceTimeline => {
  const empty: EnduranceTimeline = {
    points: [],
    roundStart: 0,
    roundEnd: 0,
    finalEnduranceRecord: 0,
    finalChronoRecord: 0,
  };
  if (!gestureList || gestureList.length === 0) {
    return empty;
  }

  const gestures = [...gestureList].sort((a, b) => a.TimeStamp - b.TimeStamp);
  const roundStart = gestures[0]!.TimeStamp;
  const requestedEnd = roundEndTimeStamp > 0 ? roundEndTimeStamp : nowTimeStamp;
  const roundEnd = Math.max(requestedEnd, gestures[gestures.length - 1]!.TimeStamp);

  interface Stint {
    start: number;
    end: number;
    leader: string;
    duration: number;
  }
  const stints: Stint[] = gestures.map((g, i) => {
    const start = g.TimeStamp;
    const end = i < gestures.length - 1 ? gestures[i + 1]!.TimeStamp : roundEnd;
    return { start, end, leader: g.BidderAddr, duration: Math.max(0, end - start) };
  });

  interface Champion {
    address: string;
    championTime: number;
    startTime: number;
  }
  const champions: Champion[] = [];
  for (const s of stints) {
    if (champions.length === 0 || s.duration > champions[champions.length - 1]!.championTime) {
      champions.push({ address: s.leader, championTime: s.duration, startTime: s.start });
    }
  }

  const segments = champions.map((c, i) => {
    const segStart = i === 0 ? c.startTime : c.startTime + champions[i - 1]!.championTime;
    const segEnd =
      i < champions.length - 1 ? champions[i + 1]!.startTime + c.championTime : roundEnd;
    return { start: segStart, end: Math.max(segStart, segEnd) };
  });

  const chronoRecordAt = (t: number): number => {
    let max = 0;
    for (const seg of segments) {
      if (t <= seg.start) continue;
      const d = Math.min(t, seg.end) - seg.start;
      if (d > max) max = d;
    }
    return Math.max(0, max);
  };

  const points: EnduranceTimelinePoint[] = [];
  let enduranceMax = 0;
  for (const s of stints) {
    points.push({
      ts: s.start,
      hoursIntoRound: (s.start - roundStart) / 3600,
      lead: 0,
      enduranceRecord: enduranceMax,
      chronoRecord: chronoRecordAt(s.start),
      leader: s.leader,
    });
    enduranceMax = Math.max(enduranceMax, s.duration);
    points.push({
      ts: s.end,
      hoursIntoRound: (s.end - roundStart) / 3600,
      lead: s.duration,
      enduranceRecord: enduranceMax,
      chronoRecord: chronoRecordAt(s.end),
      leader: s.leader,
    });
  }

  return {
    points,
    roundStart,
    roundEnd,
    finalEnduranceRecord: enduranceMax,
    finalChronoRecord: chronoRecordAt(roundEnd),
  };
};

/** A single lead stint: the window during which one address was the last bidder. */
export interface EnduranceStint {
  address: string;
  startTs: number;
  endTs: number;
  durationSeconds: number;
  /** Hours from the round's first gesture to this stint's start (Gantt X position). */
  startHours: number;
  /** Stint length in hours (Gantt bar width). */
  durationHours: number;
  /** True for the single longest stint in the round (the Endurance Champion's bar). */
  isEnduranceChampion: boolean;
  /** True when this stint set a new endurance record at the time it completed. */
  isRecord: boolean;
}

/** All lead stints for one address, grouped into a single Gantt lane. */
export interface EnduranceLane {
  address: string;
  stints: EnduranceStint[];
  totalSeconds: number;
  maxStintSeconds: number;
  isEnduranceChampion: boolean;
  isChronoWarrior: boolean;
}

export interface EnduranceGantt {
  lanes: EnduranceLane[];
  roundStart: number;
  roundEnd: number;
  roundDurationSeconds: number;
  enduranceChampionAddress: string;
  enduranceChampionStintSeconds: number;
  chronoWarriorAddress: string;
  chronoWarriorSeconds: number;
}

/**
 * Builds a Gantt view from the gesture list: each lead stint (an address holding
 * the lead from its gesture until the next) becomes a bar, grouped one lane per
 * address. Endurance Champion = longest single stint; Chrono Warrior = longest
 * contiguous reign as champion. Zero-length stints are dropped; lanes sorted by
 * total lead time. Pass a finalized round's claim timestamp; leave 0 for live.
 */
export const getEnduranceGantt = (
  gestureList: GestureEntry[],
  roundEndTimeStamp: number = 0,
  nowTimeStamp: number = Math.floor(Date.now() / 1000),
): EnduranceGantt => {
  const empty: EnduranceGantt = {
    lanes: [],
    roundStart: 0,
    roundEnd: 0,
    roundDurationSeconds: 0,
    enduranceChampionAddress: '',
    enduranceChampionStintSeconds: 0,
    chronoWarriorAddress: '',
    chronoWarriorSeconds: 0,
  };
  if (!gestureList || gestureList.length === 0) {
    return empty;
  }

  const gestures = [...gestureList].sort((a, b) => a.TimeStamp - b.TimeStamp);
  const roundStart = gestures[0]!.TimeStamp;
  const requestedEnd = roundEndTimeStamp > 0 ? roundEndTimeStamp : nowTimeStamp;
  // Guard against a stale "now" that predates the last gesture.
  const roundEnd = Math.max(requestedEnd, gestures[gestures.length - 1]!.TimeStamp);
  const roundDurationSeconds = Math.max(1, roundEnd - roundStart);

  interface RawStint {
    address: string;
    start: number;
    end: number;
    duration: number;
  }
  const raw: RawStint[] = [];
  for (let i = 0; i < gestures.length; i++) {
    const start = gestures[i]!.TimeStamp;
    const end = i < gestures.length - 1 ? gestures[i + 1]!.TimeStamp : roundEnd;
    const duration = end - start;
    if (duration > 0) {
      raw.push({ address: gestures[i]!.BidderAddr, start, end, duration });
    }
  }
  if (raw.length === 0) {
    return { ...empty, roundStart, roundEnd, roundDurationSeconds };
  }

  // Endurance champion = the single longest stint.
  let ecIdx = 0;
  for (let i = 1; i < raw.length; i++) {
    if (raw[i]!.duration > raw[ecIdx]!.duration) ecIdx = i;
  }
  const enduranceChampionAddress = raw[ecIdx]!.address;
  const enduranceChampionStintSeconds = raw[ecIdx]!.duration;

  // Chrono warrior = longest contiguous reign as endurance champion. Record-setting
  // stints define the champion lineage; reign segments tile the timeline.
  interface Champion {
    address: string;
    championTime: number;
    startTime: number;
  }
  const champions: Champion[] = [];
  const recordStintIdx = new Set<number>();
  raw.forEach((s, i) => {
    if (champions.length === 0 || s.duration > champions[champions.length - 1]!.championTime) {
      champions.push({ address: s.address, championTime: s.duration, startTime: s.start });
      recordStintIdx.add(i);
    }
  });
  let chronoWarriorAddress = '';
  let chronoWarriorSeconds = 0;
  for (let i = 0; i < champions.length; i++) {
    const segStart =
      i === 0 ? champions[i]!.startTime : champions[i]!.startTime + champions[i - 1]!.championTime;
    const segEnd =
      i < champions.length - 1
        ? champions[i + 1]!.startTime + champions[i]!.championTime
        : roundEnd;
    const segDur = Math.max(0, segEnd - segStart);
    if (segDur > chronoWarriorSeconds) {
      chronoWarriorSeconds = segDur;
      chronoWarriorAddress = champions[i]!.address;
    }
  }

  // Group stints into lanes by address.
  const laneMap = new Map<string, EnduranceLane>();
  raw.forEach((s, idx) => {
    const stint: EnduranceStint = {
      address: s.address,
      startTs: s.start,
      endTs: s.end,
      durationSeconds: s.duration,
      startHours: (s.start - roundStart) / 3600,
      durationHours: s.duration / 3600,
      isEnduranceChampion: idx === ecIdx,
      isRecord: recordStintIdx.has(idx),
    };
    let lane = laneMap.get(s.address);
    if (!lane) {
      lane = {
        address: s.address,
        stints: [],
        totalSeconds: 0,
        maxStintSeconds: 0,
        isEnduranceChampion: s.address === enduranceChampionAddress,
        isChronoWarrior: s.address === chronoWarriorAddress,
      };
      laneMap.set(s.address, lane);
    }
    lane.stints.push(stint);
    lane.totalSeconds += s.duration;
    if (s.duration > lane.maxStintSeconds) lane.maxStintSeconds = s.duration;
  });

  const lanes = [...laneMap.values()].sort((a, b) => b.totalSeconds - a.totalSeconds);

  return {
    lanes,
    roundStart,
    roundEnd,
    roundDurationSeconds,
    enduranceChampionAddress,
    enduranceChampionStintSeconds,
    chronoWarriorAddress,
    chronoWarriorSeconds,
  };
};
