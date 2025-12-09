import { useContext, useEffect, useState } from 'react';
import { QueryHookOptions } from '@apollo/client';
import { IPoolExtendedData } from '../interfaces/tokens';
import { GlobalContext } from '../providers/Global';
import { loadAllPools } from '../utils/poolDataLoader';
import { getUserPoolPositions } from '../utils/userPoolUtils';

/**
 * Hook to get user-specific pools by checking LP token balances on contracts
 * Replaces the previous GraphQL-based implementation
 * @param useQueryOptions - Kept for backward compatibility but not used
 * @param userId - User's Hedera ID
 * @param poolsExtended - Extended pools data (used for price calculations)
 * @returns Object containing user pools array, loading state, error state, and refetch function
 */
const usePoolsByUser = (
  useQueryOptions: QueryHookOptions = {},
  userId: string,
  poolsExtended: IPoolExtendedData[],
) => {
  const contextValue = useContext(GlobalContext);
  const { hbarPrice } = contextValue;

  const [poolsByUser, setPoolsByUser] = useState<IPoolExtendedData[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<any>(null);

  useEffect(() => {
    // Skip if no user is connected
    if (!userId) {
      setPoolsByUser([]);
      setLoading(false);
      return;
    }

    // Skip if hbarPrice is not available yet (needed for TVL calculations)
    if (!hbarPrice || hbarPrice === 0) {
      return;
    }

    const fetchUserPools = async () => {
      setLoading(true);
      setError(null);

      try {
        // Load all pools from static data
        const allPools = loadAllPools();

        // Get user's positions by checking LP token balances on contracts
        const userPools = await getUserPoolPositions(allPools, userId, hbarPrice);

        setPoolsByUser(userPools);
      } catch (err) {
        console.error('Error fetching user pools:', err);
        setError(err);
        setPoolsByUser([]);
      } finally {
        setLoading(false);
      }
    };

    fetchUserPools();
  }, [userId, hbarPrice, poolsExtended]);

  // refetch function to manually refresh user pools
  const refetch = async () => {
    if (!userId || !hbarPrice || hbarPrice === 0) {
      return;
    }

    try {
      setLoading(true);
      const allPools = loadAllPools();
      const userPools = await getUserPoolPositions(allPools, userId, hbarPrice);
      setPoolsByUser(userPools);
    } catch (err) {
      console.error('Error refetching user pools:', err);
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  return { poolsByUser, loading, error, refetch };
};

export default usePoolsByUser;
