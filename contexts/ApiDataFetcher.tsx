import React, { useEffect } from "react";
import { useApiData } from "./ApiDataContext";
import { useStakedToken } from "./StakedTokenContext";

/**
 * Props for the ApiDataFetcher component.
 */
interface ApiDataFetcherProps {
  /**
   * The interval time in milliseconds for periodically fetching data.
   */
  interval: number;
}

/**
 * A utility component that periodically fetches data from an API.
 *
 * It uses the `useApiData` context to fetch and store the data,
 * and the `useStakedToken` context to potentially react to changes
 * in staked tokens (if needed).
 *
 * @param {ApiDataFetcherProps} props - The props for the component.
 * @returns {null} Renders nothing, but triggers periodic data fetches.
 */
const ApiDataFetcher: React.FC<ApiDataFetcherProps> = ({ interval }) => {
  // Retrieve the list of staked tokens from the staked token context
  // (if needed to trigger a re-fetch whenever staked tokens change).
  const { cstokens: stakedTokens } = useStakedToken();

  // Obtain the data setter (setApiData) and a fetch function (fetchData) from the API context.
  const { setApiData, fetchData } = useApiData();

  useEffect(() => {
    // Immediately fetch data once the component mounts.
    fetchData();

    // Set up an interval to periodically fetch data.
    const intervalId = setInterval(fetchData, interval);

    // Clean up the interval when the component unmounts or interval changes.
    return () => clearInterval(intervalId);

    // Dependencies:
    // - interval: the frequency at which data is fetched
    // - setApiData: context setter (not directly used here, but included for completeness)
    // - stakedTokens: if staked tokens change, it will refetch the data
    // - fetchData: the function that actually retrieves the API data
  }, [interval, setApiData, stakedTokens]);

  // This component does not render any UI,
  // it only triggers side effects for data fetching.
  return null;
};

export default ApiDataFetcher;
