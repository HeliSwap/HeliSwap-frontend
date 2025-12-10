import { ethers } from 'ethers';
import { IUserStakingData, IRewardsAccumulated, IPoolData } from '../interfaces/tokens';
import { getProvider, getTokenPrice, calculateReserves } from './tokenUtils';
import { formatStringWeiToStringEther } from './numberUtils';

// Minimal ABI for MultiRewards contract - only methods needed for reading user position
const MULTI_REWARDS_ABI = [
  'function balanceOf(address account) external view returns (uint256)',
  'function earned(address account, address _rewardsToken) public view returns (uint256)',
  'function rewardTokens(uint256) external view returns (address)',
  'function totalSupply() external view returns (uint256)',
];

/**
 * Get user's staked LP token balance from MultiRewards farm contract
 * @param farmAddress - Address of the MultiRewards farm contract
 * @param userAddress - User's address (not Hedera ID)
 * @returns Staked LP token balance as string (in wei), or '0' if error
 */
export const getUserStakedBalance = async (
  farmAddress: string,
  userAddress: string,
): Promise<string> => {
  try {
    // Validate and normalize addresses to checksum format
    if (!ethers.utils.isAddress(farmAddress)) {
      console.error(`[getUserStakedBalance] Invalid farm address: ${farmAddress}`);
      return '0';
    }
    if (!ethers.utils.isAddress(userAddress)) {
      console.error(`[getUserStakedBalance] Invalid user address: ${userAddress}`);
      return '0';
    }

    // Normalize addresses to checksum format to ensure consistent comparison
    const normalizedFarmAddress = ethers.utils.getAddress(farmAddress);
    const normalizedUserAddress = ethers.utils.getAddress(userAddress);

    const provider = getProvider();
    const farmContract = new ethers.Contract(normalizedFarmAddress, MULTI_REWARDS_ABI, provider);
    const stakedBalance = await farmContract.balanceOf(normalizedUserAddress);

    // Log successful calls for debugging (only if balance > 0 to avoid spam)
    if (stakedBalance && !stakedBalance.isZero()) {
      console.debug(
        `[getUserStakedBalance] Found balance for farm ${normalizedFarmAddress}, user ${normalizedUserAddress}: ${stakedBalance.toString()}`,
      );
    }

    return stakedBalance.toString();
  } catch (error: any) {
    // Log all errors for debugging - don't silently swallow them
    // Check if it's a contract call error (revert) vs network error
    if (error.code === 'CALL_EXCEPTION' || error.reason === 'execution reverted') {
      // Contract doesn't exist or method doesn't exist - expected for invalid farms
      console.debug(
        `[getUserStakedBalance] Contract call failed for farm ${farmAddress}, user ${userAddress} (may not exist or user has no position)`,
      );
    } else {
      console.error(
        `[getUserStakedBalance] Error fetching staked balance for farm ${farmAddress}, user ${userAddress}:`,
        error,
      );
    }
    return '0';
  }
};

/**
 * Get all reward token addresses from MultiRewards contract
 * @param farmAddress - Address of the MultiRewards farm contract
 * @returns Array of reward token addresses, or empty array if error
 */
const getRewardTokens = async (farmAddress: string): Promise<string[]> => {
  try {
    const provider = getProvider();
    const farmContract = new ethers.Contract(farmAddress, MULTI_REWARDS_ABI, provider);

    // Try to get rewardTokens array by calling rewardTokens with increasing index
    // until we get an error (which means we've reached the end)
    // Safety limit: max 20 reward tokens per farm (should be more than enough)
    const MAX_REWARD_TOKENS = 20;
    const rewardTokens: string[] = [];
    let index = 0;
    let hasMore = true;

    while (hasMore && index < MAX_REWARD_TOKENS) {
      try {
        const tokenAddress = await farmContract.rewardTokens(index);
        // Validate that we got a valid address (not zero address)
        if (tokenAddress && tokenAddress !== ethers.constants.AddressZero) {
          rewardTokens.push(tokenAddress);
          index++;
        } else {
          // Zero address means we've reached the end
          hasMore = false;
        }
      } catch (error: any) {
        // Check if error is due to array out of bounds (expected) vs other errors
        // In Solidity 0.5.17, accessing array out of bounds reverts
        // Reached the end of the array or invalid index
        hasMore = false;
      }
    }

    if (index >= MAX_REWARD_TOKENS) {
      console.warn(
        `[getRewardTokens] Reached max limit (${MAX_REWARD_TOKENS}) for farm ${farmAddress}. There may be more reward tokens.`,
      );
    }

    return rewardTokens;
  } catch (error) {
    console.error(`[getRewardTokens] Error fetching reward tokens for farm ${farmAddress}:`, error);
    return [];
  }
};

