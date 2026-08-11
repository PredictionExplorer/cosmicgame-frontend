import * as Sentry from '@sentry/nextjs';

import {
  isEthProviderError,
  isTransientNetworkError,
  isUserRejection,
  getEthErrorMessage,
  reportError,
  reportErrorThrottled,
} from '@/utils/errors';
import { isContractRevertError, isEmptyContractReadError } from '@/utils/contractErrors';

jest.mock('@sentry/nextjs', () => ({
  captureException: jest.fn(),
  captureMessage: jest.fn(),
}));

const mockedSentry = Sentry as jest.Mocked<typeof Sentry>;

beforeEach(() => {
  jest.clearAllMocks();
});

describe('isEthProviderError', () => {
  it('returns true for object with data property', () => {
    expect(isEthProviderError({ data: { message: 'reverted' } })).toBe(true);
  });

  it('returns true for object with data even if data is not an object', () => {
    expect(isEthProviderError({ data: 'some string' })).toBe(true);
  });

  it('returns false for object without data property', () => {
    expect(isEthProviderError({ code: 4001 })).toBe(false);
  });

  it('returns false for null', () => {
    expect(isEthProviderError(null)).toBe(false);
  });

  it('returns false for undefined', () => {
    expect(isEthProviderError(undefined)).toBe(false);
  });

  it('returns false for string', () => {
    expect(isEthProviderError('error message')).toBe(false);
  });

  it('returns false for number', () => {
    expect(isEthProviderError(42)).toBe(false);
  });
});

describe('isUserRejection', () => {
  it('returns true for error with code 4001', () => {
    expect(isUserRejection({ code: 4001 })).toBe(true);
  });

  it('returns false for error with different code', () => {
    expect(isUserRejection({ code: 4002 })).toBe(false);
    expect(isUserRejection({ code: -32603 })).toBe(false);
  });

  it('returns false for object without code', () => {
    expect(isUserRejection({ data: 'something' })).toBe(false);
  });

  it('returns false for null', () => {
    expect(isUserRejection(null)).toBe(false);
  });

  it('returns false for undefined', () => {
    expect(isUserRejection(undefined)).toBe(false);
  });

  it('returns false for string', () => {
    expect(isUserRejection('user rejected')).toBe(false);
  });

  it('returns false for number', () => {
    expect(isUserRejection(4001)).toBe(false);
  });

  it('returns true when code 4001 is nested in cause', () => {
    expect(
      isUserRejection({
        name: 'SomeWrapperError',
        cause: { code: 4001 },
      }),
    ).toBe(true);
  });

  it('returns true for UserRejectedRequestError by name', () => {
    expect(isUserRejection({ name: 'UserRejectedRequestError', message: 'rejected' })).toBe(true);
  });

  it('returns true when message indicates user denied signature', () => {
    expect(
      isUserRejection({
        message: 'MetaMask Tx Signature: User denied transaction signature.',
      }),
    ).toBe(true);
  });

  it('returns true for ACTION_REJECTED code', () => {
    expect(isUserRejection({ code: 'ACTION_REJECTED' })).toBe(true);
  });
});

describe('getEthErrorMessage', () => {
  it('extracts message from provider error data', () => {
    const err = { data: { message: 'execution reverted' } };
    expect(getEthErrorMessage(err)).toBe('execution reverted');
  });

  it('returns fallback when data has no message', () => {
    const err = { data: {} };
    expect(getEthErrorMessage(err)).toBe('An error occurred');
  });

  it('returns fallback for non-provider error', () => {
    expect(getEthErrorMessage(new Error('boom'))).toBe('An error occurred');
  });

  it('returns custom fallback when provided', () => {
    expect(getEthErrorMessage({}, 'Custom fallback')).toBe('Custom fallback');
  });

  it('hides arbitrary provider diagnostics behind the fallback for Chinese UI', () => {
    const err = { data: { message: 'execution reverted: arbitrary English diagnostic' } };
    expect(getEthErrorMessage(err, '交易未能完成。', { locale: 'zh' })).toBe('交易未能完成。');
  });

  it('preserves detailed provider diagnostics for English UI', () => {
    const err = { data: { message: 'execution reverted: useful detail' } };
    expect(getEthErrorMessage(err, 'Transaction failed.', { locale: 'en' })).toBe(
      'execution reverted: useful detail',
    );
  });

  it('returns fallback for null', () => {
    expect(getEthErrorMessage(null)).toBe('An error occurred');
  });

  it('returns fallback for string error', () => {
    expect(getEthErrorMessage('something broke')).toBe('An error occurred');
  });
});

describe('isContractRevertError', () => {
  it('returns true for Error with name ContractFunctionExecutionError', () => {
    const err = new Error('The contract function "systemMode" reverted.');
    err.name = 'ContractFunctionExecutionError';
    expect(isContractRevertError(err)).toBe(true);
  });

  it('returns false for a plain Error', () => {
    expect(isContractRevertError(new Error('generic'))).toBe(false);
  });

  it('returns false for null', () => {
    expect(isContractRevertError(null)).toBe(false);
  });

  it('returns false for undefined', () => {
    expect(isContractRevertError(undefined)).toBe(false);
  });

  it('returns false for a string', () => {
    expect(isContractRevertError('ContractFunctionExecutionError')).toBe(false);
  });

  it('returns false for a non-Error object with matching name', () => {
    expect(isContractRevertError({ name: 'ContractFunctionExecutionError' })).toBe(false);
  });
});

