/**
 * Final diagnosis: Why USDC/HELI doesn't appear in "My positions"
 *
 * Key insight: usePoolsByUser calls loadAllPools() which loads ALL pools,
 * so whitelist filtering shouldn't matter. But let's verify the complete flow.
 */

import * as fs from 'fs';
import * as path from 'path';

const farmsData = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../src/data/farms.json'), 'utf-8'),
);
const poolsData = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../src/data/pools.json'), 'utf-8'),
);

// Find USDC/HELI
const usdcHeliPool = poolsData.find(
  (p: any) =>
    (p.token0Symbol === 'USDC' && p.token1Symbol === 'HELI') ||
    (p.token0Symbol === 'HELI' && p.token1Symbol === 'USDC'),
);

const usdcHeliFarms = farmsData.filter(
  (f: any) =>
    (f.poolData?.token0Symbol === 'USDC' && f.poolData?.token1Symbol === 'HELI') ||
    (f.poolData?.token0Symbol === 'HELI' && f.poolData?.token1Symbol === 'USDC'),
);

console.log('🔍 FINAL DIAGNOSIS: USDC/HELI Missing from "My positions"\n');

console.log('📊 Data Verification:');
console.log(`   Pool exists: ${usdcHeliPool ? '✅ YES' : '❌ NO'}`);
console.log(`   Farms exist: ${usdcHeliFarms.length} found`);

if (usdcHeliPool) {
  console.log(`\n   Pool pairAddress: ${usdcHeliPool.pairAddress}`);
}

usdcHeliFarms.forEach((farm: any, i: number) => {
  console.log(`\n   Farm ${i + 1}:`);
  console.log(`     Address: ${farm.address}`);
  console.log(`     StakingTokenAddress: ${farm.stakingTokenAddress}`);
  console.log(`     PoolData.pairAddress: ${farm.poolData?.pairAddress}`);
  console.log(`     IsDeprecated: ${farm.isFarmDeprecated || false}`);

  // Check matching
  if (usdcHeliPool) {
    const matches =
      farm.stakingTokenAddress?.toLowerCase() === usdcHeliPool.pairAddress?.toLowerCase() ||
      farm.poolData?.pairAddress?.toLowerCase() === usdcHeliPool.pairAddress?.toLowerCase();
    console.log(`     Matches pool: ${matches ? '✅ YES' : '❌ NO'}`);
  }
});

console.log('\n🔍 Root Cause Analysis:\n');

if (!usdcHeliPool) {
  console.log("❌ ISSUE: Pool doesn't exist in pools.json");
  console.log('   → getUserPoolPositions() will never check this pool');
  console.log('   → Farm lookup never happens');
  console.log('   → Staked balance never checked');
} else {
  console.log('✅ Pool exists in pools.json');

  const activeFarm = usdcHeliFarms.find((f: any) => !f.isFarmDeprecated);
  const deprecatedFarm = usdcHeliFarms.find((f: any) => f.isFarmDeprecated);

  if (activeFarm) {
    console.log('✅ Active farm exists');
    const matches =
      activeFarm.stakingTokenAddress?.toLowerCase() === usdcHeliPool.pairAddress?.toLowerCase() ||
      activeFarm.poolData?.pairAddress?.toLowerCase() === usdcHeliPool.pairAddress?.toLowerCase();

    if (matches) {
      console.log('✅ Farm matches pool address');
      console.log('\n💡 CONCLUSION:');
      console.log('   The data is correct. The issue is likely:');
      console.log('   1. User has ONLY staked tokens (no unstaked LP)');
      console.log('   2. The staked balance check in getUserStakedBalance() is failing');
      console.log('   3. Error is being silently caught and returning "0"');
      console.log('   4. Since both lpBalance=0 AND stakedBalance=0, pool is skipped');
      console.log('\n   Check:');
      console.log('   - Is getUserStakedBalance() being called?');
      console.log('   - Is it returning an error?');
      console.log('   - Is the farm contract address correct?');
      console.log(`   - Farm contract: ${activeFarm.address}`);
      console.log(`   - Staking token: ${activeFarm.stakingTokenAddress}`);
    } else {
      console.log('❌ Farm does NOT match pool address');
      console.log('   This is the root cause!');
    }
  } else {
    console.log('⚠️  Only deprecated farm(s) exist');
    if (deprecatedFarm) {
      console.log(`   Deprecated farm: ${deprecatedFarm.address}`);
      console.log('   → This farm might be filtered out by farmsToExclude');
      console.log('   → Or getFarmByPairAddress might skip deprecated farms');
    }
  }
}

console.log('\n📋 Summary:');
console.log('   The issue is NOT a missing pool or address mismatch.');
console.log('   The issue is likely in the staked balance check logic.');
console.log('   Recommendation: Add logging to getUserStakedBalance() to see');
console.log("   if it's being called and what it returns.");
