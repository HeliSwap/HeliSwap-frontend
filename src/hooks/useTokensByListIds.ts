import { useEffect, useState } from 'react';
import { ITokenData, TokenType } from '../interfaces/tokens';

import { QueryHookOptions, useQuery } from '@apollo/client';
import { GET_TOKENS_WHITELISTED } from '../GraphQL/Queries';
import { NATIVE_TOKEN } from '../utils/tokenUtils';

const useTokensByListIds = (
  tokensWhitelistedIds: string[],
  useQueryOptions: QueryHookOptions = {},
) => {
  const [tokens, setTokens] = useState<ITokenData[]>();

  const { loading, data, error } = useQuery(GET_TOKENS_WHITELISTED, {
    variables: { addresses: tokensWhitelistedIds },
    ...useQueryOptions,
    skip: tokensWhitelistedIds.length === 0,
  });

  useEffect(() => {
    if (data) {
      const { getWhitelistedTokens: tokensData } = data;

      if (tokensData.length > 0) {
        const foundTokenDataList = tokensData.map(
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

        setTokens([NATIVE_TOKEN, ...foundTokenDataList]);
      } else {
        setTokens([NATIVE_TOKEN]);
      }
    }
  }, [data]);

  return { tokens, loading, error };
};

export default useTokensByListIds;
