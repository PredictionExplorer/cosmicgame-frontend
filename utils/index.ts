import type { BigNumberish } from '@ethersproject/bignumber';
import { formatUnits } from '@ethersproject/units';
import axios from "axios";
import { 
  CHARITY_WALLET_ADDRESS, 
  MARKETING_WALLET_ADDRESS, 
  RAFFLE_WALLET_ADDRESS, 
  STAKING_WALLET_CST_ADDRESS, 
  STAKING_WALLET_RWLK_ADDRESS 
} from '../config/app';

const proxyUrl = "/api/proxy?url=";

// Helper function to construct the API URL with proxy and URL encoding
const getAPIUrl = (url: string): string => {
  return `${proxyUrl}${encodeURIComponent(url)}`;
};

// Shortens a hexadecimal string (e.g., Ethereum address) to a specified length for display
export function shortenHex(hex: string, length = 4): string {
  if (hex) {
    return `${hex.substring(0, length + 2)}....${hex.substring(hex.length - length)}`;
  }
  return "";
}

// Parses a balance from a BigNumberish value, formatting it with the specified number of decimals to display
export const parseBalance = (
  value: BigNumberish,
  decimals = 18,
  decimalsToDisplay = 4
): string => parseFloat(formatUnits(value, decimals)).toFixed(decimalsToDisplay);

// Formats a numeric ID by padding it with leading zeros (e.g., #000123)
export const formatId = (id: number | string): string => {
  return `#${id.toString().padStart(6, '0')}`;
};

// Converts a Unix timestamp to a human-readable date string (e.g., "Jan 01, 12:34")
export const convertTimestampToDateTime = (
  timestamp: number,
  showSecond: boolean = false
): string => {
  const month_names = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
  ];

  const date_ob = new Date(timestamp * 1000); // Convert to Date object
  const month = month_names[date_ob.getMonth()];
  const date = ("0" + date_ob.getDate()).slice(-2);
  const hours = ("0" + date_ob.getHours()).slice(-2);
  const minutes = ("0" + date_ob.getMinutes()).slice(-2);
  const seconds = ("0" + date_ob.getSeconds()).slice(-2);
  let result = `${month} ${date}, ${hours}:${minutes}`;

  if (showSecond) {
    result += `:${seconds}`;
  }

  return result;
};

// Converts seconds into a human-readable format (e.g., "1d 2h 30m 45s")
export const formatSeconds = (seconds: number): string => {
  if (seconds < 0) return " ";
  
  let minutes = Math.floor(seconds / 60);
  seconds = Math.floor(seconds % 60);
  let hours = Math.floor(minutes / 60);
  minutes = minutes % 60;
  let days = Math.floor(hours / 24);
  hours = hours % 24;

  let str = "";
  if (days) str += `${days}d `;
  if (hours || (str && (minutes || seconds))) str += `${hours}h `;
  if (minutes || (str && seconds)) str += `${minutes}m `;
  if (seconds) str += `${seconds}s`;

  return str || "0s";
};
/**
 * Calculates the difference between the current time and a given timestamp.
 * Returns the time difference in a human-readable format (e.g., "1d 2h 30m 45s").
 * 
 * @param timestamp - The timestamp to compare against, in seconds.
 * @returns A string representing the time difference, e.g., "1d 2h 30m 45s".
 */
export const calculateTimeDiff = (timestamp: number): string => {
  // Calculate the difference in seconds between now and the given timestamp
  let seconds = Math.floor(Date.now() / 1000) - timestamp;
  
  // If the timestamp is in the future, return an empty string
  if (seconds < 0) {
    return "";
  }

  // Calculate the difference in minutes, hours, and days
  let minutes = Math.floor(seconds / 60);
  seconds = Math.floor(seconds % 60);
  let hours = Math.floor(minutes / 60);
  minutes = minutes % 60;
  let days = Math.floor(hours / 24);
  hours = hours % 24;

  // Construct the string to represent the time difference
  let str = "";
  if (days) {
    str = `${days}d `;
  }
  if (hours || (str && (minutes || seconds))) {
    str += `${hours}h `;
  }
  if (minutes || (str && seconds)) {
    str += `${minutes}m `;
  }
  if (seconds) {
    str += `${seconds}s`;
  }

  // Return the time difference, defaulting to "0s" if no time is calculated
  return str === "" ? "0s" : str;
};


// Formats a given ETH value into a user-friendly string, displaying the value with either 2 or 4 decimal places
export const formatEthValue = (value: number): string => {
  if (!value) return '0 ETH';
  return value < 10 ? `${value.toFixed(4)} ETH` : `${value.toFixed(2)} ETH`;
};

// Formats a given CST value into a user-friendly string, displaying the value with either 2 or 4 decimal places
export const formatCSTValue = (value: number): string => {
  if (!value) return '0 CST';
  return value < 10 ? `${value.toFixed(4)} CST` : `${value.toFixed(2)} CST`;
};

