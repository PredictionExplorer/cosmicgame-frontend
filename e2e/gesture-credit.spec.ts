import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { expect, test, type Page } from '@playwright/test';

import { routing } from './locale-fixtures';

const ACTOR = '0xe7eD7F31cd76CeD85861ec5bD37879cBA053e887';
const PREVIOUS = '0x30E6E8EEEC88aA8Ea35B54807671458B3F01665e';
const ZERO = '0x0000000000000000000000000000000000000000';
const RECORD_ID = 30748;

interface CreditCopy {
  titlePrevious: string;
  titleCurrent: string;
  titleUnknown: string;
  recipientUnavailable: string;
  sameWallet: string;
  firstGesture: string;
  zero: string;
  amountUnavailable: string;
  incomplete: string;
}

function creditCopy(locale: string): CreditCopy {
  return (
    JSON.parse(readFileSync(join(process.cwd(), 'messages', locale, 'gesture.json'), 'utf8')) as {
      credit: CreditCopy;
    }
  ).credit;
}

// lexicon-allow-start: actual backend response field names and routes are sealed wire contracts.
/** Credit fields reproduce the production #79 response that exposed the attribution bug. */
function gestureRecord(overrides: Record<string, unknown> = {}) {
  return {
    Tx: {
      EvtLogId: RECORD_ID,
      BlockNum: 517075891,
      TxId: 10821,
      TxHash: '0xd2ac465cdddccef54bd39e843c71686588d2289007724a2a46abed671c39b2ec',
      TimeStamp: 1792630457,
      DateTime: '2026-10-22T00:54:17Z',
    },
    BidderAddr: ACTOR,
    PreviousBidderAddr: PREVIOUS,
    BidPosition: 79,
    RoundNum: 3,
    BidType: 0,
    EthPriceEth: 0.001738302851295673,
    CstPriceEth: -1,
    CSTRewardEth: 0.21029453205098964,
    PreviousCstRewardAmountEth: 0.21029453205098964,
    PreviousBidderCstRewardAmount: '210294532050989629',
    ThisCstRewardAmountEth: 0,
    ThisBidderCstRewardAmount: '0',
    RWalkNFTId: -1,
    NFTDonationTokenId: -1,
    Message: '',
    PrizeTime: Math.floor(Date.now() / 1000) + 7200,
    ...overrides,
  };
}

type WireRecord = ReturnType<typeof gestureRecord>;

