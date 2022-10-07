import { useEffect, useState } from 'react';

import { QueryHookOptions, useLazyQuery } from '@apollo/client';
import { GET_TOKENS_FILTERED } from '../GraphQL/Queries';

import { ITokenData } from '../interfaces/tokens';
import { getProcessedTokens } from '../utils/tokenUtils';

const useTokensByFilter = (useQueryOptions: QueryHookOptions = {}) => {
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
      const filteredTokens = [...getTokensFilter];

      const whbarIndex = getTokensFilter.findIndex(
        (token: ITokenData) => token.address === process.env.REACT_APP_WHBAR_ADDRESS,
      );

      //We want to remove WHBAR from token selectors
      if (whbarIndex !== -1) filteredTokens.splice(whbarIndex, 1);

      const foundTokenDataList = getProcessedTokens(filteredTokens);

      setFilteredTokens(foundTokenDataList);
    }
  }, [filteredTokensData]);

  return {
    filteredTokens,
    filteredTokensCalled,
    filteredTokensLoading,
    filteredTokensError,
    loadFilteredTokens,
  };
};

export default useTokensByFilter;
