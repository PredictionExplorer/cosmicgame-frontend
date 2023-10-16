import React, { useEffect } from 'react';
import { useApiData } from './ApiDataContext';
import { useActiveWeb3React } from '../hooks/web3';
import api from '../services/api';

interface ApiDataFetcherProps {
  interval: number;
}

const ApiDataFetcher: React.FC<ApiDataFetcherProps> = ({ interval }) => {
  const { setApiData } = useApiData();
  const { account } = useActiveWeb3React();
  const fetchNotification = async () => {
    const notify = await api.notify_red_box(account);
    return notify;
  };

  useEffect(() => {
    const fetchData = async () => {
      if (account) {
        const newData = await fetchNotification();
        setApiData(newData);
      }
    };

    fetchData();
    const intervalId = setInterval(fetchData, interval);

    return () => clearInterval(intervalId);
  }, [interval, setApiData]);

  return null;
};

export default ApiDataFetcher;