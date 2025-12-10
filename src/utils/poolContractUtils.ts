import { ethers } from 'ethers';
import { IPoolData } from '../interfaces/tokens';
import poolsData from '../data/pools.json';
import farmsData from '../data/farms.json';

// Minimal ABI for UniswapV2Pair contract - only methods we need
const PAIR_ABI = [
  'function token0() external view returns (address)',
  'function token1() external view returns (address)',
  'function getReserves() external view returns (uint112 reserve0, uint112 reserve1, uint32 blockTimestampLast)',
  'function totalSupply() external view returns (uint256)',
  'function name() external pure returns (string memory)',
  'function symbol() external pure returns (string memory)',
];

// ERC20 ABI for token metadata
const ERC20_ABI = [
  'function name() external view returns (string memory)',
  'function symbol() external view returns (string memory)',
  'function decimals() external view returns (uint8)',
];

/**
 * Get hasCampaign status by checking if pairAddress exists in farms.json
 */
const getHasCampaign = (pairAddress: string): boolean => {
  return farmsData.some(
    (farm: any) => farm.poolData?.pairAddress?.toLowerCase() === pairAddress.toLowerCase(),
  );
};

/**
 * Fetch token metadata (name, symbol, decimals) from contract
 */
const getTokenMetadata = async (
  tokenAddress: string,
  provider: ethers.providers.JsonRpcProvider,
): Promise<{ name: string; symbol: string; decimals: number }> => {
  try {
    const tokenContract = new ethers.Contract(tokenAddress, ERC20_ABI, provider);
    const [name, symbol, decimals] = await Promise.all([
      tokenContract.name(),
      tokenContract.symbol(),
      tokenContract.decimals(),
    ]);
    return { name, symbol, decimals: decimals.toNumber() };
  } catch (error) {
    // Fallback: try to find in pools.json if contract call fails
    const poolData = poolsData.find(
      (p: any) =>
        p.token0?.toLowerCase() === tokenAddress.toLowerCase() ||
        p.token1?.toLowerCase() === tokenAddress.toLowerCase(),
    );
    if (poolData) {
      if (poolData.token0?.toLowerCase() === tokenAddress.toLowerCase()) {
        return {
          name: poolData.token0Name || 'Unknown',
          symbol: poolData.token0Symbol || 'Unknown',
          decimals: poolData.token0Decimals || 18,
        };
      } else {
        return {
          name: poolData.token1Name || 'Unknown',
          symbol: poolData.token1Symbol || 'Unknown',
          decimals: poolData.token1Decimals || 18,
        };
      }
    }
    // Default fallback
    return { name: 'Unknown', symbol: 'Unknown', decimals: 18 };
  }
};

/**
 * Ensure provider is ready by detecting network
 */
const ensureProviderReady = async (
  provider: ethers.providers.JsonRpcProvider,
): Promise<boolean> => {
  try {
    await provider.getNetwork();
    return true;
  } catch (error) {
    console.warn('Provider network detection failed:', error);
    return false;
  }
};

/**
 * Fetch pool data from contract for a single pool
 */
export const fetchPoolDataFromContract = async (
  pairAddress: string,
  provider: ethers.providers.JsonRpcProvider,
): Promise<IPoolData | null> => {
  try {
    const pairContract = new ethers.Contract(pairAddress, PAIR_ABI, provider);

    // Fetch pair contract data with timeout protection
    const [token0Address, token1Address, reserves, totalSupply, pairName, pairSymbol] =
      await Promise.all([
        pairContract.token0(),
        pairContract.token1(),
        pairContract.getReserves(),
        pairContract.totalSupply(),
        pairContract.name(),
        pairContract.symbol(),
      ]);

    // Fetch token metadata
    const [token0Metadata, token1Metadata] = await Promise.all([
      getTokenMetadata(token0Address, provider),
      getTokenMetadata(token1Address, provider),
    ]);

    // Check if pool has campaign
    const hasCampaign = getHasCampaign(pairAddress);

    // Build pool data object matching IPoolData interface
    const poolData: IPoolData = {
      pairName: pairName || `${token0Metadata.symbol} ${token1Metadata.symbol} LP`,
      pairSymbol: pairSymbol || `${token0Metadata.symbol} ${token1Metadata.symbol}`,
      pairAddress: pairAddress.toLowerCase(),
      pairSupply: totalSupply.toString(),
      token0: token0Address.toLowerCase(),
      token0Name: token0Metadata.name,
      token0Amount: reserves.reserve0.toString(),
      token0Symbol: token0Metadata.symbol,
      token0Decimals: token0Metadata.decimals,
      token1: token1Address.toLowerCase(),
      token1Name: token1Metadata.name,
      token1Amount: reserves.reserve1.toString(),
      token1Symbol: token1Metadata.symbol,
      token1Decimals: token1Metadata.decimals,
      volume7d: '0', // Not available from contracts
      volume24h: '0', // Not available from contracts
      hasCampaign,
      hasProblematicToken: false, // Not available from contracts
    };

    return poolData;
  } catch (error: any) {
    // Silently fail for individual pools to avoid console spam
    // Only log if it's not a network error (those are handled at the top level)
    if (error?.code !== 'NETWORK_ERROR' && error?.event !== 'noNetwork') {
      console.warn(`Failed to fetch pool data for ${pairAddress}:`, error);
    }
    return null;
  }
};

/**
 * Fetch pool data for all pools from pools.json
 */
export const fetchAllPoolsFromContracts = async (
  provider: ethers.providers.JsonRpcProvider,
): Promise<IPoolData[]> => {
  // Ensure provider is ready once before fetching all pools
  const isReady = await ensureProviderReady(provider);
  if (!isReady) {
    console.error('Provider not ready, cannot fetch pools');
    return [];
  }

  // Get unique pool addresses from pools.json
  const poolAddresses = Array.from(
    new Set(poolsData.map((pool: any) => pool.pairAddress?.toLowerCase()).filter(Boolean)),
  ) as string[];

  // Fetch data for all pools in parallel (with reasonable concurrency limit)
  // Smaller batch size to reduce network load
  const BATCH_SIZE = 5;
  const pools: IPoolData[] = [];
  let successCount = 0;
  let failCount = 0;

  for (let i = 0; i < poolAddresses.length; i += BATCH_SIZE) {
    const batch = poolAddresses.slice(i, i + BATCH_SIZE);
    const batchResults = await Promise.allSettled(
      batch.map(address => fetchPoolDataFromContract(address, provider)),
    );

    batchResults.forEach((result, index) => {
      if (result.status === 'fulfilled' && result.value !== null) {
        pools.push(result.value);
        successCount++;
      } else {
        failCount++;
      }
    });
  }

  // Log summary instead of individual errors
  if (failCount > 0) {
    console.warn(`Failed to fetch ${failCount} pools, successfully fetched ${successCount} pools`);
  }

  return pools;
};
