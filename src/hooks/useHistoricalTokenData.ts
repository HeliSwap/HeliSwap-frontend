import { useEffect, useState } from 'react';

import { QueryHookOptions, useQuery } from '@apollo/client';
import { GET_TOKEN_PRICE } from '../GraphQL/Queries';

const useHistoricalTokenData = (tokenAddress: string, useQueryOptions: QueryHookOptions = {}) => {
  const [tokenData, setTokenData] = useState<any>();
  const { loading, data, error, refetch } = useQuery(GET_TOKEN_PRICE, {
    variables: { token: tokenAddress },
    ...useQueryOptions,
  });

  useEffect(() => {
    if (data) {
      const { getTokenPrice } = data;
      setTokenData(getTokenPrice);
    }
  }, [data]);

  return {
    tokenData,
    loadingTokenData: loading,
    errorTokenData: error,
    refetchTokenData: refetch,
  };
};

export default useHistoricalTokenData;
