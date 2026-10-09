import { SIGNATURE_PLATES, type SignaturePlateArt } from '@/components/reading/signaturePlates';

/**
 * The two Signatures the landing features, derived from the reading pages'
 * bundled plates (components/reading/signaturePlates.ts), the one record of
 * their verified seed, cycle, imprint time and preview. Bundled previews keep
 * first paint independent of API/media availability; provenance and
 * reproduction instructions live in public/images/landing/README.md.
 * `RoundNum` is the cycle each was imprinted in and `ImprintedAt` its imprint
 * transaction time in Unix seconds.
 */
function featured(plate: SignaturePlateArt & { imprintedAt: number }) {
  return {
    TokenId: plate.tokenId,
    Seed: plate.seed,
    RoundNum: plate.cycle,
    ImprintedAt: plate.imprintedAt,
    imageSrc: plate.src,
  } as const;
}

export const FEATURED_LANDING_ART = [
  featured(SIGNATURE_PLATES[23]),
  featured(SIGNATURE_PLATES[24]),
] as const;

export type FeaturedLandingArt = (typeof FEATURED_LANDING_ART)[number];
