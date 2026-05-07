import { protocolFacts } from '@/content/protocol-facts';

describe('protocolFacts', () => {
  it('matches deployed per-cycle NFT and CST imprint totals', () => {
    expect(protocolFacts.typicalNftsPerCycle).toBe(
      protocolFacts.roleNftsPerCycle + protocolFacts.stellarNftsPerCycle,
    );
    expect(protocolFacts.stellarNftsPerCycle).toBe(
      protocolFacts.nftStellarSelectionRecipients +
        protocolFacts.anchoredRwlkNftSelectionRecipients,
    );
    expect(protocolFacts.typicalCstImprintsPerCycle).toBe(
      protocolFacts.typicalNftsPerCycle * protocolFacts.specialAllocationCst +
        protocolFacts.outreachReserveCst,
    );
  });
});
