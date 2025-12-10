/**
 * Script to check user positions from every farm
 *
 * This script:
 * 1. Loads farms from farms.json
 * 2. Loads user IDs from id.json
 * 3. Checks balanceOf for each user ID against each farm contract
 * 4. Reports all positions found
 *
 * Usage:
 *   ts-node scripts/check-user-positions.ts
 */

import * as dotenv from 'dotenv';
import { ethers } from 'ethers';
import { hethers } from '@hashgraph/hethers';
import BigNumber from 'bignumber.js';
import * as fs from 'fs';
import * as path from 'path';

// Load environment variables
dotenv.config();

// MultiRewards contract ABI - only need balanceOf function
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

// Check user position in a farm
const checkUserPosition = async (
  farmAddress: string,
  userAddress: string,
  provider: ethers.providers.JsonRpcProvider,
): Promise<BigNumber> => {
  try {
    const contract = new ethers.Contract(farmAddress, MULTI_REWARDS_ABI, provider);
    const balance = await contract.balanceOf(userAddress);
    return new BigNumber(balance.toString());
  } catch (error: any) {
    console.error(`   Error checking position: ${error.message}`);
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

  // Load farms data
  const farmsDataPath = path.join(__dirname, '../src/data/farms.json');
  const farmsData = JSON.parse(fs.readFileSync(farmsDataPath, 'utf-8'));

  // Load user IDs
  const idsDataPath = path.join(__dirname, '../src/data/id.json');
  const userIds = JSON.parse(fs.readFileSync(idsDataPath, 'utf-8'));

  console.log('🚀 Starting user positions check...\n');
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
    farmAddress: string;
    userId: string;
    userAddress: string;
    balance: string;
  }> = [];

  // Check each farm - process all users in parallel for each farm
  for (let i = 0; i < farmsData.length; i++) {
    const farm = farmsData[i];
    const farmAddress = farm.address;

    console.log(`📊 Checking farm ${i + 1}/${farmsData.length}: ${farmAddress}`);

    // Check all users for this farm in parallel (batched)
    const checkPromises = userAddresses.map(
      async ({ userId, address: userAddress }: { userId: string; address: string }) => {
        try {
          const balance = await checkUserPosition(farmAddress, userAddress, provider);
          return {
            farmAddress,
            userId,
            userAddress,
            balance,
          };
        } catch (error: any) {
          console.error(`   ❌ Error checking ${userId}: ${error.message}`);
          return null;
        }
      },
    );

    // Wait for all checks for this farm to complete
    const farmResults = await Promise.all(checkPromises);

    // Process results and log positions found
    farmResults.forEach(result => {
      if (result && result.balance.gt(0)) {
        results.push({
          farmAddress: result.farmAddress,
          userId: result.userId,
          userAddress: result.userAddress,
          balance: result.balance.toString(),
        });
        console.log(`   ✅ ${result.userId} (${result.userAddress}): ${result.balance.toString()}`);
      }
    });
  }

  // Print summary
  console.log(`\n📋 Summary:`);
  console.log(`   Total positions found: ${results.length}`);

  if (results.length > 0) {
    console.log(`\n📝 Positions:`);
    results.forEach((result, index) => {
      console.log(`\n   ${index + 1}. Farm: ${result.farmAddress}`);
      console.log(`      User ID: ${result.userId}`);
      console.log(`      User Address: ${result.userAddress}`);
      console.log(`      Balance: ${result.balance}`);
    });
  } else {
    console.log(`\n   No positions found for any user in any farm.`);
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
