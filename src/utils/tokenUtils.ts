import axios from 'axios';
import { hethers } from '@hashgraph/hethers';
import BigNumber from 'bignumber.js';

import { IAllowanceData, IPoolData, ITokenData, TokenType } from '../interfaces/tokens';
import { Client, ContractId, AccountBalanceQuery } from '@hashgraph/sdk';
import {
  formatNumberToBigNumber,
  formatStringToBigNumber,
  formatStringToBigNumberWei,
  formatStringWeiToStringEther,
  stripStringToFixedDecimals,
} from './numberUtils';
import { getPossibleTradesExactIn, tradeComparator } from './tradeUtils';
import { HUNDRED_BN, MAX_UINT_ERC20, MAX_UINT_HTS } from '../constants';

export const getHTSTokenInfo = async (tokenId: string): Promise<ITokenData> => {
  const url = `${process.env.REACT_APP_MIRROR_NODE_URL}/api/v1/tokens/${tokenId}`;

  try {
    const {
      data: {
        token_id: hederaId,
        name,
        symbol,
        decimals,
        total_supply: totalSupply,
        max_supply: maxSupply,
        expiry_timestamp: expiryTimestamp,
        admin_key,
        custom_fees: customFees,
        freeze_key,
        kyc_key,
        pause_key,
        supply_key,
        wipe_key,
        fee_schedule_key,
      },
    } = await axios(url);

    const { fixed_fees: fixedFees, fractional_fees: fractionalFees } = customFees;
    const hasFees = fixedFees.length > 0 || fractionalFees.length > 0;

    const tokenInfo = {
      hederaId,
      name,
      symbol,
      decimals: Number(decimals),
      totalSupply,
      expiryTimestamp,
      address: idToAddress(hederaId),
      type: TokenType.HTS,
      hasFees,
      maxSupply,
      keys: {
        adminKey: admin_key !== null,
        freezeKey: freeze_key !== null,
        kycKey: kyc_key !== null,
        pauseKey: pause_key !== null,
        wipeKey: wipe_key !== null,
        supplyKey: supply_key !== null,
        feeScheduleKey: fee_schedule_key !== null,
      },
    };

    return tokenInfo;
  } catch (e) {
    console.error(e);
    return {} as ITokenData;
  }
};

export const getHTSTokenWalletBalance = async (
  userId: string,
  tokenId: string,
): Promise<number> => {
  const url = `${process.env.REACT_APP_MIRROR_NODE_URL}/api/v1/tokens/${tokenId}/balances?account.id=${userId}&order=desc&limit=2`;

  try {
    const {
      data: { balances },
    } = await axios(url);

    if (balances.length > 0) {
      const { balance } = balances[0];

      return balance;
    } else {
      return 0;
    }
  } catch (e) {
    console.error(e);
    return 0;
  }
};

export const getUserAssociatedTokens = async (userId: string): Promise<string[]> => {
  const tokens = (await getUserHTSData(userId)) || [];
  const keys: string[] = [];
  tokens.forEach((_, key) => keys.push(key as string));

  return keys;
};

export const getTokenAllowance = async (
  accountId: string,
  spenderId: string,
  tokenId: string,
): Promise<IAllowanceData[]> => {
  const url = `${process.env.REACT_APP_MIRROR_NODE_URL}/api/v1/accounts/${accountId}/allowances/tokens?spender.id=${spenderId}&token.id=${tokenId}`;

  try {
    const {
      data: { allowances },
    } = await axios(url);

    return allowances;
  } catch (e) {
    console.error(e);
    return [];
  }
};

export const checkAllowanceHTS = async (
  userId: string,
  token: ITokenData,
  amountToSpend: string,
) => {
  const spenderId = addressToId(process.env.REACT_APP_ROUTER_ADDRESS as string);
  const allowances = await getTokenAllowance(userId, spenderId, token.hederaId);

  if (allowances.length > 0) {
    const currentAllowance = allowances[0].amount_granted;
    console.log('mitko allowance', currentAllowance);
    const currentAllowanceBN = formatNumberToBigNumber(currentAllowance);
    const amountToSpendBN = formatStringToBigNumberWei(amountToSpend, token.decimals);

    const canSpend = amountToSpendBN.lte(currentAllowanceBN);

    return canSpend;
  } else {
    return false;
  }
};

export const addressToId = (tokenAddress: string) => {
  return hethers.utils.asAccountString(tokenAddress);
};

export const idToAddress = (tokenId: string) => {
  return hethers.utils.getChecksumAddress(hethers.utils.getAddressFromAccount(tokenId));
};

