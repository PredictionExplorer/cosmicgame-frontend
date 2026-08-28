import { expect, test, type Page } from '@playwright/test';

const MOCK_NOW_SECONDS = Math.floor(Date.now() / 1000);
const CYCLE_NUMBER = 7;

const dashboard = {
  CurRoundNum: CYCLE_NUMBER,
  CurNumBids: 4,
  CurPrizeAmountEth: 2.5,
  CurBidPriceEth: 0.1,
  PrizeAmountEth: 2.5,
  RaffleAmountEth: 0.4,
  PrizeClaimTs: MOCK_NOW_SECONDS + 3_600,
  CurRoundPrizeTime: MOCK_NOW_SECONDS + 3_600,
  TsRoundStart: MOCK_NOW_SECONDS - 3_600,
  LastBidderAddr: '0x3333333333333333333333333333333333333333',
  GestureCostEth: 0.1,
  StakingAmountEth: 0,
  CosmicGameBalanceEth: 10,
  PrizePercentage: 25,
  ChronoWarriorPercentage: 8,
  RafflePercentage: 4,
  StakingPercentage: 6,
  CharityPercentage: 7,
  NumRaffleEthWinnersBidding: 2,
  NumRaffleNFTWinnersBidding: 1,
  NumRaffleNFTWinnersStakingRWalk: 0,
  MainStats: {
    NumCSTokenMints: 0,
    TotalRaffleEthDeposits: 0,
    TotalCSTConsumedEth: 0,
    TotalMktRewardsEth: 0,
    NumMktRewards: 0,
    TotalRaffleEthWithdrawn: 0,
    NumBidsCST: 0,
    NumUniqueBidders: 3,
    NumUniqueWinners: 0,
    NumUniqueDonors: 0,
    TotalNamedTokens: 0,
    NumUniqueStakersCST: 0,
    NumUniqueStakersRWalk: 0,
    StakeStatisticsCST: { NumActiveStakers: 0, TotalTokensStaked: 0 },
    StakeStatisticsRWalk: { NumActiveStakers: 0, TotalTokensStaked: 0 },
  },
  CurRoundStats: {
    TotalBids: 4,
    TotalDonatedAmountEth: 0,
    TotalDonatedNFTs: 0,
    TotalRaffleEthDepositsEth: 0,
    TotalRaffleNFTs: 0,
    ActivationTime: MOCK_NOW_SECONDS - 60,
  },
};

const gestures = [
  {
    BidderAddr: '0x1111111111111111111111111111111111111111',
    BidType: 0,
    EthPriceEth: 0.1,
    RoundNum: CYCLE_NUMBER,
    Message: 'Older message from a gesture',
    Tx: {
      EvtLogId: 101,
      BlockNum: 1,
      TxId: 1,
      TxHash: '0x101',
      TimeStamp: MOCK_NOW_SECONDS - 300,
      DateTime: '2023-11-14T22:08:20Z',
    },
  },
  {
    BidderAddr: '0x2222222222222222222222222222222222222222',
    BidType: 0,
    EthPriceEth: 0.11,
    RoundNum: CYCLE_NUMBER,
    Message: '',
    Tx: {
      EvtLogId: 102,
      BlockNum: 2,
      TxId: 2,
      TxHash: '0x102',
      TimeStamp: MOCK_NOW_SECONDS - 200,
      DateTime: '2023-11-14T22:10:00Z',
    },
  },
  {
    BidderAddr: '0x3333333333333333333333333333333333333333',
    BidType: 2,
    CstPriceEth: 20,
    EthPriceEth: -1,
    CSTRewardEth: 100,
    BidPosition: 4,
    RoundNum: CYCLE_NUMBER,
    Message: 'Newest message from a gesture',
    Tx: {
      EvtLogId: 103,
      BlockNum: 3,
      TxId: 3,
      TxHash: '0x103',
      TimeStamp: MOCK_NOW_SECONDS - 100,
      DateTime: '2023-11-14T22:11:40Z',
    },
  },
];