async function mockCreditApi(page: Page, record: WireRecord) {
  const now = Math.floor(Date.now() / 1000);
  const dashboard = {
    CurRoundNum: record.RoundNum,
    CurNumBids: record.BidPosition,
    CurPrizeAmountEth: 2.5,
    PrizeAmountEth: 2.5,
    RaffleAmountEth: 0.5,
    PrizeClaimTs: now + 7200,
    CurRoundPrizeTime: now + 7200,
    TsRoundStart: now - 3600,
    LastBidderAddr: record.BidderAddr,
    GestureCostEth: record.EthPriceEth,
    StakingAmountEth: 0,
    CosmicGameBalanceEth: 12.5,
    PrizePercentage: 20,
    ChronoWarriorPercentage: 15,
    RafflePercentage: 5,
    StakingPercentage: 5,
    CharityPercentage: 5,
    NumRaffleEthWinnersBidding: 3,
    NumRaffleNFTWinnersBidding: 10,
    NumRaffleNFTWinnersStakingRWalk: 0,
    MainStats: {
      NumCSTokenMints: 0,
      TotalRaffleEthDeposits: 0,
      TotalCSTConsumedEth: 0,
      TotalMktRewardsEth: 0,
      NumMktRewards: 0,
      TotalRaffleEthWithdrawn: 0,
      NumBidsCST: 0,
      NumUniqueBidders: 2,
      NumUniqueWinners: 0,
      NumUniqueDonors: 0,
      TotalNamedTokens: 0,
      NumUniqueStakersCST: 0,
      NumUniqueStakersRWalk: 0,
      StakeStatisticsCST: { NumActiveStakers: 0, TotalTokensStaked: 0 },
      StakeStatisticsRWalk: { NumActiveStakers: 0, TotalTokensStaked: 0 },
    },
    CurRoundStats: {
      TotalBids: record.BidPosition,
      TotalDonatedAmountEth: 0,
      TotalDonatedNFTs: 0,
      TotalRaffleEthDepositsEth: 0,
      TotalRaffleNFTs: 0,
      ActivationTime: now - 3600,
    },
  };
  await page.route('**/api/v2/cosmicgame/**', (route) =>
    route.fulfill({ status: 404, json: { error: 'Not found' } }),
  );
  await page.route('**/api/cosmicgame/**', async (route) => {
    const path = new URL(route.request().url()).pathname;
    if (path.endsWith('/statistics/dashboard')) return route.fulfill({ json: dashboard });
    if (path.endsWith(`/bid/info/${RECORD_ID}`))
      return route.fulfill({ json: { BidInfo: record, status: 1 } });
    if (path.includes('/bid/list/by_round/'))
      return route.fulfill({ json: { BidsByRound: [record] } });
    if (path.endsWith('/time/current')) return route.fulfill({ json: { CurrentTimeStamp: now } });
    if (path.endsWith('/rounds/current/time'))
      return route.fulfill({ json: { CurRoundPrizeTime: now + 7200 } });
    if (path.endsWith('/get_banned_bids')) return route.fulfill({ json: [] });
    if (path.endsWith('/bid/current_special_winners')) {
      return route.fulfill({
        json: {
          LastBidderAddress: record.BidderAddr,
          LastBidderLastBidTime: record.Tx.TimeStamp,
          LastCstBidderAddress: ZERO,
          EnduranceChampionAddress: PREVIOUS,
          EnduranceChampionDuration: 120,
          ChronoWarriorAddress: PREVIOUS,
          ChronoWarriorDuration: 240,
          SourceBlockNumber: record.Tx.BlockNum,
          SourceBlockTimeStamp: now,
        },
      });
    }
    if (path.endsWith('/bid/eth_price')) {
      return route.fulfill({
        json: { AuctionDuration: '3600', ETHPrice: '1755685879808629', SecondsElapsed: '120' },
      });
    }
    if (path.endsWith('/bid/cst_price')) {
      return route.fulfill({
        json: { AuctionDuration: '3600', CSTPrice: '1000000000000000000', SecondsElapsed: '120' },
      });
    }
    return route.fulfill({ json: {} });
  });
}
// lexicon-allow-end

async function openDetail(page: Page, record: WireRecord, locale = routing.defaultLocale) {
  await mockCreditApi(page, record);
  const prefix = locale === routing.defaultLocale ? '' : `/${locale}`;
  await page.goto(`${prefix}/gesture/${RECORD_ID}`, { waitUntil: 'domcontentloaded' });
  const credit = page.getByTestId('gesture-cst-credit');
  await expect(credit).toBeVisible();
  return credit;
}

for (const locale of routing.locales) {
  test(`${locale}: the live-shaped credit names and links the previous recipient`, async ({
    page,
  }, testInfo) => {
    const copy = creditCopy(locale);
    const credit = await openDetail(page, gestureRecord(), locale);
    const prefix = locale === routing.defaultLocale ? '' : `/${locale}`;
    await expect(page.locator('html')).toHaveAttribute('lang', locale);
    await expect(credit).toContainText(copy.titlePrevious);
    await expect(credit).toContainText(/0[.,]21/);
    await expect(credit.locator(`a[href="${prefix}/user/${PREVIOUS}"]`)).toBeVisible();
    await expect(credit.locator(`a[href="${prefix}/user/${ACTOR}"]`)).toHaveCount(0);
    await expect(page.locator('[data-figure="cost"]')).toContainText('ETH');
    await expect(page.locator('[data-figure="participationCst"]')).toHaveCount(0);
    if (locale === routing.defaultLocale) {
      await credit.screenshot({
        path: testInfo.outputPath('cst-credit-detail-preview.png'),
        animations: 'disabled',
      });
    }
  });
}

for (const locale of routing.locales) {
  test(`${locale}: the latest-gesture card separates the previous participant’s credit from the cost`, async ({
    page,
  }, testInfo) => {
    await mockCreditApi(page, gestureRecord());
    const prefix = locale === routing.defaultLocale ? '' : `/${locale}`;
    await page.goto(prefix || '/', { waitUntil: 'domcontentloaded' });
    const details = page.getByTestId('latest-participant-gesture-details');
    const credit = details.getByTestId('gesture-cst-credit');
    await expect(credit).toContainText(creditCopy(locale).titlePrevious);
    await expect(credit.locator(`a[href="${prefix}/user/${PREVIOUS}"]`)).toBeVisible();
    await expect(details.getByTestId('latest-participant-paid-amount')).toContainText(
      /0[.,]001738/,
    );
    await expect(details.getByTestId('latest-participant-cst-received')).toHaveCount(0);
    await expect(credit.locator(`a[href="${prefix}/user/${ACTOR}"]`)).toHaveCount(0);
    await page.getByTestId('latest-participant-intel').screenshot({
      path: testInfo.outputPath('cst-credit-preview.png'),
      animations: 'disabled',
    });
  });
}

