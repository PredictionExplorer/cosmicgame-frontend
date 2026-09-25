import userEvent from '@testing-library/user-event';

import { checkA11y, render, screen } from '@/test-utils';

import { AddressLookup } from '../AddressLookup';

const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush, replace: jest.fn(), prefetch: jest.fn() }),
  usePathname: () => '/my-allocations',
  useSearchParams: () => new URLSearchParams(),
}));
// The real checksum (the shared viem mock returns addresses unchanged).
jest.mock('viem', () => jest.requireActual('viem'));

const ADDRESS = '0xA169574D0d353E3010997A3E64846b7D1B2a63B6';

beforeEach(() => mockPush.mockClear());

describe('AddressLookup', () => {
  it('opens the profile of any full address, checksummed', async () => {
    const user = userEvent.setup();
    render(<AddressLookup />);
    await user.type(
      screen.getByRole('textbox', { name: 'myPages.allocations.lookup.label' }),
      ` ${ADDRESS.toLowerCase()} `,
    );
    await user.click(screen.getByRole('button', { name: 'myPages.allocations.lookup.submit' }));
    expect(mockPush).toHaveBeenCalledWith(`/user/${ADDRESS}`);
  });

  it('says how to fix anything that is not an address, beside the field', async () => {
    const user = userEvent.setup();
    render(<AddressLookup />);
    const field = screen.getByRole('textbox', { name: 'myPages.allocations.lookup.label' });
    await user.type(field, '0x1234');
    await user.keyboard('{Enter}');
    expect(mockPush).not.toHaveBeenCalled();
    expect(field).toHaveAttribute('aria-invalid', 'true');
    expect(field).toHaveAccessibleDescription('myPages.allocations.lookup.invalid');
    // Typing again clears the error.
    await user.type(field, '5');
    expect(field).not.toHaveAttribute('aria-invalid');
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<AddressLookup />);
    await checkA11y(container);
  });
});
