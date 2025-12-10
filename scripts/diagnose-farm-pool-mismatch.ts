/**
 * Diagnostic script to identify mismatches between farms and pools
 *
 * This script:
 * 1. Loads all farms from farms.json
 * 2. Loads all pools from pools.json
 * 3. Checks which farms have matching pools (by pairAddress/stakingTokenAddress)
 * 4. Checks which pools have matching farms
 * 5. Reports mismatches that could cause the discrepancy in "My positions"
 *
 * Usage:
 *   ts-node scripts/diagnose-farm-pool-mismatch.ts
 */

import * as fs from 'fs';
import * as path from 'path';

// Helper to normalize addresses (lowercase for comparison)
const normalizeAddress = (address: string | undefined | null): string => {
  if (!address) return '';
  return address.toLowerCase().trim();
};

// Check if a farm matches a pool
const farmMatchesPool = (farm: any, pool: any): boolean => {
  const farmStakingToken = normalizeAddress(farm.stakingTokenAddress);
  const farmPoolPairAddress = normalizeAddress(farm.poolData?.pairAddress);
  const poolPairAddress = normalizeAddress(pool.pairAddress);

  // Match if stakingTokenAddress matches pool's pairAddress
  if (farmStakingToken && farmStakingToken === poolPairAddress) {
    return true;
  }

  // Match if poolData.pairAddress matches pool's pairAddress
  if (farmPoolPairAddress && farmPoolPairAddress === poolPairAddress) {
    return true;
  }

  return false;
};

