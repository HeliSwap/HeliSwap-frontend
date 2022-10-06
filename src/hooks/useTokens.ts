import { useEffect, useState } from 'react';
import { ITokenData } from '../interfaces/tokens';

import { QueryHookOptions, useQuery } from '@apollo/client';
import { GET_TOKENS } from '../GraphQL/Queries';
import { getProcessedTokens, NATIVE_TOKEN } from '../utils/tokenUtils';
import { REFRESH_TIME } from '../constants';

const useTokens = (useQueryOptions: QueryHookOptions = {}) => {
  const [tokens, setTokens] = useState<ITokenData[]>();

  const { loading, data, error, startPolling, stopPolling } = useQuery(GET_TOKENS, useQueryOptions);

  useEffect(() => {
    startPolling(useQueryOptions.pollInterval || REFRESH_TIME);
    return () => {
      stopPolling();
    };
  }, [startPolling, stopPolling, useQueryOptions]);

  useEffect(() => {
    if (data) {
      const { getTokensData } = data;

      if (getTokensData.length > 0) {
        const foundTokenDataList = getProcessedTokens(getTokensData);

        setTokens([NATIVE_TOKEN, ...foundTokenDataList]);
      } else {
        setTokens([NATIVE_TOKEN]);
      }
    }
  }, [data]);

  return { tokens, loading, error };
};

export default useTokens;
