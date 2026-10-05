/**
 * Token and record ids for display. A leaf module with no imports, so the
 * landing bundle can import it on its own (`@/utils/format/ids`) without
 * pulling in the whole formatting layer behind the `@/utils/format` entry,
 * which re-exports it for everyone else.
 */

/** Pads a numeric id with leading zeros for display ("#000123"). */
export const formatId = (id: number | string): string => `#${id.toString().padStart(6, '0')}`;
