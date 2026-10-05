import { act, fireEvent, render, screen, checkA11y } from '@/test-utils';

import { CopyButton } from '../copy-button';

const writeText = jest.fn().mockResolvedValue(undefined);

beforeEach(() => {
  writeText.mockClear();
  Object.defineProperty(navigator, 'clipboard', { value: { writeText }, configurable: true });
});

afterEach(() => jest.useRealTimers());

describe('CopyButton', () => {
  it('copies its value and confirms politely, then resets', async () => {
    jest.useFakeTimers();
    render(<CopyButton value="team@example.org" label="Copy email" copiedLabel="Email copied" />);
    const button = screen.getByRole('button', { name: 'Copy email' });
    expect(button).toHaveAttribute('data-touch-target', 'extended');

    await act(async () => {
      fireEvent.click(button);
    });
    expect(writeText).toHaveBeenCalledWith('team@example.org');
    expect(screen.getByRole('button', { name: 'Email copied' })).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent('Email copied');

    act(() => {
      jest.advanceTimersByTime(2_000);
    });
    expect(screen.getByRole('button', { name: 'Copy email' })).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent('');
  });

  it('never confirms a copy the browser refused (regression)', async () => {
    Object.defineProperty(navigator, 'clipboard', { value: undefined, configurable: true });
    document.execCommand = jest.fn().mockReturnValue(false);
    render(<CopyButton value="team@example.org" label="Copy email" copiedLabel="Email copied" />);

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Copy email' }));
    });
    expect(document.execCommand).toHaveBeenCalledWith('copy');
    expect(screen.getByRole('button', { name: 'Copy email' })).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent('');
  });

  it('has no accessibility violations', async () => {
    const { container } = render(
      <CopyButton value="team@example.org" label="Copy email" copiedLabel="Email copied" />,
    );
    await checkA11y(container);
  });
});
