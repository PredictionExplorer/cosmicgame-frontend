import { getEnvValidation, REQUIRED_ENV_VARS } from '../networks';

const ORIGINAL_ENV = process.env;

function setValidEnv() {
  process.env = {
    ...ORIGINAL_ENV,
    NEXT_PUBLIC_NETWORK: 'mainnet',
    NEXT_PUBLIC_API_URL: 'https://api.example.com/api/cosmicgame/',
    NEXT_PUBLIC_RPC_URL: 'https://arb1.example-rpc.test',
    NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID: '054b2b65ef55a96e408a3c1e5d15953e',
  };
}

describe('network environment validation', () => {
  beforeEach(() => {
    setValidEnv();
  });

  afterEach(() => {
    process.env = ORIGINAL_ENV;
  });

  it('lists the WalletConnect project id as a required environment variable', () => {
    expect(REQUIRED_ENV_VARS).toEqual([
      'NEXT_PUBLIC_NETWORK',
      'NEXT_PUBLIC_API_URL',
      'NEXT_PUBLIC_RPC_URL',
      'NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID',
    ]);
  });

  it('accepts a complete network and wallet environment', () => {
    expect(getEnvValidation()).toEqual({ valid: true, missing: [] });
  });

  it('rejects a missing WalletConnect project id', () => {
    process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID = '';

    expect(getEnvValidation()).toEqual({
      valid: false,
      missing: ['NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID'],
    });
  });

  it('trims the WalletConnect project id before validating it', () => {
    process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID = '   ';

    expect(getEnvValidation().missing).toContain('NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID');
  });

  it('reports all required missing values at once', () => {
    process.env.NEXT_PUBLIC_NETWORK = '';
    process.env.NEXT_PUBLIC_API_URL = '';
    process.env.NEXT_PUBLIC_RPC_URL = '';
    process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID = '';

    expect(getEnvValidation()).toEqual({
      valid: false,
      missing: [
        'NEXT_PUBLIC_NETWORK',
        'NEXT_PUBLIC_API_URL',
        'NEXT_PUBLIC_RPC_URL',
        'NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID',
      ],
    });
  });

  it('preserves the existing invalid-network message while validating wallet config', () => {
    process.env.NEXT_PUBLIC_NETWORK = 'ethereum';

    expect(getEnvValidation()).toEqual({
      valid: false,
      missing: ['NEXT_PUBLIC_NETWORK (must be: local, sepolia, or mainnet)'],
    });
  });
});
