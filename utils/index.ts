import type { BigNumberish } from '@ethersproject/bignumber'
import { formatUnits } from '@ethersproject/units'

export function shortenHex(hex: string, length = 4) {
  if (hex) {
    return `${hex.substring(0, length + 2)}....${hex.substring(
      hex.length - length,
    )}`;
  }
  return "";
}

const ETHERSCAN_PREFIXES = {
  1: '',
  3: 'ropsten.',
  4: 'rinkeby.',
  5: 'goerli.',
  42: 'kovan.',
}

export function formatEtherscanLink(
  type: 'Account' | 'Transaction',
  data: [number, string],
) {
  switch (type) {
    case 'Account': {
      const [chainId, address] = data
      return `https://${ETHERSCAN_PREFIXES[chainId]}etherscan.io/address/${address}`
    }
    case 'Transaction': {
      const [chainId, hash] = data
      return `https://${ETHERSCAN_PREFIXES[chainId]}etherscan.io/tx/${hash}`
    }
  }
}

export const parseBalance = (
  value: BigNumberish,
  decimals = 18,
  decimalsToDisplay = 4,
) => parseFloat(formatUnits(value, decimals)).toFixed(decimalsToDisplay)

export const formatId = (id: number | string) => {
  return `#${id.toString().padStart(6, '0')}`
}

export const convertTimestampToDateTime = (timestamp: any) => {
  let month_names = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  let date_ob = new Date(timestamp * 1000);
  let month = month_names[date_ob.getMonth()];
  let date = ("0" + date_ob.getDate()).slice(-2);
  let hours = ("0" + date_ob.getHours()).slice(-2);
  let minutes = ("0" + date_ob.getMinutes()).slice(-2);
  let result = month + " " + date + ", " + hours + ":" + minutes;
  return result;
};

export const calculateTimeDiff = (timestamp: any, current: any) => {
  let seconds = current - timestamp;
  let minutes = Math.floor(seconds / 60);
  seconds = seconds % 60;
  let hours = Math.floor(minutes / 60);
  minutes = minutes % 60;
  let days = Math.floor(hours / 24);
  hours = hours % 24;
  let str = "";
  if (days) {
    str = ("0" + days).slice(-2) + " Days ";
  }
  if (hours || str) {
    str += ("0" + hours).slice(-2) + " Hours ";
  }
  if (minutes) {
    str += ("0" + minutes).slice(-2) + " Minutes ";
  }
  str += ("0" + seconds).slice(-2) + " Seconds";
  return str;
}