const specialRecipients = {
  EnduranceChampionAddress: '0x1111111111111111111111111111111111111111',
  EnduranceChampionDuration: 600,
  EnduranceChampionStartTimeStamp: MOCK_NOW_SECONDS - 1_200,
  PrevEnduranceChampionDuration: 0,
  ChronoWarriorAddress: '0x2222222222222222222222222222222222222222',
  ChronoWarriorDuration: 1_800,
  ChronoWarriorIsLive: false,
  LastBidderAddress: '0x3333333333333333333333333333333333333333',
  LastBidderLastBidTime: Math.floor(Date.now() / 1000) - 100,
  LastCstBidderAddress: '0x3333333333333333333333333333333333333333',
  SourceBlockNumber: 100,
  SourceBlockTimeStamp: MOCK_NOW_SECONDS,
};

const longGestureFeed = Array.from({ length: 12 }, (_, index) => {
  const sequence = index + 1;
  return {
    ...gestures[0]!,
    BidderAddr: `0x${sequence.toString(16).padStart(40, '0')}`,
    Message: `Scrollable message ${sequence}: ${'cosmic signal '.repeat(8).trim()}`,
    Tx: {
      ...gestures[0]!.Tx,
      EvtLogId: 200 + sequence,
      TxId: 200 + sequence,
      TxHash: `0x${200 + sequence}`,
      TimeStamp: MOCK_NOW_SECONDS - sequence * 60,
    },
  };
});

async function mockHomeGestureChatApi(
  page: Page,
  gestureFeed = gestures,
  roleSnapshot = specialRecipients,
) {
  await page.route('**/api/cosmicgame/**', async (route) => {
    const url = new URL(route.request().url());
    const path = url.pathname;

    if (path.endsWith('/time/current')) {
      await route.fulfill({ json: { CurrentTimeStamp: MOCK_NOW_SECONDS } });
      return;
    }

    if (path.endsWith('/rounds/current/time')) {
      await route.fulfill({ json: { CurRoundPrizeTime: MOCK_NOW_SECONDS + 3_600 } });
      return;
    }

    if (path.endsWith('/statistics/dashboard')) {
      await route.fulfill({ json: dashboard });
      return;
    }

    // lexicon-allow-start: backend route paths are sealed API contracts.
    if (path.includes(`/bid/list/by_round/${CYCLE_NUMBER}/1/`)) {
      await route.fulfill({ json: { BidsByRound: gestureFeed } });
      return;
    }

    if (path.endsWith('/get_banned_bids')) {
      await route.fulfill({ json: [] });
      return;
    }

    if (path.endsWith('/bid/eth_price')) {
      await route.fulfill({
        json: {
          AuctionDuration: '3600',
          ETHPrice: '100000000000000000',
          SecondsElapsed: '120',
        },
      });
      return;
    }

    if (path.endsWith('/bid/cst_price')) {
      await route.fulfill({
        json: {
          AuctionDuration: '3600',
          CSTPrice: '20000000000000000000',
          SecondsElapsed: '120',
        },
      });
      return;
    }

    if (path.endsWith('/bid/current_special_winners')) {
      await route.fulfill({ json: roleSnapshot });
      return;
    }

    if (path.endsWith('/bid/used_randomwalk_nfts')) {
      await route.fulfill({ json: { UsedRwalkNFTs: [] } });
      return;
    }

    if (path.endsWith(`/donations/nft/by_round/${CYCLE_NUMBER}`)) {
      await route.fulfill({ json: { NFTDonations: [] } });
      return;
    }

    if (path.endsWith(`/donations/erc20/by_round/all/${CYCLE_NUMBER}`)) {
      await route.fulfill({ json: { DonationsERC20ByRoundAll: [] } });
      return;
    }
    // lexicon-allow-end

    await route.fulfill({ json: {} });
  });
}

