import { useEffect, useState } from 'react';
import { QueryHookOptions } from '@apollo/client';
import { IPoolExtendedData } from '../interfaces/tokens';

/**
 * Hook to get user-specific pools
 * Since we're using static data, user-specific information (lpShares, fees, stakedBalance)
 * is not available in pools.json, so this hook returns an empty array
 * Replaces the previous GraphQL-based implementation
 * @param useQueryOptions - Kept for backward compatibility but not used
 * @param userId - User ID (kept for backward compatibility but not used)
 * @param poolsExtended - Extended pools data (kept for backward compatibility but not used)
 * @returns Object containing empty pools array, loading state, error state, and refetch function
 */
const usePoolsByUser = (
  useQueryOptions: QueryHookOptions = {},
  userId: string,
  poolsExtended: IPoolExtendedData[],
) => {
  const [poolsByUser, setPoolsByUser] = useState<IPoolExtendedData[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<any>(null);

  useEffect(() => {
    // Since we're using static data, user-specific pools (with lpShares, fees, etc.)
    // are not available. Return empty array immediately.
    // This prevents API calls when a user is connected.
    setPoolsByUser([]);
    setLoading(false);
  }, [userId]);

  // refetch function kept for backward compatibility but does nothing
  const refetch = () => {
    // No-op since data is static and user-specific data isn't available
  };

  return { poolsByUser, loading, error, refetch };
};

export default usePoolsByUser;
