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
  const [processingPools, setProcessingPools] = useState<boolean>(true);
  const { loading, data, error, startPolling, stopPolling, refetch } = useQuery(
    GET_POOLS_WHITELISTED,
    {
      variables: {
        tokens: tokensList,
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
      if (poolsConsistingOf && poolsConsistingOf.length > 0 && hbarPrice !== 0) {
        try {
          const processedPools = getProcessedPools(poolsConsistingOf, getExtended, hbarPrice);
          if (processedPools) setPools(processedPools);
        } catch (error) {
          console.error('Error while fetching pools data.');
        } finally {
          setProcessingPools(false);
        }
      }
    }
  }, [data, hbarPrice, getExtended]);

  useEffect(() => {
    if (
      !loading &&
      (error || (data && (!data.poolsConsistingOf || data?.poolsConsistingOf?.length === 0)))
    ) {
      setProcessingPools(false);
    }
  }, [loading, data, error]);

  return {
    poolsByTokenList: pools,
    loadingPoolsByTokenList: loading,
    errorPoolsByTokenList: error,
    refetchPoolsByTokenList: refetch,
    processingPools,
  };
};

export default usePoolsByTokensList;
