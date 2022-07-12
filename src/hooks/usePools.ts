import { useEffect, useState } from 'react';
import { IPairData } from '../interfaces/tokens';

import { QueryHookOptions, useQuery } from '@apollo/client';
import { GET_POOLS } from '../GraphQL/Queries';

const usePools = (useQueryOptions: QueryHookOptions = {}) => {
  const [pools, setPools] = useState<IPairData[]>([]);

  const { data, loading, error, refetch } = useQuery(GET_POOLS, useQueryOptions);

  useEffect(() => {
    if (data) {
      const { pools } = data;

      if (pools.length > 0) {
        setPools(pools);
      }
    }
  }, [data]);

  return { pools, loading, error, refetch };
};

export default usePools;
