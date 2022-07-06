import { useEffect, useState } from 'react';

import { QueryHookOptions, useQuery } from '@apollo/client';
import { HEALTH_CHECK } from '../GraphQL/Queries';

const useHealthCheck = (useQueryOptions: QueryHookOptions = {}) => {
  const { data, loading, error, refetch } = useQuery(HEALTH_CHECK, useQueryOptions);
  const [timestamp, setTimestamp] = useState('');

  useEffect(() => {
    if (data) {
      const { healthcheck } = data;
      setTimestamp(healthcheck);
    }
  }, [data]);

  return { timestamp, loading, error, refetch };
};

export default useHealthCheck;
