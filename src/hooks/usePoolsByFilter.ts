import { useContext, useEffect, useState } from 'react';
import { GlobalContext } from '../providers/Global';

import { QueryHookOptions, useLazyQuery } from '@apollo/client';
import { GET_POOLS_FILTERED } from '../GraphQL/Queries';

import { IPoolExtendedData } from '../interfaces/tokens';

import { getProcessedPools } from '../utils/poolUtils';

const usePoolsByFilter = (
  useQueryOptions: QueryHookOptions = {},
  getExtended: boolean,
  restPools: IPoolExtendedData[] = [],
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
    },
  ] = useLazyQuery(GET_POOLS_FILTERED, useQueryOptions);

  useEffect(() => {
    if (filteredPoolsData) {
      const { filterPools } = filteredPoolsData;
      const processedPools = getProcessedPools(filterPools, getExtended, hbarPrice, restPools);
      setFilteredPools(processedPools || []);
    }
  }, [filteredPoolsData, hbarPrice, getExtended, restPools]);

  return {
    filteredPools,
    filteredPoolsCalled,
    filteredPoolsLoading,
    filteredPoolsError,
    loadExtraPools,
  };
};

export default usePoolsByFilter;
