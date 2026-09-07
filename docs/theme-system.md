# Theme system

Midnight is the default. Classic Blue restores the original blue canvas and cyan
accent; Aurora, Nebula, and Ember add coordinated dark palettes.

## Ownership

- `styles/themes.css` owns palette values and semantic aliases. Components use
  `background`, `card`, `popover`, `primary`, `secondary`, `muted`, and `border`
  rather than fixed interface colors. `data-palette` reuses the actual palette
  for each selector preview. Status colors and artwork keep their own meaning.
- `lib/theme/config.ts` owns stable preference IDs, validation, cookie scope, and
  the synchronous bootstrap. `app/root-document.tsx` installs it for both hosts.
- `lib/theme/client.ts` updates the document and publishes changes through
  `useSyncExternalStore`. `components/theme/ThemeSync.tsx` handles navigation,
  restored pages, tab focus, and storage events.
- `components/theme/ThemeSwitcher.tsx` uses the shared Radix radio menu for arrow
  keys, typeahead, selected-state announcements, Escape, and focus return. Names
  and descriptions live in every locale's `common.json`.
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
