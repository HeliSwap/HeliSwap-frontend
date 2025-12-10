/**
 * Script to provide liquidity to the USDC/HELI pool
 *
 * This script:
 * 1. Loads pool data from pools.json
 * 2. Fetches current pool reserves to calculate the ratio
 * 3. Calculates USDC amount based on 1 HELI and current pool ratio
 * 4. Checks token allowance (skips approval if already sufficient)
 * 5. Adds liquidity to the USDC/HELI pool
 *
 * Usage:
 *   ts-node scripts/add-liquidity-hbar-usdc.ts [slippage] [expiresAfter]
 *
 * Example:
 *   ts-node scripts/add-liquidity-hbar-usdc.ts 0.5 20
 *
 * Note:
 * - Always provides exactly 1 HELI
 * - USDC amount is automatically calculated based on current pool ratio
 * - Approval is skipped if allowance is already sufficient
 */

import * as dotenv from 'dotenv';
import {
  Client,
  PrivateKey,
  AccountId,
  ContractExecuteTransaction,
  ContractFunctionParameters,
  AccountBalanceQuery,
} from '@hashgraph/sdk';
import { ethers } from 'ethers';
import { hethers } from '@hashgraph/hethers';
import BigNumber from 'bignumber.js';
import axios from 'axios';
import * as fs from 'fs';
import * as path from 'path';

// Load pools data
const poolsDataPath = path.join(__dirname, '../src/data/pools.json');
const poolsData = JSON.parse(fs.readFileSync(poolsDataPath, 'utf-8'));

// Load environment variables
dotenv.config();

// Helper function to convert Hedera address to ContractId
// Uses hethers library to match SDK implementation
const addressToId = (address: string): string => {
  if (!address || address === '') {
    throw new Error('Cannot convert empty address to Hedera ID');
  }
  // Use hethers library to match SDK's addressToId implementation
  return hethers.utils.asAccountString(address);
};

// Helper function to convert Hedera ID to address
// Uses hethers library to match SDK implementation
const idToAddress = (id: string): string => {
  if (!id || id === '') {
    throw new Error('Cannot convert empty Hedera ID to address');
  }

  // Check if it's already an EVM address (starts with 0x and is 42 chars)
  if (id.startsWith('0x') && id.length === 42) {
    return id; // Already an EVM address, return as-is
  }

  // Use hethers library to convert Hedera ID to EVM address (matches SDK)
  // This ensures proper 42-character address format
  try {
    const address = hethers.utils.getAddressFromAccount(id);
    // Get checksum address to match SDK's idToAddress implementation
    return hethers.utils.getChecksumAddress(address);
  } catch (error: any) {
    throw new Error(`Failed to convert Hedera ID "${id}" to address: ${error.message}`);
  }
};

// Format string to BigNumber (matches SDK's formatStringToBigNumber)
const formatStringToBigNumber = (numberToFormat: string): BigNumber => {
  return new BigNumber(numberToFormat);
};

// Format string to BigNumber in wei
const formatStringToBigNumberWei = (numberToFormat: string, decimals: number = 18): BigNumber => {
  const numberToFormatBN = new BigNumber(numberToFormat);
  const tenPowDec = new BigNumber(10).pow(decimals);
  return numberToFormatBN.times(tenPowDec);
};

// Calculate amount with slippage
const getAmountWithSlippage = (
  amount: string,
  amountDecimals: number,
  slippagePercentage: number,
  isMinAmount: boolean,
): BigNumber => {
  const amountWei = formatStringToBigNumberWei(amount, amountDecimals);
  const slippage = slippagePercentage / 100;
  let amountWithSlippage;

  if (isMinAmount) {
    amountWithSlippage = amountWei.minus(amountWei.times(slippage));
  } else {
    amountWithSlippage = amountWei.plus(amountWei.times(slippage));
  }

  return amountWithSlippage.decimalPlaces(0, 1);
};

// Get expiration time (deadline)
const getExpirationTime = (minutes: number): number => {
  return Math.floor(Date.now() / 1000) + 60 * minutes;
};

