import { useContext, useEffect, useState } from 'react';
import { GlobalContext } from '../providers/Global';

import { QueryHookOptions, useLazyQuery } from '@apollo/client';
import { GET_POOL_BY_TOKEN } from '../GraphQL/Queries';

import { IPoolExtendedData } from '../interfaces/tokens';

import { getProcessedPools } from '../utils/poolUtils';
import { REFRESH_TIME } from '../constants';

const usePoolsByToken = (
  useQueryOptions: QueryHookOptions = {},
  token: string,
  getExtended: boolean,
) => {
  const contextValue = useContext(GlobalContext);
  const { hbarPrice } = contextValue;

  const [filteredPools, setFilteredPools] = useState<IPoolExtendedData[]>([]);

  const [
    loadExtraPools,
    {
      called: filteredPoolsCalled,
      loading: filteredPoolsLoading,
      data: filteredPoolsData,
      error: filteredPoolsError,
      startPolling,
      stopPolling,
    },
  ] = useLazyQuery(GET_POOL_BY_TOKEN, useQueryOptions);

  useEffect(() => {
    startPolling(useQueryOptions.pollInterval || REFRESH_TIME);
    return () => {
      stopPolling();
    };
  }, [startPolling, stopPolling, useQueryOptions]);

  useEffect(() => {
    if (token)
      loadExtraPools({
        variables: {
          token,
        },
      });
  }, [loadExtraPools, token]);

  useEffect(() => {
    if (filteredPoolsData) {
      const { poolsByToken } = filteredPoolsData;
      const processedPools = getProcessedPools(poolsByToken, getExtended, hbarPrice);
      if (processedPools) setFilteredPools(processedPools);
    }
  }, [filteredPoolsData, hbarPrice, getExtended]);

  return { filteredPools, filteredPoolsCalled, filteredPoolsLoading, filteredPoolsError };
};

export default usePoolsByToken;
