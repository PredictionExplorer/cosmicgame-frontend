import Link from 'next/link';

import { getExplorerUrl, convertTimestampToDateTime } from '@/utils';

/** Props for the NFT metadata display. */
export interface NFTMetadataProps {
  nft: {
    TimeStamp?: number;
    TxHash?: string;
    WinnerAddr?: string;
    CurOwnerAddr?: string;
    Seed?: string | number;
    RecordType?: number;
    RoundNum?: number;
    Staked?: boolean;
    WasUnstaked?: boolean;
  } | null;
}

/** Displays NFT metadata: minted date, winner, owner, seed, prize type, and staking eligibility. */
export function NFTMetadata({ nft }: NFTMetadataProps) {
  return (
    <>
      {nft?.TimeStamp && (
        <div className="mb-2">
          <span className="text-primary">Minted Date:</span>
          &nbsp;
          <a
            className="text-foreground"
            href={getExplorerUrl('tx', nft.TxHash!)}
            target="_blank"
            rel="noopener noreferrer"
          >
            {convertTimestampToDateTime(nft.TimeStamp)}
          </a>
        </div>
      )}
      <div className="mb-2">
        <span className="text-primary">Winner:</span>
        &nbsp;
        <Link href={`/user/${nft?.WinnerAddr ?? ''}`} className="text-white">
          <span className="font-mono">{nft?.WinnerAddr}</span>
        </Link>
      </div>
      <div className="mb-2">
        <span className="text-primary">Owner:</span>
        &nbsp;
        <Link href={`/user/${nft?.CurOwnerAddr ?? ''}`} className="text-white">
          <span className="font-mono">{nft?.CurOwnerAddr}</span>
        </Link>
      </div>
      <div className="mb-2 flex">
        <span className="text-primary">Seed:</span>
        &nbsp;
        <span className="font-mono inline-block break-words w-[32ch]">{nft?.Seed}</span>
      </div>
      <div className="mb-2">
        <span className="text-primary">Prize Type:</span>
        &nbsp;
        <span>
          {(() => {
            switch (nft?.RecordType) {
              case 1:
                return 'Raffle Winner';
              case 2:
                return 'Staking Winner';
              case 3:
                return (
                  <>
                    Round Winner (
                    <Link
                      href={`/prize/${nft?.RoundNum ?? 0}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-inherit"
                    >
                      Round #{nft?.RoundNum}
                    </Link>
                    )
                  </>
                );
              case 4:
                return 'Endurance Champion NFT Winner';
              default:
                return '';
            }
          })()}
        </span>
      </div>

      {!nft?.Staked && !nft?.WasUnstaked ? (
        <p className="text-[#0f0]">The token is eligible for staking.</p>
      ) : (
        <p className="text-[#f00]">The token has already been staked and cannot be staked again.</p>
      )}
    </>
  );
}
