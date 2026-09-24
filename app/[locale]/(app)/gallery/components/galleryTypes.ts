/** The indexer fields the gallery reads from each Cosmic Signature record. */
export interface GalleryNFTData {
  TokenId: number;
  Seed?: string | number;
  TokenName?: string;
  RoundNum?: number;
  /** Anchored right now (the indexer's field name). */
  Staked?: boolean;
  MintTimeStamp?: number;
  /** Imprint transaction time; the list API ships this rather than `MintTimeStamp`. */
  TimeStamp?: number;
}
