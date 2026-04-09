import * as Sentry from '@sentry/nextjs';
import '@testing-library/jest-dom';

import {
  getContractErrorMessage,
  getEthErrorMessage,
  isContractRevertError,
  reportError,
} from '@/utils/errors';

jest.mock('@sentry/nextjs', () => ({
  captureException: jest.fn(),
  captureMessage: jest.fn(),
}));

const mockedSentry = Sentry as jest.Mocked<typeof Sentry>;

beforeEach(() => {
  jest.clearAllMocks();
});

/**
 * Builds a mock viem-style ContractFunctionExecutionError that optionally
 * supports `.walk()` and/or a `.cause` chain so we can exercise every branch
 * inside the private `extractContractErrorName` helper.
 */
function createContractError({
  errorName,
  args,
  walkFindsInner = true,
  innerHasData = true,
  noWalk = false,
  cause,
}: {
  errorName?: string;
  args?: readonly unknown[];
  walkFindsInner?: boolean;
  innerHasData?: boolean;
  noWalk?: boolean;
  cause?: Error;
} = {}): Error {
  const innerError = new Error('revert');
  innerError.name = 'ContractFunctionRevertedError';

  if (innerHasData) {
    (innerError as unknown as Record<string, unknown>).data = { errorName, args };
  }

  const outerError = new Error('execution reverted');
  outerError.name = 'ContractFunctionExecutionError';

  if (!noWalk) {
    (outerError as unknown as Record<string, unknown>).walk = (fn: (e: Error) => boolean) => {
      if (!walkFindsInner) return outerError;
      if (fn(innerError)) return innerError;
      return outerError;
    };
  }

  if (cause) {
    (outerError as unknown as Record<string, unknown>).cause = cause;
  }

  return outerError;
}

/* ------------------------------------------------------------------ */
/*  getContractErrorMessage                                           */
/* ------------------------------------------------------------------ */

