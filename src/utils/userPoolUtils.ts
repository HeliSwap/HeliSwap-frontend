import { ethers } from 'ethers';
import BigNumber from 'bignumber.js';
import { IPoolExtendedData } from '../interfaces/tokens';
import { getProvider } from './tokenUtils';
import {
  idToAddress,
  calculateReserves,
  calculatePercentageByShare,
  mapHBARTokenSymbol,
  isPoolDeprecated,
  isPoolNew,
  getTokenPrice,
} from './tokenUtils';
import { formatStringWeiToStringEther } from './numberUtils';
import { getFarmByPairAddress } from './farmDataLoader';

const ERC20 = require('../abi/ERC20.json');

// Minimal ABI for MultiRewards contract - only balanceOf method needed
const MULTI_REWARDS_ABI = ['function balanceOf(address account) external view returns (uint256)'];

/**
 * Get user's LP token balance for a specific pair contract
 * @param pairAddress - Address of the pair contract (LP token)
 * @param userAddress - User's address (not Hedera ID)
 * @returns LP token balance as string (in wei)
 */
export const getUserLPBalance = async (
  pairAddress: string,
  userAddress: string,
): Promise<string> => {
  try {
    const provider = getProvider();
    // Pair contracts are ERC20 tokens, so we can use ERC20 ABI
    const pairContract = new ethers.Contract(pairAddress, ERC20.abi, provider);
    const balance = await pairContract.balanceOf(userAddress);
    return balance.toString();
  } catch (error) {
    console.error(`Error fetching LP balance for pair ${pairAddress}:`, error);
    return '0';
  }
};

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
    const provider = getProvider();
    // MultiRewards contract has balanceOf method similar to ERC20
    const farmContract = new ethers.Contract(farmAddress, MULTI_REWARDS_ABI, provider);
    const stakedBalance = await farmContract.balanceOf(userAddress);
    return stakedBalance.toString();
  } catch (error) {
    // Silently return '0' if farm doesn't exist or call fails
    // This is expected for pools without farms
    return '0';
  }
};

/**
 * Get user's positions in pools by checking LP token balances
 * @param pools - Array of pools to check
 * @param userId - User's Hedera ID
 * @param hbarPrice - Current HBAR price
 * @returns Array of pools where user has LP positions
 */
