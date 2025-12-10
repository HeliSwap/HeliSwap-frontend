/**
 * Script to specifically check USDC/HELI farm and pool matching
 */

import * as fs from 'fs';
import * as path from 'path';

const farmsData = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../src/data/farms.json'), 'utf-8'),
);
const poolsData = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../src/data/pools.json'), 'utf-8'),
);

// Find USDC/HELI farms
const usdcHeliFarms = farmsData.filter(
  (f: any) =>
    (f.poolData?.token0Symbol === 'USDC' && f.poolData?.token1Symbol === 'HELI') ||
    (f.poolData?.token0Symbol === 'HELI' && f.poolData?.token1Symbol === 'USDC'),
);

console.log(`Found ${usdcHeliFarms.length} USDC/HELI farms:\n`);

usdcHeliFarms.forEach((farm: any, i: number) => {
  console.log(`Farm ${i + 1}:`);
  console.log('  Farm Address:', farm.address);
  console.log('  StakingTokenAddress:', farm.stakingTokenAddress);
  console.log('  PoolData.pairAddress:', farm.poolData?.pairAddress);
  console.log('  Token0:', farm.poolData?.token0Symbol);
  console.log('  Token1:', farm.poolData?.token1Symbol);
  console.log('  IsDeprecated:', farm.isFarmDeprecated || false);

  // Check if matching pool exists
  const matchingPool = poolsData.find(
    (p: any) =>
      p.pairAddress?.toLowerCase() === farm.stakingTokenAddress?.toLowerCase() ||
      p.pairAddress?.toLowerCase() === farm.poolData?.pairAddress?.toLowerCase(),
  );

  if (matchingPool) {
    console.log('  ✅ MATCHING POOL FOUND:');
    console.log('     Pool pairAddress:', matchingPool.pairAddress);
    console.log('     Pool Token0:', matchingPool.token0Symbol);
    console.log('     Pool Token1:', matchingPool.token1Symbol);
    console.log('     Pool hasCampaign:', matchingPool.hasCampaign || false);
  } else {
    console.log('  ❌ NO MATCHING POOL FOUND');
    console.log('     This farm will NOT appear in "My positions"!');
  }
  console.log('');
});

// Also check if there are pools with USDC/HELI that don't match farms
const usdcHeliPools = poolsData.filter(
  (p: any) =>
    (p.token0Symbol === 'USDC' && p.token1Symbol === 'HELI') ||
    (p.token0Symbol === 'HELI' && p.token1Symbol === 'USDC'),
);

console.log(`\nFound ${usdcHeliPools.length} USDC/HELI pools:\n`);

usdcHeliPools.forEach((pool: any, i: number) => {
  console.log(`Pool ${i + 1}:`);
  console.log('  Pool pairAddress:', pool.pairAddress);
  console.log('  Token0:', pool.token0Symbol);
  console.log('  Token1:', pool.token1Symbol);

  // Check if matching farm exists
  const matchingFarm = farmsData.find(
    (f: any) =>
      f.stakingTokenAddress?.toLowerCase() === pool.pairAddress?.toLowerCase() ||
      f.poolData?.pairAddress?.toLowerCase() === pool.pairAddress?.toLowerCase(),
  );

  if (matchingFarm) {
    console.log('  ✅ MATCHING FARM FOUND:');
    console.log('     Farm Address:', matchingFarm.address);
    console.log('     Farm StakingTokenAddress:', matchingFarm.stakingTokenAddress);
  } else {
    console.log('  ❌ NO MATCHING FARM FOUND');
  }
  console.log('');
});
