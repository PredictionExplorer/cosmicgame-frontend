import { renderHook, act } from '@testing-library/react';

import { useNotification } from '@/contexts/NotificationContext';
import getErrorMessage from '@/utils/alert';
import { isEthProviderError, reportError, WALLET_TRANSACTION_CANCELLED_MESSAGE } from '@/utils/errors';

import { useNotify } from '../useNotify';

jest.mock('../../contexts/NotificationContext', () => ({
  useNotification: jest.fn(),
}));
jest.mock('../../utils/alert', () => jest.fn((msg: string) => `parsed: ${msg}`));
jest.mock('../../utils/errors', () => {
  const actual = jest.requireActual<typeof import('../../utils/errors')>('../../utils/errors');
  return {
    ...actual,
    isEthProviderError: jest.fn(),
    reportError: jest.fn(),
  };
});

const mockSetNotification = jest.fn();
const mockUseNotification = useNotification as jest.Mock;
const mockIsEthProviderError = isEthProviderError as unknown as jest.Mock;
const mockGetErrorMessage = getErrorMessage as jest.Mock;
const mockReportError = reportError as jest.Mock;

beforeEach(() => {
  jest.clearAllMocks();
  mockUseNotification.mockReturnValue({ setNotification: mockSetNotification });
  mockIsEthProviderError.mockReturnValue(false);
});

describe('useNotify', () => {
  describe('notify', () => {
    it.each<'error' | 'warning' | 'success' | 'info'>(['error', 'warning', 'success', 'info'])(
      'calls setNotification with type "%s"',
      (type) => {
        const { result } = renderHook(() => useNotify());

        act(() => {
          result.current.notify(type, 'test message');
        });

        expect(mockSetNotification).toHaveBeenCalledWith({
          visible: true,
          type,
          text: 'test message',
        });
      },
    );
  });

  describe('notifyErrorFromEthers', () => {
    it('handles EthProviderError with data.message', () => {
      mockIsEthProviderError.mockReturnValue(true);
      const ethError = { data: { message: 'revert reason' } };

      const { result } = renderHook(() => useNotify());

      act(() => {
        result.current.notifyErrorFromEthers(ethError);
      });

      expect(mockGetErrorMessage).toHaveBeenCalledWith('revert reason');
      expect(mockSetNotification).toHaveBeenCalledWith({
        visible: true,
        type: 'error',
        text: 'parsed: revert reason',
      });
    });

    it('handles standard Error using err.message', () => {
      const error = new Error('something broke');

      const { result } = renderHook(() => useNotify());

      act(() => {
        result.current.notifyErrorFromEthers(error);
      });

      expect(mockSetNotification).toHaveBeenCalledWith({
        visible: true,
        type: 'error',
        text: 'something broke',
      });
      expect(mockGetErrorMessage).not.toHaveBeenCalled();
    });

    it('handles unknown errors with reportError and generic message', () => {
      const unknownError = 42;

      const { result } = renderHook(() => useNotify());

      act(() => {
        result.current.notifyErrorFromEthers(unknownError);
      });

      expect(mockReportError).toHaveBeenCalledWith(42, 'ethers provider error');
      expect(mockSetNotification).toHaveBeenCalledWith({
        visible: true,
        type: 'error',
        text: 'Unexpected error. Please try again.',
      });
    });

    it('shows info when user rejected the transaction (EIP-1193 4001)', () => {
      const { result } = renderHook(() => useNotify());

      act(() => {
        result.current.notifyErrorFromEthers({ code: 4001 });
      });

      expect(mockSetNotification).toHaveBeenCalledWith({
        visible: true,
        type: 'info',
        text: WALLET_TRANSACTION_CANCELLED_MESSAGE,
      });
      expect(mockReportError).not.toHaveBeenCalled();
    });
  });
});
