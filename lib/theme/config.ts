/** Stable preference IDs; palettes live in styles/themes.css and names in common.json. */
export const SITE_THEMES = ['midnight', 'classic-blue', 'aurora', 'nebula', 'ember'] as const;
export type SiteTheme = (typeof SITE_THEMES)[number];
export const DEFAULT_SITE_THEME: SiteTheme = 'midnight';
export const THEME_STORAGE_KEY = 'cosmic-signature-theme';
export const THEME_COOKIE_NAME = 'cs_theme';
export const THEME_CHANGE_EVENT = 'cosmic-signature:theme';

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
 */
export const THEME_INIT_SCRIPT = `(()=>{let t;try{t=document.cookie.split(';').map(p=>p.trim()).find(p=>p.startsWith('${THEME_COOKIE_NAME}='))?.slice(${THEME_COOKIE_NAME.length + 1})}catch{}const a=${JSON.stringify(SITE_THEMES)};if(!a.includes(t)){try{t=localStorage.getItem('${THEME_STORAGE_KEY}')}catch{}}document.documentElement.dataset.theme=a.includes(t)?t:'${DEFAULT_SITE_THEME}'})()`;
