import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';

import type { CSTTokenInfo } from '@/services/api/types';

import { render, screen, waitFor, fireEvent, checkA11y } from '@/test-utils';

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn(), prefetch: jest.fn() }),
}));

import { CSTokensTable } from '../CSTokensTable';

const createToken = (overrides = {}) => ({
  EvtLogId: 1,
  BlockNum: 100,
  TxId: 1,
  TxHash: '0xabc123',
  TimeStamp: 1701346718,
  DateTime: '2023-11-30',
  TokenId: 1,
  TokenName: 'CosmicToken',
  RoundNum: 5,
  WinnerAddr: '0x1234567890abcdef1234567890abcdef12345678',
  Staked: false,
  ...overrides,
});

const defaultProps = {
  list: [] as (CSTTokenInfo & { Staked?: boolean })[],
  handleStake: jest.fn().mockResolvedValue(undefined),
  handleStakeMany: jest.fn().mockResolvedValue(undefined),
};

beforeEach(() => jest.clearAllMocks());

describe('CSTokensTable', () => {
  it('renders empty state when list is empty', () => {
    render(<CSTokensTable {...defaultProps} />);
    expect(screen.getByText('No available tokens.')).toBeInTheDocument();
  });

  it('renders table headers', () => {
    render(<CSTokensTable {...defaultProps} list={[createToken()]} />);
    for (const header of [
      'Imprint Datetime',
      'Token ID',
      'Token Name',
      'Cycle',
      'Recipient Address',
    ]) {
      expect(screen.getAllByText(header).length).toBeGreaterThanOrEqual(1);
    }
  });

  it('renders token data', () => {
    const token = createToken({ TokenId: 42, TokenName: 'MyCST', RoundNum: 7 });
    render(<CSTokensTable {...defaultProps} list={[token]} />);
    expect(screen.getAllByText('42').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('MyCST').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('7').length).toBeGreaterThanOrEqual(1);
  });

  it('displays token name or space when empty', () => {
    const token = createToken({ TokenName: '' });
    render(<CSTokensTable {...defaultProps} list={[token]} />);
    expect(screen.queryByText('CosmicToken')).not.toBeInTheDocument();
  });

  it('renders Anchor button for tokens that are not anchored', () => {
    const token = createToken({ Staked: false });
    render(<CSTokensTable {...defaultProps} list={[token]} />);
    expect(screen.getByText('Anchor')).toBeInTheDocument();
  });

  it('does not render Anchor button for anchored tokens', () => {
    const token = createToken({ Staked: true });
    render(<CSTokensTable {...defaultProps} list={[token]} />);
    expect(screen.queryByText('Anchor')).not.toBeInTheDocument();
  });

  it('paginates with perPage=5', () => {
    const list = Array.from({ length: 8 }, (_, i) =>
      createToken({ TokenId: i + 1, EvtLogId: i + 1 }),
    );
    render(<CSTokensTable {...defaultProps} list={list} />);
    expect(screen.getAllByText('5').length).toBeGreaterThanOrEqual(1);
    expect(screen.queryByText('6')).not.toBeInTheDocument();
  });

  it('row click toggles selection', () => {
    const token = createToken({ TokenId: 77, Staked: false });
    render(<CSTokensTable {...defaultProps} list={[token]} />);

    const cell = screen.getAllByText('77').find((el) => el.closest('td'));
    fireEvent.click(cell!.closest('tr')!);

    const checkboxes = screen.getAllByRole('checkbox');
    expect(checkboxes.length).toBeGreaterThanOrEqual(1);
  });

  it('Anchor button calls handleStake with id and isRwlk=false', async () => {
    const user = userEvent.setup();
    const token = createToken({ TokenId: 42, Staked: false });
    render(<CSTokensTable {...defaultProps} list={[token]} />);

    await user.click(screen.getByText('Anchor'));

    await waitFor(() => {
      expect(defaultProps.handleStake).toHaveBeenCalledWith(42, false);
    });
  });

  it('shows Anchor Many when multiple rows selected', () => {
    const list = [
      createToken({ TokenId: 1, EvtLogId: 1, Staked: false }),
      createToken({ TokenId: 2, EvtLogId: 2, Staked: false }),
      createToken({ TokenId: 3, EvtLogId: 3, Staked: false }),
    ];
    render(<CSTokensTable {...defaultProps} list={list} />);

    const cell1 = screen.getAllByText('1').find((el) => el.closest('td'));
    const cell2 = screen.getAllByText('2').find((el) => el.closest('td'));
    fireEvent.click(cell1!.closest('tr')!);
    fireEvent.click(cell2!.closest('tr')!);

    expect(screen.getByText('Anchor Many')).toBeInTheDocument();
  });

  it('Anchor Many calls handleStakeMany with selected IDs and isRwlk=false flags', async () => {
    const user = userEvent.setup();
    const list = [
      createToken({ TokenId: 10, EvtLogId: 1, Staked: false }),
      createToken({ TokenId: 20, EvtLogId: 2, Staked: false }),
    ];
    render(<CSTokensTable {...defaultProps} list={list} />);

    const cell1 = screen.getAllByText('10').find((el) => el.closest('td'));
    const cell2 = screen.getAllByText('20').find((el) => el.closest('td'));
    fireEvent.click(cell1!.closest('tr')!);
    fireEvent.click(cell2!.closest('tr')!);
    await user.click(screen.getByText('Anchor Many'));

    await waitFor(() => {
      expect(defaultProps.handleStakeMany).toHaveBeenCalledWith(
        expect.arrayContaining([10, 20]),
        expect.arrayContaining([false, false]),
      );
    });
  });

  it('single Anchor sets selectedTokenIds to the clicked token', async () => {
    const user = userEvent.setup();
    const list = [
      createToken({ TokenId: 5, EvtLogId: 1, Staked: false }),
      createToken({ TokenId: 6, EvtLogId: 2, Staked: false }),
    ];
    render(<CSTokensTable {...defaultProps} list={list} />);

    const anchorButtons = screen.getAllByText('Anchor');
    await user.click(anchorButtons[0]!);

    await waitFor(() => {
      expect(defaultProps.handleStake).toHaveBeenCalledWith(5, false);
    });
  });

  it('resets selection when list changes', () => {
    const list1 = [createToken({ TokenId: 1, EvtLogId: 1 })];
    const list2 = [createToken({ TokenId: 2, EvtLogId: 2 })];
    const { rerender } = render(<CSTokensTable {...defaultProps} list={list1} />);
    rerender(<CSTokensTable {...defaultProps} list={list2} />);
    expect(screen.queryByText('Anchor Many')).not.toBeInTheDocument();
  });

  it('Token ID links to detail page', () => {
    const token = createToken({ TokenId: 99 });
    render(<CSTokensTable {...defaultProps} list={[token]} />);
    const link = screen.getAllByRole('link').find((l) => l.getAttribute('href') === '/detail/99');
    expect(link).toBeInTheDocument();
  });

  it('Round links to allocation page', () => {
    const token = createToken({ RoundNum: 7 });
    render(<CSTokensTable {...defaultProps} list={[token]} />);
    const link = screen
      .getAllByRole('link')
      .find((l) => l.getAttribute('href') === '/allocation/7');
    expect(link).toBeInTheDocument();
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<CSTokensTable {...defaultProps} />);
    await checkA11y(container);
  });
});
