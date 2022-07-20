import { useEffect, useState } from 'react';

import { QueryHookOptions, useQuery } from '@apollo/client';
import { HEALTH_CHECK } from '../GraphQL/Queries';
import { HEALTH_CHECK_INTERVAL } from '../constants';

const useHealthCheck = (useQueryOptions: QueryHookOptions = {}) => {
  const { data, loading, error, startPolling, stopPolling, refetch } = useQuery(
    HEALTH_CHECK,
    useQueryOptions,
  );
  const [timestamp, setTimestamp] = useState('');

  useEffect(() => {
    startPolling(useQueryOptions.pollInterval || HEALTH_CHECK_INTERVAL);
    return () => {
      stopPolling();
    };
  }, [startPolling, stopPolling, useQueryOptions]);

  useEffect(() => {
    if (data) {
      const { healthcheck } = data;
      setTimestamp(healthcheck);
    }
  }, [data]);

  return { timestamp, loading, error, refetch };
};

export default useHealthCheck;