// Fetch pool reserves to calculate ratio
const getPoolReserves = async (
  pairAddress: string,
  provider: ethers.providers.JsonRpcProvider,
): Promise<{ reserve0: BigNumber; reserve1: BigNumber }> => {
  // Minimal ABI for UniswapV2Pair contract - only getReserves method
  const PAIR_ABI = [
    'function getReserves() external view returns (uint112 reserve0, uint112 reserve1, uint32 blockTimestampLast)',
    'function token0() external view returns (address)',
    'function token1() external view returns (address)',
  ];

  const pairContract = new ethers.Contract(pairAddress, PAIR_ABI, provider);
  const [reserves, token0Address] = await Promise.all([
    pairContract.getReserves(),
    pairContract.token0(),
  ]);

  return {
    reserve0: new BigNumber(reserves.reserve0.toString()),
    reserve1: new BigNumber(reserves.reserve1.toString()),
  };
};

// Calculate USDC amount based on pool ratio and HELI amount
const calculateUSDCAmount = (
  heliAmount: string,
  reserveUSDC: BigNumber,
  reserveHELI: BigNumber,
  usdcDecimals: number,
  heliDecimals: number,
): string => {
  // Convert amounts to same decimal base for calculation
  const heliAmountBN = formatStringToBigNumberWei(heliAmount, heliDecimals);

  // Calculate ratio: USDC per HELI
  // ratio = reserveUSDC / reserveHELI
  const ratio = reserveUSDC.dividedBy(reserveHELI);

  // Calculate required USDC: heliAmount * ratio
  const usdcAmountBN = heliAmountBN.multipliedBy(ratio);

  // Convert back to human-readable format
  const usdcAmount = usdcAmountBN.dividedBy(new BigNumber(10).pow(usdcDecimals));

  return usdcAmount.toFixed(usdcDecimals);
};

// Find USDC/HELI pool from pools.json
const findUSDCHELIPool = () => {
  // Looking for pool with USDC and HELI
  // Pool ID 105: "USD Coin HeliSwap LP"
  const pool = poolsData.find(
    (p: any) =>
      p.id === '105' ||
      (p.pairSymbol?.includes('USDC') && p.pairSymbol?.includes('HELI')) ||
      (p.pairName?.includes('USD Coin') && p.pairName?.includes('HeliSwap')),
  );

  if (!pool) {
    throw new Error('USDC/HELI pool not found in pools.json');
  }

  return pool;
};

// Check if address is HTS token (Hedera Token Service)
// HTS addresses start with 0x00000000...
const isHTSToken = (address: string): boolean => {
  return address.toLowerCase().startsWith('0x00000000');
};

// Convert HTS address to Hedera token ID
// HTS addresses encode token IDs differently than contract addresses
// For HTS tokens, the account number is typically in the last 8 hex characters
// Shard and realm are usually 0 for HTS tokens
const htsAddressToTokenId = (address: string): string => {
  if (!isHTSToken(address)) {
    throw new Error('Not an HTS token address');
  }
  const addressWithoutPrefix = address.replace('0x', '');

  // HTS addresses: 0x00000000 (prefix) + ... + account (last 8 hex chars)
  // Extract account from the last 8 hex characters
  const accountHex = addressWithoutPrefix.substring(32, 40);
  const account = parseInt(accountHex, 16);

  // For HTS tokens, shard and realm are typically 0
  // If the account is 0, try extracting from positions 24-32 as fallback
  if (account === 0) {
    const accountHexAlt = addressWithoutPrefix.substring(24, 32);
    const accountAlt = parseInt(accountHexAlt, 16);
    if (accountAlt !== 0) {
      return `0.0.${accountAlt}`;
    }
  }

  return `0.0.${account}`;
};

