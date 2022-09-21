import { useEffect, useState } from 'react';

import { QueryHookOptions, useQuery } from '@apollo/client';
import { GET_POOLS_WHITELISTED } from '../GraphQL/Queries';
import { REFRESH_TIME } from '../constants';

import { IPoolExtendedData } from '../interfaces/tokens';

import { getHBarPrice } from '../utils/tokenUtils';
import { getProcessedPools } from '../utils/poolUtils';

const usePoolsByTokensList = (
  useQueryOptions: QueryHookOptions = {},
  getExtended = false,
  tokensList: string[] = [],
) => {
  const [hbarPrice, setHbarPrice] = useState(0);
  const [pools, setPools] = useState<IPoolExtendedData[]>([]);
  const { loading, data, error, startPolling, stopPolling, refetch } = useQuery(
    GET_POOLS_WHITELISTED,
    {
      variables: {
        tokens: tokensList,
      },
      ...useQueryOptions,
    },
  );

  useEffect(() => {
    const getHBARPrice = async () => {
      const hbarPrice = await getHBarPrice();
      setHbarPrice(hbarPrice);
    };

    getExtended && getHBARPrice();
  }, [getExtended]);

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
