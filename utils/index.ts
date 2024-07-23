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
  var date_ob = new Date(timestamp * 1000);
  var year = date_ob.getFullYear();
  var month = month_names[date_ob.getMonth()];
  var date = ("0" + date_ob.getDate()).slice(-2);
  var hours = ("0" + date_ob.getHours()).slice(-2);
  var minutes = ("0" + date_ob.getMinutes()).slice(-2);
  var result = `${month} ${date}, ${year} ${hours}:${minutes}`;
  return result;
};

export const formatSeconds = (seconds: any) => {
  if (seconds <= 0) {
    return " ";
  }
  let minutes = Math.ceil(seconds / 60);
  seconds = seconds % 60;
  let hours = Math.floor(minutes / 60);
  minutes = minutes % 60;
  let days = Math.floor(hours / 24);
  hours = hours % 24;
  let str = "";
  if (days) {
    str = days + (days === 1 ? " Day " : " Days ");
  }
  if (hours || str) {
    str += hours + (hours === 1 ? " Hour " : " Hours ");
  }
  if (minutes) {
    str += minutes + (minutes === 1 ? " Minute " : " Minutes ");
  }
  return str;
};

export const calculateTimeDiff = (timestamp: any) => {
  let seconds = Math.floor(Date.now() / 1000) - timestamp;
  if (seconds <= 0) {
    return "";
  }
  let minutes = Math.floor(seconds / 60);
  seconds = seconds % 60;
  let hours = Math.floor(minutes / 60);
  minutes = minutes % 60;
  let days = Math.floor(hours / 24);
  hours = hours % 24;
  let str = "";
  if (days) {
    str = days + (days === 1 ? " Day " : " Days ");
  }
  if (hours || str) {
    str += hours + (hours === 1 ? " Hour " : " Hours ");
  }
  if (minutes) {
    str += minutes + (minutes === 1 ? " Minute " : " Minutes ");
  }
  return str;
};

export const formatEthValue = (value: number) => {
  if (!value) return '';
  if (value < 10) return `${value.toFixed(4)} ETH`;
  return `${value.toFixed(1)} ETH`;
};

export const formatCSTValue = (value: number) => {
  if (value < 10) return `${value.toFixed(4)} CST`;
  return `${value.toFixed(1)} CST`;
};
