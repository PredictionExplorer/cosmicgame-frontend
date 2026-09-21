# Theme system

Midnight is the default and keeps its ink-and-lavender palette. Classic Blue brings
back the original cyan-to-violet gradients over navy. Aurora pairs sea glass with
ice blue, Nebula pairs lilac with rose over violet ink, and Ember pairs champagne
with peach over warm charcoal. Saturation is concentrated in accents and soft
background light, leaving reading surfaces calm.

## Ownership

- `styles/themes.css` owns palette values and semantic aliases. Components use
  `background`, `card`, `popover`, `primary`, `secondary`, `muted`, and `border`
  rather than fixed interface colors. `data-palette` reuses the actual palette
  for each selector preview. Signature gradients interpolate in sRGB; their entire
  color range must meet the contrast requirement for both dark button labels and
  gradient text on dark surfaces. Atmospheric glows have separate saturated color
  tokens and a per-palette strength, so Midnight stays restrained. Static backdrop
  light remains visible with reduced motion. Status colors and artwork keep their
  own meaning.
- `lib/theme/config.ts` owns stable preference IDs, validation, cookie scope, and
  the synchronous bootstrap. `app/root-document.tsx` installs it for both hosts.
- `lib/theme/client.ts` updates the document and publishes changes through
  `useSyncExternalStore`. `components/theme/ThemeSync.tsx` handles navigation,
  restored pages, tab focus, and storage events.
- `components/theme/ThemeSwitcher.tsx` uses the shared Radix radio menu for arrow
  keys, typeahead, selected-state announcements, Escape, and focus return. Names
  and descriptions live in every locale's `common.json`.
- `components/layout/BrandMark.tsx` applies the primary color through an alpha mask
  of the original logo asset, preserving its geometry across every palette.
- The wallet theme consumes CSS variables directly. `components/three/scene-palette.ts`
  converts the same HSL values for WebGL; material changes preserve animation state.

## Persistence and rendering

The one-year `cs_theme` cookie is shared with `cosmicsignature.com` and its sibling
subdomains (and the equivalent local development hosts). Other preview hosts get
a host-only cookie. HTTPS adds `Secure`; all cookies use `SameSite=Lax` and `Path=/`.
An origin-local storage value provides a fallback when cookie access is blocked.
The shared cookie takes precedence so an older fallback cannot undo a choice made
on the other host. If writes fail, the current page retains its in-memory choice.

The head script reads only a validated preference before first paint. It does not
read server request state, so static pages remain prerendered and cacheable.
Hydration uses the default React snapshot while the document controls the palette.
Returning to another tab or host picks up its latest shared cookie.

## Extending and verifying

Add a stable ID in `SITE_THEMES`, its complete palette in `styles/themes.css`, and
names/descriptions to every locale's `common.json`. Keep data-series colors distinct
and body text, muted text, accents, and primary-button text at least WCAG AA 4.5:1.
Avoid a light palette without first auditing existing white foreground utilities.

Run `npm run i18n:check`, `npm run lint`, `npm run type-check`, the theme unit tests,
and `npx playwright test e2e/themes.spec.ts`. The browser suite covers both hosts,
all palettes, 320px/desktop layouts, keyboard and language changes, first paint
without hydration, and shared-cookie behavior across distinct origins. Its proxy
serves local responses without contacting the production site.
