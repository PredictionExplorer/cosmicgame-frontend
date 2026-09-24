import type { Namespace } from '@/i18n/request';

/**
 * The message namespaces the embed layout serializes: everything an embed's
 * client tree reads (the chart's copy, tables, formats, error and tooltip
 * surfaces) and none of the dApp chrome (header, footer, wallet, search).
 * The i18n-scoping walker fails if an embed reaches a namespace missing here.
 */
export const EMBED_NAMESPACES = [
  'common',
  'errors',
  'formats',
  'statistics',
  'tables',
  'tooltips',
] as const satisfies readonly Namespace[];
