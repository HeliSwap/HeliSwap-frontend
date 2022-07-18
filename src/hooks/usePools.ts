import { useEffect, useState } from 'react';
import { IPairData } from '../interfaces/tokens';

import { QueryHookOptions, useQuery } from '@apollo/client';
import { GET_POOLS } from '../GraphQL/Queries';
import { REFRESH_TIME } from '../constants';

const usePools = (useQueryOptions: QueryHookOptions = {}) => {
  const [pools, setPools] = useState<IPairData[]>([]);
  const { loading, data, error, startPolling, stopPolling, refetch } = useQuery(
    GET_POOLS,
    useQueryOptions,
  );

  useEffect(() => {
    startPolling(useQueryOptions.pollInterval || REFRESH_TIME);
    return () => {
      stopPolling();
    };
  }, [startPolling, stopPolling, useQueryOptions]);

  useEffect(() => {
    if (data) {
      const { pools } = data;

      if (pools.length > 0) {
        setPools(pools);
      }
    }
  }, [data]);

  return { pools, loading, error, refetch };
};

export default usePools;
