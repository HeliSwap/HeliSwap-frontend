import { useEffect, useState } from 'react';
import { ITokenData } from '../interfaces/tokens';

import { QueryHookOptions, useQuery } from '@apollo/client';
import { GET_TOKENS_WHITELISTED } from '../GraphQL/Queries';
import { getProcessedTokens, NATIVE_TOKEN } from '../utils/tokenUtils';

const useTokensByListIds = (
  tokensWhitelistedIds: string[],
  useQueryOptions: QueryHookOptions = {},
  addNativeToken: boolean = true,
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
        const foundTokenDataList = getProcessedTokens(tokensData);

        setTokens(addNativeToken ? [NATIVE_TOKEN, ...foundTokenDataList] : foundTokenDataList);
      } else {
        setTokens(addNativeToken ? [NATIVE_TOKEN] : []);
      }
    }
  }, [data, addNativeToken]);

  return { tokens, loading, error };
};

export default useTokensByListIds;
