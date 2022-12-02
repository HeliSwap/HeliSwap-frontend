import { useContext, useEffect, useState } from 'react';
import { GlobalContext } from '../providers/Global';

import { QueryHookOptions, useQuery } from '@apollo/client';
import { GET_POOL_BY_ADDRESS } from '../GraphQL/Queries';
import { REFRESH_TIME } from '../constants';

import { IPoolExtendedData } from '../interfaces/tokens';

import { getProcessedPools } from '../utils/poolUtils';

const usePoolByAddress = (
  useQueryOptions: QueryHookOptions = {},
  getExtended = false,
  poolAddress: string,
  tokensList: string[] = [],
) => {
  const contextValue = useContext(GlobalContext);
  const { hbarPrice } = contextValue;

  const [pool, setPool] = useState<IPoolExtendedData>();
  const [processingPools, setProcessingPools] = useState<boolean>(true);
  const { loading, data, error, startPolling, stopPolling, refetch } = useQuery(
    GET_POOL_BY_ADDRESS,
    {
      variables: {
        poolAddress,
        tokens: tokensList,
      },
      ...useQueryOptions,
      skip: tokensList.length === 0 || !poolAddress,
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
      const { getPoolByAddress } = data;
      if (getPoolByAddress && hbarPrice !== 0) {
        try {
          const processedPools = getProcessedPools([getPoolByAddress], getExtended, hbarPrice);
          if (processedPools) setPool(processedPools[0]);
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
      (error || (data && (!data.getPoolByAddress || data?.getPoolByAddress?.length === 0)))
    ) {
      setProcessingPools(false);
    }
  }, [loading, data, error]);

  return {
    pool,
    loadingPoolsByTokenList: loading,
    errorPoolsByTokenList: error,
    refetchPoolsByTokenList: refetch,
    processingPools,
  };
};

export default usePoolByAddress;
