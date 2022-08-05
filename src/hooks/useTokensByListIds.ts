import { useEffect, useState } from 'react';
import { ITokenData, TokenType } from '../interfaces/tokens';

import { QueryHookOptions, useQuery } from '@apollo/client';
import { GET_TOKENS } from '../GraphQL/Queries';
import { NATIVE_TOKEN } from '../utils/tokenUtils';

const useTokensByListIds = (
  tokensWhitelistedIds: string[],
  useQueryOptions: QueryHookOptions = {},
) => {
  const [tokens, setTokens] = useState<ITokenData[]>();

  const { loading, data, error } = useQuery(GET_TOKENS, {
    variables: { tokensWhitelistedIds },
    ...useQueryOptions,
  });

  useEffect(() => {
    if (data) {
      const { getTokensData } = data;

      if (getTokensData.length > 0) {
        const foundTokenDataList = getTokensData.map(
          ({ hederaId, name, symbol, address, decimals, isHTS }: any) => ({
            hederaId,
            name,
            symbol,
            address,
            decimals,
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