// Check token allowance - handles both HTS and ERC20 tokens
const checkAllowance = async (
  tokenAddress: string,
  accountId: string,
  spenderAddress: string,
  provider: ethers.providers.JsonRpcProvider,
): Promise<BigNumber> => {
  if (isHTSToken(tokenAddress)) {
    // Use mirror node API for HTS tokens
    const tokenId = htsAddressToTokenId(tokenAddress);
    const spenderId = addressToId(spenderAddress);
    const mirrorNodeUrl = process.env.REACT_APP_MIRROR_NODE_URL;

    if (!mirrorNodeUrl) {
      throw new Error('Missing REACT_APP_MIRROR_NODE_URL for HTS token allowance check');
    }

    const url = `${mirrorNodeUrl}/api/v1/accounts/${accountId}/allowances/tokens?spender.id=${spenderId}&token.id=${tokenId}`;

    try {
      const {
        data: { allowances },
      } = await axios(url);

      if (allowances && allowances.length > 0) {
        const currentAllowance = allowances[0].amount_granted;
        return new BigNumber(currentAllowance.toString());
      }

      return new BigNumber('0'); // No allowance found
    } catch (error: any) {
      console.warn(`   Mirror node API error: ${error.message}`);
      return new BigNumber('0');
    }
  } else {
    // Use ethers.js for ERC20 tokens
    const ERC20_ABI = [
      'function allowance(address owner, address spender) external view returns (uint256)',
    ];
    const ownerAddress = idToAddress(accountId);
    const tokenContract = new ethers.Contract(tokenAddress, ERC20_ABI, provider);
    const allowance = await tokenContract.allowance(ownerAddress, spenderAddress);
    return new BigNumber(allowance.toString());
  }
};

// Approve token spending (only if needed)
// Reusing logic from SDK's approveToken method
const approveTokenIfNeeded = async (
  client: Client,
  tokenAddress: string,
  spenderAddress: string,
  requiredAmount: BigNumber,
  accountId: AccountId,
  privateKey: PrivateKey,
  provider: ethers.providers.JsonRpcProvider,
): Promise<boolean> => {
  const accountIdString = accountId.toString();

  console.log(`\n📝 Checking token allowance...`);
  console.log(`   Token: ${tokenAddress}`);
  console.log(`   Spender: ${spenderAddress}`);
  console.log(`   Required amount: ${requiredAmount.toString()}`);

  // Check if token is HTS or ERC20
  const isHTS = isHTSToken(tokenAddress);
  console.log(`   Token type: ${isHTS ? 'HTS' : 'ERC20'}`);

  try {
    const currentAllowance = await checkAllowance(
      tokenAddress,
      accountIdString,
      spenderAddress,
      provider,
    );
    console.log(`   Current allowance: ${currentAllowance.toString()}`);

    if (currentAllowance.gte(requiredAmount)) {
      console.log(`   ✅ Allowance sufficient, skipping approval`);
      return false; // No approval needed
    }

    console.log(`   ⚠️  Allowance insufficient, approving token...`);
  } catch (error: any) {
    console.log(`   ⚠️  Could not check allowance: ${error.message}`);
    console.log(`   Proceeding with approval...`);
  }

  // Convert address to ContractId format - match SDK pattern
  // For HTS tokens, use htsAddressToTokenId, for ERC20 use addressToId
  let tokenId: string;
  if (isHTS) {
    tokenId = htsAddressToTokenId(tokenAddress);
    console.log(`   HTS Token ID: ${tokenId}`);
  } else {
    tokenId = addressToId(tokenAddress);
    console.log(`   ERC20 Contract ID: ${tokenId}`);
  }

  // Ensure spenderAddress is a valid EVM address (42 chars)
  // routerAddress from env should already be an EVM address, but validate it
  let spenderEVMAddress: string;
  if (spenderAddress.startsWith('0x') && spenderAddress.length === 42) {
    spenderEVMAddress = spenderAddress; // Already an EVM address
  } else {
    // Convert Hedera ID to EVM address if needed
    spenderEVMAddress = idToAddress(spenderAddress);
  }
  console.log(`   Spender EVM Address: ${spenderEVMAddress}`);

  // Approve max amount - use MAX_UINT_HTS for HTS, MAX_UINT_ERC20 for ERC20
  // Match SDK: uses formatStringToBigNumber for the amount
  const maxApprovalString = isHTS ? '9223372036854775807' : hethers.constants.MaxUint256.toString();
  const maxApproval = formatStringToBigNumber(maxApprovalString);
  const gasFee = isHTS ? 1000000 : 72000; // APPROVE_HTS or APPROVE_ERC20

  console.log(`   Approval amount: ${maxApproval.toString()}`);
  console.log(`   Gas fee: ${gasFee}`);

  // Match SDK: uses BigNumber directly in addUint256, not .toNumber()
  const approveTransaction = new ContractExecuteTransaction()
    .setContractId(tokenId)
    .setGas(gasFee)
    .setFunction(
      'approve',
      new ContractFunctionParameters().addAddress(spenderEVMAddress).addUint256(maxApproval), // SDK uses BigNumber directly
    )
    .freezeWith(client);

  const approveResponse = await approveTransaction.execute(client);
  const approveReceipt = await approveResponse.getReceipt(client);

  console.log(`✅ Token approved! Transaction ID: ${approveResponse.transactionId.toString()}`);
  return true; // Approval was needed
};

