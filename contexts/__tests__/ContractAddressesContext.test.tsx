import { act, render, screen } from '@testing-library/react';

import { flushDynamicImports } from '@/test-utils/dynamic';

import { ContractAddressesProvider, useContractAddresses } from '../ContractAddressesContext';

jest.mock('next/dynamic', () => require('@/test-utils/dynamic').syncDynamic);

const mockDashboard = jest.fn();
jest.mock('../../hooks/useApiQuery', () => ({
  useDashboardInfo: (...args: unknown[]) => mockDashboard(...args),
}));

const GAME = '0x1111111111111111111111111111111111111111';

function Reader() {
  const { cosmicGame } = useContractAddresses();
  return <p>game {cosmicGame || 'unknown'}</p>;
}

beforeAll(() => flushDynamicImports());
beforeEach(() => {
  mockDashboard.mockReset();
  mockDashboard.mockReturnValue({ data: { ContractAddrs: { CosmicGameAddr: GAME } } });
});

describe('ContractAddressesProvider', () => {
  it('reads nothing while no component asks for an address', () => {
    render(
      <ContractAddressesProvider>
        <p>legal text</p>
      </ContractAddressesProvider>,
    );
    expect(mockDashboard).not.toHaveBeenCalled();
  });

  it('reads the dashboard, without polling it, once a component asks', async () => {
    render(
      <ContractAddressesProvider>
        <Reader />
      </ContractAddressesProvider>,
    );
    await act(async () => {});
    expect(screen.getByText(`game ${GAME}`)).toBeInTheDocument();
    expect(mockDashboard).toHaveBeenCalledWith(undefined, { poll: false });
  });

  it('falls back to the last published snapshot outside the provider', () => {
    render(<Reader />);
    expect(screen.getByText(/^game /)).toBeInTheDocument();
  });
});
