import { useEffect, useState, useCallback } from 'react';
import { IFarmData, IUserStakingData, IPoolData } from '../interfaces/tokens';
import { getUserFarmPosition } from '../utils/farmContractUtils';
import { idToAddress } from '../utils/tokenUtils';

/**
 * Hook to fetch user's farm positions for all farms from MultiRewards contracts
 * Only fetches when user is connected
 * @param farms - Array of all farms to fetch positions for
 * @param userId - User's Hedera ID (will be converted to address)
 * @param pools - Array of all pools for price lookup
 * @param hbarPrice - Current HBAR price
 * @param enabled - Whether to fetch data (should be true when user is connected)
 * @returns Map of farm address to user position data, loading state, and refetch function
 */
const useUserFarmsPositions = (
  farms: IFarmData[],
  userId: string,
  pools: IPoolData[],
  hbarPrice: number,
  enabled: boolean = true,
) => {
  const [userPositions, setUserPositions] = useState<Map<string, IUserStakingData>>(new Map());
  const [loading, setLoading] = useState<boolean>(false);

  const fetchUserPositions = useCallback(async () => {
    // Skip if not enabled, no user ID, no farms, no pools, or hbarPrice is 0
    if (
      !enabled ||
      !userId ||
      !farms ||
      farms.length === 0 ||
      pools.length === 0 ||
      hbarPrice === 0
    ) {
      console.log(
        `[useUserFarmsPositions] Skipping fetch - enabled: ${enabled}, userId: ${!!userId}, farms: ${
          farms?.length || 0
        }, pools: ${pools.length}, hbarPrice: ${hbarPrice}`,
      );
      setLoading(false);
      return;
    }

    setLoading(true);

    try {
      // Convert Hedera ID to address
      const userAddress = idToAddress(userId);

      console.log(
        `[useUserFarmsPositions] Starting to fetch positions for ${farms.length} farms for user ${userId} (${userAddress})`,
      );

      // Fetch positions for all farms in parallel
      // This will make multiple contract calls simultaneously for better performance
      const positionPromises = farms.map(async farm => {
        const farmPairName = `${farm.poolData?.token0Symbol || '?'}/${
          farm.poolData?.token1Symbol || '?'
        }`;
        console.log(
          `[useUserFarmsPositions] Fetching position for farm ${farm.address} (${farmPairName})...`,
        );

        try {
          const position = await getUserFarmPosition(
            farm.address,
            userAddress,
            farm.poolData,
            pools,
            hbarPrice,
            farm.rewardsData || [],
          );

          // Log successful fetch with position details
          if (position && Number(position.stakedAmount) > 0) {
            console.log(
              `[useUserFarmsPositions] ✓ Farm ${farm.address} (${farmPairName}): Staked ${
                position.stakedAmount
              } ($${position.stakedAmountUSD}), Rewards: ${
                position.rewardsAccumulated?.length || 0
              }`,
            );
          } else {
            console.log(
              `[useUserFarmsPositions] ✓ Farm ${farm.address} (${farmPairName}): No position (staked: 0)`,
            );
          }

          // Return position or empty position if null
          return {
            farmAddress: farm.address,
            position: position || {
              stakedAmount: '0',
              stakedAmountUSD: '0',
              rewardsAccumulated: [],
            },
          };
        } catch (error) {
          // If individual farm fails, return empty position
          console.error(
            `[useUserFarmsPositions] ✗ Error fetching position for farm ${farm.address} (${farmPairName}):`,
            error,
          );
          return {
            farmAddress: farm.address,
            position: {
              stakedAmount: '0',
              stakedAmountUSD: '0',
              rewardsAccumulated: [],
            },
          };
        }
      });

      // Wait for all positions to be fetched
      const results = await Promise.all(positionPromises);

      // Convert results array to Map for easy lookup
      const positionsMap = new Map<string, IUserStakingData>();
      let farmsWithStake = 0;
      results.forEach(({ farmAddress, position }) => {
        positionsMap.set(farmAddress, position);
        if (Number(position.stakedAmount) > 0) {
          farmsWithStake++;
        }
      });

      console.log(
        `[useUserFarmsPositions] Completed fetching positions: ${farmsWithStake} farms with stake out of ${results.length} total farms`,
      );

      setUserPositions(positionsMap);
    } catch (err) {
      console.error(
        `[useUserFarmsPositions] Fatal error while fetching positions for ${farms.length} farms:`,
        err,
      );
      // On error, set empty map (will fallback to static data)
      setUserPositions(new Map());
    } finally {
      setLoading(false);
      console.log(`[useUserFarmsPositions] Fetch completed, loading set to false`);
    }
  }, [farms, userId, pools, hbarPrice, enabled]);

  useEffect(() => {
    fetchUserPositions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [farms.length, userId, pools.length, hbarPrice, enabled]);

  return { userPositions, loading, refetch: fetchUserPositions };
};

export default useUserFarmsPositions;
