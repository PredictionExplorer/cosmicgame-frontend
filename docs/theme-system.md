# Theme system

Midnight is the default and keeps its ink-and-lavender palette. Classic Blue brings
back the original cyan-to-violet gradients over navy. Aurora pairs sea glass with
ice blue, Nebula pairs lilac with rose over violet ink, and Ember pairs champagne
with peach over warm charcoal. Saturation is concentrated in the accents, the soft
background light and the art itself, so reading surfaces stay calm.

Every token and utility these palettes feed is listed in
[design-system.md](design-system.md).

## Ownership

- `styles/themes.css` owns palette values and the tokens derived from them. Components use
  the semantic tokens (`background`, `surface`, `surface-raised`, `rule`, `primary`,
  `muted-foreground`, `subtle`, the status and data tokens) rather than fixed interface
  colours or white alpha. `data-palette` reuses the actual palette for each selector
  preview. Signature gradients interpolate in sRGB; their entire colour range must meet
  the contrast requirement for both dark button labels and gradient text on dark
  surfaces. Atmospheric glows have separate saturated colour tokens and a per-palette
  strength, so Midnight stays restrained.
- Each palette block defines the same raw tokens: page, surface ladder, three text tiers,
  accents, border and control boundary, glows and atmosphere strength. Status hues are
  shared defaults that a palette overrides only where a default sits within 30 degrees of
  its own accent (Aurora's positive, Ember's attention), so a state never reads as
  decoration. Data series are fixed across palettes, so a track keeps its colour
  everywhere. Artwork keeps its own colours and always sits on the pure black
  `--art-ground`.
- `lib/theme/config.ts` owns stable preference ids, validation, cookie scope, the
  synchronous bootstrap and `THEME_CHROME`, each palette's page colour as hex.
  `app/root-document.tsx` installs the bootstrap for both hosts.
- `lib/theme/client.ts` updates the document and publishes changes through
  `useSyncExternalStore`. `components/theme/ThemeSync.tsx` handles navigation,
  restored pages, tab focus, and storage events.
- `components/theme/ThemeSwitcher.tsx` uses the shared Radix radio menu for arrow
  keys, typeahead, selected-state announcements, Escape, and focus return. Names
  and descriptions live in every locale's `common.json`.
- `components/ui/ambient-backdrop.tsx` draws the palette's atmosphere: the glow gradient
  at the palette's strength (full on hero pages, 40% on data and long-form pages, none
  when the lights go down), and a static starfield in the palette's foreground colour on
  hero pages, kept to the gutters. It is pure CSS; there is no particle canvas.
- `components/layout/BrandMark.tsx` applies the primary colour through an alpha mask
  of the original logo asset, preserving its geometry across every palette.
- The wallet theme consumes CSS variables directly. Nothing draws with WebGL: the
  landing hero's atmosphere and starfield are the same static CSS as the app's.

## Persistence and rendering

The one-year `cs_theme` cookie is shared with `cosmicsignature.com` and its sibling
subdomains (and the equivalent local development hosts). Other preview hosts get
a host-only cookie. HTTPS adds `Secure`; all cookies use `SameSite=Lax` and `Path=/`.
An origin-local storage value provides a fallback when cookie access is blocked.
The shared cookie takes precedence so an older fallback cannot undo a choice made
on the other host. If writes fail, the current page retains its in-memory choice.

The head script reads only a validated preference before first paint. It does not
read server request state, so static pages remain prerendered and cacheable. The same
script writes the palette's `THEME_CHROME` colour into `<meta name="theme-color">`, so
the mobile browser toolbar matches the page from the first paint instead of flashing a
colour of its own; `applyTheme` repeats this after soft navigations and palette changes.
The static viewport and the PWA manifest use Midnight's page colour.
Hydration uses the default React snapshot while the document controls the palette.
Returning to another tab or host picks up its latest shared cookie.

## Extending and verifying

Add a stable id in `SITE_THEMES`, its complete palette block in `styles/themes.css` (every
raw token the other blocks declare), its entry in `THEME_CHROME`, and names and
descriptions in every locale's `common.json`. Keep text tokens at WCAG AA 4.5:1 and control
boundaries at 3:1 on background, card and popover, and keep status hues 30 degrees from
the new accent. `styles/__tests__/palette-contrast.test.ts` checks all of this for every
palette, and `lib/theme/__tests__/config.test.ts` checks `THEME_CHROME` against the
palette's background. Avoid a light palette until the remaining white foreground
utilities have migrated to tokens.

Run `npm run i18n:check`, `npm run lint`, `npm run type-check`, the theme and style unit
tests, and `npx playwright test e2e/themes.spec.ts`. The browser suite covers both hosts,
all palettes, 320px/desktop layouts, keyboard and language changes, first paint
without hydration, and shared-cookie behaviour across distinct origins. Its proxy
serves local responses without contacting the production site.
