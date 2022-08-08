import { useEffect, useState } from 'react';

import { QueryHookOptions, useLazyQuery } from '@apollo/client';
import { GET_TOKENS_FILTERED } from '../GraphQL/Queries';

import { IPoolExtendedData, ITokenData } from '../interfaces/tokens';

const useTokensByFilter = (
  useQueryOptions: QueryHookOptions = {},
  restPools: IPoolExtendedData[] = [],
) => {
  const [filteredTokens, setFilteredTokens] = useState<ITokenData[]>([]);

  const [
    loadFilteredTokens,
    {
      called: filteredTokensCalled,
      loading: filteredTokensLoading,
      data: filteredTokensData,
      error: filteredTokensError,
    },
  ] = useLazyQuery(GET_TOKENS_FILTERED, useQueryOptions);

  useEffect(() => {
    if (filteredTokensData) {
      const { getTokensFilter } = filteredTokensData;
      setFilteredTokens(getTokensFilter);
    }
  }, [filteredTokensData, restPools]);

  return {
    filteredTokens,
    filteredTokensCalled,
    filteredTokensLoading,
    filteredTokensError,
    loadFilteredTokens,
  };
};

export default useTokensByFilter;
