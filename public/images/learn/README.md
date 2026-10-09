# Signature plates for the reading pages

Optimized previews of real Cosmic Signature artworks, bundled so the art on the
About page, the Learn guides and the white paper paints without waiting for the
collection API or a remote media server. The token registry is
`components/reading/signaturePlates.ts`; #23 and #24 reuse the landing previews
in `public/images/landing/` (see its README).

Token identifiers, cycles and seeds were verified against the public token API
(`https://a1.cosmicsignature.com/api/cosmicgame/cst/info/<id>`) on 2026-09-24.
Each original is the token's published PNG,
`https://a1.cosmicsignature.com/images/new/cosmicsignature/0x<seed>.png`.

| Preview             | Token | Cycle | Original bytes | Preview bytes |
| ------------------- | ----: | ----: | -------------: | ------------: |
| `signature-2.webp`  |     2 |     0 |      5,123,346 |        57,682 |
| `signature-3.webp`  |     3 |     0 |      5,941,915 |        40,674 |
| `signature-7.webp`  |     7 |     0 |      4,436,656 |        76,332 |
| `signature-9.webp`  |     9 |     0 |      6,656,429 |        66,846 |
| `signature-11.webp` |    11 |     0 |     11,934,441 |        75,180 |
| `signature-13.webp` |    13 |     0 |     14,776,344 |        82,796 |
| `signature-14.webp` |    14 |     0 |      5,241,985 |        45,674 |
| `signature-22.webp` |    22 |     0 |      4,386,969 |        46,930 |
| `signature-25.webp` |    25 |     1 |      7,173,643 |        53,968 |
| `signature-33.webp` |    33 |     1 |      7,487,870 |        64,820 |
| `signature-39.webp` |    39 |     1 |      5,317,126 |        46,628 |
| `signature-40.webp` |    40 |     1 |     10,596,747 |        85,794 |

Every original measures 3456 × 2234 pixels. Every preview measures 1600 × 1034
pixels, preserves the full artwork and its aspect ratio, and uses WebP quality 82. Only resizing and encoding were applied; no artwork was generated,
recolored, retouched or cropped. The previews are wider than the landing's
(960px) because the reading pages show them up to about 60rem wide, and the
image optimizer serves each viewer a smaller rendition.

To reproduce with the repository's `sharp` dependency, download each original
to a temporary file, then run the equivalent of:

```js
await sharp(originalPath)
  .resize({ width: 1600, withoutEnlargement: true })
  .webp({ quality: 82 })
  .toFile(outputPath);
```

SHA-256 checksums of the downloaded originals:

```text
2:  05000c845429b545747ecef594ac289845d4ebedca2d12851cfdc6b624883644
3:  559021403a427f42ae7d512898764bf8f1742cec098aed5ea73ff525575956a1
7:  557046b46b5b64b2aac2952238c8f9f7e6018d8dca24a6a53a49f271065ce245
9:  37c0867a9246de2316bba9eec0864a0d7aa521c1eb2c82085af2eeeee77c047a
11: 89c390ca1aeead73188be4d34a0b2aceaf94194438bc1c538d16e4594a74dea0
13: 79cf4121fc87d0e5738b736792bda30050cccc6a3bcd80cf94ac0dabf47f751e
14: 618614143448902c2e764a9b471d9d817aee484680e0cea828f43a7163d04130
22: 2249238d5e0a6e6e46fbbc4b761c5711f9cb6398aee89e2500c381a47264e0db
25: 564982cc23cad7cdc6c391e71d6913f32aba588648fa43f817e02d6f79fb039b
33: a007f7d30c53610d04fd10ac397fd66f1b56ce6c9e1a0a5f3325159c94e633d1
39: 989967798f63ad090f907c684b3c472c7f46f0a0b49aae984bfda28fdcd3b6ef
40: f51766fb9e5a6b3cb51e2567a5634388a58b4825cfd0690d2d6b10240738007a
```

SHA-256 checksums of these previews:

```text
2:  a9a90e4bf1034698169fb2efc71039f5e761375c97ca887336cafc8233152394
3:  4ee91ef2f633aac6ee41b88a9573acd762ada93ba20bd43d6c99c47fa886826f
7:  794b935129ba26fe946827ffa11f222a3ba10648e56b29aa94f0af045af3b7b6
9:  b4716b696bb8273c3c569fb71e99b159b960632ce006234ff348573b08b6bcb1
11: a20e5c3714acfb4614569dbf2847db315455d82bd0e6ef963b182e54961e9fa3
13: e606066ee5ae69c78c5e7f33a4bd18550bfbf4c5cda0157973d80a2956359cb1
14: b96d1d2fcf3db33633c807969716c437a81aa7f7f4e2db9f11cf24dd9b9628d1
22: 09f653e0db77a2baaf0061cdf492c4fd48fabb89af868b7361b8b8422a2a6112
25: a8bc02f240ff741e0ec614372cd6ccd2e2c1f3767068a629547f13a41a28ba92
33: b7423d6ff76cc6c66498a1ba9df74e722b499b09dc26481afd2d1002e6d6792c
39: 1b4446ad1f839de9eea7cc9f56d7e962c9ffbc9fbf6f7a555bd573e6400fd565
40: cb91b721c42933e77574b0f5296cf12648cce0e6e3733341f21007cae039cb14
```
