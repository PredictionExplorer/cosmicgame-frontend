export interface EthProviderError extends Error {
  code: number;
  data?: { message?: string };
}

export function isEthProviderError(err: unknown): err is EthProviderError {
  return (
    typeof err === 'object' &&
    err !== null &&
    'code' in err &&
    typeof (err as Record<string, unknown>).code === 'number'
  );
}

export function isUserRejection(err: unknown): boolean {
  return isEthProviderError(err) && err.code === 4001;
}
