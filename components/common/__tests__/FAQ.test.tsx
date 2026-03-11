import '@testing-library/jest-dom';
import { fireEvent } from '@testing-library/react';

import { render, screen } from '@/test-utils';

 
import FAQ from '../FAQ';

describe('FAQ', () => {
  it('renders all FAQ items', () => {
    render(<FAQ />);
    expect(screen.getByText('What is Cosmic Signature?')).toBeInTheDocument();
    expect(screen.getByText('How does the bidding game work?')).toBeInTheDocument();
    expect(screen.getByText('How does the raffle work?')).toBeInTheDocument();
  });

  it('expands an item on click', () => {
    render(<FAQ />);
    const button = screen.getByText('What is Cosmic Signature?').closest('button')!;
    expect(button).toHaveAttribute('aria-expanded', 'false');
    fireEvent.click(button);
    expect(button).toHaveAttribute('aria-expanded', 'true');
  });

  it('collapses an item on second click', () => {
    render(<FAQ />);
    const button = screen.getByText('What is Cosmic Signature?').closest('button')!;
    fireEvent.click(button);
    expect(button).toHaveAttribute('aria-expanded', 'true');
    fireEvent.click(button);
    expect(button).toHaveAttribute('aria-expanded', 'false');
  });

  it('sets aria-expanded correctly', () => {
    render(<FAQ />);
    const buttons = screen.getAllByRole('button');
    buttons.forEach((btn) => {
      expect(btn).toHaveAttribute('aria-expanded', 'false');
    });
  });

  it('only one item expanded at a time', () => {
    render(<FAQ />);
    const firstButton = screen.getByText('What is Cosmic Signature?').closest('button')!;
    const secondButton = screen.getByText('How does the bidding game work?').closest('button')!;

    fireEvent.click(firstButton);
    expect(firstButton).toHaveAttribute('aria-expanded', 'true');
    expect(secondButton).toHaveAttribute('aria-expanded', 'false');

    fireEvent.click(secondButton);
    expect(firstButton).toHaveAttribute('aria-expanded', 'false');
    expect(secondButton).toHaveAttribute('aria-expanded', 'true');
  });

  it('expands correct item via hash #main-prize (index 3)', () => {
    Object.defineProperty(window, 'location', {
      writable: true,
      value: { ...window.location, hash: '#main-prize' },
    });
    window.scrollTo = jest.fn();

    render(<FAQ />);
    const mainPrizeButton = screen.getByText('What is the main prize?').closest('button')!;
    expect(mainPrizeButton).toHaveAttribute('aria-expanded', 'true');

    Object.defineProperty(window, 'location', {
      writable: true,
      value: { ...window.location, hash: '' },
    });
  });

  it('expands correct item via hash #endurance-champion (index 7)', () => {
    Object.defineProperty(window, 'location', {
      writable: true,
      value: { ...window.location, hash: '#endurance-champion' },
    });
    window.scrollTo = jest.fn();

    render(<FAQ />);
    const button = screen.getByText('What is an Endurance Champion?').closest('button')!;
    expect(button).toHaveAttribute('aria-expanded', 'true');

    Object.defineProperty(window, 'location', {
      writable: true,
      value: { ...window.location, hash: '' },
    });
  });

  it('expands correct item via hash #chrono-warrior (index 8)', () => {
    Object.defineProperty(window, 'location', {
      writable: true,
      value: { ...window.location, hash: '#chrono-warrior' },
    });
    window.scrollTo = jest.fn();

    render(<FAQ />);
    const button = screen.getByText('What is a Chrono Warrior?').closest('button')!;
    expect(button).toHaveAttribute('aria-expanded', 'true');

    Object.defineProperty(window, 'location', {
      writable: true,
      value: { ...window.location, hash: '' },
    });
  });
});
