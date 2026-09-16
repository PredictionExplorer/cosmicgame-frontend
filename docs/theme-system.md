# Theme system

Midnight is the default. Classic Blue restores the original blue canvas and cyan
accent; Aurora, Nebula, and Ember add coordinated dark palettes.
Original Glass is an optional sixth choice that restores the complete palette and
glass treatment saved in `e58da429` (the same style sources as `b675472`): the indigo
atmosphere, cyan/violet glows, stars and constellations, translucent panel materials,
white text, light-blue secondary, original brand gradients/highlights, and glass
controls with white-label cyan-to-violet buttons.
It preserves the current page layout; Midnight remains the default.

Review screenshots use deterministic browser-test data:
[default Midnight](images/liquid-glass-default-comparison.png),
[Original Glass desktop](images/liquid-glass-desktop.png), and
[Original Glass mobile](images/liquid-glass-mobile.png), and a
[10-second desktop animation](images/liquid-glass-motion.mp4).

## Ownership

- `styles/themes.css` owns palette values and semantic aliases. Components use
  `background`, `card`, `popover`, `primary`, `secondary`, `muted`, and `border`
  rather than fixed interface colors. `data-palette` reuses the actual palette
  for each selector preview. Status colors and artwork keep their own meaning.
- `styles/liquid-glass-theme.css` applies the control material recovered from
  `b675472/styles/liquid-glass.css`, plus the saved Surface/Card and header materials,
  only below `data-theme="liquid-glass"`.
  Stable `cs-glass-control`, `cs-glass-static`, and `cs-glass-cta` hooks cover
  the original control roles: primary/outline/secondary buttons, grouped header
  navigation, ecosystem dock, language trigger, gesture-method choices and wallet
  controls. Ghost/text buttons and language-list rows do not gain blanket glass. Cards, artwork, destructive buttons, and page geometry
  keep their existing dimensions. The experimental route remains independent.
  `styles/tokens.css` falls back to each current palette unless the original preset
  supplies its fixed brand-color overrides; other schemes retain their current colors.
- `components/ui/ambient-backdrop.tsx` retains the current backdrop for existing
  themes and exposes the saved background layers for Original Glass. The home page
  uses the historical signature atmosphere under that preset. Explicit surface hooks
  apply the saved translucent materials to the current dashboard's panels without
  changing their layout. The existing app particle engine supplies moving stars on
  desktop; it remains disabled for coarse pointers, small screens and reduced motion.
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
Original Glass controls use saturation and contrast without blur; the saved panels
retain their separate translucent, blurred material.
The original horizontal CTA stops are `#06AEEC`, `#35C9FF`, and `#9C37FD`, with
white labels and the saved gloss. Reduced motion prevents movement while preserving
the static indigo atmosphere; reduced
transparency uses the original near-opaque indigo surface; print removes the material effects.

Run `npm run i18n:check`, `npm run lint`, `npm run type-check`, the theme unit tests,
and `npx playwright test e2e/themes.spec.ts`. The browser suite covers both hosts,
all palettes, 320px/desktop layouts, keyboard and language changes, first paint
without hydration, and shared-cookie behavior across distinct origins. Its proxy
serves local responses without contacting the production site.

Visual verification must also run with normal motion on a desktop: the app's
`#tsparticles canvas` should render changing frames. Reduced-motion screenshots alone
cannot verify the animated appearance. Keep the dashboard responsive beyond the
initial contract reads, then switch themes. This 2D app backdrop is independent of
the landing page's WebGL scene.

## Faithful-restoration contrast limitation

Original Glass deliberately preserves the saved colors, including the original
white-label CTA. White labels have approximately 2.54:1, 1.92:1, and 4.80:1 contrast at the
three original CTA stops, before gloss. The preset is therefore **not fully WCAG AA
contrast compliant**. Original saturated brand accents are likewise restored rather
than advertised as universally readable text colors.

Core palette text contrast remains checked, including compositing the original
68%-white muted text over each surface. A separately named expected-failure check
records the original CTA source-color AA shortfall. Review this tradeoff before
production rollout.
