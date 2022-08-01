import { useEffect, useState } from 'react';

import { QueryHookOptions, useLazyQuery } from '@apollo/client';
import { GET_FILTERED_POOLS } from '../GraphQL/Queries';

import { IPoolExtendedData } from '../interfaces/tokens';

import { getHBarPrice } from '../utils/tokenUtils';
import { getProcessedPools } from '../utils/poolUtils';

const useFilteredPools = (
  useQueryOptions: QueryHookOptions = {},
  searchQuery: Object,
  getExtended: boolean,
) => {
  const [hbarPrice, setHbarPrice] = useState(0);
  const [filteredPools, setFilteredPools] = useState<IPoolExtendedData[]>([]);

  const [
    loadExtraPools,
    {
      called: filteredPoolsCalled,
      loading: filteredPoolsLoading,
      data: filteredPoolsData,
      error: filteredPoolsError,
    },
  ] = useLazyQuery(GET_FILTERED_POOLS, useQueryOptions);

  useEffect(() => {
    const getHBARPrice = async () => {
      const hbarPrice = await getHBarPrice();
      setHbarPrice(hbarPrice);
    };

    getExtended && getHBARPrice();
  }, [getExtended]);

  useEffect(() => {
    if (Object.keys(searchQuery).length !== 0)
      loadExtraPools({
        variables: {
          ...searchQuery,
        },
      });
  }, [loadExtraPools, searchQuery]);

  useEffect(() => {
    if (filteredPoolsData) {
      const { filterPools } = filteredPoolsData;
      const processedPools = getProcessedPools(filterPools, getExtended, hbarPrice);
      setFilteredPools(processedPools);
    }
  }, [filteredPoolsData, hbarPrice, getExtended]);

  return { filteredPools, filteredPoolsCalled, filteredPoolsLoading, filteredPoolsError };
};

export default useFilteredPools;
