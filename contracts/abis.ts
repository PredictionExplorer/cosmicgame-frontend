/**
 * Stable ABI barrel for the app.
 *
 * Values come from `contracts/generated.ts` (run `npm run contracts:generate`
 * after replacing any ABI JSON file). Exports are widened to viem's `Abi`
 * so existing call sites keep their current loosely-typed contract surface;
 * import from `contracts/generated` directly when you want fully literal
 * ABI types with compile-time method signature inference.
 */
import { type Abi } from 'viem';

import * as generated from './generated';

export const charityWalletAbi: Abi = generated.charityWalletAbi;
export const cosmicDaoAbi: Abi = generated.cosmicDaoAbi;
export const cosmicGameAbi: Abi = generated.cosmicGameAbi;
export const cosmicSignatureAbi: Abi = generated.cosmicSignatureAbi;
export const cosmicTokenAbi: Abi = generated.cosmicTokenAbi;
export const ethDonationsAbi: Abi = generated.ethDonationsAbi;
export const marketingWalletAbi: Abi = generated.marketingWalletAbi;
export const prizesWalletAbi: Abi = generated.prizesWalletAbi;
export const randomWalkNftAbi: Abi = generated.randomWalkNftAbi;
export const stakingWalletCstAbi: Abi = generated.stakingWalletCosmicSignatureNftAbi;
export const stakingWalletRwlkAbi: Abi = generated.stakingWalletRandomWalkNftAbi;
export const systemManagementAbi: Abi = generated.systemManagementAbi;
