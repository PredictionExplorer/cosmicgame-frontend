import { formatUnits } from 'viem';

type BigNumberish = bigint | string | number;

/** Shortens a hex string (e.g., address) for display. */
export function shortenHex(hex: string, length = 4): string {
  if (hex) {
    return `${hex.substring(0, length + 2)}....${hex.substring(hex.length - length)}`;
  }
  return '';
}

/** Parses wei/smallest-unit balance to a fixed-decimal string. */
export const parseBalance = (value: BigNumberish, decimals = 18, decimalsToDisplay = 4): string =>
  parseFloat(formatUnits(BigInt(value), decimals)).toFixed(decimalsToDisplay);

/** Pads numeric ID with leading zeros for display (e.g., #000123). */
export const formatId = (id: number | string): string => {
  return `#${id.toString().padStart(6, '0')}`;
};

/** Converts Unix timestamp to locale-style date string (e.g., "Jan 01, 12:34"). */
export const convertTimestampToDateTime = (
  timestamp: number,
  showSecond: boolean = false,
): string => {
  const month_names = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ];

  const date_ob = new Date(timestamp * 1000); // Convert to Date object
  const month = month_names[date_ob.getMonth()];
  const date = ('0' + date_ob.getDate()).slice(-2);
  const hours = ('0' + date_ob.getHours()).slice(-2);
  const minutes = ('0' + date_ob.getMinutes()).slice(-2);
  const seconds = ('0' + date_ob.getSeconds()).slice(-2);
  let result = `${month} ${date}, ${hours}:${minutes}`;

  if (showSecond) {
    result += `:${seconds}`;
  }

  return result;
};

/** Converts seconds into a human-readable duration string (e.g., "1d 2h 30m 45s"). */
export const formatSeconds = (seconds: number): string => {
  if (seconds < 0) return ' ';

  let minutes = Math.floor(seconds / 60);
  seconds = Math.floor(seconds % 60);
  let hours = Math.floor(minutes / 60);
  minutes = minutes % 60;
  let days = Math.floor(hours / 24);
  hours = hours % 24;

  let str = '';
  if (days) str += `${days}d `;
  if (hours || (str && (minutes || seconds))) str += `${hours}h `;
  if (minutes || (str && seconds)) str += `${minutes}m `;
  if (seconds) str += `${seconds}s`;

  return str || '0s';
};
/**
 * Calculates the difference between the current time and a given timestamp.
 * Returns the time difference in a human-readable format (e.g., "1d 2h 30m 45s").
 */
export const calculateTimeDiff = (timestamp: number): string => {
  const seconds = Math.floor(Date.now() / 1000) - timestamp;
  return seconds < 0 ? '' : formatSeconds(seconds);
};

/** Formats ETH for display: 4 decimals when < 10, else 2. */
export const formatEthValue = (value: number): string => {
  if (!value) return '0 ETH';
  return value < 10 ? `${value.toFixed(4)} ETH` : `${value.toFixed(2)} ETH`;
};

/** Formats CST for display: 4 decimals when < 10, else 2. */
export const formatCSTValue = (value: number): string => {
  if (!value) return '0 CST';
  return value < 10 ? `${value.toFixed(4)} CST` : `${value.toFixed(2)} CST`;
};
