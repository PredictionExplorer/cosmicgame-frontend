export const CST_TOKEN_ADDRESS_ARBITRUM = '0xAD91843e6A58Ba560F577E676986AFb1dba6FBA0';

export const CST_UNISWAP_SWAP_URL = `https://app.uniswap.org/swap?chain=arbitrum&inputCurrency=NATIVE&outputCurrency=${CST_TOKEN_ADDRESS_ARBITRUM}`;

/**
 * Uniswap v4's PoolManager on Arbitrum One. One contract holds the liquidity
 * of every v4 pool, the CST/ETH pool included (config/geckoterminal), so its
 * CST balance is the pool's liquidity, never a participant's holding.
 */
export const UNISWAP_V4_POOL_MANAGER_ARBITRUM = '0x360E68faCcca8cA495c1B759Fd9EEe466db9FB32';
