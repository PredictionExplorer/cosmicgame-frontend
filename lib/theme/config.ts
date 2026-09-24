/** Stable preference IDs; palettes live in styles/themes.css and names in common.json. */
export const SITE_THEMES = ['midnight', 'classic-blue', 'aurora', 'nebula', 'ember'] as const;
export type SiteTheme = (typeof SITE_THEMES)[number];
export const DEFAULT_SITE_THEME: SiteTheme = 'midnight';
export const THEME_STORAGE_KEY = 'cosmic-signature-theme';
export const THEME_COOKIE_NAME = 'cs_theme';
export const THEME_CHANGE_EVENT = 'cosmic-signature:theme';

/**
 * Mobile browser chrome (`<meta name="theme-color">`) per palette: each
 * palette's `--background` as hex, so the toolbar blends into the page from
 * the first paint instead of flashing a colour of its own. The bootstrap
 * below writes it before paint; lib/theme/__tests__/config.test.ts checks
 * every entry against styles/themes.css.
 */
export const THEME_CHROME: Readonly<Record<SiteTheme, `#${string}`>> = {
  midnight: '#090a11',
  'classic-blue': '#0a0d24',
  aurora: '#0c1518',
  nebula: '#140f1a',
  ember: '#15110f',
};

export function isSiteTheme(value: unknown): value is SiteTheme {
  return typeof value === 'string' && SITE_THEMES.includes(value as SiteTheme);
}

export function themeFromCookie(cookie: string): SiteTheme | undefined {
  const value = cookie
    .split(';')
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${THEME_COOKIE_NAME}=`))
    ?.slice(THEME_COOKIE_NAME.length + 1);
  return isSiteTheme(value) ? value : undefined;
}

/** Share only with our own sibling hosts. Preview hosts and localhost stay host-only. */
export function themeCookieString(theme: SiteTheme, hostname: string, secure: boolean): string {
  const domain = ['cosmicsignature.com', 'cosmicsignature.local'].find(
    (base) => hostname === base || hostname.endsWith(`.${base}`),
  );
  return [
    `${THEME_COOKIE_NAME}=${theme}`,
    'Path=/',
    'Max-Age=31536000',
    'SameSite=Lax',
    ...(domain ? [`Domain=${domain}`] : []),
    ...(secure ? ['Secure'] : []),
  ].join('; ');
}

/**
 * Runs synchronously in the shared document head, before first paint. Reading
 * preferences here preserves static rendering and CDN caching on both hosts.
 * Only validated IDs can reach the DOM; no request data is interpolated.
 * The shared cookie wins over an older, origin-specific storage fallback.
 * It also points the browser-chrome colour at the chosen palette; the
 * viewport's `theme-color` meta precedes this script in the head.
 */
export const THEME_INIT_SCRIPT = `(()=>{let t;try{t=document.cookie.split(';').map(p=>p.trim()).find(p=>p.startsWith('${THEME_COOKIE_NAME}='))?.slice(${THEME_COOKIE_NAME.length + 1})}catch{}const a=${JSON.stringify(SITE_THEMES)};if(!a.includes(t)){try{t=localStorage.getItem('${THEME_STORAGE_KEY}')}catch{}}t=a.includes(t)?t:'${DEFAULT_SITE_THEME}';document.documentElement.dataset.theme=t;const c=${JSON.stringify(THEME_CHROME)}[t];try{document.querySelectorAll('meta[name="theme-color"]').forEach(m=>m.setAttribute('content',c))}catch{}})()`;
