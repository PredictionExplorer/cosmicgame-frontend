/**
 * PageShell classes that put a statistics or profile page on the site's one
 * content edge: the `site-container` width (`--gutter` each side, at most
 * 80rem), the header's and footer's edge at every viewport. Written as a
 * width utility rather than `site-container` so it replaces PageShell's own
 * `w-full`, `max-w-*` and side padding when the classes merge.
 */
export const SITE_EDGE_SHELL_CLASS = 'w-[min(100%-2*var(--gutter),80rem)] max-w-none px-0 sm:px-0';