// Add liquidity to the pool
// Reusing logic from SDK's addLiquidity method
const addLiquidity = async (
  client: Client,
  routerAddress: string,
  tokenAAddress: string,
  tokenBAddress: string,
  amountA: string,
  amountB: string,
  decimalsA: number,
  decimalsB: number,
  slippage: number,
  expiresAfter: number,
  accountId: AccountId,
  privateKey: PrivateKey,
): Promise<void> => {
  console.log(`\n💧 Adding liquidity to USDC/HELI pool...`);
  console.log(`   Token A (USDC): ${amountA} (decimals: ${decimalsA})`);
  console.log(`   Token B (HELI): ${amountB} (decimals: ${decimalsB})`);
  console.log(`   Slippage: ${slippage}%`);
  console.log(`   Expires after: ${expiresAfter} minutes`);

  // Match SDK pattern exactly
  const tokenAAmount = formatStringToBigNumberWei(amountA, decimalsA);
  const tokenBAmount = formatStringToBigNumberWei(amountB, decimalsB);
  const tokenAAmountMin = getAmountWithSlippage(amountA, decimalsA, slippage, true);
  const tokenBAmountMin = getAmountWithSlippage(amountB, decimalsB, slippage, true);

  // Validate router address first
  if (!routerAddress || routerAddress === '') {
    throw new Error('Router address is empty');
  }
  if (!routerAddress.startsWith('0x') || routerAddress.length !== 42) {
    throw new Error(
      `Router address "${routerAddress}" is invalid. Expected 42 characters (0x + 40 hex), got ${routerAddress.length}`,
    );
  }

  const userAddress = idToAddress(accountId.toString());
  const routerId = addressToId(routerAddress);

  console.log(`\n   Address conversions:`);
  console.log(`   Router Address: ${routerAddress}`);
  console.log(`   Router Contract ID: ${routerId}`);
  console.log(`   User Account ID: ${accountId.toString()}`);
  console.log(`   User Address: ${userAddress}`);

  // Validate all addresses before using them
  const validateAddress = (address: string, name: string): void => {
    if (!address || address === '') {
      throw new Error(`${name} address is empty`);
    }
    // EVM addresses should be 42 characters (0x + 40 hex chars)
    if (!address.startsWith('0x') || address.length !== 42) {
      throw new Error(
        `${name} address "${address}" is invalid. Expected 42 characters (0x + 40 hex), got ${address.length}`,
      );
    }
  };

  console.log(`\n   Validating token addresses...`);
  console.log(`   Token A Address: ${tokenAAddress} (length: ${tokenAAddress.length})`);
  console.log(`   Token B Address: ${tokenBAddress} (length: ${tokenBAddress.length})`);
  console.log(`   User Address: ${userAddress} (length: ${userAddress.length})`);

  validateAddress(tokenAAddress, 'Token A');
  validateAddress(tokenBAddress, 'Token B');
  validateAddress(userAddress, 'User');

  console.log(`\n   Amounts (in wei/smallest unit):`);
  console.log(`   Token A amount: ${tokenAAmount.toString()}`);
  console.log(`   Token B amount: ${tokenBAmount.toString()}`);
  console.log(`   Token A min: ${tokenAAmountMin.toString()}`);
  console.log(`   Token B min: ${tokenBAmountMin.toString()}`);

  const expirationTime = getExpirationTime(expiresAfter);
  console.log(
    `   Expiration time: ${expirationTime} (${new Date(expirationTime * 1000).toISOString()})`,
  );

  console.log(`\n   Building addLiquidity transaction...`);
  console.log(`   Contract ID: ${routerId}`);
  console.log(`   Gas: 300000`);
  console.log(`   Function: addLiquidity`);
  console.log(`   Parameters:`);
  console.log(`     1. tokenA: ${tokenAAddress}`);
  console.log(`     2. tokenB: ${tokenBAddress}`);
  console.log(`     3. amountA: ${tokenAAmount.toString()}`);
  console.log(`     4. amountB: ${tokenBAmount.toString()}`);
  console.log(`     5. amountAMin: ${tokenAAmountMin.toString()}`);
  console.log(`     6. amountBMin: ${tokenBAmountMin.toString()}`);
  console.log(`     7. to: ${userAddress}`);
  console.log(`     8. deadline: ${expirationTime}`);

  // Match SDK pattern: uses BigNumber directly in addUint256, not .toNumber()
  const addLiquidityTransaction = new ContractExecuteTransaction()
    .setContractId(routerId)
    .setGas(300000) // PROVIDE_LIQUIDITY gas fee - match SDK TRANSACTION_MAX_FEES.PROVIDE_LIQUIDITY
    .setFunction(
      'addLiquidity',
      new ContractFunctionParameters()
        .addAddress(tokenAAddress)
        .addAddress(tokenBAddress)
        .addUint256(tokenAAmount) // SDK uses BigNumber directly
        .addUint256(tokenBAmount)
        .addUint256(tokenAAmountMin)
        .addUint256(tokenBAmountMin)
        .addAddress(userAddress)
        .addUint256(expirationTime),
    )
    .freezeWith(client);

  console.log(`   ✅ Transaction built successfully`);

  const addLiquidityResponse = await addLiquidityTransaction.execute(client);
  const addLiquidityReceipt = await addLiquidityResponse.getReceipt(client);

  console.log(`\n✅ Liquidity added successfully!`);
  console.log(`   Transaction ID: ${addLiquidityResponse.transactionId.toString()}`);
};

