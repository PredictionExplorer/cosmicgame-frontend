import React, { useEffect } from "react";
import { useApiData } from "./ApiDataContext";
import { useStakedToken } from "./StakedTokenContext";

interface ApiDataFetcherProps {
  interval: number;
}

const ApiDataFetcher: React.FC<ApiDataFetcherProps> = ({ interval }) => {
  const { cstokens: stakedTokens } = useStakedToken();
  const { setApiData, fetchData } = useApiData();

  useEffect(() => {
    fetchData();
    const intervalId = setInterval(fetchData, interval);
    return () => clearInterval(intervalId);
  }, [interval, setApiData, stakedTokens]);

  return null;
};

export default ApiDataFetcher;
