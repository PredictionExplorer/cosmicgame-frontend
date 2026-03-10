import React, { useEffect } from 'react';

import { useApiData } from './ApiDataContext';

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
  const { fetchData } = useApiData();

  useEffect(() => {
    fetchData();
    const intervalId = setInterval(fetchData, interval);
    return () => clearInterval(intervalId);
    // fetchData is stable (only changes when account changes, handled in ApiDataContext)
  }, [interval, fetchData]);

  // This component does not render any UI,
  // it only triggers side effects for data fetching.
  return null;
};

export default ApiDataFetcher;
