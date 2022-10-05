import { useEffect, useState } from 'react';

import { QueryHookOptions, useLazyQuery } from '@apollo/client';
import { GET_TOKENS_FILTERED } from '../GraphQL/Queries';

import { ITokenData, TokenType } from '../interfaces/tokens';

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
      const foundTokenDataList = getTokensFilter.map(
        ({ hederaId, name, symbol, address, decimals, isHTS, keys, hasFees }: ITokenData) => ({
          hederaId,
          name,
          symbol,
          address,
          decimals,
          keys,
          hasFees,
          type: isHTS ? TokenType.HTS : TokenType.ERC20,
        }),
      );
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
