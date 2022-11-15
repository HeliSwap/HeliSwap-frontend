import { useEffect, useState } from 'react';

import { QueryHookOptions, useQuery } from '@apollo/client';
import { GET_METRICS } from '../GraphQL/Queries';
import { REFRESH_TIME } from '../constants';

import { IHistoricalData } from '../interfaces/common';

const useHistoricalData = (useQueryOptions: QueryHookOptions = {}) => {
  const [historicalData, setHistoricalData] = useState<IHistoricalData[]>([]);
  const { loading, data, error, startPolling, stopPolling, refetch } = useQuery(GET_METRICS, {
    ...useQueryOptions,
  });

  useEffect(() => {
    startPolling(useQueryOptions.pollInterval || REFRESH_TIME);
    return () => {
      stopPolling();
    };
  }, [startPolling, stopPolling, useQueryOptions]);

  useEffect(() => {
    if (data) {
      const { getMetrics } = data;
      setHistoricalData(getMetrics);
    }
  }, [data]);

  return {
    historicalData,
    loadingHistoricalData: loading,
    errorHistoricalData: error,
    refetchHistoricalData: refetch,
  };
};

export default useHistoricalData;
