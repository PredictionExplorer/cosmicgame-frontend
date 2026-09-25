import {
  buildContracts,
  CONTRACT_ENTRY_IDS,
  contractEntryCopy,
} from '@/content/legal/contractRegistry';
import { protocolFacts } from '@/content/protocol-facts';

const copy = contractEntryCopy((key) => key);
const API = {
  CosmicGameAddr: protocolFacts.contractAddresses.proxy,
  CosmicTokenAddr: '0x2222222222222222222222222222222222222222',
  CosmicSignatureAddr: protocolFacts.contractAddresses.cosmicSignatureNft,
  RandomWalkAddr: protocolFacts.contractAddresses.randomWalkNft,
  CosmicDaoAddr: protocolFacts.contractAddresses.cosmicCouncil,
  CharityWalletAddr: protocolFacts.contractAddresses.publicGoodsVault,
  MarketingWalletAddr: protocolFacts.contractAddresses.outreachReserve,
  PrizesWalletAddr: protocolFacts.contractAddresses.allocationsWallet,
  StakingWalletCSTAddr: protocolFacts.contractAddresses.cosmicSignatureNftAnchoringWallet,
  StakingWalletRWalkAddr: '',
  ImplementationAddr: '0x7739148013777c485AD9f3d971e1005Eca686661',
};

describe('buildContracts', () => {
  it('lists the eleven verified contracts on Arbitrum One, whatever the indexer answers', () => {
    for (const api of [API, null]) {
      const contracts = buildContracts(api, copy, { verified: true });
      expect(contracts.map((contract) => contract.id)).toEqual(CONTRACT_ENTRY_IDS);
      expect(contracts.map((contract) => contract.address)).toEqual(
        expect.arrayContaining(Object.values(protocolFacts.contractAddresses)),
      );
    }
  });

  it('keeps a differing indexer address as drift, except the lagging implementation', () => {
    const contracts = buildContracts(API, copy, { verified: true });
    const byId = Object.fromEntries(contracts.map((contract) => [contract.id, contract]));
    expect(byId.cst?.address).toBe(protocolFacts.contractAddresses.cstToken);
    expect(byId.cst?.reported).toBe(API.CosmicTokenAddr);
    expect(byId.protocol?.reported).toBeUndefined();
    // An empty field is not drift, and the dashboard's pre-upgrade implementation is not either.
    expect(byId.rwalkAnchor?.reported).toBeUndefined();
    expect(byId.implementation?.reported).toBeUndefined();
  });

  it('lists what the indexer reports on another network, leaving out what it does not', () => {
    const contracts = buildContracts(API, copy, { verified: false });
    const byId = Object.fromEntries(contracts.map((contract) => [contract.id, contract]));
    expect(byId.cst?.address).toBe(API.CosmicTokenAddr);
    expect(byId.rwalkAnchor).toBeUndefined();
    expect(contracts.some((contract) => contract.reported)).toBe(false);
    expect(buildContracts(null, copy, { verified: false })).toEqual([]);
  });

  it('names each entry from its catalog copy', () => {
    const [protocol] = buildContracts(null, copy, { verified: true });
    expect(protocol).toMatchObject({
      name: 'entries.protocol.name',
      description: 'entries.protocol.description',
      category: 'core',
    });
  });
});