/**
 * Get user's earned rewards for a specific reward token
 * @param farmAddress - Address of the MultiRewards farm contract
 * @param userAddress - User's address (not Hedera ID)
 * @param rewardTokenAddress - Address of the reward token
 * @returns Earned reward amount as string (in wei), or '0' if error
 */
const getUserEarnedReward = async (
  farmAddress: string,
  userAddress: string,
  rewardTokenAddress: string,
): Promise<string> => {
  try {
    const provider = getProvider();
    const farmContract = new ethers.Contract(farmAddress, MULTI_REWARDS_ABI, provider);
    const earnedAmount = await farmContract.earned(userAddress, rewardTokenAddress);
    return earnedAmount.toString();
  } catch (error: any) {
    // Check if it's a contract call error (revert) vs network error
    if (error.code === 'CALL_EXCEPTION' || error.reason === 'execution reverted') {
      // Contract call failed - reward token may not be enabled or other contract issue
      console.debug(
        `[getUserEarnedReward] Contract call failed for token ${rewardTokenAddress} in farm ${farmAddress}`,
      );
    } else {
      console.error(
        `[getUserEarnedReward] Error fetching earned reward for token ${rewardTokenAddress} in farm ${farmAddress}:`,
        error,
      );
    }
    return '0';
  }
};

/**
 * Calculate LP token value in USD based on pool reserves
 * @param poolData - Pool data containing reserves and token info
 * @param pools - Array of all pools for price lookup
 * @param hbarPrice - Current HBAR price
 * @returns LP token value in USD
 */
const calculateLPValue = (poolData: IPoolData, pools: IPoolData[], hbarPrice: number): number => {
  const { token0Amount, token1Amount, pairSupply, token0, token1, token0Decimals, token1Decimals } =
    poolData;

  const token0Price = getTokenPrice(pools, token0, hbarPrice);
  const token1Price = getTokenPrice(pools, token1, hbarPrice);

  const token0AmountFormatted = formatStringWeiToStringEther(token0Amount, token0Decimals);
  const token1AmountFormatted = formatStringWeiToStringEther(token1Amount, token1Decimals);
  const pairSupplyFormatted = formatStringWeiToStringEther(pairSupply);

  const token0Value = Number(token0AmountFormatted) * Number(token0Price);
  const token1Value = Number(token1AmountFormatted) * Number(token1Price);

  let totalLpValue = 0;

  if (token0Value !== 0 && token1Value !== 0) {
    totalLpValue = token0Value + token1Value;
  } else if (token0Value !== 0) {
    totalLpValue = 2 * token0Value;
  } else if (token1Value !== 0) {
    totalLpValue = 2 * token1Value;
  }

  const lPValue = totalLpValue / Number(pairSupplyFormatted);

  return lPValue;
};

/**
 * Get user's complete farm position data from MultiRewards contract
 * @param farmAddress - Address of the MultiRewards farm contract
 * @param userAddress - User's address (not Hedera ID)
 * @param poolData - Pool data for calculating USD values
 * @param pools - Array of all pools for price lookup
 * @param hbarPrice - Current HBAR price
 * @param rewardsData - Array of reward data (for getting decimals and symbols)
 * @returns User staking data with staked amount and accumulated rewards, or null if error
 */
