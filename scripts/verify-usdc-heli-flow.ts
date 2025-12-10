/**
 * Script to verify the exact flow for USDC/HELI in "My positions"
 * Simulates what happens in Pools.tsx -> usePoolsByUser -> getUserPoolPositions
 */

import * as fs from 'fs';
import * as path from 'path';

// Simulate the functions
const loadAllPools = () => {
  const poolsData = JSON.parse(
    fs.readFileSync(path.join(__dirname, '../src/data/pools.json'), 'utf-8'),
  );
  return poolsData;
};

const getFarmByPairAddress = (pairAddress: string) => {
  const farmsData = JSON.parse(
    fs.readFileSync(path.join(__dirname, '../src/data/farms.json'), 'utf-8'),
  );
  return farmsData.find(
    (farm: any) =>
      farm.poolData?.pairAddress?.toLowerCase() === pairAddress.toLowerCase() ||
      farm.stakingTokenAddress?.toLowerCase() === pairAddress.toLowerCase(),
  );
};

console.log('🔍 Verifying USDC/HELI flow in "My positions"...\n');

// Step 1: Load all pools (what usePoolsByUser does)
const allPools = loadAllPools();
console.log(`1. Loaded ${allPools.length} pools from pools.json`);

// Step 2: Find USDC/HELI pool
const usdcHeliPool = allPools.find(
  (p: any) =>
    (p.token0Symbol === 'USDC' && p.token1Symbol === 'HELI') ||
    (p.token0Symbol === 'HELI' && p.token1Symbol === 'USDC'),
);

if (!usdcHeliPool) {
  console.log('❌ USDC/HELI pool NOT FOUND in pools.json!');
  process.exit(1);
}

console.log(`2. ✅ Found USDC/HELI pool:`);
console.log(`   pairAddress: ${usdcHeliPool.pairAddress}`);
console.log(`   token0: ${usdcHeliPool.token0Symbol}`);
console.log(`   token1: ${usdcHeliPool.token1Symbol}`);

// Step 3: Try to find matching farm (what getUserPoolPositions does)
const matchingFarm = getFarmByPairAddress(usdcHeliPool.pairAddress);

if (!matchingFarm) {
  console.log('\n❌ CRITICAL: No matching farm found for USDC/HELI pool!');
  console.log('   This means getFarmByPairAddress() will return undefined');
  console.log('   And staked balance check will be skipped');
  console.log('   Result: Pool will NOT appear in "My positions" if user only has staked tokens');
  process.exit(1);
}

console.log(`\n3. ✅ Found matching farm:`);
console.log(`   Farm Address: ${matchingFarm.address}`);
console.log(`   StakingTokenAddress: ${matchingFarm.stakingTokenAddress}`);
console.log(`   PoolData.pairAddress: ${matchingFarm.poolData?.pairAddress}`);

// Step 4: Verify address matching
const poolAddress = usdcHeliPool.pairAddress.toLowerCase();
const farmStakingToken = matchingFarm.stakingTokenAddress?.toLowerCase();
const farmPoolPairAddress = matchingFarm.poolData?.pairAddress?.toLowerCase();

console.log(`\n4. Address matching verification:`);
console.log(`   Pool pairAddress: ${poolAddress}`);
console.log(`   Farm stakingTokenAddress: ${farmStakingToken}`);
console.log(`   Farm poolData.pairAddress: ${farmPoolPairAddress}`);

const matchesStakingToken = poolAddress === farmStakingToken;
const matchesPoolPairAddress = poolAddress === farmPoolPairAddress;

if (matchesStakingToken) {
  console.log(`   ✅ Matches via stakingTokenAddress`);
} else if (matchesPoolPairAddress) {
  console.log(`   ✅ Matches via poolData.pairAddress`);
} else {
  console.log(`   ❌ NO MATCH - Addresses don't match!`);
  console.log(`   This is the problem!`);
}

console.log(`\n✅ Flow verification complete!`);
console.log(`\n💡 Conclusion:`);
if (matchesStakingToken || matchesPoolPairAddress) {
  console.log(`   The farm lookup SHOULD work. If USDC/HELI is missing from "My positions",`);
  console.log(`   the issue might be:`);
  console.log(`   1. User has NO unstaked LP tokens AND staked balance check is failing`);
  console.log(`   2. Pool is filtered out before reaching getUserPoolPositions`);
  console.log(`   3. There's an error in the staked balance check that's being silently caught`);
} else {
  console.log(`   ❌ Address mismatch detected - this is the root cause!`);
}
