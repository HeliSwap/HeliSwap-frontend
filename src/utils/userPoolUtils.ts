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

const ERC20 = require('../abi/ERC20.json');

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
    const balancePromises = batch.map(async pool => {
      try {
        const lpBalance = await getUserLPBalance(pool.pairAddress, userAddress);
        return { pool, lpBalance, success: true };
      } catch (error) {
        return { pool, lpBalance: '0', success: false };
      }
    });

    const results = await Promise.all(balancePromises);

    // Process pools where user has balance > 0
    for (const { pool, lpBalance, success } of results) {
      // Skip if the call failed or balance is zero
      if (!success || !lpBalance || lpBalance === '0' || !new BigNumber(lpBalance).gt(0)) {
        continue;
      }

      try {
        // Calculate user's share of reserves
        const { reserve0ShareStr, reserve1ShareStr } = calculateReserves(
          lpBalance,
          pool.pairSupply,
          pool.token0Amount,
          pool.token1Amount,
          pool.token0Decimals,
          pool.token1Decimals,
        );

        // Get token prices for TVL calculation
        const token0Price = getTokenPrice(pools, pool.token0, hbarPrice);
        const token1Price = getTokenPrice(pools, pool.token1, hbarPrice);
        const token0PriceNum = Number(token0Price);
        const token1PriceNum = Number(token1Price);

        // Calculate TVL
        let totalLpValue = 0;
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

        const totalLpValueStr = totalLpValue.toFixed(2);
        const lpSharesFormatted = formatStringWeiToStringEther(lpBalance, 18);
        const userPercentageShare = calculatePercentageByShare(pool.pairSupply, lpBalance);

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
          lpShares: lpBalance,
          tvl: totalLpValueStr,
          tvlBN: new BigNumber(totalLpValueStr),
          poolPercenatage: userPercentageShare,
          token0Symbol: mapHBARTokenSymbol(pool.token0Symbol),
          token1Symbol: mapHBARTokenSymbol(pool.token1Symbol),
          forMigration,
          newPool,
          // Note: fees and stakedBalance are not available from contracts alone
          // These would require additional contract calls or API data
          feesNum: 0,
          feesStr: '0',
          stakedBalance: '0',
          stakedBalanceFormatted: '0',
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