export const getUserPoolPositions = async (
  pools: IPoolExtendedData[],
  userId: string,
  hbarPrice: number,
): Promise<IPoolExtendedData[]> => {
  if (!userId || pools.length === 0) {
    return [];
  }

  const userAddress = idToAddress(userId);
  const userPools: IPoolExtendedData[] = [];

  // Process pools in batches for better performance
  // Check multiple pools in parallel, but limit concurrency to avoid overwhelming the network
  const BATCH_SIZE = 20;

  for (let i = 0; i < pools.length; i += BATCH_SIZE) {
    const batch = pools.slice(i, i + BATCH_SIZE);

    // Check all pools in this batch in parallel
    // Fetch both LP balance and staked balance (if farm exists)
    const balancePromises = batch.map(async pool => {
      try {
        const [lpBalance, stakedBalance] = await Promise.all([
          getUserLPBalance(pool.pairAddress, userAddress),
          // Check if pool has a farm and fetch staked balance
          (async () => {
            const farm = getFarmByPairAddress(pool.pairAddress);
            if (farm && farm.address) {
              return await getUserStakedBalance(farm.address, userAddress);
            }
            return '0';
          })(),
        ]);
        return { pool, lpBalance, stakedBalance, success: true };
      } catch (error) {
        return { pool, lpBalance: '0', stakedBalance: '0', success: false };
      }
    });

    const results = await Promise.all(balancePromises);

    // Process pools where user has balance > 0 (either LP or staked)
    for (const { pool, lpBalance, stakedBalance, success } of results) {
      // Skip if the call failed
      if (!success) {
        continue;
      }

      // Skip if both LP balance and staked balance are zero
      const hasLPBalance = lpBalance && lpBalance !== '0' && new BigNumber(lpBalance).gt(0);
      const hasStakedBalance =
        stakedBalance && stakedBalance !== '0' && new BigNumber(stakedBalance).gt(0);

      if (!hasLPBalance && !hasStakedBalance) {
        continue;
      }

      try {
        // Get token prices for TVL calculation
        const token0Price = getTokenPrice(pools, pool.token0, hbarPrice);
        const token1Price = getTokenPrice(pools, pool.token1, hbarPrice);
        const token0PriceNum = Number(token0Price);
        const token1PriceNum = Number(token1Price);

        // Calculate user's share of reserves (only if user has LP balance)
        let reserve0ShareStr = '0';
        let reserve1ShareStr = '0';
        if (hasLPBalance && lpBalance) {
          const reserves = calculateReserves(
            lpBalance,
            pool.pairSupply,
            pool.token0Amount,
            pool.token1Amount,
            pool.token0Decimals,
            pool.token1Decimals,
          );
          reserve0ShareStr = reserves.reserve0ShareStr;
          reserve1ShareStr = reserves.reserve1ShareStr;
        }

        // Calculate TVL based on LP balance
        let totalLpValue = 0;
        if (hasLPBalance) {
          if (token0PriceNum !== 0 && token1PriceNum !== 0) {
            const token0Value = Number(reserve0ShareStr) * token0PriceNum;
            const token1Value = Number(reserve1ShareStr) * token1PriceNum;
            totalLpValue = token0Value + token1Value;
          } else if (token0PriceNum !== 0) {
            const token0Value = Number(reserve0ShareStr) * token0PriceNum;
            totalLpValue = 2 * token0Value;
          } else if (token1PriceNum !== 0) {
            const token1Value = Number(reserve1ShareStr) * token1PriceNum;
            totalLpValue = 2 * token1Value;
          }
        }

        const totalLpValueStr = totalLpValue.toFixed(2);
        const lpSharesFormatted = formatStringWeiToStringEther(lpBalance || '0', 18);
        const userPercentageShare = hasLPBalance
          ? calculatePercentageByShare(pool.pairSupply, lpBalance || '0')
          : '0';

        // Process staked balance and farm address
        // Get farm address for this pool (if it exists)
        const farm = getFarmByPairAddress(pool.pairAddress);
        let farmAddress: string | undefined = undefined;
        if (farm && farm.address) {
          farmAddress = farm.address;
        }

        let stakedBalanceFormatted = '0';
        let stakedTvl = '0';
        let stakedToken0AmountFormatted = '0';
        let stakedToken1AmountFormatted = '0';

        // Calculate staked data if user has staked tokens
        if (hasStakedBalance && stakedBalance && farmAddress) {
          stakedBalanceFormatted = formatStringWeiToStringEther(stakedBalance, 18);

          // Calculate staked reserves (user's share of staked tokens)
          const { reserve0ShareStr: stakedReserve0, reserve1ShareStr: stakedReserve1 } =
            calculateReserves(
              stakedBalance,
              pool.pairSupply,
              pool.token0Amount,
              pool.token1Amount,
              pool.token0Decimals,
              pool.token1Decimals,
            );

          stakedToken0AmountFormatted = stakedReserve0;
          stakedToken1AmountFormatted = stakedReserve1;

          // Calculate staked TVL
          let stakedTvlValue = 0;
          if (token0PriceNum !== 0 && token1PriceNum !== 0) {
            const stakedToken0Value = Number(stakedReserve0) * token0PriceNum;
            const stakedToken1Value = Number(stakedReserve1) * token1PriceNum;
            stakedTvlValue = stakedToken0Value + stakedToken1Value;
          } else if (token0PriceNum !== 0) {
            const stakedToken0Value = Number(stakedReserve0) * token0PriceNum;
            stakedTvlValue = 2 * stakedToken0Value;
          } else if (token1PriceNum !== 0) {
            const stakedToken1Value = Number(stakedReserve1) * token1PriceNum;
            stakedTvlValue = 2 * stakedToken1Value;
          }
          stakedTvl = stakedTvlValue.toFixed(2);
        }

        // Check if pool is for migration
        let forMigration = false;
        let newPool = false;

        if (isPoolDeprecated(pool.token0, pool.token1)) {
          forMigration = true;
        }

        if (isPoolNew(pool.token0, pool.token1)) {
          newPool = true;
        }

        // Create extended pool data with user-specific information
        const userPoolData: IPoolExtendedData = {
          ...pool,
          token0AmountFormatted: reserve0ShareStr,
          token1AmountFormatted: reserve1ShareStr,
          lpSharesFormatted,
          lpShares: lpBalance || '0',
          tvl: totalLpValueStr,
          tvlBN: new BigNumber(totalLpValueStr),
          poolPercenatage: userPercentageShare,
          token0Symbol: mapHBARTokenSymbol(pool.token0Symbol),
          token1Symbol: mapHBARTokenSymbol(pool.token1Symbol),
          forMigration,
          newPool,
          // Staked balance data fetched from MultiRewards contracts
          stakedBalance: stakedBalance || '0',
          stakedBalanceFormatted,
          stakedTvl,
          stakedToken0AmountFormatted,
          stakedToken1AmountFormatted,
          farmAddress,
          // Note: fees are not available from contracts alone
          feesNum: 0,
          feesStr: '0',
        };

        userPools.push(userPoolData);
      } catch (error) {
        // Skip pools that fail to process, continue with next pool
        console.error(`Error processing pool ${pool.pairAddress}:`, error);
        continue;
      }
    }
  }

  // Sort by TVL (highest first)
  return userPools.sort((a, b) => {
    return Number(b.tvlBN.minus(a.tvlBN));
  });
};
