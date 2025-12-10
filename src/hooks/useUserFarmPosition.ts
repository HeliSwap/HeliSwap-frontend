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
      console.debug(
        `[useUserFarmPosition] Skipping fetch - enabled: ${enabled}, farmAddress: ${!!farmAddress}, userId: ${!!userId}, poolData: ${!!poolData}, pools: ${
          pools.length
        }, hbarPrice: ${hbarPrice}`,
      );
      setLoading(false);
      return;
    }

    console.debug(
      `[useUserFarmPosition] Starting fetch - Farm: ${farmAddress}, User: ${userId}, Pool: ${poolData?.pairAddress}`,
    );

    setLoading(true);
    setError(null);

    try {
      // Convert Hedera ID to address
      const userAddress = idToAddress(userId);
      console.debug(`[useUserFarmPosition] Converted user ID to address: ${userAddress}`);

      // Fetch user position from contract
      const position = await getUserFarmPosition(
        farmAddress,
        userAddress,
        poolData,
        pools,
        hbarPrice,
        rewardsData,
      );

      console.debug(
        `[useUserFarmPosition] Position fetched - stakedAmount: ${
          position?.stakedAmount || 'null'
        }, stakedAmountUSD: ${position?.stakedAmountUSD || 'null'}`,
      );

      if (position) {
        setUserPosition(position);
      } else {
        // If position is null, user likely has no position or contract call failed
        // Set to empty position
        console.debug(`[useUserFarmPosition] Position is null, setting empty position`);
        setUserPosition({
          stakedAmount: '0',
          stakedAmountUSD: '0',
          rewardsAccumulated: [],
        });
      }
    } catch (err) {
      console.error('[useUserFarmPosition] Error fetching position:', err);
      setError(err);
      // Set empty position on error
      setUserPosition({
        stakedAmount: '0',
        stakedAmountUSD: '0',
        rewardsAccumulated: [],
      });
    } finally {
      setLoading(false);
      console.debug(`[useUserFarmPosition] Fetch completed, loading set to false`);
    }
  }, [farmAddress, userId, poolData, pools, hbarPrice, rewardsData, enabled]);

  useEffect(() => {
    fetchUserPosition();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [farmAddress, userId, poolData?.pairAddress, pools.length, hbarPrice, enabled]);

  return { userPosition, loading, error, refetch: fetchUserPosition };
};

export default useUserFarmPosition;
