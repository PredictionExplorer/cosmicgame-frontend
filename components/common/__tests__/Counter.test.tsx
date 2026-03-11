import { render, screen } from '@/test-utils';

import Counter from '../Counter';

describe('Counter', () => {
  it('renders all four time units when days > 0', () => {
    render(<Counter days={1} hours={2} minutes={30} seconds={45} />);
    expect(screen.getByText('DAYS')).toBeInTheDocument();
    expect(screen.getByText('HOURS')).toBeInTheDocument();
    expect(screen.getByText('MIN')).toBeInTheDocument();
    expect(screen.getByText('SEC')).toBeInTheDocument();
  });

  it('hides DAYS when days is 0', () => {
    render(<Counter days={0} hours={5} minutes={10} seconds={20} />);
    expect(screen.queryByText('DAYS')).not.toBeInTheDocument();
    expect(screen.getByText('HOURS')).toBeInTheDocument();
  });

  it('hides DAYS and HOURS when both are 0', () => {
    render(<Counter days={0} hours={0} minutes={15} seconds={30} />);
    expect(screen.queryByText('DAYS')).not.toBeInTheDocument();
    expect(screen.queryByText('HOURS')).not.toBeInTheDocument();
    expect(screen.getByText('MIN')).toBeInTheDocument();
    expect(screen.getByText('SEC')).toBeInTheDocument();
  });

  it('zero-pads single-digit values', () => {
    render(<Counter days={1} hours={2} minutes={3} seconds={4} />);
    expect(screen.getByText('01')).toBeInTheDocument();
    expect(screen.getByText('02')).toBeInTheDocument();
    expect(screen.getByText('03')).toBeInTheDocument();
    expect(screen.getByText('04')).toBeInTheDocument();
  });

  it('does not pad two-digit values', () => {
    render(<Counter days={10} hours={23} minutes={59} seconds={59} />);
    expect(screen.getByText('10')).toBeInTheDocument();
    expect(screen.getByText('23')).toBeInTheDocument();
  });

  it('renders all zeros', () => {
    render(<Counter days={0} hours={0} minutes={0} seconds={0} />);
    expect(screen.getByText('MIN')).toBeInTheDocument();
    expect(screen.getByText('SEC')).toBeInTheDocument();
  });
});