test.describe('home gesture chat', () => {
  test.beforeEach(async ({ page }) => {
    await mockHomeGestureChatApi(page);
    await page.emulateMedia({ reducedMotion: 'reduce' });
  });

  test('shows current-cycle gesture messages newest first', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });

    const chat = page.locator('[data-testid="gesture-message-chat"]:visible').first();
    await expect(chat.getByText('Cycle #7 · 2 messages')).toBeVisible();
    await chat.scrollIntoViewIfNeeded();

    await expect(chat).toBeVisible();
    await expect(chat.getByRole('heading', { name: 'Gesture Chat' })).toBeVisible();
    await expect(chat.getByText('Newest message from a gesture')).toBeVisible();
    await expect(chat.getByText('Older message from a gesture')).toBeVisible();
    await expect(chat.getByRole('link', { name: 'Open gesture position 4' })).toHaveAttribute(
      'href',
      '/gesture/103',
    );
    await expect(chat.getByRole('link', { name: 'Open gesture position 102' })).toHaveCount(0);

    const firstMessage = chat.getByRole('listitem').first();
    await expect(firstMessage).toContainText('Newest message from a gesture');
  });

  test('shows complete latest-participant and active Chrono challenge intelligence', async ({
    page,
  }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });

    const latest = page.getByTestId('latest-participant-intel');
    await expect(latest).toBeVisible();
    await expect(latest.getByText('0x3333333333333333333333333333333333333333')).toBeVisible();
    await expect(page.getByTestId('latest-participant-paid-amount')).toContainText('20.0000 CST');
    await expect(page.getByTestId('latest-participant-cst-received')).toContainText('100.00 CST');
    await expect(page.getByTestId('latest-participant-gesture-id')).toContainText('#4');
    await expect(page.getByTestId('latest-participant-message')).toContainText(
      'Newest message from a gesture',
    );
    await expect(
      latest.getByRole('progressbar', { name: 'Progress toward Endurance Champion' }),
    ).toBeVisible();
    await expect(page.getByTestId('latest-participant-allocation-package')).toContainText(
      'Currently in line for at finalization',
    );

    const challenge = page.getByTestId('chrono-active-challenge');
    await expect(challenge).toBeVisible();
    await expect(challenge).toContainText('Active Endurance Challenge');
    await expect(challenge).toContainText('0x111111....111111');
    await expect(
      challenge.getByRole('link', {
        name: '0x1111111111111111111111111111111111111111',
      }),
    ).toBeVisible();
    await expect(page.getByTestId('chrono-challenge-segment')).toContainText('20m');
    await expect(page.getByTestId('chrono-challenge-record-to-beat')).toContainText('30m');
    await expect(page.getByTestId('chrono-challenge-next-change')).toContainText('10m 1s');
  });

  test('keeps Last Gesture visible while the special-recipient endpoint is stale', async ({
    page,
  }) => {
    await page.unroute('**/api/cosmicgame/**');
    await mockHomeGestureChatApi(page, gestures, {
      ...specialRecipients,
      LastBidderAddress: '0x9999999999999999999999999999999999999999',
      LastBidderLastBidTime: Math.floor(Date.now() / 1000) - 500,
    });
    await page.goto('/', { waitUntil: 'domcontentloaded' });

    const latest = page.getByTestId('latest-participant-intel');
    await expect(latest).toContainText('0x3333333333333333333333333333333333333333');
    await expect(latest).not.toContainText('0x9999999999999999999999999999999999999999');
    await expect(page.getByTestId('latest-participant-gesture-details')).toBeVisible();
    await expect(page.getByTestId('latest-participant-paid-amount')).toContainText('20.0000 CST');
    await expect(page.getByTestId('latest-participant-cst-received')).toContainText('100.00 CST');
  });

  test('keeps a syncing Last Gesture panel when the gesture list trails the dashboard', async ({
    page,
  }) => {
    await page.unroute('**/api/cosmicgame/**');
    await mockHomeGestureChatApi(
      page,
      gestures.filter(
        (gesture) => gesture.BidderAddr !== '0x3333333333333333333333333333333333333333',
      ),
      {
        ...specialRecipients,
        LastBidderAddress: '0x9999999999999999999999999999999999999999',
      },
    );
    await page.goto('/', { waitUntil: 'domcontentloaded' });

    await expect(page.getByTestId('latest-participant-gesture-details')).toBeVisible();
    await expect(page.getByTestId('latest-participant-gesture-syncing')).toContainText(
      'Last Gesture details are syncing from the indexer.',
    );
    await expect(page.getByTestId('latest-participant-intel')).not.toContainText(
      'Older message from a gesture',
    );
  });

  test('fits all decision-critical desk zones in a 1440×900 first viewport', async ({
    page,
  }, testInfo) => {
    test.skip(testInfo.project.name !== 'Desktop Chrome', 'desktop density guard');
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/', { waitUntil: 'domcontentloaded' });

    const critical = [
      ['clock', page.getByTestId('cycle-clock')],
      ['latest paid', page.getByTestId('latest-participant-paid-amount')],
      ['latest CST received', page.getByTestId('latest-participant-cst-received')],
      ['active Chrono challenge', page.getByTestId('chrono-active-challenge')],
      ['ETH price', page.getByTestId('panel-method-eth-cost')],
      ['RandomWalk price', page.getByTestId('panel-method-randomWalk-cost')],
      ['CST price', page.getByTestId('panel-method-cst-cost')],
      ['allocation ledger', page.getByTestId('allocation-ledger')],
      ...[
        'signature',
        'chrono',
        'endurance',
        'stellar-eth',
        'stellar-nft',
        'cosmic-anchor',
        'rwlk-anchor',
        'public-goods',
        'next-cycle',
      ].map((track) => [`${track} track`, page.getByTestId(`ledger-track-${track}`)] as const),
    ] as const;

    await expect(page.getByTestId('chrono-active-challenge')).toBeVisible();
    for (const [name, locator] of critical) {
      await expect(locator).toBeVisible();
      const box = await locator.boundingBox();
      expect(box).not.toBeNull();
      expect(box!.y + box!.height, `${name} must fit in first viewport`).toBeLessThanOrEqual(900);
    }

    const deskBox = await page.getByTestId('control-desk').boundingBox();
    const gridBox = await page.getByTestId('control-desk-grid').boundingBox();
    const ledgerBox = await page.getByTestId('allocation-ledger').boundingBox();
    expect(deskBox).not.toBeNull();
    expect(gridBox).not.toBeNull();
    expect(ledgerBox).not.toBeNull();
    expect(deskBox!.y).toBeGreaterThanOrEqual(72);
    expect(deskBox!.y).toBeLessThanOrEqual(112);
    expect(ledgerBox!.y - (gridBox!.y + gridBox!.height)).toBeLessThanOrEqual(1);
  });

  test('uses a price strip and one sheet-only gesture console on phones', async ({
    page,
  }, testInfo) => {
    test.skip(testInfo.project.name === 'Desktop Chrome', 'mobile action-path guard');
    await page.goto('/', { waitUntil: 'domcontentloaded' });

    await expect(page.getByTestId('gesture-price-strip')).toBeVisible();
    await expect(page.locator('[data-testid="gesture-panel"]:visible')).toHaveCount(0);
    const dockAction = page.getByTestId('dock-open-sheet');
    await expect(dockAction).toBeVisible();
    await dockAction.click();

    const sheetPanel = page.locator('[data-testid="gesture-panel"][data-variant="sheet"]:visible');
    await expect(sheetPanel).toHaveCount(1);
    await expect(sheetPanel.getByTestId('panel-method-eth-cost')).toBeVisible();
    // This mocked production project has no connected wallet; the same sheet
    // exposes the message input after connect (covered by HomePage unit flow).
    await expect(sheetPanel.getByTestId('connect-to-gesture')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(sheetPanel).toHaveCount(0);
  });

  test('handles a long feed without making phone scrolling feel nested', async ({
    page,
  }, testInfo) => {
    await page.unroute('**/api/cosmicgame/**');
    await mockHomeGestureChatApi(page, longGestureFeed);
    await page.goto('/', { waitUntil: 'domcontentloaded' });

    const chat = page.locator('[data-testid="gesture-message-chat"]:visible').first();
    const scroll = chat.getByTestId('gesture-message-chat-scroll');
    const cycleDetails = page.locator('[data-testid="cycle-details-link-card"]:visible').first();
    await expect(chat.getByText('Cycle #7 · 12 messages')).toBeVisible();

    const viewport = page.viewportSize();
    const chatBox = await chat.boundingBox();
    const metrics = await scroll.evaluate((element) => ({
      clientHeight: element.clientHeight,
      scrollHeight: element.scrollHeight,
      overflowY: window.getComputedStyle(element).overflowY,
    }));
    expect(viewport).not.toBeNull();
    expect(chatBox).not.toBeNull();

    if (testInfo.project.name === 'Desktop Chrome') {
      expect(chatBox!.height).toBeLessThanOrEqual(viewport!.height * 0.75);
      expect(metrics.overflowY).toBe('auto');
      expect(metrics.scrollHeight).toBeGreaterThan(metrics.clientHeight + 20);

      await scroll.evaluate((element) => {
        element.scrollTop = element.scrollHeight;
      });
      expect(await scroll.evaluate((element) => element.scrollTop)).toBeGreaterThan(0);
      await expect(chat.getByText(/Scrollable message 12:/)).toBeVisible();
      return;
    }

    expect(metrics.overflowY).toBe('visible');
    expect(metrics.scrollHeight).toBeLessThanOrEqual(metrics.clientHeight + 1);
    expect(chatBox!.height).toBeGreaterThan(viewport!.height);

    const cycleDetailsBox = await cycleDetails.boundingBox();
    expect(cycleDetailsBox).not.toBeNull();
    expect(cycleDetailsBox!.y + cycleDetailsBox!.height).toBeLessThanOrEqual(chatBox!.y + 2);
  });

  test('positions the chat appropriately for the current viewport', async ({ page }, testInfo) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });

    const chat = page.locator('[data-testid="gesture-message-chat"]:visible').first();
    const panel = page.locator('[data-testid="gesture-panel"]:visible');
    const clock = page.locator('[data-testid="cycle-clock"]:visible').first();
    const latest = page.locator('[data-testid="latest-participant-intel"]:visible').first();
    const chrono = page.locator('[data-testid="chrono-endurance-intel"]:visible').first();
    const ledger = page.locator('[data-testid="allocation-ledger"]:visible').first();
    const prices = page.locator('[data-testid="gesture-price-strip"]:visible');
    const cycleDetails = page.locator('[data-testid="cycle-details-link-card"]:visible').first();
    const artwork = page.locator('[data-testid="deck-art-card"]:visible').first();
    await expect(chat.getByText('Cycle #7 · 2 messages')).toBeVisible();
    await expect(chat).toBeVisible();
    await expect(latest).toBeVisible();
    await expect(chrono).toBeVisible();
    await expect(ledger).toBeVisible();
    await expect(cycleDetails).toBeVisible();
    await expect(artwork).toBeVisible();
    await expect(page.getByTestId('public-goods-impact-card')).toHaveCount(0);

    const viewport = page.viewportSize();
    const clockBox = await clock.boundingBox();
    const cycleDetailsBox = await cycleDetails.boundingBox();
    const artworkBox = await artwork.boundingBox();
    const box = await chat.boundingBox();
    expect(viewport).not.toBeNull();
    expect(clockBox).not.toBeNull();
    expect(box).not.toBeNull();
    expect(cycleDetailsBox).not.toBeNull();
    expect(artworkBox).not.toBeNull();
    expect(cycleDetailsBox!.y + cycleDetailsBox!.height).toBeLessThanOrEqual(box!.y + 2);

    if (testInfo.project.name !== 'Desktop Chrome') {
      await expect(panel).toHaveCount(0);
      await expect(prices).toHaveCount(1);
      expect(box!.width).toBeLessThanOrEqual(viewport!.width);
      expect(box!.x).toBeGreaterThanOrEqual(0);
      // Phones lead with the clock and role intelligence; the inline form is
      // absent and the feed begins only after the complete desk.
      const latestBox = await latest.boundingBox();
      const ledgerBox = await ledger.boundingBox();
      expect(latestBox).not.toBeNull();
      expect(ledgerBox).not.toBeNull();
      expect(clockBox!.y + clockBox!.height).toBeLessThanOrEqual(latestBox!.y + 2);
      expect(ledgerBox!.y + ledgerBox!.height).toBeLessThanOrEqual(box!.y + 2);
      expect(artworkBox!.y).toBeGreaterThan(box!.y + box!.height);

      const participantBox = await chat
        .getByTestId('gesture-message-participant')
        .first()
        .boundingBox();
      const badgesBox = await chat.getByTestId('gesture-message-badges').first().boundingBox();
      expect(participantBox).not.toBeNull();
      expect(badgesBox).not.toBeNull();
      expect(badgesBox!.y).toBeGreaterThanOrEqual(participantBox!.y + participantBox!.height - 1);
      return;
    }

    await expect(panel).toHaveCount(1);
    await expect(prices).toHaveCount(0);
    const panelBox = await panel.first().boundingBox();
    expect(panelBox).not.toBeNull();
    // Desktop control desk: the panel flanks the clock's right in the same band.
    expect(clockBox!.x + clockBox!.width).toBeLessThanOrEqual(panelBox!.x + 2);
    // Feed floor: chat on the left, artwork rail on the right.
    expect(box!.x).toBeLessThan(viewport!.width / 2);
    expect(box!.width).toBeGreaterThan(320);
    expect(artworkBox!.x).toBeGreaterThan(box!.x + box!.width - 2);
  });
});
