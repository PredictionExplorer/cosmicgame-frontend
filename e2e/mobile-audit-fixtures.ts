import type { Page, Route } from '@playwright/test';

import { mockZhQualityApi } from './zh-quality-mocks';
import { ZH_ROUTE_FIXTURES } from './zh-route-inventory';

// lexicon-allow-start: deterministic fixtures mirror sealed backend wire keys.

/**
 * Adversarial fixtures for the mobile layout audit.
 *
 * `mockZhQualityApi` returns empty arrays for most list endpoints, and an empty
 * table cannot overflow — so on its own it would let every table pass. These
 * fixtures fill the table-backed endpoints with the worst content the UI can
 * legitimately receive: full 42-character addresses, unbroken 66-character tx
 * hashes, seven-decimal amounts and long user-supplied messages.
 */

const NOW_SECONDS = Math.floor(Date.now() / 1_000);
const { address, cycle, tokenId } = ZH_ROUTE_FIXTURES;

/** A full-length checksum address — the most common unbreakable token in the UI. */
const LONG_ADDRESS = '0xAbCdEf0123456789AbCdEf0123456789AbCdEf01';

/** Longest message the gesture form accepts, with no spaces to break on. */
const LONG_MESSAGE =
  'ThisIsAnIntentionallyUnbrokenGestureMessageUsedToProveThatLongUserSuppliedTextWrapsInsteadOfEscapingItsContainerOnNarrowViewports';

const MIXED_MESSAGE =
  'A deliberately long gesture message with spaces that should wrap across several lines on a narrow phone screen instead of being clipped to a single ellipsis.';

function tx(id: number, offsetSeconds = 0) {
  const timeStamp = NOW_SECONDS - offsetSeconds;
  return {
    EvtLogId: id,
    BlockNum: 100_000 + id,
    TxId: id,
    TxHash: `0x${id.toString(16).padStart(64, '0')}`,
    TimeStamp: timeStamp,
    DateTime: new Date(timeStamp * 1_000).toISOString(),
  };
}

/** Rows exercising every branch of the gesture history renderer. */
function gestureRows() {
  return [
    {
      ...tx(9101, 30),
      RoundNum: cycle,
      BidderAddr: LONG_ADDRESS,
      GestureType: 0,
      EthPriceEth: 0.1234567,
      GestureCostEth: 0.1234567,
      Message: MIXED_MESSAGE,
    },
    {
      ...tx(9102, 600),
      RoundNum: cycle,
      BidderAddr: address,
      GestureType: 2,
      CstPriceEth: 1234.5678,
      GestureCostEth: 1234.5678,
      Message: LONG_MESSAGE,
    },
    {
      ...tx(9103, 1_800),
      RoundNum: cycle,
      BidderAddr: LONG_ADDRESS,
      GestureType: 1,
      RWalkNFTId: 987_654,
      EthPriceEth: 0.0000001,
      GestureCostEth: 0.0000001,
      Message: '',
    },
    {
      ...tx(9104, 3_600),
      RoundNum: cycle,
      BidderAddr: address,
      GestureType: 0,
      EthPriceEth: 12.3456789,
      GestureCostEth: 12.3456789,
      NFTDonationTokenAddr: LONG_ADDRESS,
      NFTDonationTokenId: 123_456,
      Message: MIXED_MESSAGE,
    },
    {
      ...tx(9105, 7_200),
      RoundNum: cycle,
      BidderAddr: LONG_ADDRESS,
      GestureType: 0,
      EthPriceEth: 0.5,
      GestureCostEth: 0.5,
      DonatedERC20TokenAddr: LONG_ADDRESS,
      DonatedERC20TokenAmount: '123456789000000000000000',
      Message: LONG_MESSAGE,
    },
  ];
}

function transferRows() {
  return Array.from({ length: 5 }, (_, i) => ({
    ...tx(7_100 + i, i * 120),
    FromAddr: LONG_ADDRESS,
    ToAddr: address,
    TokenId: tokenId + i,
    TokenName: `AnExtremelyLongUserSuppliedTokenNameNumber${i}ThatMustWrapOnMobile`,
    ValueEth: 1_234.5678901,
    Value: '1234567890000000000000',
  }));
}