for (const path of ['/current-cycle', '/experimental-ui']) {
  test(`${path}: the shared standings block has its localized credit namespace`, async ({
    page,
  }) => {
    await mockCreditApi(page, gestureRecord());
    await page.goto(path, { waitUntil: 'domcontentloaded' });
    const credit = page
      .getByTestId('latest-participant-gesture-details')
      .getByTestId('gesture-cst-credit');
    await expect(credit).toContainText(creditCopy('en').titlePrevious);
    await expect(credit.locator(`a[href="/user/${PREVIOUS}"]`)).toBeVisible();
    await expect(credit).not.toContainText('gesture.credit.');
  });
}

test('a first gesture has no credit, while a later zero credit remains distinct', async ({
  page,
}) => {
  // lexicon-allow-start: sealed backend attribution fields.
  const first = gestureRecord({
    BidPosition: 1,
    PreviousBidderAddr: ZERO,
    PreviousBidderCstRewardAmount: '0',
    PreviousCstRewardAmountEth: 0,
    CSTRewardEth: 0,
  });
  // lexicon-allow-end
  const copy = creditCopy('en');
  let credit = await openDetail(page, first);
  await expect(credit).toContainText(copy.firstGesture);
  await expect(credit.getByRole('link')).toHaveCount(0);

  // lexicon-allow-start: sealed backend attribution fields.
  credit = await openDetail(
    page,
    gestureRecord({
      PreviousBidderCstRewardAmount: '0',
      PreviousCstRewardAmountEth: 0,
      CSTRewardEth: 0,
    }),
  );
  // lexicon-allow-end
  await expect(credit).toContainText(copy.zero);
  await expect(credit).not.toContainText(copy.firstGesture);
});

test('consecutive gestures from one wallet retain the previous role and say same wallet', async ({
  page,
}) => {
  // lexicon-allow-start: sealed backend attribution field.
  const credit = await openDetail(page, gestureRecord({ PreviousBidderAddr: ACTOR }));
  // lexicon-allow-end
  const copy = creditCopy('en');
  await expect(credit).toContainText(copy.titlePrevious);
  await expect(credit).toContainText(copy.sameWallet);
  await expect(credit.locator(`a[href="/user/${ACTOR}"]`)).toBeVisible();
});

test('a historical explicit credit belongs to its own participant, even under current V3 copy', async ({
  page,
}) => {
  // lexicon-allow-start: sealed backend attribution fields.
  const credit = await openDetail(
    page,
    gestureRecord({
      Tx: {
        ...gestureRecord().Tx,
        BlockNum: 467848129,
        TimeStamp: 1780045566,
        DateTime: '2026-05-29T09:06:06Z',
      },
      RoundNum: 0,
      BidPosition: 7,
      PreviousBidderAddr: undefined,
      PreviousBidderCstRewardAmount: '0',
      PreviousCstRewardAmountEth: 0,
      ThisBidderCstRewardAmount: '100000000000000000000',
      ThisCstRewardAmountEth: 100,
      CSTRewardEth: 100,
    }),
  );
  // lexicon-allow-end
  const copy = creditCopy('en');
  await expect(credit).toContainText(copy.titleCurrent);
  await expect(credit).toContainText('100');
  await expect(credit.locator(`a[href="/user/${ACTOR}"]`)).toBeVisible();
  await expect(credit).not.toContainText(copy.titlePrevious);
  await expect(credit).not.toContainText(copy.sameWallet);
});

test('an aggregate without attribution never invents a recipient', async ({ page }) => {
  // lexicon-allow-start: sealed backend attribution fields.
  const credit = await openDetail(
    page,
    gestureRecord({
      PreviousBidderAddr: undefined,
      PreviousBidderCstRewardAmount: undefined,
      PreviousCstRewardAmountEth: undefined,
      ThisBidderCstRewardAmount: undefined,
      ThisCstRewardAmountEth: undefined,
    }),
  );
  // lexicon-allow-end
  const copy = creditCopy('en');
  await expect(credit).toContainText(copy.titleUnknown);
  await expect(credit).toContainText(copy.recipientUnavailable);
  await expect(credit).toContainText(/0[.,]21/);
  await expect(credit.getByRole('link')).toHaveCount(0);
});

