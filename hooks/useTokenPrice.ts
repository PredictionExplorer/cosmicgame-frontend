import { useState, useEffect } from 'react';
import axios from 'axios';

import { reportError } from '../utils/errors';

/**
 * Fetches token USD price from CoinGecko. Use for ETH or other supported token IDs.
 * @param tokenId - CoinGecko token ID (default: 'ethereum')
 */
export function useTokenPrice(tokenId = 'ethereum'): number {
  const [marketPrice, setMarketPrice] = useState(0);
  useEffect(() => {
    const getMarketPrice = async () => {
      try {
        const res = await axios.get(
          `https://api.coingecko.com/api/v3/simple/price?ids=${tokenId}&vs_currencies=usd`,
        );
        setMarketPrice(res.data[tokenId].usd);
      } catch (error) {
        reportError(error, 'fetch token price');
      }
    };
    getMarketPrice();
  }, [tokenId]);
  return marketPrice;
}