describe('getContractErrorMessage', () => {
  describe('returns null when error name cannot be extracted', () => {
    it('returns null for non-Error string input', () => {
      expect(getContractErrorMessage('not an error')).toBeNull();
    });

    it('returns null for null', () => {
      expect(getContractErrorMessage(null)).toBeNull();
    });

    it('returns null for undefined', () => {
      expect(getContractErrorMessage(undefined)).toBeNull();
    });

    it('returns null for a number', () => {
      expect(getContractErrorMessage(123)).toBeNull();
    });

    it('returns null for a plain Error without walk or cause', () => {
      expect(getContractErrorMessage(new Error('boom'))).toBeNull();
    });

    it('returns null when walk does not find the inner revert error', () => {
      const err = createContractError({ walkFindsInner: false });
      expect(getContractErrorMessage(err)).toBeNull();
    });

    it('returns null when inner error has no data property at all', () => {
      const err = createContractError({
        errorName: 'RoundIsInactive',
        innerHasData: false,
      });
      expect(getContractErrorMessage(err)).toBeNull();
    });

    it('returns null when inner data.errorName is an empty string', () => {
      const err = createContractError({ errorName: '' });
      expect(getContractErrorMessage(err)).toBeNull();
    });

    it('returns null when inner data.errorName is undefined', () => {
      const err = createContractError({ errorName: undefined });
      expect(getContractErrorMessage(err)).toBeNull();
    });

    it('returns null when inner data object itself is null', () => {
      const innerError = new Error('revert');
      innerError.name = 'ContractFunctionRevertedError';
      (innerError as unknown as Record<string, unknown>).data = null;

      const err = new Error('outer');
      (err as unknown as Record<string, unknown>).walk = (fn: (e: Error) => boolean) =>
        fn(innerError) ? innerError : err;

      expect(getContractErrorMessage(err)).toBeNull();
    });

    it('returns null when cause is not an Error instance', () => {
      const err = new Error('outer');
      (err as unknown as Record<string, unknown>).cause = 'string cause';
      expect(getContractErrorMessage(err)).toBeNull();
    });
  });

  describe('known custom error messages', () => {
    const customErrors: Array<[string, string]> = [
      ['UsedRandomWalkNft', 'This RandomWalk NFT has already been used for a bid.'],
      ['CallerIsNotNftOwner', 'You are not the owner of this NFT.'],
      ['RoundIsInactive', 'The current round is not active.'],
      ['TooLongBidMessage', 'Your bid message is too long.'],
      ['WrongBidType', 'Wrong bid type selected.'],
      ['FundTransferFailed', 'Fund transfer failed.'],
      ['MainPrizeEarlyClaim', 'Not enough time has elapsed to claim the prize.'],
      ['MainPrizeClaimDenied', 'Only the last bidder is permitted to claim the main prize.'],
      ['NoBidsPlacedInCurrentRound', 'There have been no bids in the current round yet.'],
    ];

    it.each(customErrors)('returns correct message for %s', (errorName, expectedMessage) => {
      const err = createContractError({ errorName });
      expect(getContractErrorMessage(err)).toBe(expectedMessage);
    });

    it('returns null for an unrecognised error name', () => {
      const err = createContractError({ errorName: 'CompletelyUnknownError' });
      expect(getContractErrorMessage(err)).toBeNull();
    });
  });

  describe('cause-chain traversal (via extractContractErrorName)', () => {
    it('finds error name through cause chain when outer has no walk', () => {
      const innerError = new Error('revert');
      innerError.name = 'ContractFunctionRevertedError';
      (innerError as unknown as Record<string, unknown>).data = {
        errorName: 'RoundIsInactive',
      };

      const causeWithWalk = new Error('mid');
      (causeWithWalk as unknown as Record<string, unknown>).walk = (fn: (e: Error) => boolean) =>
        fn(innerError) ? innerError : causeWithWalk;

      const outerError = new Error('top');
      (outerError as unknown as Record<string, unknown>).cause = causeWithWalk;

      expect(getContractErrorMessage(outerError)).toBe('The current round is not active.');
    });

    it('traverses a deeply nested cause chain', () => {
      const innerError = new Error('revert');
      innerError.name = 'ContractFunctionRevertedError';
      (innerError as unknown as Record<string, unknown>).data = {
        errorName: 'FundTransferFailed',
      };

      const deepCause = new Error('deep');
      (deepCause as unknown as Record<string, unknown>).walk = (fn: (e: Error) => boolean) =>
        fn(innerError) ? innerError : deepCause;

      const midCause = new Error('mid');
      (midCause as unknown as Record<string, unknown>).cause = deepCause;

      const outerError = new Error('outer');
      (outerError as unknown as Record<string, unknown>).cause = midCause;

      expect(getContractErrorMessage(outerError)).toBe('Fund transfer failed.');
    });

    it('falls through walk to cause when inner data has no errorName', () => {
      const innerWithoutName = new Error('revert');
      innerWithoutName.name = 'ContractFunctionRevertedError';
      (innerWithoutName as unknown as Record<string, unknown>).data = {};

      const innerWithName = new Error('revert2');
      innerWithName.name = 'ContractFunctionRevertedError';
      (innerWithName as unknown as Record<string, unknown>).data = {
        errorName: 'RoundIsInactive',
      };

      const causeError = new Error('cause');
      (causeError as unknown as Record<string, unknown>).walk = (fn: (e: Error) => boolean) =>
        fn(innerWithName) ? innerWithName : causeError;

      const outerError = new Error('outer');
      (outerError as unknown as Record<string, unknown>).walk = (fn: (e: Error) => boolean) =>
        fn(innerWithoutName) ? innerWithoutName : outerError;
      (outerError as unknown as Record<string, unknown>).cause = causeError;

      expect(getContractErrorMessage(outerError)).toBe('The current round is not active.');
    });

    it('returns null when walk finds data without errorName and no cause exists', () => {
      const innerError = new Error('revert');
      innerError.name = 'ContractFunctionRevertedError';
      (innerError as unknown as Record<string, unknown>).data = {};

      const err = new Error('outer');
      (err as unknown as Record<string, unknown>).walk = (fn: (e: Error) => boolean) =>
        fn(innerError) ? innerError : err;

      expect(getContractErrorMessage(err)).toBeNull();
    });
  });

  describe('InsufficientReceivedBidAmount with displayedEthPrice', () => {
    it('returns price-rose message when delta is positive', () => {
      const requiredWei = 2_000_000_000_000_000_000n; // 2 ETH
      const err = createContractError({
        errorName: 'InsufficientReceivedBidAmount',
        args: [0n, requiredWei],
      });

      const result = getContractErrorMessage(err, 1.0);

      expect(result).toBe(
        'Bid price rose by 1.000000 ETH while your transaction was in transit. ' +
          'The new required price is 2.000000 ETH. Please try again.',
      );
    });

    it('falls back to custom message when delta is exactly zero', () => {
      const requiredWei = 1_000_000_000_000_000_000n; // 1 ETH
      const err = createContractError({
        errorName: 'InsufficientReceivedBidAmount',
        args: [0n, requiredWei],
      });

      expect(getContractErrorMessage(err, 1.0)).toBe(
        'The current bid price is greater than the amount you transferred.',
      );
    });

    it('falls back to custom message when delta is negative', () => {
      const requiredWei = 1_000_000_000_000_000_000n; // 1 ETH
      const err = createContractError({
        errorName: 'InsufficientReceivedBidAmount',
        args: [0n, requiredWei],
      });

      expect(getContractErrorMessage(err, 3.0)).toBe(
        'The current bid price is greater than the amount you transferred.',
      );
    });

    it('falls back when args[1] is not a bigint', () => {
      const err = createContractError({
        errorName: 'InsufficientReceivedBidAmount',
        args: [0, 'not-bigint'],
      });

      expect(getContractErrorMessage(err, 1.0)).toBe(
        'The current bid price is greater than the amount you transferred.',
      );
    });

    it('falls back when args is undefined', () => {
      const err = createContractError({
        errorName: 'InsufficientReceivedBidAmount',
        args: undefined,
      });

      expect(getContractErrorMessage(err, 1.0)).toBe(
        'The current bid price is greater than the amount you transferred.',
      );
    });

    it('falls back when args is empty', () => {
      const err = createContractError({
        errorName: 'InsufficientReceivedBidAmount',
        args: [],
      });

      expect(getContractErrorMessage(err, 1.0)).toBe(
        'The current bid price is greater than the amount you transferred.',
      );
    });

    it('falls back when outer error has no walk (name found via cause chain)', () => {
      const innerCause = new Error('revert');
      innerCause.name = 'ContractFunctionRevertedError';
      (innerCause as unknown as Record<string, unknown>).data = {
        errorName: 'InsufficientReceivedBidAmount',
        args: [0n, 2_000_000_000_000_000_000n],
      };

      const causeWithWalk = new Error('cause');
      (causeWithWalk as unknown as Record<string, unknown>).walk = (fn: (e: Error) => boolean) =>
        fn(innerCause) ? innerCause : causeWithWalk;

      const outerError = new Error('top');
      (outerError as unknown as Record<string, unknown>).cause = causeWithWalk;

      expect(getContractErrorMessage(outerError, 1.0)).toBe(
        'The current bid price is greater than the amount you transferred.',
      );
    });

    it('falls back when outer walk returns non-matching error (no data)', () => {
      const innerCause = new Error('revert');
      innerCause.name = 'ContractFunctionRevertedError';
      (innerCause as unknown as Record<string, unknown>).data = {
        errorName: 'InsufficientReceivedBidAmount',
        args: [0n, 2_000_000_000_000_000_000n],
      };

      const causeWithWalk = new Error('cause');
      (causeWithWalk as unknown as Record<string, unknown>).walk = (fn: (e: Error) => boolean) =>
        fn(innerCause) ? innerCause : causeWithWalk;

      const outerError = new Error('top');
      (outerError as unknown as Record<string, unknown>).walk = () => outerError;
      (outerError as unknown as Record<string, unknown>).cause = causeWithWalk;

      expect(getContractErrorMessage(outerError, 1.0)).toBe(
        'The current bid price is greater than the amount you transferred.',
      );
    });

    it('returns custom message when displayedEthPrice is not provided', () => {
      const err = createContractError({
        errorName: 'InsufficientReceivedBidAmount',
        args: [0n, 2_000_000_000_000_000_000n],
      });

      expect(getContractErrorMessage(err)).toBe(
        'The current bid price is greater than the amount you transferred.',
      );
    });

    it('returns custom message when displayedEthPrice is explicitly undefined', () => {
      const err = createContractError({
        errorName: 'InsufficientReceivedBidAmount',
        args: [0n, 2_000_000_000_000_000_000n],
      });

      expect(getContractErrorMessage(err, undefined)).toBe(
        'The current bid price is greater than the amount you transferred.',
      );
    });
  });
});