// Fetches metadata (title, description, keywords, image) from a given URL
export async function getMetadata(url: string) {
  try {
    const { data: html } = await axios.get(getAPIUrl(url));

    // Extract metadata from the HTML content using regex
    const titleMatch = html.match(/<title>(.*?)<\/title>/);
    const title = titleMatch ? titleMatch[1] : '';

    const descriptionMatch = html.match(/<meta\s+name=["']description["']\s+content=["'](.*?)["']/i);
    const description = descriptionMatch ? descriptionMatch[1] : '';

    const keywordsMatch = html.match(/<meta\s+name=["']keywords["']\s+content=["'](.*?)["']/i);
    const keywords = keywordsMatch ? keywordsMatch[1] : '';

    const imageMatch = html.match(/<meta\s+property=["']og:image["']\s+content=["'](.*?)["']/i);
    const image = imageMatch ? imageMatch[1] : '';

    return { title, description, keywords, image };
  } catch (error) {
    console.error('Error fetching metadata:', error);
    return null;
  }
}

// Returns the wallet name for known wallet addresses or an empty string for unknown addresses
export const isWalletAddress = (address: string): string => {
  switch (address) {
    case STAKING_WALLET_CST_ADDRESS: return "Staking CST Wallet";
    case STAKING_WALLET_RWLK_ADDRESS: return "Staking RandomWalk Wallet";
    case MARKETING_WALLET_ADDRESS: return "Marketing Wallet";
    case RAFFLE_WALLET_ADDRESS: return "Raffle Wallet";
    case CHARITY_WALLET_ADDRESS: return "Charity Wallet";
    default: return "";
  }
};

// Calculates the endurance champions based on a list of bids, including a chrono warrior time
export const getEnduranceChampions = (bidList: any[], roundEndTimeStamp: number = 0) => {
  const currentTime = roundEndTimeStamp > 0 ? roundEndTimeStamp : Math.floor(Date.now() / 1000);

  if (!bidList || bidList.length === 0) {
    return [];
  }

  // Sort the bids by timestamp
  let currentRoundBids = [...bidList].sort((a, b) => a.TimeStamp - b.TimeStamp);

  // If only one bid, return that as the endurance champion
  if (currentRoundBids.length === 1) {
    return [
      {
        bidder: currentRoundBids[0].BidderAddr,
        championTime: currentTime - currentRoundBids[0].TimeStamp,
        chronoWarrior: 0,
      },
    ];
  }

  let enduranceChampions: any[] = [];

  // Calculate endurance champions from sorted bids
  for (let i = 1; i < currentRoundBids.length; i++) {
    const enduranceDuration = currentRoundBids[i].TimeStamp - currentRoundBids[i - 1].TimeStamp;

    if (
      enduranceChampions.length === 0 ||
      enduranceDuration > enduranceChampions[enduranceChampions.length - 1].championTime
    ) {
      enduranceChampions.push({
        address: currentRoundBids[i - 1].BidderAddr,
        championTime: enduranceDuration,
        startTime: currentRoundBids[i - 1].TimeStamp,
        endTime: currentRoundBids[i].TimeStamp,
      });
    }
  }

  // Handle the last bid's duration to currentTime
  const lastBid = currentRoundBids[currentRoundBids.length - 1];
  const lastEnduranceDuration = currentTime - lastBid.TimeStamp;

  if (
    enduranceChampions.length === 0 ||
    lastEnduranceDuration > enduranceChampions[enduranceChampions.length - 1].championTime
  ) {
    enduranceChampions.push({
      address: lastBid.BidderAddr,
      championTime: lastEnduranceDuration,
      startTime: lastBid.TimeStamp,
      endTime: currentTime,
    });
  }

  // Calculate chrono warrior time (time difference between endurance champions)
  for (let i = 0; i < enduranceChampions.length; i++) {
    let chronoStartTime = i === 0 ? enduranceChampions[i].startTime : enduranceChampions[i].startTime + enduranceChampions[i - 1].championTime;
    let chronoEndTime = i < enduranceChampions.length - 1 ? enduranceChampions[i + 1].startTime + enduranceChampions[i].championTime : currentTime;

    enduranceChampions[i].chronoWarrior = Math.max(0, chronoEndTime - chronoStartTime);
  }

  return enduranceChampions.map((champion) => ({
    bidder: champion.address,
    championTime: champion.championTime,
    chronoWarrior: champion.chronoWarrior,
  }));
};

// Utility function to get the full URL for assets (e.g., images) via proxy
export const getAssetsUrl = (url: string): string => {
  const imageServerUrl = "https://nfts.cosmicsignature.com/images/new/";
  return `${proxyUrl}${encodeURIComponent(imageServerUrl + url)}`;
};

// Utility function to extract the original URL from the proxy URL
export const getOriginUrl = (url: string): string => {
  const strippedUrl = url.replace("/api/proxy?url=", "");
  return decodeURIComponent(strippedUrl);
}

// Logo image URL
export const logoImgUrl = getAssetsUrl("cosmicsignature/logo.png");