describe('isEmptyContractReadError', () => {
  it('detects viem zero-data read errors', () => {
    expect(
      isEmptyContractReadError(new Error('Cannot decode zero data ("0x") with ABI parameters.')),
    ).toBe(true);
  });

  it('detects nested zero-data read errors', () => {
    const err = new Error('outer') as Error & { cause?: unknown };
    err.cause = new Error('returned no data ("0x")');
    expect(isEmptyContractReadError(err)).toBe(true);
  });

  it('returns false for unrelated errors', () => {
    expect(isEmptyContractReadError(new Error('contract reverted'))).toBe(false);
  });
});

describe('isTransientNetworkError', () => {
  it('recognizes a viem HttpRequestError by name', () => {
    const err = new Error('HTTP request failed.');
    err.name = 'HttpRequestError';
    expect(isTransientNetworkError(err)).toBe(true);
  });

  it('recognizes fetch failures by message', () => {
    expect(isTransientNetworkError(new TypeError('Failed to fetch'))).toBe(true);
    expect(isTransientNetworkError(new TypeError('Load failed'))).toBe(true);
    expect(isTransientNetworkError(new Error('fetch failed'))).toBe(true);
  });

  it('recognizes connection and timeout failures', () => {
    expect(isTransientNetworkError(new Error('connect ECONNREFUSED 127.0.0.1:3000'))).toBe(true);
    expect(isTransientNetworkError(new Error('The request timed out.'))).toBe(true);
  });

  it('walks nested cause chains (viem ContractFunctionExecutionError shape)', () => {
    const inner = new Error('HTTP request failed.');
    inner.name = 'HttpRequestError';
    const middle = new Error('Raw call arguments failed');
    (middle as Error & { cause?: unknown }).cause = inner;
    const outer = new Error('The contract function "getNextCstBidPrice" reverted.');
    (outer as Error & { cause?: unknown }).cause = middle;
    expect(isTransientNetworkError(outer)).toBe(true);
  });

  it('checks the viem details field', () => {
    const err = new Error('something went wrong');
    (err as Error & { details?: string }).details = 'Failed to fetch';
    expect(isTransientNetworkError(err)).toBe(true);
  });

  it('returns false for application-level errors', () => {
    expect(isTransientNetworkError(new Error('execution reverted'))).toBe(false);
    expect(isTransientNetworkError(new Error('schemaMismatch:DashboardInfo'))).toBe(false);
    expect(isTransientNetworkError(null)).toBe(false);
    expect(isTransientNetworkError(undefined)).toBe(false);
    expect(isTransientNetworkError('Failed to fetch')).toBe(false);
  });
});

describe('reportErrorThrottled', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('reports the first error and suppresses repeats within the interval', () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    let now = 1_000_000;
    jest.spyOn(Date, 'now').mockImplementation(() => now);
    const err = new Error('boom');

    reportErrorThrottled(err, 'throttle-test-a');
    now += 1_000;
    reportErrorThrottled(err, 'throttle-test-a');

    expect(mockedSentry.captureException).toHaveBeenCalledTimes(1);
    expect(consoleSpy).toHaveBeenCalledTimes(1);
  });

  it('reports again after the interval elapses', () => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
    let now = 2_000_000;
    jest.spyOn(Date, 'now').mockImplementation(() => now);
    const err = new Error('boom');

    reportErrorThrottled(err, 'throttle-test-b', 60_000);
    now += 60_001;
    reportErrorThrottled(err, 'throttle-test-b', 60_000);

    expect(mockedSentry.captureException).toHaveBeenCalledTimes(2);
  });

  it('throttles per context key independently', () => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
    jest.spyOn(Date, 'now').mockImplementation(() => 3_000_000);
    const err = new Error('boom');

    reportErrorThrottled(err, 'throttle-test-c');
    reportErrorThrottled(err, 'throttle-test-d');

    expect(mockedSentry.captureException).toHaveBeenCalledTimes(2);
  });
});

describe('reportError', () => {
  it('calls Sentry.captureException for Error instances', () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    const err = new Error('test error');

    reportError(err);

    expect(mockedSentry.captureException).toHaveBeenCalledWith(err, undefined);
    consoleSpy.mockRestore();
  });

  it('passes context as tag when provided with Error', () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    const err = new Error('test error');

    reportError(err, 'gesturing');

    expect(mockedSentry.captureException).toHaveBeenCalledWith(err, {
      tags: { context: 'gesturing' },
    });
    consoleSpy.mockRestore();
  });

  it('calls Sentry.captureMessage for non-Error values', () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    reportError('string error');

    expect(mockedSentry.captureMessage).toHaveBeenCalledWith('string error', {
      level: 'error',
    });
    consoleSpy.mockRestore();
  });

  it('passes context as tag when provided with non-Error', () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    reportError('string error', 'anchoring');

    expect(mockedSentry.captureMessage).toHaveBeenCalledWith('string error', {
      level: 'error',
      tags: { context: 'anchoring' },
    });
    consoleSpy.mockRestore();
  });

  it('logs to console with context prefix', () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    const err = new Error('oops');

    reportError(err, 'myContext');

    expect(consoleSpy).toHaveBeenCalledWith('[myContext]', err);
    consoleSpy.mockRestore();
  });

  it('logs to console without prefix when no context', () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    const err = new Error('oops');

    reportError(err);

    expect(consoleSpy).toHaveBeenCalledWith(err);
    consoleSpy.mockRestore();
  });
});
