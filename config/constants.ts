/** Interval between data polling cycles (12 seconds). */
export const DATA_POLL_INTERVAL_MS = 12_000;

/** Interval between statistics page polling cycles (5 seconds). */
export const STATS_POLL_INTERVAL_MS = 5_000;

/** Interval between header data polling cycles (30 seconds). */
export const HEADER_POLL_INTERVAL_MS = 30_000;

/** Duration before a notification is automatically hidden (5 seconds). */
export const NOTIFICATION_AUTO_HIDE_MS = 5_000;

/** Gas limit for bid transactions. */
export const GESTURE_GAS_LIMIT = 30_000_000n;

/** ERC-165 interface identifier for ERC-721. */
export const ERC721_INTERFACE_ID = '0x80ac58cd' as const;
