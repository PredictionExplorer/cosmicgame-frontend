import type { GestureInfo } from '@/services/api/types';

import { render, screen, within, checkA11y } from '@/test-utils';

import { GestureCstCredit } from '../GestureCstCredit';

const ACTOR = '0xe7eD7F31cd76CeD85861ec5bD37879cBA053e887';
const PREVIOUS = '0x30E6E8EEEC88aA8Ea35B54807671458B3F01665e';

const record = (overrides: Partial<GestureInfo> = {}): GestureInfo => ({
  EvtLogId: 30748,
  BlockNum: 517075891,
  TxId: 10821,
  TxHash: '0xd2ac465cdddccef54bd39e843c71686588d2289007724a2a46abed671c39b2ec',
  TimeStamp: 1792630457,
  DateTime: '2026-10-22T00:54:17Z',
  RoundNum: 3,
  BidPosition: 79,
  BidderAddr: ACTOR,
  PreviousBidderAddr: PREVIOUS,
  GestureType: 0,
  GestureCostEth: 0.001738302851295673,
  PreviousCstRewardAmountEth: 0.21029453205098964,
  PreviousBidderCstRewardAmount: '210294532050989629',
  ThisBidderCstRewardAmount: '0',
  CSTRewardEth: 0.21029453205098964,
  ...overrides,
});

const group = () => screen.getByRole('group', { name: 'gesture.credit.titleUnknown' });

it('names the previous participant beside the exact live credit and links that recipient', () => {
  render(<GestureCstCredit gesture={record()} />);
  expect(group()).toHaveTextContent('gesture.credit.titlePrevious');
  expect(within(group()).getByTestId('gesture-cst-credit-amount')).toHaveAttribute(
    'value',
    '0.210294532050989629',
  );
  expect(within(group()).getByRole('link')).toHaveAttribute('href', `/user/${PREVIOUS}`);
  expect(group()).toHaveTextContent('gesture.credit.bodyPrevious');
  expect(group()).not.toHaveTextContent('gesture.credit.titleCurrent');
  expect(group()).not.toHaveTextContent('gesture.credit.sameWallet');
});

it('keeps the recipient visible in the compact ledger block', () => {
  render(<GestureCstCredit gesture={record()} compact />);
  expect(within(group()).getByRole('link')).toHaveAttribute('href', `/user/${PREVIOUS}`);
  expect(group()).toHaveTextContent('gesture.credit.titlePrevious');
  expect(group()).not.toHaveTextContent('gesture.credit.bodyPrevious');
});

it('identifies the same wallet without changing its previous-gesture role', () => {
  render(<GestureCstCredit gesture={record({ PreviousBidderAddr: ACTOR })} />);
  expect(group()).toHaveTextContent('gesture.credit.titlePrevious');
  expect(group()).toHaveTextContent('gesture.credit.sameWallet');
  expect(within(group()).getByRole('link')).toHaveAttribute('href', `/user/${ACTOR}`);
});

it('shows the current participant when recipient-specific historical data credits them', () => {
  render(
    <GestureCstCredit
      gesture={record({
        PreviousBidderAddr: undefined,
        PreviousBidderCstRewardAmount: '0',
        PreviousCstRewardAmountEth: 0,
        ThisBidderCstRewardAmount: '100000000000000000000',
        CSTRewardEth: 100,
      })}
    />,
  );
  expect(group()).toHaveTextContent('gesture.credit.titleCurrent');
  expect(within(group()).getByRole('link')).toHaveAttribute('href', `/user/${ACTOR}`);
  expect(group()).not.toHaveTextContent('gesture.credit.sameWallet');
  expect(group()).not.toHaveTextContent('gesture.credit.titlePrevious');
});

it('distinguishes a confirmed first-gesture zero from a missing amount', () => {
  const { rerender } = render(
    <GestureCstCredit
      gesture={record({
        BidPosition: 1,
        PreviousBidderAddr: undefined,
        PreviousBidderCstRewardAmount: undefined,
        PreviousCstRewardAmountEth: undefined,
        ThisBidderCstRewardAmount: undefined,
        CSTRewardEth: 0,
      })}
    />,
  );
  expect(group()).toHaveTextContent('gesture.credit.firstGesture');
  expect(within(group()).getByTestId('gesture-cst-credit-amount')).toHaveAttribute('value', '0');
  expect(within(group()).queryByRole('link')).toBeNull();

  rerender(
    <GestureCstCredit
      gesture={record({
        PreviousBidderAddr: undefined,
        PreviousBidderCstRewardAmount: undefined,
        PreviousCstRewardAmountEth: undefined,
        ThisBidderCstRewardAmount: undefined,
        CSTRewardEth: undefined,
      })}
    />,
  );
  expect(group()).toHaveTextContent('gesture.credit.amountUnavailable');
  expect(group()).toHaveTextContent('gesture.credit.recipientUnavailable');
  expect(group()).not.toHaveTextContent('gesture.credit.firstGesture');
  expect(within(group()).queryByTestId('gesture-cst-credit-amount')).toBeNull();
});

