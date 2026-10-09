import userEvent from '@testing-library/user-event';

import { checkA11y, render, screen } from '@/test-utils';

import { ViewAddressForm, parseProfileAddress } from '../ViewAddressForm';

// The shared viem mock returns addresses as given; checksumming is the point here.
jest.mock('viem', () => {
  const utils = jest.requireActual<typeof import('viem/utils')>('viem/utils');
  return {
    ...jest.requireActual<Record<string, unknown>>('../../../__mocks__/viem'),
    getAddress: utils.getAddress,
    isAddress: utils.isAddress,
  };
});

const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
  ...jest.requireActual('next/navigation'),
  useRouter: () => ({ push: mockPush }),
  usePathname: () => '/my-statistics',
}));

const ADDRESS = '0xA169574D0d353E3010997A3E64846b7D1B2a63B6';

describe('parseProfileAddress', () => {
  it('reads a pasted address in any case, trimmed, as its checksummed form', () => {
    expect(parseProfileAddress(`  ${ADDRESS.toLowerCase()} `)).toBe(ADDRESS);
  });

  it('rejects anything that is not a whole address', () => {
    for (const value of ['', '0x', ADDRESS.slice(0, -1), 'vitalik.eth', `${ADDRESS}0`]) {
      expect(parseProfileAddress(value)).toBeNull();
    }
  });
});

describe('ViewAddressForm', () => {
  beforeEach(() => mockPush.mockReset());

  it("opens a valid address's profile", async () => {
    render(<ViewAddressForm />);
    await userEvent.type(
      screen.getByRole('textbox', { name: 'myPages.statistics.viewAddress.label' }),
      ADDRESS.toLowerCase(),
    );
    await userEvent.click(
      screen.getByRole('button', { name: 'myPages.statistics.viewAddress.submit' }),
    );
    expect(mockPush).toHaveBeenCalledWith(`/user/${ADDRESS}`);
  });

  it('says how to fix a malformed address and stays on the page', async () => {
    render(<ViewAddressForm />);
    const field = screen.getByRole('textbox', { name: 'myPages.statistics.viewAddress.label' });
    await userEvent.type(field, '0x1234{Enter}');
    expect(mockPush).not.toHaveBeenCalled();
    expect(field).toHaveAttribute('aria-invalid', 'true');
    expect(field).toHaveAccessibleDescription('myPages.statistics.viewAddress.invalid');
    await userEvent.type(field, '5');
    expect(field).not.toHaveAttribute('aria-invalid');
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<ViewAddressForm />);
    await checkA11y(container);
  });
});