export const getUserFarmPosition = async (
  farmAddress: string,
  userAddress: string,
  poolData: IPoolData,
  pools: IPoolData[],
  hbarPrice: number,
  rewardsData: Array<{ address: string; decimals: number }>,
): Promise<IUserStakingData | null> => {
  try {
    // Validate inputs
    if (!farmAddress || !userAddress || !poolData || !pools || pools.length === 0) {
      console.error(
        `[getUserFarmPosition] Invalid inputs - farmAddress: ${!!farmAddress}, userAddress: ${!!userAddress}, poolData: ${!!poolData}, pools: ${
          pools.length
        }`,
      );
      return null;
    }

    // Normalize addresses to checksum format
    const normalizedFarmAddress = ethers.utils.getAddress(farmAddress);
    const normalizedUserAddress = ethers.utils.getAddress(userAddress);

    console.debug(
      `[getUserFarmPosition] Checking position - Farm: ${normalizedFarmAddress}, User: ${normalizedUserAddress}`,
    );

    // Get user's staked balance
    const stakedAmount = await getUserStakedBalance(normalizedFarmAddress, normalizedUserAddress);

    console.debug(
      `[getUserFarmPosition] Staked balance result - Farm: ${normalizedFarmAddress}, User: ${normalizedUserAddress}, Balance: ${stakedAmount}`,
    );

    // If user has no staked amount, return empty position
    if (!stakedAmount || stakedAmount === '0') {
      return {
        stakedAmount: '0',
        stakedAmountUSD: '0',
        rewardsAccumulated: [],
      };
    }

    // Calculate LP value for USD conversion
    // LP tokens use 18 decimals (default in formatStringWeiToStringEther)
    const lpValue = calculateLPValue(poolData, pools, hbarPrice);
    const stakedAmountFormatted = formatStringWeiToStringEther(stakedAmount); // Defaults to 18 decimals for LP tokens
    const stakedAmountUSD = (lpValue * Number(stakedAmountFormatted)).toString();

    // Get all reward token addresses
    const rewardTokenAddresses = await getRewardTokens(normalizedFarmAddress);

    // Fetch earned rewards for each reward token in parallel
    const earnedRewardsPromises = rewardTokenAddresses.map(rewardTokenAddress =>
      getUserEarnedReward(normalizedFarmAddress, normalizedUserAddress, rewardTokenAddress),
    );

    const earnedRewards = await Promise.all(earnedRewardsPromises);

    // Process rewards and calculate USD values
    const rewardsAccumulated: IRewardsAccumulated[] = [];

    for (let i = 0; i < rewardTokenAddresses.length; i++) {
      const rewardTokenAddress = rewardTokenAddresses[i];
      const earnedAmount = earnedRewards[i];

      // Only include rewards that are greater than 0
      if (earnedAmount && earnedAmount !== '0') {
        // Find reward data to get decimals
        const rewardInfo = rewardsData.find(
          r => r.address.toLowerCase() === rewardTokenAddress.toLowerCase(),
        );
        const rewardDecimals = rewardInfo?.decimals || 18;

        // Calculate USD value
        const rewardPrice = getTokenPrice(pools, rewardTokenAddress, hbarPrice);
        const earnedAmountFormatted = formatStringWeiToStringEther(earnedAmount, rewardDecimals);
        const totalAccumulatedUSD = (Number(rewardPrice) * Number(earnedAmountFormatted)).toFixed(
          2,
        );

        rewardsAccumulated.push({
          address: rewardTokenAddress,
          totalAccumulated: earnedAmount,
          totalAccumulatedUSD,
        });
      }
    }

    return {
      stakedAmount,
      stakedAmountUSD,
      rewardsAccumulated,
    };
  } catch (error) {
    console.error(`Error fetching user farm position for farm ${farmAddress}:`, error);
    // Return null to indicate error, caller can handle fallback
    return null;
  }
};
