/**
 * Comparison: How staked liquidity is detected in Farms vs My Positions
 */

import * as fs from 'fs';
import * as path from 'path';

const farmsData = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../src/data/farms.json'), 'utf-8'),
);
const poolsData = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../src/data/pools.json'), 'utf-8'),
);

// Simulate loadAllFarms (with farmsToExclude filter)
const farmsToExclude: string[] = []; // Would come from constants
const loadAllFarms = () => {
  return farmsData.filter((farm: any) => !farmsToExclude.includes(farm.address));
};

// Simulate getFarmByPairAddress (used in My Positions)
const getFarmByPairAddress = (pairAddress: string) => {
  const allFarms = loadAllFarms();
  return allFarms.find(
    (farm: any) =>
      farm.poolData?.pairAddress?.toLowerCase() === pairAddress.toLowerCase() ||
      farm.stakingTokenAddress?.toLowerCase() === pairAddress.toLowerCase(),
  );
};

console.log('🔍 COMPARISON: Farms Page vs My Positions Detection\n');

// Find USDC/HELI
const usdcHeliPool = poolsData.find(
  (p: any) =>
    (p.token0Symbol === 'USDC' && p.token1Symbol === 'HELI') ||
    (p.token0Symbol === 'HELI' && p.token1Symbol === 'USDC'),
);

const allFarms = loadAllFarms();
const usdcHeliFarms = allFarms.filter(
  (f: any) =>
    (f.poolData?.token0Symbol === 'USDC' && f.poolData?.token1Symbol === 'HELI') ||
    (f.poolData?.token0Symbol === 'HELI' && f.poolData?.token1Symbol === 'USDC'),
);

console.log('📊 USDC/HELI Data:\n');
console.log(`Pool pairAddress: ${usdcHeliPool?.pairAddress}`);
console.log(`Total farms found: ${usdcHeliFarms.length}\n`);

usdcHeliFarms.forEach((farm: any, i: number) => {
  console.log(`Farm ${i + 1}:`);
  console.log(`  Address: ${farm.address}`);
  console.log(`  IsDeprecated: ${farm.isFarmDeprecated || false}`);
  console.log(`  StakingTokenAddress: ${farm.stakingTokenAddress}`);
  console.log(`  PoolData.pairAddress: ${farm.poolData?.pairAddress}`);
  console.log('');
});

console.log('\n🔍 HOW FARMS PAGE DETECTS STAKED LIQUIDITY:\n');
console.log('1. Uses useUserFarmsPositions hook');
console.log('2. Iterates through ALL farms from farms.json');
console.log('3. For EACH farm, calls getUserFarmPosition(farm.address, ...)');
console.log('4. Uses farm.address DIRECTLY from farms.json');
console.log('5. Checks staked balance on farm contract: farm.address\n');

console.log('✅ Farms Page Approach:');
usdcHeliFarms.forEach((farm: any, i: number) => {
  console.log(`   Farm ${i + 1}: Checks contract ${farm.address}`);
  console.log(`   → Would check BOTH farms if user has staked tokens`);
});
console.log('   Result: Shows ALL farms where user has staked tokens\n');

console.log('\n🔍 HOW MY POSITIONS DETECTS STAKED LIQUIDITY:\n');
console.log('1. Uses usePoolsByUser hook');
console.log('2. Iterates through ALL pools from pools.json');
console.log('3. For EACH pool, calls getFarmByPairAddress(pool.pairAddress)');
console.log('4. getFarmByPairAddress uses loadAllFarms() which filters farmsToExclude');
console.log('5. Uses find() which returns FIRST matching farm');
console.log('6. Checks staked balance on farm.address from the found farm\n');

if (usdcHeliPool) {
  const foundFarm = getFarmByPairAddress(usdcHeliPool.pairAddress);

  console.log('❌ My Positions Approach:');
  console.log(`   Pool: ${usdcHeliPool.pairAddress}`);
  console.log(`   Calls: getFarmByPairAddress("${usdcHeliPool.pairAddress}")`);

  if (foundFarm) {
    console.log(`   Found farm: ${foundFarm.address}`);
    console.log(`   IsDeprecated: ${foundFarm.isFarmDeprecated || false}`);
    console.log(`   → Only checks THIS farm contract`);

    // Check if there are other farms that won't be checked
    const otherFarms = usdcHeliFarms.filter((f: any) => f.address !== foundFarm.address);
    if (otherFarms.length > 0) {
      console.log(
        `\n   ⚠️  PROBLEM: ${otherFarms.length} other farm(s) exist but won't be checked:`,
      );
      otherFarms.forEach((farm: any, i: number) => {
        console.log(
          `      Farm ${i + 1}: ${farm.address} (Deprecated: ${farm.isFarmDeprecated || false})`,
        );
        console.log(`      → This farm will NEVER be checked in My Positions!`);
      });
    }
  } else {
    console.log(`   ❌ No farm found!`);
  }
}

console.log('\n\n🎯 ROOT CAUSE IDENTIFIED:\n');
console.log('1. Farms Page: Checks ALL farms directly by farm address');
console.log('   → Works correctly, shows all farms with staked tokens\n');

console.log('2. My Positions: Uses pool → farm lookup via getFarmByPairAddress()');
console.log('   → getFarmByPairAddress() uses find() which returns FIRST match');
console.log('   → If multiple farms exist for same pair, only FIRST one is checked');
console.log("   → If user staked in the SECOND farm, it won't be detected!\n");

console.log('💡 SPECIFIC ISSUE FOR USDC/HELI:\n');
if (usdcHeliPool && usdcHeliFarms.length > 1) {
  const foundFarm = getFarmByPairAddress(usdcHeliPool.pairAddress);
  const otherFarms = usdcHeliFarms.filter((f: any) => f.address !== foundFarm?.address);

  console.log(`   - ${usdcHeliFarms.length} farms exist for USDC/HELI`);
  console.log(`   - getFarmByPairAddress() returns: ${foundFarm?.address || 'NONE'}`);
  console.log(
    `   - Other farm(s) that won't be checked: ${otherFarms.map((f: any) => f.address).join(', ')}`,
  );
  console.log(`   - If user staked in the other farm, My Positions won't show it!\n`);
}

console.log('🔧 SOLUTION:\n');
console.log('Option 1: Change getFarmByPairAddress to return ALL matching farms');
console.log('Option 2: Check ALL farms for each pool, not just the first match');
console.log('Option 3: Use farm-centric approach in My Positions (like Farms page)');