// Main function
async function main() {
  console.log('🔍 Starting farm-pool mismatch diagnosis...\n');

  // Load farms data
  const farmsDataPath = path.join(__dirname, '../src/data/farms.json');
  const farmsData = JSON.parse(fs.readFileSync(farmsDataPath, 'utf-8'));

  // Load pools data
  const poolsDataPath = path.join(__dirname, '../src/data/pools.json');
  const poolsData = JSON.parse(fs.readFileSync(poolsDataPath, 'utf-8'));

  console.log(`📊 Loaded ${farmsData.length} farms`);
  console.log(`📊 Loaded ${poolsData.length} pools\n`);

  // Track matches and mismatches
  const farmsWithMatches: Array<{
    farm: any;
    matchingPools: any[];
  }> = [];

  const farmsWithoutMatches: Array<{
    farm: any;
    stakingTokenAddress: string;
    poolDataPairAddress: string;
  }> = [];

  const poolsWithMatches: Array<{
    pool: any;
    matchingFarms: any[];
  }> = [];

  const poolsWithoutMatches: any[] = [];

  // Check each farm for matching pools
  console.log('🔍 Checking farms for matching pools...');
  farmsData.forEach((farm: any, index: number) => {
    const matchingPools = poolsData.filter((pool: any) => farmMatchesPool(farm, pool));

    const farmInfo = {
      address: farm.address,
      stakingTokenAddress: farm.stakingTokenAddress || 'N/A',
      poolDataPairAddress: farm.poolData?.pairAddress || 'N/A',
      token0Symbol: farm.poolData?.token0Symbol || '?',
      token1Symbol: farm.poolData?.token1Symbol || '?',
    };

    if (matchingPools.length > 0) {
      farmsWithMatches.push({
        farm: farmInfo,
        matchingPools: matchingPools.map((p: any) => ({
          pairAddress: p.pairAddress,
          token0Symbol: p.token0Symbol,
          token1Symbol: p.token1Symbol,
        })),
      });
    } else {
      farmsWithoutMatches.push({
        farm: farmInfo,
        stakingTokenAddress: farm.stakingTokenAddress || '',
        poolDataPairAddress: farm.poolData?.pairAddress || '',
      });
    }
  });

  // Check each pool for matching farms
  console.log('🔍 Checking pools for matching farms...');
  poolsData.forEach((pool: any) => {
    const matchingFarms = farmsData.filter((farm: any) => farmMatchesPool(farm, pool));

    if (matchingFarms.length > 0) {
      poolsWithMatches.push({
        pool: {
          pairAddress: pool.pairAddress,
          token0Symbol: pool.token0Symbol,
          token1Symbol: pool.token1Symbol,
        },
        matchingFarms: matchingFarms.map((f: any) => ({
          address: f.address,
          stakingTokenAddress: f.stakingTokenAddress || 'N/A',
          poolDataPairAddress: f.poolData?.pairAddress || 'N/A',
        })),
      });
    } else {
      poolsWithoutMatches.push({
        pairAddress: pool.pairAddress,
        token0Symbol: pool.token0Symbol,
        token1Symbol: pool.token1Symbol,
      });
    }
  });

  // Print summary
  console.log('\n📋 SUMMARY\n');
  console.log(`✅ Farms with matching pools: ${farmsWithMatches.length}`);
  console.log(`❌ Farms WITHOUT matching pools: ${farmsWithoutMatches.length}`);
  console.log(`✅ Pools with matching farms: ${poolsWithMatches.length}`);
  console.log(`❌ Pools WITHOUT matching farms: ${poolsWithoutMatches.length}\n`);

  // Print farms without matches (CRITICAL - these won't show in "My positions")
  if (farmsWithoutMatches.length > 0) {
    console.log(
      '🚨 CRITICAL: Farms WITHOUT matching pools (these won\'t appear in "My positions"):\n',
    );
    farmsWithoutMatches.forEach((item, index) => {
      console.log(`   ${index + 1}. Farm: ${item.farm.address}`);
      console.log(`      Pair: ${item.farm.token0Symbol}/${item.farm.token1Symbol}`);
      console.log(`      StakingTokenAddress: ${item.farm.stakingTokenAddress}`);
      console.log(`      PoolData.pairAddress: ${item.farm.poolDataPairAddress}`);
      console.log(
        `      ⚠️  This farm will NOT show in "My positions" if user only has staked tokens!`,
      );
      console.log('');
    });
  }

  // Print pools without matches (less critical, but good to know)
  if (poolsWithoutMatches.length > 0) {
    console.log(
      '⚠️  Pools WITHOUT matching farms (these won\'t show staked balance in "My positions"):\n',
    );
    poolsWithoutMatches.slice(0, 10).forEach((pool, index) => {
      console.log(`   ${index + 1}. Pool: ${pool.pairAddress}`);
      console.log(`      Pair: ${pool.token0Symbol}/${pool.token1Symbol}`);
      console.log('');
    });
    if (poolsWithoutMatches.length > 10) {
      console.log(`   ... and ${poolsWithoutMatches.length - 10} more pools without farms\n`);
    }
  }

  // Check for potential address format mismatches
  console.log('\n🔍 Checking for address format mismatches...\n');
  const addressMismatches: Array<{
    farm: any;
    potentialPool: any;
    reason: string;
  }> = [];

  farmsWithoutMatches.forEach((item: any) => {
    const stakingToken = normalizeAddress(item.stakingTokenAddress);
    const poolDataPair = normalizeAddress(item.poolDataPairAddress);

    // Check if there's a pool with similar address (different case/format)
    poolsData.forEach((pool: any) => {
      const poolPair = normalizeAddress(pool.pairAddress);

      // Check if addresses are similar but not exact match
      if (stakingToken && poolPair && stakingToken !== poolPair) {
        // Check if they're the same when both normalized (shouldn't happen, but check anyway)
        if (stakingToken.replace(/^0x/, '') === poolPair.replace(/^0x/, '')) {
          addressMismatches.push({
            farm: item.farm,
            potentialPool: {
              pairAddress: pool.pairAddress,
              token0Symbol: pool.token0Symbol,
              token1Symbol: pool.token1Symbol,
            },
            reason: 'Address format mismatch (same hex, different case/prefix)',
          });
        }
      }

      if (poolDataPair && poolPair && poolDataPair !== poolPair) {
        if (poolDataPair.replace(/^0x/, '') === poolPair.replace(/^0x/, '')) {
          addressMismatches.push({
            farm: item.farm,
            potentialPool: {
              pairAddress: pool.pairAddress,
              token0Symbol: pool.token0Symbol,
              token1Symbol: pool.token1Symbol,
            },
            reason: 'PoolData.pairAddress format mismatch',
          });
        }
      }
    });
  });

  if (addressMismatches.length > 0) {
    console.log('⚠️  Potential address format mismatches found:\n');
    addressMismatches.forEach((mismatch, index) => {
      console.log(`   ${index + 1}. Farm: ${mismatch.farm.address}`);
      console.log(`      Farm Pair: ${mismatch.farm.token0Symbol}/${mismatch.farm.token1Symbol}`);
      console.log(`      Potential Pool: ${mismatch.potentialPool.pairAddress}`);
      console.log(
        `      Pool Pair: ${mismatch.potentialPool.token0Symbol}/${mismatch.potentialPool.token1Symbol}`,
      );
      console.log(`      Reason: ${mismatch.reason}`);
      console.log('');
    });
  } else {
    console.log('✅ No address format mismatches detected\n');
  }

  // Check for farms with multiple matching pools (potential issue)
  const farmsWithMultiplePools = farmsWithMatches.filter(item => item.matchingPools.length > 1);
  if (farmsWithMultiplePools.length > 0) {
    console.log('⚠️  Farms with MULTIPLE matching pools (potential data issue):\n');
    farmsWithMultiplePools.forEach((item, index) => {
      console.log(`   ${index + 1}. Farm: ${item.farm.address}`);
      console.log(`      Pair: ${item.farm.token0Symbol}/${item.farm.token1Symbol}`);
      console.log(`      Matches ${item.matchingPools.length} pools:`);
      item.matchingPools.forEach((pool: any, poolIndex: number) => {
        console.log(
          `         ${poolIndex + 1}. ${pool.pairAddress} (${pool.token0Symbol}/${
            pool.token1Symbol
          })`,
        );
      });
      console.log('');
    });
  }

  // Check for pools with multiple matching farms (potential issue)
  const poolsWithMultipleFarms = poolsWithMatches.filter(item => item.matchingFarms.length > 1);
  if (poolsWithMultipleFarms.length > 0) {
    console.log('⚠️  Pools with MULTIPLE matching farms (potential data issue):\n');
    poolsWithMultipleFarms.slice(0, 5).forEach((item, index) => {
      console.log(`   ${index + 1}. Pool: ${item.pool.pairAddress}`);
      console.log(`      Pair: ${item.pool.token0Symbol}/${item.pool.token1Symbol}`);
      console.log(`      Matches ${item.matchingFarms.length} farms:`);
      item.matchingFarms.forEach((farm: any, farmIndex: number) => {
        console.log(`         ${farmIndex + 1}. ${farm.address}`);
      });
      console.log('');
    });
    if (poolsWithMultipleFarms.length > 5) {
      console.log(
        `   ... and ${poolsWithMultipleFarms.length - 5} more pools with multiple farms\n`,
      );
    }
  }

  console.log('\n✅ Diagnosis complete!\n');
  console.log('💡 Key findings:');
  console.log(
    '   - Farms without matching pools will NOT appear in "My positions" if user only has staked tokens',
  );
  console.log(
    '   - Pools without matching farms will show in "My positions" but without staked balance',
  );
  console.log(
    '   - This explains why Farms page shows 2 farms but "My positions" shows only 1 pool\n',
  );
}

// Run the script
main()
  .then(() => {
    console.log('✅ Script completed successfully');
    process.exit(0);
  })
  .catch(error => {
    console.error('\n❌ Script failed:', error);
    process.exit(1);
  });