/* ------------------------------------------------------------------ */
/*  isContractRevertError – extra edge cases                          */
/* ------------------------------------------------------------------ */

describe('isContractRevertError – extended', () => {
  it('returns false for a TypeError', () => {
    expect(isContractRevertError(new TypeError('bad type'))).toBe(false);
  });

  it('returns false for a number', () => {
    expect(isContractRevertError(42)).toBe(false);
  });

  it('returns false for a boolean', () => {
    expect(isContractRevertError(true)).toBe(false);
  });

  it('returns true for an Error subclass with the correct name', () => {
    class CustomError extends Error {
      constructor() {
        super('custom');
        this.name = 'ContractFunctionExecutionError';
      }
    }
    expect(isContractRevertError(new CustomError())).toBe(true);
  });
});

/* ------------------------------------------------------------------ */
/*  reportError – non-Error value types & console branch coverage     */
/* ------------------------------------------------------------------ */

describe('reportError – extended coverage', () => {
  it('stringifies number errors via captureMessage', () => {
    const spy = jest.spyOn(console, 'error').mockImplementation(() => {});

    reportError(42);

    expect(mockedSentry.captureMessage).toHaveBeenCalledWith('42', {
      level: 'error',
    });
    expect(spy).toHaveBeenCalledWith(42);
    spy.mockRestore();
  });

  it('stringifies null via captureMessage', () => {
    const spy = jest.spyOn(console, 'error').mockImplementation(() => {});

    reportError(null);

    expect(mockedSentry.captureMessage).toHaveBeenCalledWith('null', {
      level: 'error',
    });
    spy.mockRestore();
  });

  it('stringifies undefined via captureMessage', () => {
    const spy = jest.spyOn(console, 'error').mockImplementation(() => {});

    reportError(undefined);

    expect(mockedSentry.captureMessage).toHaveBeenCalledWith('undefined', {
      level: 'error',
    });
    spy.mockRestore();
  });

  it('stringifies plain objects via captureMessage', () => {
    const spy = jest.spyOn(console, 'error').mockImplementation(() => {});

    reportError({ foo: 'bar' });

    expect(mockedSentry.captureMessage).toHaveBeenCalledWith('[object Object]', { level: 'error' });
    spy.mockRestore();
  });

  it('includes context tag for non-Error with context', () => {
    const spy = jest.spyOn(console, 'error').mockImplementation(() => {});

    reportError(404, 'api-call');

    expect(mockedSentry.captureMessage).toHaveBeenCalledWith('404', {
      level: 'error',
      tags: { context: 'api-call' },
    });
    expect(spy).toHaveBeenCalledWith('[api-call]', 404);
    spy.mockRestore();
  });

  it('omits tags when context is not provided for Error', () => {
    const spy = jest.spyOn(console, 'error').mockImplementation(() => {});
    const err = new Error('no context');

    reportError(err);

    expect(mockedSentry.captureException).toHaveBeenCalledWith(err, undefined);
    spy.mockRestore();
  });

  it('does not call captureException for non-Error values', () => {
    const spy = jest.spyOn(console, 'error').mockImplementation(() => {});

    reportError('just a string');

    expect(mockedSentry.captureException).not.toHaveBeenCalled();
    spy.mockRestore();
  });

  it('does not call captureMessage for Error values', () => {
    const spy = jest.spyOn(console, 'error').mockImplementation(() => {});

    reportError(new Error('real error'));

    expect(mockedSentry.captureMessage).not.toHaveBeenCalled();
    spy.mockRestore();
  });
});

/* ------------------------------------------------------------------ */
/*  getEthErrorMessage – additional edge-case branches                */
/* ------------------------------------------------------------------ */

describe('getEthErrorMessage – extended edge cases', () => {
  it('returns fallback when data.message is empty string (falsy)', () => {
    expect(getEthErrorMessage({ data: { message: '' } })).toBe('An error occurred');
  });

  it('returns fallback when data is null', () => {
    expect(getEthErrorMessage({ data: null })).toBe('An error occurred');
  });

  it('returns fallback when data.message is explicitly undefined', () => {
    expect(getEthErrorMessage({ data: { message: undefined } })).toBe('An error occurred');
  });

  it('returns fallback for boolean input', () => {
    expect(getEthErrorMessage(false)).toBe('An error occurred');
  });

  it('uses custom fallback when data exists but is not an object', () => {
    expect(getEthErrorMessage({ data: 42 }, 'Custom')).toBe('Custom');
  });

  it('returns the message even when code is also present', () => {
    const err = { code: -32603, data: { message: 'internal error' } };
    expect(getEthErrorMessage(err)).toBe('internal error');
  });
});
