import { useEffect, useState } from 'react';
import { ITokenData, TokenType } from '../interfaces/tokens';

import { QueryHookOptions, useQuery } from '@apollo/client';
import { GET_TOKENS } from '../GraphQL/Queries';

const useTokens = (useQueryOptions: QueryHookOptions = {}) => {
  const [tokens, setTokens] = useState<ITokenData[]>();

  const { data, loading, error } = useQuery(GET_TOKENS, useQueryOptions);

  useEffect(() => {
    if (data) {
      const { getTokensData } = data;

      const nativeToken = {
        hederaId: '',
        name: 'HBAR',
        symbol: 'HBAR',
        address: '',
        decimals: 8,
        type: TokenType.HBAR,
      };

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

        setTokens([nativeToken, ...foundTokenDataList]);
      } else {
        setTokens([nativeToken]);
      }
    }
  }, [data]);

  return { tokens, loading, error };
};

export default useTokens;
