import '@testing-library/jest-dom';
import { fireEvent } from '@testing-library/react';

import { act, render, screen, checkA11y } from '@/test-utils';

jest.mock('../../../hooks/web3', () => ({
  useActiveWeb3React: () => ({ account: '0xUser123' }),
}));

jest.mock('../../../services/api', () => ({
  __esModule: true,
  default: {
    get_info: jest.fn().mockResolvedValue({ CurName: 'Token Name' }),
    get_name_history: jest.fn().mockResolvedValue([]),
    get_staking_rewards_by_user: jest.fn().mockResolvedValue([]),
  },
}));

jest.mock('../../../components/nft/NFTImage', () => ({
  __esModule: true,
  default: function MockNFTImage({ src }: { src: string }) {
    return <img src={src} alt="nft" data-testid="nft-image" />;
  },
}));

import { StakedTokensTable } from '../StakedTokensTable';

const mockUnstake = jest.fn().mockResolvedValue(undefined);
const mockUnstakeMany = jest.fn().mockResolvedValue(undefined);

const createRWLKRow = (overrides = {}) => ({
  StakeActionId: 1,
  StakedTokenId: 42,
  StakeTimeStamp: 1701346718,
  ...overrides,
});

const createCSTRow = (
  overrides: {
    TokenInfo?: Partial<{ TokenId: number; Seed: number; StakeActionId: number }>;
    StakeTimeStamp?: number;
  } = {},
) => ({
  TokenInfo: {
    TokenId: 99,
    Seed: 123,
    StakeActionId: 10,
    ...overrides.TokenInfo,
  },
  StakeTimeStamp: overrides.StakeTimeStamp ?? 1701346718,
});

beforeEach(() => jest.clearAllMocks());

