/**
 * GET /api/supply/total
 *
 * Returns the current CST total supply (imprinted minus burned, exactly as
 * the token contract reports) as {"result":"<decimal string>"}, matching
 * CoinGecko's reference supply endpoint format.
 */
import { getSupplyValue, supplyErrorResponse, supplyResponse } from '../lib';

export const dynamic = 'force-dynamic';

export async function GET(): Promise<Response> {
  try {
    return supplyResponse(await getSupplyValue());
  } catch (error) {
    return supplyErrorResponse(error);
  }
}
