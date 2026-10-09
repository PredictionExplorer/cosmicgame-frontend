import type { Page } from '@playwright/test';

import { mockMobileAuditApi } from './mobile-audit-fixtures';
import { ROUTE_FIXTURES } from './locale-route-inventory';

const { address, cycle } = ROUTE_FIXTURES;
const metadataOrigin = 'https://spacing-fixtures.example';

/** Four NFTs plus four tokens fills every preview slot in the attachment section. */
export const HOME_SPACING_ASSET_COUNT = 8;

export async function mockHomeSpacingApi(page: Page, messageCount: number): Promise<void> {
  await mockMobileAuditApi(page);
  const timestamp = Math.floor(Date.now() / 1000);
  const transaction = (id: number) => ({
    EvtLogId: id,
    TxId: id,
    BlockNum: 100_000 + id,
    TxHash: `0x${id.toString(16).padStart(64, '0')}`,
    TimeStamp: timestamp - id,
    DateTime: new Date((timestamp - id) * 1000).toISOString(),
  });

  await page.route(`${metadataOrigin}/**`, async (route) => {
    const url = new URL(route.request().url());
    if (url.pathname.endsWith('.svg')) {
      await route.fulfill({
        contentType: 'image/svg+xml',
        body: '<svg xmlns="http://www.w3.org/2000/svg" width="480" height="360"><rect width="480" height="360" fill="#161024"/><circle cx="240" cy="180" r="100" fill="#bea8e8"/></svg>',
      });
      return;
    }
    await route.fulfill({
      json: {
        name: `Attached artwork ${url.pathname.match(/\d+/)?.[0] ?? '1'}`,
        collection_name: 'Cosmic geometry',
        image: `${metadataOrigin}/art.svg`,
      },
    });
  });
  await page.route('**/api/nft-estimate?*', (route) => route.fulfill({ json: {} }));
  await page.route('**/api/token-metadata?*', (route) => route.fulfill({ json: {} }));

  await page.route('**/api/cosmicgame/**', async (route) => {
    const path = new URL(route.request().url()).pathname;
    // lexicon-allow-start: the three paths below are sealed backend endpoints.
    const isNftAttachmentList = path.endsWith(`/donations/nft/by_round/${cycle}`);
    const isTokenAttachmentList = path.endsWith(`/donations/erc20/by_round/all/${cycle}`);
    const isCycleGestures = path.includes(`/bid/list/by_round/${cycle}/`);
    // lexicon-allow-end
    if (isNftAttachmentList) {
      await route.fulfill({
        json: {
          NFTDonations: Array.from({ length: 4 }, (_, index) => ({
            ...transaction(index + 1),
            RecordId: index + 1,
            RoundNum: cycle,
            TokenAddr: '0x3333333333333333333333333333333333333333',
            NFTTokenId: index + 1,
            NFTTokenURI: `${metadataOrigin}/nft/${index + 1}.json`,
            DonorAddr: address,
          })),
        },
      });
      return;
    }
    if (isTokenAttachmentList) {
      await route.fulfill({
        json: {
          DonationsERC20ByRoundAll: Array.from({ length: 4 }, (_, index) => ({
            ...transaction(index + 10),
            RoundNum: cycle,
            TokenAddr: `0x${(index + 10).toString(16).padStart(40, '0')}`,
            AmountDonatedEth: 1234.5678,
            AmountClaimedEth: 0,
            WinnerAddr: address,
            DonorAddr: address,
          })),
        },
      });
      return;
    }
    if (isCycleGestures) {
      await route.fulfill({
        json: {
          BidsByRound: Array.from({ length: messageCount }, (_, index) => ({
            ...transaction(index + 100),
            RoundNum: cycle,
            BidderAddr: address,
            GestureType: 0,
            EthPriceEth: 0.1234567,
            Message: `Spacing audit message ${index + 1}: ${'A signal from the active performance cycle. '.repeat(4)}`,
          })),
        },
      });
      return;
    }
    await route.fallback();
  });
}
