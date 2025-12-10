import { useEffect, useState, useCallback } from 'react';
import { IUserStakingData, IPoolData } from '../interfaces/tokens';
import { getUserFarmPosition } from '../utils/farmContractUtils';
import { idToAddress } from '../utils/tokenUtils';

/**
 * Hook to fetch user's farm position data directly from MultiRewards contract
 * @param farmAddress - Address of the farm contract
 * @param userId - User's Hedera ID (will be converted to address)
 * @param poolData - Pool data for calculating USD values
 * @param pools - Array of all pools for price lookup
 * @param hbarPrice - Current HBAR price
 * @param rewardsData - Array of reward data (for getting decimals)
 * @param enabled - Whether to fetch data (should be true when user is connected)
 * @returns Object containing user position data, loading state, error state, and refetch function
 */
const useUserFarmPosition = (
  farmAddress: string,
  userId: string,
  poolData: IPoolData | undefined,
  pools: IPoolData[],
  hbarPrice: number,
  rewardsData: Array<{ address: string; decimals: number }>,
  enabled: boolean = true,
) => {
  const [userPosition, setUserPosition] = useState<IUserStakingData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<any>(null);

  const fetchUserPosition = useCallback(async () => {
    // Skip if not enabled, no farm address, no user ID, or no pool data
    if (!enabled || !farmAddress || !userId || !poolData || pools.length === 0 || hbarPrice === 0) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Convert Hedera ID to address
      const userAddress = idToAddress(userId);

      // Fetch user position from contract
      const position = await getUserFarmPosition(
        farmAddress,
        userAddress,
        poolData,
        pools,
        hbarPrice,
        rewardsData,
      );

      if (position) {
        setUserPosition(position);
      } else {
        // If position is null, user likely has no position or contract call failed
        // Set to empty position
        setUserPosition({
          stakedAmount: '0',
          stakedAmountUSD: '0',
          rewardsAccumulated: [],
        });
      }
    } catch (err) {
      console.error('Error in useUserFarmPosition:', err);
      setError(err);
      // Set empty position on error
      setUserPosition({
        stakedAmount: '0',
        stakedAmountUSD: '0',
        rewardsAccumulated: [],
      });
    } finally {
      setLoading(false);
    }
  }, [farmAddress, userId, poolData, pools, hbarPrice, rewardsData, enabled]);

  useEffect(() => {
    fetchUserPosition();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [farmAddress, userId, poolData?.pairAddress, pools.length, hbarPrice, enabled]);

  return { userPosition, loading, error, refetch: fetchUserPosition };
};

export default useUserFarmPosition;