function namedNftRows() {
  return Array.from({ length: 5 }, (_, i) => ({
    ...tx(6_100 + i, i * 300),
    TokenId: tokenId + i,
    TokenName: `AnExtremelyLongUserSuppliedTokenNameNumber${i}ThatMustWrapOnMobile`,
    WinnerAddr: LONG_ADDRESS,
    RecordType: 1,
  }));
}

function prizeHistoryRows() {
  return Array.from({ length: 5 }, (_, i) => ({
    ...tx(5_100 + i, i * 900),
    RoundNum: cycle + i,
    WinnerAddr: LONG_ADDRESS,
    WinnerAddress: LONG_ADDRESS,
    RecordType: i % 5,
    Amount: 12_345.6789012,
    AmountEth: 12_345.6789012,
    TokenId: tokenId + i,
    TokenAddress: LONG_ADDRESS,
    TokenAddr: LONG_ADDRESS,
    TokenSymbol: 'VERYLONGSYMBOL',
    NFTTokenId: tokenId + i,
  }));
}

function anchorActionRows() {
  return Array.from({ length: 5 }, (_, i) => ({
    ...tx(4_100 + i, i * 450),
    ActionId: 700 + i,
    StakedTokenId: tokenId + i,
    TokenId: tokenId + i,
    StakerAddr: LONG_ADDRESS,
    ActionType: i % 2,
    NumStakedNFTs: 1_234 + i,
    UnstakeTimeStamp: NOW_SECONDS + 86_400,
  }));
}

function roundRows() {
  return Array.from({ length: 5 }, (_, i) => ({
    ...tx(3_100 + i, i * 3_600),
    RoundNum: cycle - i,
    WinnerAddr: LONG_ADDRESS,
    AmountEth: 12_345.6789012,
    PrizeAmountEth: 12_345.6789012,
    NumBids: 1_234 + i,
  }));
}

/**
 * Endpoint patterns matched in order. Envelope keys mirror the ones
 * `services/api` unwraps, so the fixtures stay close to the real wire format.
 */
const DENSE_FIXTURES: readonly { match: RegExp; body: () => unknown }[] = [
  { match: /\/bid\/list\/by_round\//, body: () => ({ BidsByRound: gestureRows() }) },
  { match: /\/bid\/list\/all\//, body: () => ({ Gestures: gestureRows() }) },
  {
    match: /\/cst\/transfers\/by_user\//,
    body: () => ({ CosmicSignatureTransfers: transferRows() }),
  },
  { match: /\/cst\/transfers\/all\//, body: () => ({ TokenTransfers: transferRows() }) },
  { match: /\/ct\/transfers\/by_user\//, body: () => ({ CosmicTokenTransfers: transferRows() }) },
  { match: /\/cst\/names\/search\//, body: () => ({ TokenNameSearchResults: namedNftRows() }) },
  { match: /\/cst\/names\/history\//, body: () => ({ TokenNames: namedNftRows() }) },
  {
    match: /\/prizes\/history\/global\//,
    body: () => ({ GlobalPrizeHistory: prizeHistoryRows() }),
  },
  { match: /\/prizes\/history\/by_user\//, body: () => ({ UserPrizeHistory: prizeHistoryRows() }) },
  {
    match: /\/staking\/cst\/actions\/(global|by_user)\//,
    body: () => ({ StakingCSTActions: anchorActionRows() }),
  },
  { match: /\/rounds\/list\//, body: () => ({ Rounds: roundRows() }) },
];

async function fulfillDenseFixture(route: Route): Promise<boolean> {
  const path = new URL(route.request().url()).pathname;
  for (const fixture of DENSE_FIXTURES) {
    if (fixture.match.test(path)) {
      await route.fulfill({ json: fixture.body() });
      return true;
    }
  }
  return false;
}

/**
 * Installs the deterministic backend plus dense table rows. Call once per page
 * before the first navigation.
 */
export async function mockMobileAuditApi(page: Page): Promise<void> {
  // Playwright runs the most recently registered handler first, so the dense
  // fixtures must be installed after the baseline mocks to take precedence.
  await mockZhQualityApi(page);
  await page.route('**/api/cosmicgame/**', async (route) => {
    if (await fulfillDenseFixture(route)) return;
    await route.fallback();
  });
}

export const MOBILE_AUDIT_SAMPLE_TEXT = {
  longAddress: LONG_ADDRESS,
  longMessage: LONG_MESSAGE,
  mixedMessage: MIXED_MESSAGE,
} as const;

// lexicon-allow-end