test('missing credit amount stays unavailable instead of becoming zero', async ({ page }) => {
  // lexicon-allow-start: sealed backend attribution fields.
  const credit = await openDetail(
    page,
    gestureRecord({
      PreviousBidderAddr: undefined,
      PreviousBidderCstRewardAmount: undefined,
      PreviousCstRewardAmountEth: undefined,
      ThisBidderCstRewardAmount: undefined,
      ThisCstRewardAmountEth: undefined,
      CSTRewardEth: undefined,
    }),
  );
  // lexicon-allow-end
  const copy = creditCopy('en');
  await expect(credit).toContainText(copy.amountUnavailable);
  await expect(credit).not.toContainText(copy.zero);
  await expect(credit.getByRole('link')).toHaveCount(0);
});

test('a raw aggregate preserves every decimal without inventing a recipient', async ({ page }) => {
  // lexicon-allow-start: sealed backend attribution fields.
  const credit = await openDetail(
    page,
    gestureRecord({
      PreviousBidderAddr: undefined,
      PreviousBidderCstRewardAmount: undefined,
      PreviousCstRewardAmountEth: undefined,
      ThisBidderCstRewardAmount: undefined,
      ThisCstRewardAmountEth: undefined,
      CSTReward: '210294532050989629',
      CSTRewardEth: 0.21,
    }),
  );
  // lexicon-allow-end
  await expect(credit).toHaveAttribute('data-credit-status', 'unknown');
  await expect(credit).toContainText(creditCopy('en').recipientUnavailable);
  await expect(credit.getByTestId('gesture-cst-credit-amount')).toHaveAttribute(
    'value',
    '0.210294532050989629',
  );
  await expect(credit.getByRole('link')).toHaveCount(0);
});

test('a conflicting total preserves attributed credit and marks the details incomplete', async ({
  page,
}) => {
  // lexicon-allow-start: sealed backend attribution fields.
  const credit = await openDetail(page, gestureRecord({ CSTReward: '0', CSTRewardEth: 0 }));
  // lexicon-allow-end
  const copy = creditCopy('en');
  await expect(credit).toHaveAttribute('data-credit-status', 'unknown');
  await expect(credit).toContainText(copy.titlePrevious);
  await expect(credit).toContainText(copy.incomplete);
  await expect(credit).not.toContainText(copy.zero);
  const previous = credit.locator('[data-credit-role="previous"]');
  const current = credit.locator('[data-credit-role="participant"]');
  await expect(previous.getByTestId('gesture-cst-credit-amount')).toHaveAttribute(
    'value',
    '0.210294532050989629',
  );
  await expect(previous.locator(`a[href="/user/${PREVIOUS}"]`)).toBeVisible();
  await expect(current.getByTestId('gesture-cst-credit-amount')).toHaveAttribute('value', '0');
  await expect(current.locator(`a[href="/user/${ACTOR}"]`)).toBeVisible();
  await expect(current).not.toContainText(copy.sameWallet);
});

test('explicit credits to both roles remain separately attributed', async ({ page }) => {
  // lexicon-allow-start: sealed backend attribution fields.
  const credit = await openDetail(
    page,
    gestureRecord({
      PreviousBidderCstRewardAmount: '900000000000000000',
      PreviousCstRewardAmountEth: 0.9,
      ThisBidderCstRewardAmount: '100000000000000000',
      ThisCstRewardAmountEth: 0.1,
      CSTRewardEth: 1,
    }),
  );
  // lexicon-allow-end
  const copy = creditCopy('en');
  await expect(credit).toContainText(copy.titlePrevious);
  await expect(credit).toContainText(copy.titleCurrent);
  await expect(credit.locator(`a[href="/user/${PREVIOUS}"]`)).toBeVisible();
  await expect(credit.locator(`a[href="/user/${ACTOR}"]`)).toBeVisible();
});

test('the full recipient label and address fit a narrow viewport', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 780 });
  const credit = await openDetail(page, gestureRecord());
  await expect(credit).toContainText(creditCopy('en').titlePrevious);
  await expect(credit.locator(`a[href="/user/${PREVIOUS}"]`)).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(320);
});
