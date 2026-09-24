import { TxRevertedError, classifyTxError, errorChain } from '../txErrors';

/** A viem-style error: name, shortMessage, optional cause. */
function viemError(name: string, shortMessage: string, cause?: unknown, extra = {}) {
  return Object.assign(new Error(`${shortMessage}\n\nRequest Arguments: …\nVersion: viem@2`), {
    name,
    shortMessage,
    cause,
    ...extra,
  });
}

describe('classifyTxError', () => {
  it('treats a dismissed wallet prompt as a rejection, whatever wraps it', () => {
    const inner = Object.assign(new Error('User rejected the request.'), {
      name: 'UserRejectedRequestError',
      code: 4001,
    });
    const err = viemError('TransactionExecutionError', 'User rejected the request.', inner);
    expect(classifyTxError(err)).toMatchObject({ kind: 'rejected' });
  });

  it('recognises a balance that cannot cover value plus gas', () => {
    const inner = viemError(
      'InsufficientFundsError',
      'The total cost (gas * gas fee + value) of executing this transaction exceeds the balance of the account.',
    );
    const err = viemError('ContractFunctionExecutionError', 'Execution reverted', inner);
    expect(classifyTxError(err)).toMatchObject({
      kind: 'insufficient-funds',
      name: 'InsufficientFundsError',
    });
  });

  it('recognises the node wording for insufficient funds without a typed error', () => {
    expect(classifyTxError(new Error('insufficient funds for gas * price + value'))).toMatchObject({
      kind: 'insufficient-funds',
    });
  });

  it('prefers the precise wrong-network cause over the generic revert wrapper', () => {
    const inner = viemError(
      'ChainMismatchError',
      'The current chain of the wallet (id: 1) does not match the target chain (id: 42161).',
    );
    const err = viemError('ContractFunctionExecutionError', 'Execution reverted', inner);
    expect(classifyTxError(err)).toMatchObject({
      kind: 'wrong-network',
      name: 'ChainMismatchError',
    });
  });

  it.each([
    'ConnectorNotConnectedError',
    'ConnectorAccountNotFoundError',
    'AccountNotFoundError',
    'ProviderDisconnectedError',
  ])('maps %s to a missing wallet', (name) => {
    expect(classifyTxError(viemError(name, 'Connector not connected.'))).toMatchObject({
      kind: 'wallet-not-connected',
    });
  });

  it('recognises a wallet that already has a request open (-32002)', () => {
    const err = { code: -32002, message: 'Request of type eth_sendTransaction already pending' };
    expect(classifyTxError(err)).toMatchObject({ kind: 'wallet-busy' });
  });

  it('separates an on-chain revert from a simulation that would revert', () => {
    expect(classifyTxError(new TxRevertedError('0xabc'))).toMatchObject({ kind: 'reverted' });

    const inner = viemError(
      'ContractFunctionRevertedError',
      'The contract function reverted.',
      undefined,
      {
        data: { errorName: 'MainPrizeEarlyClaim' },
        reason: 'too early',
      },
    );
    const info = classifyTxError(viemError('ContractFunctionExecutionError', 'reverted', inner));
    expect(info).toMatchObject({ kind: 'would-revert', contractErrorName: 'MainPrizeEarlyClaim' });
    expect(info.details).toContain('reason: too early');
    expect(info.details).toContain('contract error: MainPrizeEarlyClaim');
  });

  it('reports a receipt that did not arrive in time', () => {
    const err = viemError('WaitForTransactionReceiptTimeoutError', 'Timed out while waiting');
    expect(classifyTxError(err)).toMatchObject({ kind: 'timeout' });
  });

  it('reports an unreachable RPC as a network failure', () => {
    const err = viemError('HttpRequestError', 'HTTP request failed.');
    expect(classifyTxError(err)).toMatchObject({ kind: 'network' });
  });

  it('falls back to unknown, keeping a copyable one-line-per-error summary', () => {
    const err = viemError('SomethingNewError', 'Something odd happened', new Error('root cause'));
    const info = classifyTxError(err);
    expect(info.kind).toBe('unknown');
    expect(info.details.split('\n')).toEqual([
      'SomethingNewError: Something odd happened',
      'Error: root cause',
    ]);
  });

  it('survives cyclic cause chains and non-error values', () => {
    const a: { name: string; cause?: unknown } = { name: 'A' };
    const b = { name: 'B', cause: a };
    a.cause = b;
    expect(errorChain(a)).toHaveLength(2);
    expect(classifyTxError('plain string').kind).toBe('unknown');
    expect(classifyTxError(null).kind).toBe('unknown');
  });
});
