/**
 * Real Signatures bundled with the reading pages, so their art paints without
 * waiting for the collection API or the media server. Token ids, cycles and
 * seeds were verified against the public token API, and each preview is the
 * full artwork resized at its native ratio with no other change: provenance
 * and checksums are in public/images/learn/README.md (and, for #23 and #24,
 * public/images/landing/README.md).
 */
export interface SignaturePlateArt {
  tokenId: number;
  /** The cycle the token was imprinted in (the API's RoundNum). */
  cycle: number;
  seed: string;
  /** The bundled preview, served through the image optimizer. */
  src: string;
}

function plate(tokenId: number, cycle: number, seed: string, folder = 'learn'): SignaturePlateArt {
  return { tokenId, cycle, seed, src: `/images/${folder}/signature-${tokenId}.webp` };
}

export const SIGNATURE_PLATES = {
  2: plate(2, 0, 'adbf95ffe328567a552743028b0f8b204fe6ca747fdbce42ede267a8eee7bf0e'),
  3: plate(3, 0, '203581755eca174027d8d64b53dcb54d320fd2195fae1c7fbf152dfe83c69855'),
  7: plate(7, 0, 'ae7e4b937e44eddb5693b29148b6bd03f65417f7a363b60829a562ca2370ec0d'),
  9: plate(9, 0, '1362465d6ffe31bfc33a924a9406663e313cf417c35d8d4461e66db845d39903'),
  11: plate(11, 0, '55abfa5aa9c648d15d2f46ea2dc9ad640e32247e130962cf87604029da9c6982'),
  13: plate(13, 0, '8b834c15a096e3e2ba8ecaea21627117e104bb37f844f69648c0fdf9406d3457'),
  14: plate(14, 0, '18952be1a43822726d7920df20bc2e1a2be06c1f907a0dc80e7469e50be3ce4b'),
  22: plate(22, 0, '003108837490f9fd840a44e70590173c7f95340872f60eaa13482b4ecb8fb0a8'),
  23: plate(23, 0, '17d61f1c00e5d16c399a8e341e9feaea32b275e5426a4375394e74cc855affcc', 'landing'),
  24: plate(24, 1, '5084a87375896c7103ba17b57264f20de35d9e6eb545314680ad5e074dfc33ad', 'landing'),
  25: plate(25, 1, '6b273359fbc21c34f58a546c86a88b21c2bd307797e3c4959c5eccc8e326e4fd'),
  33: plate(33, 1, 'fecd05a4e7f537281200ed720a095da2d5d4db14867a37d2627ebdaa2d2ad1e6'),
  39: plate(39, 1, '56d7e21a3dd131a46f7541b0d4fc85faf7996a325f090d5f18d53d099cade7b8'),
  40: plate(40, 1, 'cdab48977fb18d3c9c46d1e9405c6342cdc58a500013fe856ffb142d31cef6dc'),
} as const satisfies Record<number, SignaturePlateArt>;

export type SignaturePlateId = keyof typeof SIGNATURE_PLATES;

const PLATES_BY_ID: ReadonlyMap<number, SignaturePlateArt> = new Map(
  Object.values(SIGNATURE_PLATES).map((art) => [art.tokenId, art]),
);

/** The bundled plate of a token, when there is one (content refers to plates by token id). */
export function signaturePlate(tokenId: number): SignaturePlateArt | undefined {
  return PLATES_BY_ID.get(tokenId);
}

/** The seed as printed on a wall label: its first and last characters. */
export function shortSeed(seed: string): string {
  // The word joiner after the ellipsis keeps the two halves on one line.
  return `${seed.slice(0, 6)}…\u2060${seed.slice(-4)}`;
}
