import type { BigNumberish } from '@ethersproject/bignumber'
import { formatUnits } from '@ethersproject/units'
import axios from "axios";
import { CHARITY_WALLET_ADDRESS, MARKETING_WALLET_ADDRESS, RAFFLE_WALLET_ADDRESS, STAKING_WALLET_CST_ADDRESS, STAKING_WALLET_RWLK_ADDRESS } from '../config/app';

const proxyUrl = "/api/proxy?url=";

const getAPIUrl = (url: string) => {
  return `${proxyUrl}${encodeURIComponent(url)}`;
};

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
export const convertTimestampToDateTime = (timestamp: any, showSecond: boolean = false) => {
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
  var seconds = ("0" + date_ob.getSeconds()).slice(-2);
  var result = `${month} ${date}, ${year} ${hours}:${minutes}`;
  if (showSecond) {
    result += `:${seconds}`;
  }
  return result;
};

export const formatSeconds = (seconds: any) => {
  if (seconds < 0) {
    return " ";
  }
  let minutes = Math.floor(seconds / 60);
  seconds = Math.floor(seconds % 60);
  let hours = Math.floor(minutes / 60);
  minutes = minutes % 60;
  let days = Math.floor(hours / 24);
  hours = hours % 24;
  let str = "";
  if (days) {
    str = days + 'd ';
  }
  if (hours || (str && (minutes || seconds))) {
    str += hours + 'h ';
  }
  if (minutes || (str && seconds)) {
    str += minutes + 'm ';
  }
  if (seconds) {
    str += seconds + 's';
  }
  return str === "" ? "0s" : str;
};

export const calculateTimeDiff = (timestamp: any) => {
  let seconds = Math.floor(Date.now() / 1000) - timestamp;
  if (seconds < 0) {
    return "";
  }
  let minutes = Math.floor(seconds / 60);
  seconds = Math.floor(seconds % 60);
  let hours = Math.floor(minutes / 60);
  minutes = minutes % 60;
  let days = Math.floor(hours / 24);
  hours = hours % 24;
  let str = "";
  if (days) {
    str = days + 'd ';
  }
  if (hours || (str && (minutes || seconds))) {
    str += hours + 'h ';
  }
  if (minutes || (str && seconds)) {
    str += minutes + 'm ';
  }
  if (seconds) {
    str += seconds + 's';
  }
  return str === "" ? "0s" : str;
};

export const formatEthValue = (value: number) => {
  if (!value) return '0 ETH';
  if (value < 10) return `${value.toFixed(4)} ETH`;
  return `${value.toFixed(2)} ETH`;
};

export const formatCSTValue = (value: number) => {
  if (!value) return '0 ETH';
  if (value < 10) return `${value.toFixed(4)} CST`;
  return `${value.toFixed(2)} CST`;
};

export async function getMetadata(url: string) {
  try {
    const { data: html } = await axios.get(getAPIUrl(url));

    // Extract title using a regex
    const titleMatch = html.match(/<title>(.*?)<\/title>/);
    const title = titleMatch ? titleMatch[1] : '';

    // Extract description using a regex
    const descriptionMatch = html.match(/<meta\s+name=["']description["']\s+content=["'](.*?)["']/i);
    const description = descriptionMatch ? descriptionMatch[1] : '';

    // Extract keywords using a regex
    const keywordsMatch = html.match(/<meta\s+name=["']keywords["']\s+content=["'](.*?)["']/i);
    const keywords = keywordsMatch ? keywordsMatch[1] : '';

    // Extract image using a regex for og:image
    const imageMatch = html.match(/<meta\s+property=["']og:image["']\s+content=["'](.*?)["']/i);
    const image = imageMatch ? imageMatch[1] : '';

    return {
      title,
      description,
      keywords,
      image,
    };
  } catch (error) {
    console.error('Error fetching metadata:', error);
    return null;
  }
}

export const isWalletAddress = (address: string) => {
  if (address === STAKING_WALLET_CST_ADDRESS) return "Staking CST Wallet";
  if (address === STAKING_WALLET_RWLK_ADDRESS)
    return "Staking RandomWalk Wallet";
  if (address === MARKETING_WALLET_ADDRESS) return "Marketing Wallet";
  if (address === RAFFLE_WALLET_ADDRESS) return "Raffle Wallet";
  if (address === CHARITY_WALLET_ADDRESS) return "Charity Wallet";
  return "";
};

