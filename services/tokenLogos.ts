import { isAddress } from 'viem';

const IPFS_GATEWAY_ORIGIN = 'https://ipfs.io/ipfs/';

const TOKEN_LIST_URLS_BY_CHAIN: Record<number, string[]> = {
  42161: [
    'https://tokens.coingecko.com/arbitrum-one/all.json',
    'https://raw.githubusercontent.com/Uniswap/default-token-list/main/src/tokens/arbitrum.json',
  ],
};

const LOCAL_TOKEN_LOGO_OVERRIDES: Record<number, Record<string, TokenLogoMetadata>> = {
  42161: {
    '0x82af49447d8a07e3bd95bd0d56f35241523fbab1': {
      logoURI:
        'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/arbitrum/assets/0x82aF49447D8a07e3bd95BD0d56f35241523fBab1/logo.png',
      source: 'Trust Wallet',
    },
    '0xaf88d065e77c8cc2239327c5edb3a432268e5831': {
      logoURI:
        'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/arbitrum/assets/0xaf88d065e77c8cC2239327C5EDb3A432268e5831/logo.png',
      source: 'Trust Wallet',
    },
    '0xfd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9': {
      logoURI:
        'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/arbitrum/assets/0xFd086bC7CD5C481DCC9C85ebe478A1C0b69FCbb9/logo.png',
      source: 'Trust Wallet',
    },
    '0x912ce59144191c1204e64559fe8253a0e49e6548': {
      logoURI:
        'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/arbitrum/assets/0x912CE59144191C1204E64559FE8253a0e49E6548/logo.png',
      source: 'Trust Wallet',
    },
  },
};

interface TokenListToken {
  chainId?: number;
  address?: string;
  logoURI?: string;
}

interface TokenListResponse {
  tokens?: TokenListToken[];
}

export interface TokenLogoMetadata {
  logoURI: string;
  source: string;
}

interface ResolveTokenLogoOptions {
  chainId: number;
  address: string;
  fetchImpl?: typeof fetch;
}

type FetchInitWithNext = RequestInit & {
  next?: { revalidate?: number };
};

export function normalizeTokenLogoUrl(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  if (!trimmed) return null;

  if (trimmed.startsWith('ipfs://')) {
    const withoutProtocol = trimmed.replace(/^ipfs:\/\//, '').replace(/^ipfs\//, '');
    return withoutProtocol ? `${IPFS_GATEWAY_ORIGIN}${withoutProtocol}` : null;
  }

  try {
    const url = new URL(trimmed);
    return url.protocol === 'https:' || url.protocol === 'http:' ? url.toString() : null;
  } catch {
    return null;
  }
}

function normalizeAddress(address: string): string | null {
  return isAddress(address) ? address.toLowerCase() : null;
}

function normalizeLocalLogo(logo: TokenLogoMetadata | undefined): TokenLogoMetadata | null {
  const logoURI = normalizeTokenLogoUrl(logo?.logoURI);
  if (!logoURI) return null;
  return {
    logoURI,
    source: logo?.source || 'Local token metadata',
  };
}

function findLocalTokenLogo(chainId: number, address: string): TokenLogoMetadata | null {
  return normalizeLocalLogo(LOCAL_TOKEN_LOGO_OVERRIDES[chainId]?.[address]);
}

function findLogoInTokenList(
  list: TokenListResponse,
  chainId: number,
  address: string,
  source: string,
): TokenLogoMetadata | null {
  const token = list.tokens?.find(
    (item) => item.chainId === chainId && item.address?.toLowerCase() === address,
  );
  const logoURI = normalizeTokenLogoUrl(token?.logoURI);
  return logoURI ? { logoURI, source } : null;
}

async function fetchTokenListLogo({
  chainId,
  address,
  fetchImpl,
}: Required<ResolveTokenLogoOptions>): Promise<TokenLogoMetadata | null> {
  const urls = TOKEN_LIST_URLS_BY_CHAIN[chainId] ?? [];

  for (const url of urls) {
    try {
      const response = await fetchImpl(url, {
        headers: { Accept: 'application/json' },
        next: { revalidate: 60 * 60 * 24 },
      } as FetchInitWithNext);
      if (!response.ok) continue;

      const data = (await response.json()) as TokenListResponse;
      const logo = findLogoInTokenList(data, chainId, address, new URL(url).hostname);
      if (logo) return logo;
    } catch {
      continue;
    }
  }

  return null;
}

export async function resolveTokenLogo({
  chainId,
  address,
  fetchImpl = fetch,
}: ResolveTokenLogoOptions): Promise<TokenLogoMetadata | null> {
  const normalizedAddress = normalizeAddress(address);
  if (!normalizedAddress || !Number.isInteger(chainId)) return null;

  return (
    findLocalTokenLogo(chainId, normalizedAddress) ??
    (await fetchTokenListLogo({
      chainId,
      address: normalizedAddress,
      fetchImpl,
    }))
  );
}
