# Featured Signature previews

These are optimized previews of real Cosmic Signature artworks. The landing page
bundles them so its first artwork appears without waiting for the collection API
or a remote media server. Token identifiers and seeds were verified against the
public API on 2026-09-05. Each response's `TokenInfo.TokenId` and `TokenInfo.Seed`
exactly matched the corresponding record in
`components/landing-v2/featured-art.ts`.

| Preview             | Token metadata                                                             | Original PNG                                                                                                                                     | Original bytes | Preview bytes |
| ------------------- | -------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ | -------------: | ------------: |
| `signature-23.webp` | [Signature #23](https://a1.cosmicsignature.com/api/cosmicgame/cst/info/23) | [Original #23](https://a1.cosmicsignature.com/images/new/cosmicsignature/0x17d61f1c00e5d16c399a8e341e9feaea32b275e5426a4375394e74cc855affcc.png) |      3,886,388 |        24,782 |
| `signature-24.webp` | [Signature #24](https://a1.cosmicsignature.com/api/cosmicgame/cst/info/24) | [Original #24](https://a1.cosmicsignature.com/images/new/cosmicsignature/0x5084a87375896c7103ba17b57264f20de35d9e6eb545314680ad5e074dfc33ad.png) |      5,509,752 |        29,736 |

Both originals measure 3456 × 2234 pixels. Both previews measure 960 × 621
pixels, preserve the full artwork and its aspect ratio, and use WebP quality 85.
Only resizing and encoding were applied; no artwork was generated, recolored,
retouched, or cropped.

To reproduce with the repository's `sharp` dependency, download each original
to a temporary file, then run the equivalent of:

```js
await sharp(originalPath)
  .resize({ width: 960, withoutEnlargement: true })
  .webp({ quality: 85 })
  .toFile(outputPath);
```

SHA-256 checksums of the downloaded originals:

```text
23: 4885d70d65e48f29b1eebab2494c4f6da950453babdac1ccc55c9a5f05778953
24: d24d31f9cf188d8fd23601c63a9c9f9dab0a803572888d12fea236e2968757e5
```

SHA-256 checksums of these previews:

```text
23: 8c01836730f569568ae1a771465fe269a076322e94586ead7dce324505dabf76
24: b444f532ef43599924737ed2fd29d7a43393a5db84c926e16a4fcb5568e083d9
```
