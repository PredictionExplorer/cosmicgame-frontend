import { renderHook } from '@testing-library/react';
import { getContract } from 'viem';

import { reportError } from '@/utils/errors';

import useContractNoSigner from '../useContractNoSigner';

jest.mock('viem', () => ({
  ...jest.requireActual('../../__mocks__/viem.js'),
  getContract: jest.fn(),
  createPublicClient: jest.fn(() => ({ request: jest.fn() })),
  http: jest.fn(),
}));

jest.mock('../../utils/errors', () => ({
  reportError: jest.fn(),
}));

jest.mock('../../config/networks', () => ({
  networkConfig: { rpcUrl: 'http://localhost:8545', chainId: 31337 },
}));

jest.mock('../../config/chains', () => ({
  activeChain: { id: 31337, name: 'localhost' },
}));

const mockGetContract = getContract as unknown as jest.Mock;
const mockedReportError = reportError as jest.MockedFunction<typeof reportError>;

const TEST_ABI = [
  {
    type: 'function' as const,
    name: 'balanceOf',
    inputs: [{ name: 'owner', type: 'address' }],
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view' as const,
  },
] as const;

const TEST_ADDRESS = '0x1234567890123456789012345678901234567890';

beforeEach(() => {
  jest.clearAllMocks();
});

describe('useContractNoSigner', () => {
  it('returns null when address is empty', () => {
    const { result } = renderHook(() => useContractNoSigner('', TEST_ABI));
    expect(result.current).toBeNull();
    expect(mockGetContract).not.toHaveBeenCalled();
  });

  it('returns null when abi is falsy', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { result } = renderHook(() => useContractNoSigner(TEST_ADDRESS, null as any));
    expect(result.current).toBeNull();
    expect(mockGetContract).not.toHaveBeenCalled();
  });

  it('returns a contract when address and abi are valid', () => {
    const mockContract = { read: {}, address: TEST_ADDRESS };
    mockGetContract.mockReturnValue(mockContract);

    const { result } = renderHook(() => useContractNoSigner(TEST_ADDRESS, TEST_ABI));

    expect(result.current).toBe(mockContract);
    expect(mockGetContract).toHaveBeenCalledWith(
      expect.objectContaining({
        address: TEST_ADDRESS,
        abi: TEST_ABI,
      }),
    );
  });

  it('returns null and calls reportError when getContract throws', () => {
    const error = new Error('bad abi');
    mockGetContract.mockImplementation(() => {
      throw error;
    });

    const { result } = renderHook(() => useContractNoSigner(TEST_ADDRESS, TEST_ABI));

    expect(result.current).toBeNull();
    expect(mockedReportError).toHaveBeenCalledWith(error, 'useContractNoSigner init');
  });

  it('memoises across re-renders with same inputs', () => {
    const mockContract = { read: {} };
    mockGetContract.mockReturnValue(mockContract);

    const { result, rerender } = renderHook(() => useContractNoSigner(TEST_ADDRESS, TEST_ABI));

    const first = result.current;
    rerender();

    expect(result.current).toBe(first);
    expect(mockGetContract).toHaveBeenCalledTimes(1);
  });
});
