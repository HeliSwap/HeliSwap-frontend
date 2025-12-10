import BigNumber from 'bignumber.js';
import { IPoolExtendedData } from '../interfaces/tokens';
import poolsData from '../data/pools.json';

/**
 * Loads all pools from the static pools.json file
 * Converts tvlBN from string to BigNumber to match the interface
 * @returns Array of all pools with properly typed tvlBN
 */
export const loadAllPools = (): IPoolExtendedData[] => {
  // Transform pools data to convert tvlBN from string to BigNumber
  return poolsData.map((pool: any) => ({
    ...pool,
    tvlBN: new BigNumber(pool.tvlBN || pool.tvl || '0'),
  })) as IPoolExtendedData[];
};

/**
 * Filters pools by a list of token addresses
 * Returns pools where either token0 or token1 matches any token in the list
 * @param tokensList - Array of token addresses to filter by
 * @returns Filtered array of pools
 */
export const filterPoolsByTokens = (tokensList: string[]): IPoolExtendedData[] => {
  if (tokensList.length === 0) {
    return [];
  }

  const allPools = loadAllPools();

  return allPools.filter(pool => {
    // Check if token0 or token1 is in the tokensList
    return tokensList.includes(pool.token0) || tokensList.includes(pool.token1);
  });
};
