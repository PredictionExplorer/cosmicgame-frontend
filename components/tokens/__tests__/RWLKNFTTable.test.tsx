import '@testing-library/jest-dom';

import { render, screen } from '@/test-utils';

 
import { RWLKNFTTable } from '../RWLKNFTTable';

const defaultProps = {
  list: [] as number[],
  ownerAddress: '0x1234567890abcdef1234567890abcdef12345678',
  handleStake: jest.fn().mockResolvedValue(undefined),
  handleStakeMany: jest.fn().mockResolvedValue(undefined),
};

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
});