describe('StakedTokensTable', () => {
  it('renders empty state message', async () => {
    await act(async () => {
      render(
        <StakedTokensTable
          list={[]}
          handleUnstake={mockUnstake}
          handleUnstakeMany={mockUnstakeMany}
          IsRwalk={false}
        />,
      );
    });
    expect(screen.getByText('No tokens yet.')).toBeInTheDocument();
  });

  it('renders table headers for RWLK', async () => {
    await act(async () => {
      render(
        <StakedTokensTable
          list={[createRWLKRow()]}
          handleUnstake={mockUnstake}
          handleUnstakeMany={mockUnstakeMany}
          IsRwalk={true}
        />,
      );
    });
    for (const header of ['Token Image', 'Token ID', 'Stake Action ID', 'Stake Datetime']) {
      expect(screen.getAllByText(header).length).toBeGreaterThanOrEqual(1);
    }
  });

  it('renders table headers including Accumulated Rewards for CST', async () => {
    await act(async () => {
      render(
        <StakedTokensTable
          list={[createCSTRow()]}
          handleUnstake={mockUnstake}
          handleUnstakeMany={mockUnstakeMany}
          IsRwalk={false}
        />,
      );
    });
    expect(screen.getAllByText('Accumulated Rewards').length).toBeGreaterThanOrEqual(1);
  });

  it('does not show Accumulated Rewards header for RWLK', async () => {
    await act(async () => {
      render(
        <StakedTokensTable
          list={[createRWLKRow()]}
          handleUnstake={mockUnstake}
          handleUnstakeMany={mockUnstakeMany}
          IsRwalk={true}
        />,
      );
    });
    expect(screen.queryByText('Accumulated Rewards')).not.toBeInTheDocument();
  });

  it('renders RWLK row data', async () => {
    await act(async () => {
      render(
        <StakedTokensTable
          list={[createRWLKRow({ StakedTokenId: 55, StakeActionId: 7 })]}
          handleUnstake={mockUnstake}
          handleUnstakeMany={mockUnstakeMany}
          IsRwalk={true}
        />,
      );
    });
    expect(screen.getAllByText('55').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('7').length).toBeGreaterThanOrEqual(1);
  });

  it('renders CST row data', async () => {
    await act(async () => {
      render(
        <StakedTokensTable
          list={[createCSTRow()]}
          handleUnstake={mockUnstake}
          handleUnstakeMany={mockUnstakeMany}
          IsRwalk={false}
        />,
      );
    });
    expect(screen.getAllByText('99').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('10').length).toBeGreaterThanOrEqual(1);
  });

  it('renders Unstake button in each row', async () => {
    await act(async () => {
      render(
        <StakedTokensTable
          list={[createRWLKRow()]}
          handleUnstake={mockUnstake}
          handleUnstakeMany={mockUnstakeMany}
          IsRwalk={true}
        />,
      );
    });
    expect(screen.getAllByText('Unstake').length).toBeGreaterThanOrEqual(1);
  });

  it('renders only first page of results (perPage=5)', async () => {
    const list = Array.from({ length: 8 }, (_, i) =>
      createRWLKRow({
        StakeActionId: 100 + i,
        StakedTokenId: 200 + i,
        StakeTimeStamp: 1701346718 + i,
      }),
    );
    await act(async () => {
      render(
        <StakedTokensTable
          list={list}
          handleUnstake={mockUnstake}
          handleUnstakeMany={mockUnstakeMany}
          IsRwalk={true}
        />,
      );
    });
    expect(screen.getByText('204')).toBeInTheDocument();
    expect(screen.queryByText('205')).not.toBeInTheDocument();
  });

  it('calls handleUnstake on Unstake button click', async () => {
    await act(async () => {
      render(
        <StakedTokensTable
          list={[createRWLKRow({ StakeActionId: 42 })]}
          handleUnstake={mockUnstake}
          handleUnstakeMany={mockUnstakeMany}
          IsRwalk={true}
        />,
      );
    });
    await act(async () => {
      fireEvent.click(screen.getAllByText('Unstake')[0]!);
    });
    expect(mockUnstake).toHaveBeenCalledWith(42, true);
  });

  it('renders checkbox for row selection', async () => {
    await act(async () => {
      render(
        <StakedTokensTable
          list={[createRWLKRow()]}
          handleUnstake={mockUnstake}
          handleUnstakeMany={mockUnstakeMany}
          IsRwalk={true}
        />,
      );
    });
    const checkboxes = screen.getAllByRole('checkbox');
    expect(checkboxes.length).toBeGreaterThanOrEqual(1);
  });

  it('row click toggles checkbox selection', async () => {
    await act(async () => {
      render(
        <StakedTokensTable
          list={[
            createRWLKRow({ StakeActionId: 1, StakedTokenId: 42 }),
            createRWLKRow({ StakeActionId: 2, StakedTokenId: 43, StakeTimeStamp: 1701346719 }),
          ]}
          handleUnstake={mockUnstake}
          handleUnstakeMany={mockUnstakeMany}
          IsRwalk={true}
        />,
      );
    });
    const cell = screen.getAllByText('42').find((el) => el.closest('td'));
    fireEvent.click(cell!.closest('tr')!);
    const checkboxes = screen.getAllByRole('checkbox');
    expect(checkboxes.length).toBeGreaterThanOrEqual(2);
  });

  it('shows Unstake Many when multiple rows selected', async () => {
    await act(async () => {
      render(
        <StakedTokensTable
          list={[
            createRWLKRow({ StakeActionId: 1, StakedTokenId: 42 }),
            createRWLKRow({ StakeActionId: 2, StakedTokenId: 43, StakeTimeStamp: 1701346719 }),
            createRWLKRow({ StakeActionId: 3, StakedTokenId: 44, StakeTimeStamp: 1701346720 }),
          ]}
          handleUnstake={mockUnstake}
          handleUnstakeMany={mockUnstakeMany}
          IsRwalk={true}
        />,
      );
    });
    const cell1 = screen.getAllByText('42').find((el) => el.closest('td'));
    const cell2 = screen.getAllByText('43').find((el) => el.closest('td'));
    fireEvent.click(cell1!.closest('tr')!);
    fireEvent.click(cell2!.closest('tr')!);
    expect(screen.getByText('Unstake Many')).toBeInTheDocument();
  });

  it('Unstake Many calls handleUnstakeMany with selected action IDs', async () => {
    await act(async () => {
      render(
        <StakedTokensTable
          list={[
            createRWLKRow({ StakeActionId: 10, StakedTokenId: 50 }),
            createRWLKRow({ StakeActionId: 20, StakedTokenId: 51, StakeTimeStamp: 1701346719 }),
          ]}
          handleUnstake={mockUnstake}
          handleUnstakeMany={mockUnstakeMany}
          IsRwalk={true}
        />,
      );
    });
    const cell1 = screen.getAllByText('50').find((el) => el.closest('td'));
    const cell2 = screen.getAllByText('51').find((el) => el.closest('td'));
    fireEvent.click(cell1!.closest('tr')!);
    fireEvent.click(cell2!.closest('tr')!);
    await act(async () => {
      fireEvent.click(screen.getByText('Unstake Many'));
    });
    expect(mockUnstakeMany).toHaveBeenCalledWith(expect.arrayContaining([10, 20]), true);
  });

  it('Unstake button hides Unstake Many for single selection', async () => {
    await act(async () => {
      render(
        <StakedTokensTable
          list={[createRWLKRow({ StakeActionId: 1 })]}
          handleUnstake={mockUnstake}
          handleUnstakeMany={mockUnstakeMany}
          IsRwalk={true}
        />,
      );
    });
    await act(async () => {
      fireEvent.click(screen.getAllByText('Unstake')[0]!);
    });
    expect(screen.queryByText('Unstake Many')).not.toBeInTheDocument();
  });

  it('resets selection when list prop changes', async () => {
    const list1 = [createRWLKRow({ StakeActionId: 1 })];
    const list2 = [createRWLKRow({ StakeActionId: 2 })];
    let result: ReturnType<typeof render>;
    await act(async () => {
      result = render(
        <StakedTokensTable
          list={list1}
          handleUnstake={mockUnstake}
          handleUnstakeMany={mockUnstakeMany}
          IsRwalk={true}
        />,
      );
    });
    await act(async () => {
      result!.rerender(
        <StakedTokensTable
          list={list2}
          handleUnstake={mockUnstake}
          handleUnstakeMany={mockUnstakeMany}
          IsRwalk={true}
        />,
      );
    });
    expect(screen.queryByText('Unstake Many')).not.toBeInTheDocument();
  });

  it('passes isRwlk=false for CST unstake', async () => {
    await act(async () => {
      render(
        <StakedTokensTable
          list={[createCSTRow()]}
          handleUnstake={mockUnstake}
          handleUnstakeMany={mockUnstakeMany}
          IsRwalk={false}
        />,
      );
    });
    await act(async () => {
      fireEvent.click(screen.getAllByText('Unstake')[0]!);
    });
    expect(mockUnstake).toHaveBeenCalledWith(10, false);
  });

  it('has no accessibility violations', async () => {
    let container: HTMLElement;
    await act(async () => {
      const result = render(
        <StakedTokensTable
          list={[]}
          handleUnstake={mockUnstake}
          handleUnstakeMany={mockUnstakeMany}
          IsRwalk={false}
        />,
      );
      container = result.container;
    });
    await checkA11y(container!);
  });
});
