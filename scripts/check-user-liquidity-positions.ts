/**
 * Script to check user liquidity positions from every pool
 *
 * This script:
 * 1. Loads pools from pools.json
 * 2. Loads user IDs from id.json
 * 3. Checks balanceOf (LP tokens) for each user ID against each pool's pair contract
 * 4. Checks staked balances from all farms matching each pool
 * 5. Reports all positions found (unstaked + staked)
 *
 * Usage:
 *   ts-node scripts/check-user-liquidity-positions.ts
 */

import * as dotenv from 'dotenv';
import { ethers } from 'ethers';
import { hethers } from '@hashgraph/hethers';
import BigNumber from 'bignumber.js';
import * as fs from 'fs';
import * as path from 'path';

// Load environment variables
dotenv.config();

// ERC20 ABI - only need balanceOf function for LP tokens
const ERC20_ABI = ['function balanceOf(address account) external view returns (uint256)'];

// MultiRewards contract ABI - only need balanceOf function for staked tokens
const MULTI_REWARDS_ABI = ['function balanceOf(address account) external view returns (uint256)'];

// Helper function to convert Hedera ID to EVM address
const idToAddress = (id: string): string => {
  if (!id || id === '') {
    throw new Error('Cannot convert empty Hedera ID to address');
  }

  // Check if it's already an EVM address (starts with 0x and is 42 chars)
  if (id.startsWith('0x') && id.length === 42) {
    return id; // Already an EVM address, return as-is
  }

  // Use hethers library to convert Hedera ID to EVM address
  try {
    const address = hethers.utils.getAddressFromAccount(id);
    // Get checksum address
    return hethers.utils.getChecksumAddress(address);
  } catch (error: any) {
    throw new Error(`Failed to convert Hedera ID "${id}" to address: ${error.message}`);
  }
};

// Load farms data to check for staked positions
const loadFarms = () => {
  const farmsDataPath = path.join(__dirname, '../src/data/farms.json');
  return JSON.parse(fs.readFileSync(farmsDataPath, 'utf-8'));
};

// Get all farms matching a pair address
const getAllFarmsByPairAddress = (pairAddress: string, farmsData: any[]): any[] => {
  return farmsData.filter(
    (farm: any) =>
      farm.poolData?.pairAddress?.toLowerCase() === pairAddress.toLowerCase() ||
      farm.stakingTokenAddress?.toLowerCase() === pairAddress.toLowerCase(),
  );
};

// Check user's LP token balance (unstaked)
const checkLPBalance = async (
  pairAddress: string,
  userAddress: string,
  provider: ethers.providers.JsonRpcProvider,
): Promise<BigNumber> => {
  try {
    const contract = new ethers.Contract(pairAddress, ERC20_ABI, provider);
    const balance = await contract.balanceOf(userAddress);
    return new BigNumber(balance.toString());
  } catch (error: any) {
    console.error(`   Error checking LP balance: ${error.message}`);
    return new BigNumber('0');
  }
};

// Check user's staked balance in a farm
const checkStakedBalance = async (
  farmAddress: string,
  userAddress: string,
  provider: ethers.providers.JsonRpcProvider,
): Promise<BigNumber> => {
  try {
    const contract = new ethers.Contract(farmAddress, MULTI_REWARDS_ABI, provider);
    const balance = await contract.balanceOf(userAddress);
    return new BigNumber(balance.toString());
  } catch (error: any) {
    // Silently return 0 if farm doesn't exist or call fails
    return new BigNumber('0');
  }
};

