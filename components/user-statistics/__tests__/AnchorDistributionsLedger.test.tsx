import type { ReactNode } from 'react';
import userEvent from '@testing-library/user-event';

import { checkA11y, render, screen } from '@/test-utils';

import { AnchorDistributionsLedger } from '../AnchorDistributionsLedger';
import { anchoredNftDistributions } from '../anchorLedger';

const mockRelease = jest.fn();
jest.mock('@/hooks/useAnchorActions', () => ({
  useAnchorActions: () => ({ release: mockRelease, txStage: { status: 'idle' } }),
}));
jest.mock('@/components/wallet/NetworkGuard', () => ({
  ChainGuard: ({ children }: { children: ReactNode }) => <>{children}</>,
}));
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: Record<string, unknown>) => <img {...props} />,
}));

const ADDRESS = '0xA169574D0d353E3010997A3E64846b7D1B2a63B6';

/** The production shape: one deposit shared by 17 NFTs, one of them this address's #0. */
const DEPOSITS = [
  {
    EvtLogId: 25906,
    TxHash: '0x40e9',
    TimeStamp: 1_786_491_506,
    DepositId: 18,
    DepositRoundNum: 1,
    NumStakedNFTs: 17,
    DepositAmountEth: 2.6547801247782794,
    Actions: [
      {
        Stake: { TokenId: 0, ActionId: 1, Tx: { TimeStamp: 1_781_506_867 } },
        RewardEth: 0.15616353675166347,
        Claimed: false,
      },
    ],
  },
];
const SUMMARY = [{ TokenId: 0, RewardCollectedEth: 0, RewardToCollectEth: 0.15616353675166347 }];
const ACTIONS = [{ ActionType: 0, TokenId: 0, TimeStamp: 1_781_506_867, ActionId: 1 }];

const rows = anchoredNftDistributions(SUMMARY, DEPOSITS, ACTIONS);

describe('AnchorDistributionsLedger', () => {
  beforeEach(() => mockRelease.mockReset());

  it('lists one row per anchored NFT and says once that nothing was retrieved', () => {
    render(
      <AnchorDistributionsLedger
        address={ADDRESS}
        rows={rows}
        deposits={DEPOSITS}
        seeds={new Map([[0, 'seed0']])}
        canRelease={false}
      />,
    );
    expect(screen.getAllByRole('link', { name: /#000000/ }).length).toBeGreaterThan(0);
    expect(screen.getByText('myPages.statistics.anchoring.nothingRetrieved')).toBeInTheDocument();
    // Someone else's profile never offers the release.
    expect(
      screen.queryByRole('button', {
        name: 'anchoring.tables.unretrievedDistributions.releaseAll',
      }),
    ).not.toBeInTheDocument();
  });

  it('opens a row onto the deposits the NFT shared in, with a link to its record', async () => {
    render(
      <AnchorDistributionsLedger
        address={ADDRESS}
        rows={rows}
        deposits={DEPOSITS}
        seeds={new Map()}
        canRelease={false}
      />,
    );
    await userEvent.click(
      screen.getByRole('button', { name: /myPages\.statistics\.anchoring\.showDeposits/ }),
    );
    expect(
      screen.getByRole('link', { name: /anchoring\.distributionsByToken\.title/ }),
    ).toHaveAttribute('href', `/distributions-by-token/${ADDRESS}/0`);
    expect(
      screen.getByRole('table', { name: 'anchoring.distributionsByToken.label' }),
    ).toBeVisible();
  });

  it('offers "Release all and retrieve" on the own profile, through the confirmation', async () => {
    render(
      <AnchorDistributionsLedger
        address={ADDRESS}
        rows={rows}
        deposits={DEPOSITS}
        seeds={new Map()}
        canRelease
      />,
    );
    await userEvent.click(
      screen.getByRole('button', { name: 'anchoring.tables.unretrievedDistributions.releaseAll' }),
    );
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(mockRelease).not.toHaveBeenCalled();
  });

  it('has no accessibility violations', async () => {
    const { container } = render(
      <AnchorDistributionsLedger
        address={ADDRESS}
        rows={rows}
        deposits={DEPOSITS}
        seeds={new Map([[0, 'seed0']])}
        canRelease={false}
      />,
    );
    await checkA11y(container);
  });
});
