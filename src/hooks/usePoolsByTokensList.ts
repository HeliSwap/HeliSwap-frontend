import { useContext, useEffect, useState } from 'react';
import { GlobalContext } from '../providers/Global';

import { QueryHookOptions, useQuery } from '@apollo/client';
import { GET_POOLS_WHITELISTED } from '../GraphQL/Queries';
import { REFRESH_TIME } from '../constants';

import { IPoolExtendedData } from '../interfaces/tokens';

import { getProcessedPools } from '../utils/poolUtils';

const usePoolsByTokensList = (
  useQueryOptions: QueryHookOptions = {},
  getExtended = false,
  tokensList: string[] = [],
) => {
  const contextValue = useContext(GlobalContext);
  const { hbarPrice } = contextValue;

  const [pools, setPools] = useState<IPoolExtendedData[]>([]);
  const { loading, data, error, startPolling, stopPolling, refetch } = useQuery(
    GET_POOLS_WHITELISTED,
    {
      variables: {
        tokens: [...tokensList, process.env.REACT_APP_WHBAR_ADDRESS],
      },
      ...useQueryOptions,
      skip: tokensList.length === 0,
    },
  );

  useEffect(() => {
    startPolling(useQueryOptions.pollInterval || REFRESH_TIME);
    return () => {
      stopPolling();
    };
  }, [startPolling, stopPolling, useQueryOptions]);

  useEffect(() => {
    if (data) {
      const { poolsConsistingOf } = data;
      const processedPools = getProcessedPools(poolsConsistingOf, getExtended, hbarPrice);
      if (processedPools) setPools(processedPools);
    }
  }, [data, hbarPrice, getExtended]);

  return {
    poolsByTokenList: pools,
    loadingPoolsByTokenList: loading,
    errorPoolsByTokenList: error,
    refetchPoolsByTokenList: refetch,
  };
};

export default usePoolsByTokensList;
