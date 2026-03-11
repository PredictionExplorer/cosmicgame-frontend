import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';

import { render, screen, waitFor, fireEvent, checkA11y } from '@/test-utils';

import { RWLKNFTTable } from '../RWLKNFTTable';

const defaultProps = {
  list: [] as number[],
  ownerAddress: '0x1234567890abcdef1234567890abcdef12345678',
  handleStake: jest.fn().mockResolvedValue(undefined),
  handleStakeMany: jest.fn().mockResolvedValue(undefined),
};

beforeEach(() => jest.clearAllMocks());

describe('RWLKNFTTable', () => {
  it('renders empty state when list is empty', () => {
    render(<RWLKNFTTable {...defaultProps} />);
    expect(screen.getByText('No available tokens.')).toBeInTheDocument();
  });

  it('renders table headers', () => {
    render(<RWLKNFTTable {...defaultProps} list={[1]} />);
    for (const header of ['Owner Address', 'Token ID']) {
      expect(screen.getAllByText(header).length).toBeGreaterThanOrEqual(1);
    }
  });

  it('renders token IDs', () => {
    render(<RWLKNFTTable {...defaultProps} list={[10, 20, 30]} />);
    expect(screen.getAllByText('10').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('20').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('30').length).toBeGreaterThanOrEqual(1);
  });

  it('renders Stake button for each row', () => {
    render(<RWLKNFTTable {...defaultProps} list={[1, 2]} />);
    const stakeButtons = screen.getAllByText('Stake');
    expect(stakeButtons.length).toBeGreaterThanOrEqual(2);
  });

  it('paginates with 5 items per page', () => {
    const list = Array.from({ length: 8 }, (_, i) => i + 1);
    render(<RWLKNFTTable {...defaultProps} list={list} />);
    expect(screen.getAllByText('5').length).toBeGreaterThanOrEqual(1);
    expect(screen.queryByText('6')).not.toBeInTheDocument();
  });

  it('renders owner address link', () => {
    render(<RWLKNFTTable {...defaultProps} list={[1]} />);
    const links = screen.getAllByRole('link', { name: /0x1234/i });
    expect(links.length).toBeGreaterThanOrEqual(1);
    expect(links[0]).toHaveAttribute('href', `/user/${defaultProps.ownerAddress}`);
  });

  it('row click toggles selection', () => {
    render(<RWLKNFTTable {...defaultProps} list={[10, 20]} />);

    const cell = screen.getAllByText('10').find((el) => el.closest('td'));
    fireEvent.click(cell!.closest('tr')!);

    expect(screen.queryByText('Stake Many')).not.toBeInTheDocument();
  });

  it('Stake button calls handleStake with tokenId and isRwlk=true', async () => {
    const user = userEvent.setup();
    render(<RWLKNFTTable {...defaultProps} list={[42]} />);

    await user.click(screen.getByText('Stake'));

    await waitFor(() => {
      expect(defaultProps.handleStake).toHaveBeenCalledWith(42, true);
    });
  });

  it('shows Stake Many when multiple rows selected', () => {
    render(<RWLKNFTTable {...defaultProps} list={[1, 2, 3]} />);

    const cell1 = screen.getAllByText('1').find((el) => el.closest('td'));
    const cell2 = screen.getAllByText('2').find((el) => el.closest('td'));
    fireEvent.click(cell1!.closest('tr')!);
    fireEvent.click(cell2!.closest('tr')!);

    expect(screen.getByText('Stake Many')).toBeInTheDocument();
  });

  it('Stake Many calls handleStakeMany with selected IDs and isRwlk flags', async () => {
    const user = userEvent.setup();
    render(<RWLKNFTTable {...defaultProps} list={[10, 20, 30]} />);

    const cell1 = screen.getAllByText('10').find((el) => el.closest('td'));
    const cell2 = screen.getAllByText('20').find((el) => el.closest('td'));
    fireEvent.click(cell1!.closest('tr')!);
    fireEvent.click(cell2!.closest('tr')!);
    await user.click(screen.getByText('Stake Many'));

    await waitFor(() => {
      expect(defaultProps.handleStakeMany).toHaveBeenCalledWith(
        expect.arrayContaining([10, 20]),
        expect.arrayContaining([true, true]),
      );
    });
  });

  it('deselecting row hides Stake Many when only one remains', () => {
    render(<RWLKNFTTable {...defaultProps} list={[1, 2, 3]} />);

    const cell1 = screen.getAllByText('1').find((el) => el.closest('td'));
    const cell2 = screen.getAllByText('2').find((el) => el.closest('td'));
    fireEvent.click(cell1!.closest('tr')!);
    fireEvent.click(cell2!.closest('tr')!);
    expect(screen.getByText('Stake Many')).toBeInTheDocument();

    fireEvent.click(cell2!.closest('tr')!);
    expect(screen.queryByText('Stake Many')).not.toBeInTheDocument();
  });

  it('resets selection when list changes', () => {
    const { rerender } = render(<RWLKNFTTable {...defaultProps} list={[1, 2]} />);
    rerender(<RWLKNFTTable {...defaultProps} list={[3, 4]} />);
    expect(screen.queryByText('Stake Many')).not.toBeInTheDocument();
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<RWLKNFTTable {...defaultProps} />);
    await checkA11y(container);
  });
});
