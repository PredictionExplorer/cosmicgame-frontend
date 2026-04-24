import { renderHook } from '@testing-library/react';
import { getContract } from 'viem';

import { reportError } from '@/utils/errors';

import useContractNoSigner from '../useContractNoSigner';

jest.mock('viem', () => ({
  ...jest.requireActual('../../__mocks__/viem'),
  getContract: jest.fn(),
  createPublicClient: jest.fn(() => ({ request: jest.fn() })),
  http: jest.fn(),
}));

jest.mock('../../utils/errors', () => ({
  reportError: jest.fn(),
}));

jest.mock('../../config/networks', () => ({
  networkConfig: { rpcUrl: 'http://localhost:8545', chainId: 31337 },
  getPublicClientRpcUrl: () => 'http://localhost:8545',
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

  it('passes a client object to getContract', () => {
    mockGetContract.mockReturnValue({ read: {} });

    renderHook(() => useContractNoSigner(TEST_ADDRESS, TEST_ABI));

    expect(mockGetContract).toHaveBeenCalledWith(
      expect.objectContaining({ client: expect.anything() }),
    );
  });

  it('casts address to 0x-prefixed string', () => {
    mockGetContract.mockReturnValue({ read: {} });

    renderHook(() => useContractNoSigner(TEST_ADDRESS, TEST_ABI));

    const callArgs = mockGetContract.mock.calls[0][0];
    expect(callArgs.address).toBe(TEST_ADDRESS);
    expect(callArgs.address).toMatch(/^0x/);
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

  it('calls reportError for non-Error throwables', () => {
    mockGetContract.mockImplementation(() => {
      throw 'string error';
    });

    const { result } = renderHook(() => useContractNoSigner(TEST_ADDRESS, TEST_ABI));

    expect(result.current).toBeNull();
    expect(mockedReportError).toHaveBeenCalledWith('string error', 'useContractNoSigner init');
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

  it('recalculates when address changes', () => {
    const contract1 = { read: {}, id: 1 };
    const contract2 = { read: {}, id: 2 };
    mockGetContract.mockReturnValueOnce(contract1).mockReturnValueOnce(contract2);

    const OTHER_ADDRESS = '0x0000000000000000000000000000000000000001';

    const { result, rerender } = renderHook(({ addr }) => useContractNoSigner(addr, TEST_ABI), {
      initialProps: { addr: TEST_ADDRESS },
    });

    expect(result.current).toBe(contract1);

    rerender({ addr: OTHER_ADDRESS });

    expect(result.current).toBe(contract2);
    expect(mockGetContract).toHaveBeenCalledTimes(2);
  });

  it('recalculates when abi changes', () => {
    const contract1 = { read: {}, id: 1 };
    const contract2 = { read: {}, id: 2 };
    mockGetContract.mockReturnValueOnce(contract1).mockReturnValueOnce(contract2);

    const OTHER_ABI = [
      {
        type: 'function' as const,
        name: 'totalSupply',
        inputs: [] as const,
        outputs: [{ name: '', type: 'uint256' }] as const,
        stateMutability: 'view' as const,
      },
    ] as const;

    const { result, rerender } = renderHook(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ({ abi }: { abi: any }) => useContractNoSigner(TEST_ADDRESS, abi),
      { initialProps: { abi: TEST_ABI as typeof TEST_ABI | typeof OTHER_ABI } },
    );

    expect(result.current).toBe(contract1);

    rerender({ abi: OTHER_ABI });

    expect(result.current).toBe(contract2);
    expect(mockGetContract).toHaveBeenCalledTimes(2);
  });
});
