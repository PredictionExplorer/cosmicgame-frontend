import * as Sentry from '@sentry/nextjs';

import { isEthProviderError, isUserRejection, getEthErrorMessage, reportError } from '../errors';

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

  it('returns fallback for null', () => {
    expect(getEthErrorMessage(null)).toBe('An error occurred');
  });

  it('returns fallback for string error', () => {
    expect(getEthErrorMessage('something broke')).toBe('An error occurred');
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

    reportError(err, 'bidding');

    expect(mockedSentry.captureException).toHaveBeenCalledWith(err, {
      tags: { context: 'bidding' },
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

    reportError('string error', 'staking');

    expect(mockedSentry.captureMessage).toHaveBeenCalledWith('string error', {
      level: 'error',
      tags: { context: 'staking' },
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
