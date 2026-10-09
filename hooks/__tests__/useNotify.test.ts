import { renderHook, act } from '@testing-library/react';

import { useNotification } from '@/contexts/NotificationContext';
import { reportError } from '@/utils/errors';

import { useNotify } from '../useNotify';

jest.mock('../../contexts/NotificationContext', () => ({
  useNotification: jest.fn(),
}));
jest.mock('../../utils/errors', () => {
  const actual = jest.requireActual<typeof import('../../utils/errors')>('../../utils/errors');
  return { ...actual, reportError: jest.fn() };
});

const mockSetNotification = jest.fn();
const mockUseNotification = useNotification as jest.Mock;
const mockReportError = reportError as jest.Mock;

beforeEach(() => {
  jest.clearAllMocks();
  mockUseNotification.mockReturnValue({ setNotification: mockSetNotification });
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
    it('never shows provider text: a revert reason becomes the fallback sentence', () => {
      const { result } = renderHook(() => useNotify());
      const err = Object.assign(new Error('execution reverted: ERC20: transfer amount'), {
        data: { message: 'revert reason' },
      });

      act(() => {
        result.current.notifyErrorFromEthers(err, 'Action fallback');
      });

      expect(mockSetNotification).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'error', text: 'Action fallback' }),
      );
      const [{ text, details }] = mockSetNotification.mock.calls[0] as [
        { text: string; details: string },
      ];
      expect(text).not.toContain('ERC20');
      // The technical summary rides along for "Copy details".
      expect(details).toContain('execution reverted');
    });

    it('names the cause when it is known (not enough ETH)', () => {
      const { result } = renderHook(() => useNotify());
      const err = { name: 'InsufficientFundsError', message: 'insufficient funds for gas' };

      act(() => {
        result.current.notifyErrorFromEthers(err, 'Action fallback');
      });

      expect(mockSetNotification).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'error',
          text: expect.stringContaining('toasts.tx.error.insufficientFunds'),
        }),
      );
    });

    it('uses the generic sentence and reports unknown errors', () => {
      const { result } = renderHook(() => useNotify());
      const err = 'something unexpected';

      act(() => {
        result.current.notifyErrorFromEthers(err);
      });

      expect(mockReportError).toHaveBeenCalledWith(err, 'ethers provider error');
      expect(mockSetNotification).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'error', text: 'toasts.generic.rpcFailure' }),
      );
    });

    it('shows a neutral cancelled notice for a dismissed wallet prompt', () => {
      const { result } = renderHook(() => useNotify());

      act(() => {
        result.current.notifyErrorFromEthers({ code: 4001, message: 'User rejected' });
      });

      expect(mockReportError).not.toHaveBeenCalled();
      expect(mockSetNotification).toHaveBeenCalledWith({
        visible: true,
        type: 'info',
        text: 'toasts.walletTransactionCancelled',
      });
    });
  });
});