export const addressToContractId = (tokenAddress: string) => {
  return ContractId.fromEvmAddress(0, 0, tokenAddress);
};

export const isHederaIdValid = (hederaId: string) => {
  return hederaId
    .toLowerCase()
    .match(/^(0|(?:[1-9]\d*))\.(0|(?:[1-9]\d*))\.(0|(?:[1-9]\d*))(?:-([a-z]{5}))?$/g);
};

export const isAddressValid = (address: string) => {
  return hethers.utils.isAddress(address.toLowerCase());
};

/**
 * Calucate reserves based on total amount ot LP
 * @public
 * @param {string} lpAmount - LP amount share in wei
 * @param {string} lpAmountTotal - LP total amount in wei
 * @param {string} reserve0 - Total amount of token0 reserves in wei
 * @param {string} reserve1 - Total amount of token1 reserves in wei
 * @return {object} - Reserves amounts in BigNumber in wei and converted into ethers strings
 */
export const calculateReserves = (
  lpAmount: string,
  lpAmountTotal: string,
  reserve0: string,
  reserve1: string,
  reserve0Decimals: number = 18,
  reserve1Decimals: number = 18,
) => {
  // Convert string values (wei) into Hethers Big Number
  const lpAmountHBN = hethers.BigNumber.from(lpAmount); // HBN | wei
  const lpAmountTotalHBN = hethers.BigNumber.from(lpAmountTotal); // HBN | wei
  const reserve0HBN = hethers.BigNumber.from(reserve0); // HBN | wei
  const reserve1HBN = hethers.BigNumber.from(reserve1); // HBN | wei

  const reserve0ShareHBN = reserve0HBN.mul(lpAmountHBN).div(lpAmountTotalHBN); // HBN | wei
  const reserve1ShareHBN = reserve1HBN.mul(lpAmountHBN).div(lpAmountTotalHBN); // HBN | wei

  const reserve0ShareStr = hethers.utils.formatUnits(reserve0ShareHBN, reserve0Decimals); // String | ether
  const reserve1ShareStr = hethers.utils.formatUnits(reserve1ShareHBN, reserve1Decimals); // String | ether

  return {
    reserve0ShareHBN,
    reserve1ShareHBN,
    reserve0ShareStr,
    reserve1ShareStr,
  };
};

/**
 * Calucate share based on total amount and percentage
 * @public
 * @param {string} totalAmount - total amount of tokens in ETH
 * @param {string} percentage - percentage
 * @return {string} - Share in ETH
 */
export const calculateShareByPercentage = (totalAmount: string, percentage: string) => {
  const percentageStr = (Number(percentage) / 100).toString();
  const percentageBN = formatStringToBigNumber(percentageStr);
  const totalAmountBN = formatStringToBigNumberWei(totalAmount);

  const shareBN = totalAmountBN.times(percentageBN);

  const shareFormatted = stripStringToFixedDecimals(
    formatStringWeiToStringEther(shareBN.toFixed(), 18),
    18,
  );

  return shareFormatted;
};

/**
 * Calucate percentage based on total amount and share
 * @public
 * @param {string} totalAmount - total amount of tokens in ETH
 * @param {string} share - percentage
 * @return {string} - Percentage
 */
export const calculatePercentageByShare = (totalAmount: string, share: string) => {
  const shareBN = formatStringToBigNumberWei(share);
  const totalAmountBN = formatStringToBigNumberWei(totalAmount);

  const percentageBN = shareBN.div(totalAmountBN).times(HUNDRED_BN);

  const percentageFormatted = percentageBN.toFixed(0);

  return percentageFormatted;
};

export const getTokenBalance = async (userId: string, tokenData: ITokenData) => {
  let tokenBalance;

  if (tokenData.type === TokenType.HBAR && userId) {
    const provider = hethers.providers.getDefaultProvider(process.env.REACT_APP_NETWORK_TYPE);
    const userBalanceBN = await provider.getBalance(userId);
    tokenBalance = hethers.utils.formatHbar(userBalanceBN);
  } else if (tokenData.type === TokenType.HTS) {
    const accountTokens = await getUserHTSData(userId);
    const balance = accountTokens?.get(tokenData.hederaId);
    const tokenDecimals = tokenData?.decimals || 8;

    if (balance)
      tokenBalance = formatStringWeiToStringEther(balance.toString(), tokenDecimals).toString();
  }
  // Currently we don't have a way getting the balance of ERC20 tokens
  return tokenBalance;
};

export const getHBarPrice = async () => {
  const coingeckoURL = process.env.REACT_APP_COINGECKO_URL + `/simple/price`;
  try {
    const response = await axios.get(coingeckoURL, {
      params: {
        ids: 'hedera-hashgraph',
        vs_currencies: 'usd',
      },
    });
    return response.data['hedera-hashgraph']['usd'];
  } catch (e) {
    console.error(e);
    return 0;
  }
};

