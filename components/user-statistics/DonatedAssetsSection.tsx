import { Button } from '@/components/ui/button';
import DonatedNFTTable from '@/components/donations/DonatedNFTTable';
import DonatedERC20Table from '@/components/donations/DonatedERC20Table';
import type { NFTRecord } from '@/components/donations/DonatedNFTTable';
import type { DonatedERC20Token } from '@/components/donations/DonatedERC20Table';

/** Props for the donated assets section. */
export interface DonatedAssetsSectionProps {
  unclaimedNFTs: NFTRecord[];
  claimedNFTs: NFTRecord[];
  donatedERC20: DonatedERC20Token[];
  loadingNFTs: boolean;
  loadingERC20: boolean;
  canClaim: boolean;
  isClaiming: boolean;
  claimingDonatedNFTs: number[];
  onClaimNFT?: (tokenID: number) => void;
  onClaimAllNFTs: () => void;
  onClaimERC20?: ((roundNum: number, tokenAddr: string, amount: string) => void) | null | undefined;
  onClaimAllERC20: () => void;
}

/** Donated NFTs and ERC20 tokens sections with claim buttons. */
export function DonatedAssetsSection({
  unclaimedNFTs,
  claimedNFTs,
  donatedERC20,
  loadingNFTs,
  loadingERC20,
  canClaim,
  isClaiming,
  claimingDonatedNFTs,
  onClaimNFT,
  onClaimAllNFTs,
  onClaimERC20,
  onClaimAllERC20,
}: DonatedAssetsSectionProps) {
  return (
    <>
      <div className="mt-16">
        <div className="flex justify-between items-center mb-4">
          <h6 className="text-xl font-medium">Donated NFTs User Won</h6>
          {unclaimedNFTs.length > 0 && canClaim && (
            <Button onClick={onClaimAllNFTs} disabled={isClaiming}>
              Claim All
            </Button>
          )}
        </div>
        {loadingNFTs ? (
          <h6 className="text-xl font-medium">Loading...</h6>
        ) : (
          <DonatedNFTTable
            list={[...unclaimedNFTs, ...claimedNFTs]}
            handleClaim={canClaim ? onClaimNFT : undefined}
            claimingTokens={claimingDonatedNFTs}
          />
        )}
      </div>

      <div className="mt-16">
        <div className="flex justify-between items-center mb-4">
          <h6 className="text-xl font-medium">Donated ERC20 Tokens</h6>
          {donatedERC20.filter((x) => !x.Claimed).length > 0 && canClaim && (
            <Button onClick={onClaimAllERC20}>Claim All</Button>
          )}
        </div>
        {loadingERC20 ? (
          <h6 className="text-xl font-medium">Loading...</h6>
        ) : (
          <DonatedERC20Table
            list={donatedERC20}
            handleClaim={canClaim ? (onClaimERC20 ?? null) : null}
          />
        )}
      </div>
    </>
  );
}
