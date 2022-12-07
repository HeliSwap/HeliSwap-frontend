import { useEffect, useState } from 'react';

import { QueryHookOptions, useQuery } from '@apollo/client';
import { GET_METRICS } from '../GraphQL/Queries';

import { IHistoricalData } from '../interfaces/common';

const useHistoricalData = (useQueryOptions: QueryHookOptions = {}) => {
  const [historicalData, setHistoricalData] = useState<IHistoricalData[]>([]);
  const { loading, data, error, refetch } = useQuery(GET_METRICS, {
    ...useQueryOptions,
  });

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