export const getTokenPrice = (poolsData: IPoolData[], tokenAddress: string, hbarPrice: number) => {
  if (hbarPrice === 0) return '0';
  if (tokenAddress === process.env.REACT_APP_WHBAR_ADDRESS) return hbarPrice.toString();

  const tradesIn = getPossibleTradesExactIn(
    poolsData || [],
    '1',
    process.env.REACT_APP_WHBAR_ADDRESS || '',
    tokenAddress,
    false,
  );

  const sortedTrades = tradesIn.sort(tradeComparator);

  if (sortedTrades.length === 0) return '0';

  let bestTradeAmount = sortedTrades[0].amountOut;

  //Handle special case where for 1 token in you get 0 tokens out because of big difference of the amounts and decimals
  if (Number(sortedTrades[0].amountOut) === 0) {
    let determinedPrice = false;
    let multiplier = 2;
    const step = 2;

    //Set a threshold in order to avoid infinit loop
    const threshold = 1000;

    while (!determinedPrice && multiplier < threshold) {
      const tradesInMultiplied = getPossibleTradesExactIn(
        poolsData || [],
        multiplier.toString(),
        process.env.REACT_APP_WHBAR_ADDRESS || '',
        tokenAddress,
        false,
      );

      const sortedTradesMultiplied = tradesInMultiplied.sort(tradeComparator);

      if (Number(sortedTradesMultiplied[0].amountOut) === 0) {
        multiplier = step * multiplier;
      } else {
        determinedPrice = true;
        bestTradeAmount = sortedTradesMultiplied[0].amountOut;
      }
    }
  }

  return new BigNumber(hbarPrice).div(new BigNumber(bestTradeAmount)).toString();
};

const getUserHTSData = async (userId: string) => {
  const networkType = process.env.REACT_APP_NETWORK_TYPE as string;
  const client = networkType === 'testnet' ? Client.forTestnet() : Client.forMainnet();
  const { tokens } = await new AccountBalanceQuery().setAccountId(userId).execute(client);
  return tokens?._map;
};

export const requestIdFromAddress = async (id: string) => {
  const url = `${process.env.REACT_APP_MIRROR_NODE_URL}/api/v1/contracts/${id}`;
  try {
    const {
      data: { contract_id },
    } = await axios(url);
    return contract_id;
  } catch (e) {
    console.error(e);
    return '0';
  }
};

export const requestAddressFromId = async (address: string) => {
  const url = `${process.env.REACT_APP_MIRROR_NODE_URL}/api/v1/contracts/${address}`;
  try {
    const {
      data: { evm_address },
    } = await axios(url);
    return evm_address;
  } catch (e) {
    console.error(e);
    return '0';
  }
};

export const hasFeesOrKeys = (token: ITokenData) => {
  const { hasFees, keys: tokenKeys } = token;
  const keys = tokenKeys ? Object.keys(tokenKeys) : [];

  let hasKeys = false;

  if (keys.length > 0 && tokenKeys) {
    for (let i = 0; i < keys.length; i++) {
      if (tokenKeys[keys[i]] && keys[i] !== '__typename') {
        hasKeys = true;
        break;
      }
    }
  }

  return hasFees || hasKeys;
};

export const NATIVE_TOKEN: ITokenData = {
  hederaId: '',
  name: 'HBAR',
  symbol: 'HBAR',
  address: '',
  decimals: 8,
  type: TokenType.HBAR,
};

export const invalidInputTokensData = (value: string, maxValue?: string, decimals?: number) => {
  let inputGtMaxValue = false;
  if (maxValue && decimals) {
    const maxValueWei = formatStringToBigNumberWei(maxValue, decimals);
    const valueBNWei = formatStringToBigNumberWei(value, decimals);
    inputGtMaxValue = valueBNWei.gt(maxValueWei);
  }
  return !value || isNaN(Number(value)) || inputGtMaxValue;
};

export const getAmountToApprove = async (
  tokenId: string,
  isHTS: boolean = false,
): Promise<string> => {
  try {
    if (!isHTS) {
      return MAX_UINT_ERC20.toString();
    } else {
      const maxSupply = (await getHTSTokenInfo(tokenId)).maxSupply;
      return maxSupply && parseInt(maxSupply) !== 0 ? maxSupply : MAX_UINT_HTS.toString();
    }
  } catch (e) {
    return isHTS ? MAX_UINT_HTS.toString() : MAX_UINT_ERC20.toString();
  }
};
