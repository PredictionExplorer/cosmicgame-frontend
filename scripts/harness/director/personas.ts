/**
 * Synthetic participants ("personas") mapped onto Hardhat's well-known dev
 * accounts, plus the deterministic RNG that drives their behavior. The keys
 * below are the public Hardhat defaults — safe by definition, local-only.
 */

export interface HardhatAccount {
  index: number;
  address: `0x${string}`;
  privateKey: `0x${string}`;
}

export const HARDHAT_ACCOUNTS: readonly HardhatAccount[] = [
  {
    index: 0,
    address: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
    privateKey: '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80',
  },
  {
    index: 1,
    address: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8',
    privateKey: '0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d',
  },
  {
    index: 2,
    address: '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC',
    privateKey: '0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a',
  },
  {
    index: 3,
    address: '0x90F79bf6EB2c4f870365E785982E1f101E93b906',
    privateKey: '0x7c852118294e51e653712a81e05800f419141751be58f605c371e15141b007a6',
  },
  {
    index: 4,
    address: '0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65',
    privateKey: '0x47e179ec197488593b187f80a00eb0da91f1b9d0b13f8733639f19c30a34926a',
  },
  {
    index: 5,
    address: '0x9965507D1a55bcC2695C58ba16FB37d819B0A4dc',
    privateKey: '0x8b3a350cf5c34c9194ca85829a2df0ec3153be0318b5e2d3348e872092edffba',
  },
  {
    index: 6,
    address: '0x976EA74026E726554dB657fA54763abd0C3a0aa9',
    privateKey: '0x92db14e403b83dfe3df233f83dfa3a0d7096f21ca9b0d6d6b8d88b2b4ec1564e',
  },
  {
    index: 7,
    address: '0x14dC79964da2C08b23698B3D3cc7Ca32193d9955',
    privateKey: '0x4bbbf85ce3377467afe5d46f804f221813b2bb87f24d81f60f1fcdbf7cbf4356',
  },
  {
    index: 8,
    address: '0x23618e81E3f5cdF7f54C3d65f7FBc0aBf5B21E8f',
    privateKey: '0xdbda1821b80551c9d65939329250298aa3472ba22feea921c0cf5d620ea67b97',
  },
  {
    index: 9,
    address: '0xa0Ee7A142d267C1f36714E4a8F75612F20a79720',
    privateKey: '0x2a871d0798f97d79848a013d4936a73bf4cc922c825d33c1cf7073dff6d409c6',
  },
] as const;

/** Account #0 owns the protocol; account #6 receives Public Goods payouts. */
export const OWNER_ACCOUNT_INDEX = 0;
export const PUBLIC_GOODS_ACCOUNT_INDEX = 6;

export interface PersonaStyle {
  /** 0..1 — probability weight of choosing a CST gesture when affordable. */
  cstAffinity: number;
  /** 0..1 — probability weight of playing a RandomWalk-discount gesture. */
  rwlkAffinity: number;
  /** 0..1 — probability of attaching an ERC-20/NFT to a gesture. */
  attachmentAffinity: number;
  /** 0..1 — probability of writing a message with the gesture. */
  chattiness: number;
  /** Multiplier on the persona's pause between actions (1 = neutral). */
  tempo: number;
}

export interface PersonaSpec {
  name: string;
  accountIndex: number;
  style: PersonaStyle;
}

/** The cast. Distinct habits make timelines, chats, and leaderboards look organic. */
export const PERSONAS: readonly PersonaSpec[] = [
  {
    name: 'Nova',
    accountIndex: 1,
    style: {
      cstAffinity: 0.15,
      rwlkAffinity: 0.05,
      attachmentAffinity: 0.05,
      chattiness: 0.9,
      tempo: 0.7,
    },
  },
  {
    name: 'Lyra',
    accountIndex: 2,
    style: {
      cstAffinity: 0.55,
      rwlkAffinity: 0.0,
      attachmentAffinity: 0.02,
      chattiness: 0.6,
      tempo: 1.0,
    },
  },
  {
    name: 'Orion',
    accountIndex: 3,
    style: {
      cstAffinity: 0.1,
      rwlkAffinity: 0.45,
      attachmentAffinity: 0.05,
      chattiness: 0.3,
      tempo: 1.3,
    },
  },
  {
    name: 'Vega',
    accountIndex: 4,
    style: {
      cstAffinity: 0.3,
      rwlkAffinity: 0.1,
      attachmentAffinity: 0.2,
      chattiness: 0.8,
      tempo: 0.9,
    },
  },
  {
    name: 'Atlas',
    accountIndex: 5,
    style: {
      cstAffinity: 0.05,
      rwlkAffinity: 0.05,
      attachmentAffinity: 0.0,
      chattiness: 0.1,
      tempo: 1.6,
    },
  },
  {
    name: 'Callisto',
    accountIndex: 7,
    style: {
      cstAffinity: 0.4,
      rwlkAffinity: 0.15,
      attachmentAffinity: 0.1,
      chattiness: 0.7,
      tempo: 1.1,
    },
  },
  {
    name: 'Quasar',
    accountIndex: 8,
    style: {
      cstAffinity: 0.2,
      rwlkAffinity: 0.25,
      attachmentAffinity: 0.08,
      chattiness: 0.5,
      tempo: 0.8,
    },
  },
  {
    name: 'Selene',
    accountIndex: 9,
    style: {
      cstAffinity: 0.35,
      rwlkAffinity: 0.0,
      attachmentAffinity: 0.15,
      chattiness: 0.95,
      tempo: 1.2,
    },
  },
] as const;

/** Deterministic PRNG (mulberry32) so runs are reproducible from a seed. */
export function createRng(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function pickWeighted<T>(rng: () => number, entries: ReadonlyArray<[T, number]>): T {
  const total = entries.reduce((sum, [, weight]) => sum + weight, 0);
  let roll = rng() * total;
  for (const [value, weight] of entries) {
    roll -= weight;
    if (roll <= 0) return value;
  }
  const last = entries[entries.length - 1];
  if (!last) throw new Error('pickWeighted: no entries');
  return last[0];
}

export function pickOne<T>(rng: () => number, values: readonly T[]): T {
  const value = values[Math.floor(rng() * values.length)];
  if (value === undefined) throw new Error('pickOne: empty list');
  return value;
}

/** Integer in [min, max] inclusive. */
export function pickInt(rng: () => number, min: number, max: number): number {
  return min + Math.floor(rng() * (max - min + 1));
}