it('shows a known zero for a later gesture without calling it a first gesture', () => {
  render(
    <GestureCstCredit gesture={record({ PreviousBidderCstRewardAmount: '0', CSTRewardEth: 0 })} />,
  );
  expect(group()).toHaveTextContent('gesture.credit.zero');
  expect(group()).not.toHaveTextContent('gesture.credit.firstGesture');
  expect(within(group()).getByRole('link')).toHaveAttribute('href', `/user/${PREVIOUS}`);
});

it('does not assign an unqualified aggregate amount to either participant', () => {
  render(
    <GestureCstCredit
      gesture={record({
        PreviousBidderAddr: undefined,
        PreviousBidderCstRewardAmount: undefined,
        PreviousCstRewardAmountEth: undefined,
        ThisBidderCstRewardAmount: undefined,
        CSTReward: '210294532050989629',
      })}
    />,
  );
  expect(group()).toHaveTextContent('0.21');
  expect(group()).toHaveTextContent('gesture.credit.recipientUnavailable');
  expect(group()).not.toHaveTextContent('gesture.credit.titleCurrent');
  expect(group()).not.toHaveTextContent('gesture.credit.titlePrevious');
  expect(within(group()).queryByRole('link')).toBeNull();
  expect(within(group()).getByTestId('gesture-cst-credit-amount')).toHaveAttribute(
    'value',
    '0.210294532050989629',
  );
});

it('keeps a known positive credit while making an invalid recipient unavailable', () => {
  render(<GestureCstCredit gesture={record({ PreviousBidderAddr: 'javascript:alert(1)' })} />);
  expect(group()).toHaveTextContent('0.21');
  expect(group()).toHaveTextContent('gesture.credit.recipientUnavailable');
  expect(within(group()).queryByRole('link')).toBeNull();
});

it('marks partial zero attribution as incomplete rather than declaring no CST credit', () => {
  render(
    <GestureCstCredit
      gesture={record({
        PreviousBidderCstRewardAmount: '0',
        PreviousCstRewardAmountEth: 0,
        ThisBidderCstRewardAmount: undefined,
        CSTRewardEth: undefined,
      })}
    />,
  );
  expect(group()).toHaveAttribute('data-credit-status', 'unknown');
  expect(group()).toHaveTextContent('gesture.credit.incomplete');
  expect(group()).not.toHaveTextContent('gesture.credit.zero');
  expect(group()).not.toHaveTextContent('gesture.credit.firstGesture');
});

it('keeps each explicit recipient credit separate', () => {
  render(
    <GestureCstCredit
      gesture={record({
        ThisBidderCstRewardAmount: '1000000000000000000',
        CSTReward: '1210294532050989629',
        CSTRewardEth: Number('1.210294532050989629'),
      })}
    />,
  );
  expect(group()).toHaveTextContent('gesture.credit.titlePrevious');
  expect(group()).toHaveTextContent('gesture.credit.titleCurrent');
  expect(
    within(group())
      .getAllByRole('link')
      .map((link) => link.getAttribute('href')),
  ).toEqual([`/user/${PREVIOUS}`, `/user/${ACTOR}`]);
  expect(group()).toHaveAttribute('data-credit-status', 'credited');
});

it('keeps contradictory credit details visible with an incomplete-data note', () => {
  render(<GestureCstCredit gesture={record({ CSTReward: '0', CSTRewardEth: 0 })} />);
  expect(group()).toHaveAttribute('data-credit-status', 'unknown');
  expect(group()).toHaveTextContent('gesture.credit.titlePrevious');
  expect(group()).toHaveTextContent('gesture.credit.incomplete');
  expect(group()).not.toHaveTextContent('gesture.credit.zero');
  expect(group().querySelector('[data-credit-role="previous"] a')).toHaveAttribute(
    'href',
    `/user/${PREVIOUS}`,
  );
});

it('has no accessibility violations', async () => {
  const { container } = render(<GestureCstCredit gesture={record()} />);
  await checkA11y(container);
});