// Main function
async function main() {
  // Parse command line arguments
  const args = process.argv.slice(2);

  // Fixed HELI amount: always 1 HELI
  const heliAmount = '1';
  const slippage = args[0] ? parseFloat(args[0]) : 0.5; // Default 0.5% slippage
  const expiresAfter = args[1] ? parseInt(args[1]) : 20; // Default 20 minutes

  // Validate inputs
  if (isNaN(parseFloat(heliAmount)) || parseFloat(heliAmount) <= 0) {
    throw new Error('Invalid HELI amount');
  }
  if (slippage < 0 || slippage > 100) {
    throw new Error('Slippage must be between 0 and 100');
  }

  // Check environment variables
  const deployerAddress = process.env.REACT_APP_DEPLOYER_ADDRESS;
  const deployerPK = process.env.REACT_APP_DEPLOYER_PK;
  const routerAddress = process.env.REACT_APP_ROUTER_ADDRESS;
  const providerUrl = process.env.REACT_APP_PROVIDER_URL;

  if (!deployerAddress || !deployerPK) {
    throw new Error('Missing REACT_APP_DEPLOYER_ADDRESS or REACT_APP_DEPLOYER_PK in .env file');
  }
  if (!routerAddress) {
    throw new Error('Missing REACT_APP_ROUTER_ADDRESS in .env file');
  }
  if (!providerUrl) {
    throw new Error('Missing REACT_APP_PROVIDER_URL in .env file');
  }

  console.log('🚀 Starting liquidity provision script...\n');
  console.log(`   Deployer Address: ${deployerAddress}`);
  console.log(`   Router Address: ${routerAddress}`);
  console.log(`   HELI Amount: ${heliAmount} (fixed)`);
  console.log(`   USDC Amount: Will be calculated based on pool ratio`);
  console.log(`   Slippage: ${slippage}%`);
  console.log(`   Expires After: ${expiresAfter} minutes`);

  // Find the USDC/HELI pool
  const pool = findUSDCHELIPool();
  console.log(`\n📊 Found pool: ${pool.pairName}`);
  console.log(`   Pair Address: ${pool.pairAddress}`);
  console.log(`   Token 0: ${pool.token0Name} (${pool.token0Symbol}) - ${pool.token0}`);
  console.log(`   Token 1: ${pool.token1Name} (${pool.token1Symbol}) - ${pool.token1}`);

  // Determine which token is USDC and which is HELI
  // Based on pool data, token0 is USDC and token1 is HELI
  const usdcAddress = pool.token0; // USDC address
  const heliAddress = pool.token1; // HELI address
  const usdcDecimals = pool.token0Decimals;
  const heliDecimals = pool.token1Decimals;
  const pairAddress = pool.pairAddress;

  console.log(`\n   USDC Address: ${usdcAddress}`);
  console.log(`   HELI Address: ${heliAddress}`);
  console.log(`   Pair Address: ${pairAddress}`);

  // Fetch current pool reserves to calculate ratio
  console.log(`\n📊 Fetching current pool reserves...`);
  const provider = new ethers.providers.JsonRpcProvider(providerUrl);
  const reserves = await getPoolReserves(pairAddress, provider);

  // Determine which reserve is USDC and which is HELI
  // Need to check token0 to know the order
  const PAIR_ABI = ['function token0() external view returns (address)'];
  const pairContract = new ethers.Contract(pairAddress, PAIR_ABI, provider);
  const token0Address = await pairContract.token0();

  let reserveUSDC: BigNumber;
  let reserveHELI: BigNumber;

  if (token0Address.toLowerCase() === usdcAddress.toLowerCase()) {
    // token0 is USDC, token1 is HELI
    reserveUSDC = reserves.reserve0;
    reserveHELI = reserves.reserve1;
  } else {
    // token0 is HELI, token1 is USDC
    reserveUSDC = reserves.reserve1;
    reserveHELI = reserves.reserve0;
  }

  console.log(
    `   USDC Reserve: ${reserveUSDC.dividedBy(new BigNumber(10).pow(usdcDecimals)).toFixed(2)}`,
  );
  console.log(
    `   HELI Reserve: ${reserveHELI.dividedBy(new BigNumber(10).pow(heliDecimals)).toFixed(2)}`,
  );

  // Calculate USDC amount based on pool ratio
  const usdcAmount = calculateUSDCAmount(
    heliAmount,
    reserveUSDC,
    reserveHELI,
    usdcDecimals,
    heliDecimals,
  );

  console.log(`\n💡 Calculated amounts:`);
  console.log(`   HELI: ${heliAmount}`);
  console.log(`   USDC: ${usdcAmount} (calculated based on pool ratio)`);

  // Initialize Hedera client
  const accountId = AccountId.fromString(deployerAddress);
  const privateKey = PrivateKey.fromString(deployerPK);

  // Create Hedera client
  let client: Client;
  const networkType = process.env.REACT_APP_NETWORK || 'mainnet';
  if (networkType === 'testnet') {
    client = Client.forTestnet();
  } else {
    client = Client.forMainnet();
  }
  client.setOperator(accountId, privateKey);

  // Check account balance before proceeding
  console.log(`\n💰 Checking account balance...`);
  try {
    const accountBalance = await new AccountBalanceQuery().setAccountId(accountId).execute(client);

    // Get balance - accountBalance.hbars is already an Hbar object
    // Convert to BigNumber for comparison
    const balanceTinybars = accountBalance.hbars.toTinybars();
    const balanceHBAR = new BigNumber(balanceTinybars.toString()).dividedBy(
      new BigNumber(10).pow(8),
    );

    // Also get the balance as a number for display
    const balanceHBARNumber = parseFloat(accountBalance.hbars.toString());

    console.log(`   Account ID: ${accountId.toString()}`);
    console.log(
      `   Account Balance: ${balanceHBARNumber.toFixed(
        2,
      )} HBAR (${balanceTinybars.toString()} tinybars)`,
    );

    // Check if balance is sufficient for transaction fees (recommend at least 0.1 HBAR)
    const minRequired = new BigNumber('0.1');
    if (balanceHBAR.isLessThan(minRequired)) {
      console.warn(
        `\n⚠️  Warning: Account balance (${balanceHBARNumber.toFixed(2)} HBAR) may be low.`,
      );
      console.warn(`   Recommended: At least ${minRequired.toString()} HBAR for transaction fees`);
      console.warn(`   Current balance: ${balanceHBARNumber.toFixed(2)} HBAR`);
      console.warn(`   Proceeding anyway...`);
    }

    console.log(`   ✅ Balance sufficient for transaction`);
  } catch (error: any) {
    if (error.message === 'Insufficient account balance') {
      throw error; // Re-throw balance errors
    }
    console.warn(`   ⚠️  Could not check balance: ${error.message}`);
    console.warn(`   Proceeding anyway...`);
  }

  try {
    // Step 1: Check and approve USDC token if needed (skip if allowance sufficient)
    const requiredUSDCAmount = formatStringToBigNumberWei(usdcAmount, usdcDecimals);
    const usdcApproved = await approveTokenIfNeeded(
      client,
      usdcAddress,
      routerAddress,
      requiredUSDCAmount,
      accountId,
      privateKey,
      provider,
    );

    // Step 2: Check and approve HELI token if needed (skip if allowance sufficient)
    const requiredHELIAmount = formatStringToBigNumberWei(heliAmount, heliDecimals);
    const heliApproved = await approveTokenIfNeeded(
      client,
      heliAddress,
      routerAddress,
      requiredHELIAmount,
      accountId,
      privateKey,
      provider,
    );

    // Step 3: Add liquidity (only proceed if both tokens are approved or have sufficient allowance)
    if (usdcApproved || heliApproved) {
      console.log(`\n⏳ Waiting a moment for approvals to be processed...`);
      await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds for approvals to be processed
    }

    await addLiquidity(
      client,
      routerAddress,
      usdcAddress,
      heliAddress,
      usdcAmount,
      heliAmount,
      usdcDecimals,
      heliDecimals,
      slippage,
      expiresAfter,
      accountId,
      privateKey,
    );

    console.log('\n🎉 Script completed successfully!');
  } catch (error: any) {
    console.error('\n❌ Error:', error.message);

    // Provide helpful error messages for common issues
    if (error.message.includes('INSUFFICIENT_PAYER_BALANCE')) {
      console.error('\n💡 Troubleshooting tips:');
      console.error('   1. Verify your account has enough HBAR for transaction fees');
      console.error('   2. Check that REACT_APP_DEPLOYER_ADDRESS matches your account ID');
      console.error('   3. Ensure REACT_APP_DEPLOYER_PK matches the account');
      console.error('   4. Verify you have enough USDC and HELI tokens');
      console.error('   5. Transaction fees are deducted from your HBAR balance');
    }

    if (error.stack) {
      console.error('\nStack trace:');
      console.error(error.stack);
    }
    process.exit(1);
  } finally {
    client.close();
  }
}

// Run the script
main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
