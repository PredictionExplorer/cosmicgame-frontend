/**
 * GET /api/supply/circulating
 *
 * Returns the current CST circulating supply as {"result":"<decimal string>"},
 * matching CoinGecko's reference supply endpoint format. Circulating supply
 * equals total supply: CST has no team allocation, no vesting, and no locked
 * balances, and the Outreach Reserve's balance counts as circulating.
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
