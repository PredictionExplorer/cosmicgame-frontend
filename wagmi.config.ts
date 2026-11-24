import { defineConfig } from '@wagmi/cli';
import { parseAbi, type Abi } from 'viem';

import charityWalletAbi from './contracts/CharityWallet.json';
import cosmicDaoAbi from './contracts/CosmicDAO.json';
import cosmicGameAbi from './contracts/CosmicGame.json';
import cosmicGameV4Abi from './contracts/CosmicGameV4.json';
import cosmicSignatureArtAuctionAbi from './contracts/CosmicSignatureArtAuction.json';
import cosmicSignatureAbi from './contracts/CosmicSignature.json';
import cosmicTokenAbi from './contracts/CosmicToken.json';
import ethDonationsAbi from './contracts/EthDonations.json';
import marketingWalletAbi from './contracts/MarketingWallet.json';
import prizesWalletAbi from './contracts/PrizesWallet.json';
import randomWalkNftAbi from './contracts/RandomWalkNFT.json';
import stakingWalletCosmicSignatureNftAbi from './contracts/StakingWalletCosmicSignatureNft.json';
import stakingWalletRandomWalkNftAbi from './contracts/StakingWalletRandomWalkNft.json';
import systemManagementAbi from './contracts/SystemManagement.json';

// JSON imports lose literal types; the generated output restores them.
// CosmicDAO ships as a human-readable ABI, so it goes through parseAbi.
export default defineConfig({
  out: 'contracts/generated.ts',
  contracts: [
    { name: 'CharityWallet', abi: charityWalletAbi as Abi },
    { name: 'CosmicDao', abi: parseAbi(cosmicDaoAbi as string[]) },
    { name: 'CosmicGame', abi: cosmicGameAbi as Abi },
    // V4 (in development): only the additions over the V3 game ABI, used at
    // the same proxy address. Folded into CosmicGame.json when V4 ships.
    { name: 'CosmicGameV4', abi: cosmicGameV4Abi as Abi },
    { name: 'CosmicSignatureArtAuction', abi: cosmicSignatureArtAuctionAbi as Abi },
    { name: 'CosmicSignature', abi: cosmicSignatureAbi as Abi },
    { name: 'CosmicToken', abi: cosmicTokenAbi as Abi },
    { name: 'EthDonations', abi: ethDonationsAbi as Abi },
    { name: 'MarketingWallet', abi: marketingWalletAbi as Abi },
    { name: 'PrizesWallet', abi: prizesWalletAbi as Abi },
    { name: 'RandomWalkNft', abi: randomWalkNftAbi as Abi },
    { name: 'StakingWalletCosmicSignatureNft', abi: stakingWalletCosmicSignatureNftAbi as Abi },
    { name: 'StakingWalletRandomWalkNft', abi: stakingWalletRandomWalkNftAbi as Abi },
    { name: 'SystemManagement', abi: systemManagementAbi as Abi },
  ],
});