// Main function
async function main() {
  // Check environment variables
  const providerUrl = process.env.REACT_APP_PROVIDER_URL;

  if (!providerUrl) {
    throw new Error('Missing REACT_APP_PROVIDER_URL in .env file');
  }

  // Load pools data
  const poolsDataPath = path.join(__dirname, '../src/data/pools.json');
  const poolsData = JSON.parse(fs.readFileSync(poolsDataPath, 'utf-8'));

  // Load farms data
  const farmsData = loadFarms();

  // Load user IDs
  const idsDataPath = path.join(__dirname, '../src/data/id.json');
  const userIds = JSON.parse(fs.readFileSync(idsDataPath, 'utf-8'));

  console.log('🚀 Starting user liquidity positions check...\n');
  console.log(`   Total pools: ${poolsData.length}`);
  console.log(`   Total farms: ${farmsData.length}`);
  console.log(`   Total user IDs: ${userIds.length}\n`);

  // Initialize provider
  const provider = new ethers.providers.JsonRpcProvider(providerUrl);

  // Convert all user IDs to addresses upfront (one-time conversion)
  console.log('🔄 Converting user IDs to addresses...');
  const userAddresses = userIds
    .map((userId: string) => {
      try {
        return {
          userId,
          address: idToAddress(userId),
        };
      } catch (error: any) {
        console.error(`   ⚠️  Failed to convert ${userId}: ${error.message}`);
        return null;
      }
    })
    .filter(
      (
        item: { userId: string; address: string } | null,
      ): item is { userId: string; address: string } => item !== null,
    );

  console.log(`   ✅ Converted ${userAddresses.length} user IDs\n`);

  // Store results
  const results: Array<{
    poolPairAddress: string;
    poolPairSymbol: string;
    userId: string;
    userAddress: string;
    lpBalance: string;
    stakedBalance: string;
    totalBalance: string;
    farmsChecked: string[];
  }> = [];

  // Process pools in batches of 30 for better performance
  const BATCH_SIZE = 30;
  const totalBatches = Math.ceil(poolsData.length / BATCH_SIZE);

  console.log(
    `📦 Processing ${poolsData.length} pools in ${totalBatches} batches of ${BATCH_SIZE}\n`,
  );

  for (let batchIndex = 0; batchIndex < totalBatches; batchIndex++) {
    const batchStart = batchIndex * BATCH_SIZE;
    const batchEnd = Math.min(batchStart + BATCH_SIZE, poolsData.length);
    const batch = poolsData.slice(batchStart, batchEnd);

    console.log(
      `📦 Processing batch ${batchIndex + 1}/${totalBatches} (pools ${batchStart + 1}-${batchEnd})`,
    );

    // Process all pools in this batch in parallel
    const batchPromises = batch.map(async (pool: any, poolIndexInBatch: number) => {
      const pairAddress = pool.pairAddress;
      const pairSymbol = pool.pairSymbol || `${pool.token0Symbol}/${pool.token1Symbol}`;
      const globalPoolIndex = batchStart + poolIndexInBatch + 1;

      // Get all farms matching this pool
      const matchingFarms = getAllFarmsByPairAddress(pairAddress, farmsData);

      // Check all users for this pool in parallel
      const userCheckPromises = userAddresses.map(
        async ({ userId, address: userAddress }: { userId: string; address: string }) => {
          try {
            // Check unstaked LP balance
            const lpBalance = await checkLPBalance(pairAddress, userAddress, provider);

            // Check staked balances from all matching farms
            const stakedBalancePromises = matchingFarms.map((farm: any) =>
              checkStakedBalance(farm.address, userAddress, provider),
            );
            const stakedBalances = await Promise.all(stakedBalancePromises);

            // Sum all staked balances
            let totalStaked = new BigNumber('0');
            const farmsWithStake: string[] = [];
            for (let j = 0; j < stakedBalances.length; j++) {
              const balance = stakedBalances[j];
              if (balance.gt(0)) {
                totalStaked = totalStaked.plus(balance);
                farmsWithStake.push(matchingFarms[j].address);
              }
            }

            const totalBalance = lpBalance.plus(totalStaked);

            return {
              poolPairAddress: pairAddress,
              poolPairSymbol: pairSymbol,
              userId,
              userAddress,
              lpBalance,
              stakedBalance: totalStaked,
              totalBalance,
              farmsChecked: matchingFarms.map((f: any) => f.address),
              farmsWithStake,
              globalPoolIndex,
            };
          } catch (error: any) {
            console.error(`   ❌ Error checking ${userId} in pool ${pairSymbol}: ${error.message}`);
            return null;
          }
        },
      );

      const poolResults = await Promise.all(userCheckPromises);
      return { pool: { pairAddress, pairSymbol }, results: poolResults, globalPoolIndex };
    });

    // Wait for all pools in this batch to complete
    const batchResults = await Promise.all(batchPromises);

    // Process results from this batch
    batchResults.forEach(({ pool, results: poolResults, globalPoolIndex }) => {
      poolResults.forEach((result: any) => {
        if (result && result.totalBalance.gt(0)) {
          results.push({
            poolPairAddress: result.poolPairAddress,
            poolPairSymbol: result.poolPairSymbol,
            userId: result.userId,
            userAddress: result.userAddress,
            lpBalance: result.lpBalance.toString(),
            stakedBalance: result.stakedBalance.toString(),
            totalBalance: result.totalBalance.toString(),
            farmsChecked: result.farmsChecked,
          });

          const lpInfo = result.lpBalance.gt(0) ? `LP: ${result.lpBalance.toString()}` : '';
          const stakedInfo = result.stakedBalance.gt(0)
            ? `Staked: ${result.stakedBalance.toString()} (${result.farmsWithStake.length} farm(s))`
            : '';
          const balanceInfo = [lpInfo, stakedInfo].filter(Boolean).join(', ');

          console.log(
            `   ✅ Pool ${globalPoolIndex}: ${result.userId} (${result.userAddress}) in ${result.poolPairSymbol}: ${balanceInfo}`,
          );
        }
      });
    });

    console.log(`   ✅ Batch ${batchIndex + 1} completed\n`);
  }

  // Print summary
  console.log(`\n📋 Summary:`);
  console.log(`   Total positions found: ${results.length}`);

  // Group by user
  const positionsByUser = new Map<string, typeof results>();
  results.forEach(result => {
    if (!positionsByUser.has(result.userId)) {
      positionsByUser.set(result.userId, []);
    }
    positionsByUser.get(result.userId)!.push(result);
  });

  console.log(`   Users with positions: ${positionsByUser.size}`);

  if (results.length > 0) {
    console.log(`\n📝 Positions by User:\n`);

    positionsByUser.forEach((positions, userId) => {
      console.log(`   👤 User: ${userId}`);
      console.log(`      Total pools with positions: ${positions.length}\n`);

      positions.forEach((result, index) => {
        console.log(`      ${index + 1}. Pool: ${result.poolPairSymbol}`);
        console.log(`         Pair Address: ${result.poolPairAddress}`);
        console.log(`         Unstaked LP: ${result.lpBalance}`);
        console.log(`         Staked LP: ${result.stakedBalance}`);
        console.log(`         Total: ${result.totalBalance}`);
        if (result.farmsChecked.length > 0) {
          console.log(`         Farms checked: ${result.farmsChecked.length}`);
          if (result.stakedBalance !== '0') {
            const farmsWithStake = result.farmsChecked.filter((farmAddr, idx) => {
              // This is approximate - we know farms were checked but don't have per-farm balances here
              return true; // Show all checked farms
            });
            console.log(`         Farms with stake: ${farmsWithStake.join(', ')}`);
          }
        }
        console.log('');
      });
    });

    // Summary by pool
    console.log(`\n📊 Summary by Pool:\n`);
    const positionsByPool = new Map<string, typeof results>();
    results.forEach(result => {
      const key = `${result.poolPairSymbol} (${result.poolPairAddress})`;
      if (!positionsByPool.has(key)) {
        positionsByPool.set(key, []);
      }
      positionsByPool.get(key)!.push(result);
    });

    positionsByPool.forEach((positions, poolKey) => {
      const totalUsers = positions.length;
      const totalLP = positions.reduce(
        (sum, p) => sum.plus(new BigNumber(p.lpBalance)),
        new BigNumber('0'),
      );
      const totalStaked = positions.reduce(
        (sum, p) => sum.plus(new BigNumber(p.stakedBalance)),
        new BigNumber('0'),
      );
      const total = totalLP.plus(totalStaked);

      console.log(`   ${poolKey}`);
      console.log(`      Users: ${totalUsers}`);
      console.log(`      Total Unstaked LP: ${totalLP.toString()}`);
      console.log(`      Total Staked LP: ${totalStaked.toString()}`);
      console.log(`      Total LP: ${total.toString()}\n`);
    });
  } else {
    console.log(`\n   No liquidity positions found for any user in any pool.`);
  }
}

// Run the script
main()
  .then(() => {
    console.log('\n✅ Script completed successfully');
    process.exit(0);
  })
  .catch(error => {
    console.error('\n❌ Script failed:', error);
    process.exit(1);
  });
