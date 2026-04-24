/**
 * Typed ABI re-exports.
 *
 * JSON imports lose their literal string types, so viem can't infer exact
 * method signatures. The `as const` assertion doesn't work on import
 * bindings. These re-exports give each ABI a stable identity for useMemo
 * deps and provide a single import point.
 *
 * Contract reads/writes return `unknown` instead of `any`, forcing call
 * sites to explicitly narrow types -- preventing bugs like BigInt mixing.
 *
 * Future: use @wagmi/cli to generate fully typed ABI constants from
 * Solidity, which would give compile-time method signature inference.
 */
import { type Abi } from 'viem';

import charityWalletJson from './CharityWallet.json';
import cosmicDaoJson from './CosmicDAO.json';
import cosmicGameJson from './CosmicGame.json';
import cosmicSignatureJson from './CosmicSignature.json';
import cosmicTokenJson from './CosmicToken.json';
import ethDonationsJson from './EthDonations.json';
import prizesWalletJson from './PrizesWallet.json';
import randomWalkNftJson from './RandomWalkNFT.json';
import stakingWalletCstJson from './StakingWalletCosmicSignatureNft.json';
import stakingWalletRwlkJson from './StakingWalletRandomWalkNft.json';
import systemManagementJson from './SystemManagement.json';

function asAbi(json: unknown): Abi {
  return json as Abi;
}

export const charityWalletAbi = asAbi(charityWalletJson);
export const cosmicDaoAbi = asAbi(cosmicDaoJson);
export const cosmicGameAbi = asAbi(cosmicGameJson);
export const cosmicSignatureAbi = asAbi(cosmicSignatureJson);
export const cosmicTokenAbi = asAbi(cosmicTokenJson);
export const ethDonationsAbi = asAbi(ethDonationsJson);
export const prizesWalletAbi = asAbi(prizesWalletJson);
export const randomWalkNftAbi = asAbi(randomWalkNftJson);
export const stakingWalletCstAbi = asAbi(stakingWalletCstJson);
export const stakingWalletRwlkAbi = asAbi(stakingWalletRwlkJson);
export const systemManagementAbi = asAbi(systemManagementJson);
