import { useContext, useEffect, useState } from 'react';
import { GlobalContext } from '../providers/Global';

import { QueryHookOptions, useQuery } from '@apollo/client';
import { GET_POOLS } from '../GraphQL/Queries';
import { REFRESH_TIME } from '../constants';

import { IPoolExtendedData } from '../interfaces/tokens';

import { getProcessedPools } from '../utils/poolUtils';

const usePools = (useQueryOptions: QueryHookOptions = {}, getExtended = false) => {
  const contextValue = useContext(GlobalContext);
  const { hbarPrice } = contextValue;

  const [pools, setPools] = useState<IPoolExtendedData[]>([]);
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
      if (pools) {
        const processedPools = getProcessedPools(pools, getExtended, hbarPrice);
        if (processedPools) setPools(processedPools);
      }
    }
  }, [data, hbarPrice, getExtended]);

  return { pools, loading, error, refetch };
};

export default usePools;
