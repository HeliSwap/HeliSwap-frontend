import axios from 'axios';
import { hethers } from '@hashgraph/hethers';
import BigNumber from 'bignumber.js';

import { IAllowanceData, IPairData, ITokenData, TokenType } from '../interfaces/tokens';
import { Client, ContractId, AccountBalanceQuery } from '@hashgraph/sdk';
import {
  formatNumberToBigNumber,
  formatStringToBigNumber,
  formatStringToBigNumberWei,
  formatStringWeiToStringEther,
  stripStringToFixedDecimals,
} from './numberUtils';
import { getPossibleTradesExactIn, tradeComparator } from './tradeUtils';

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
        expiry_timestamp: expiryTimestamp,
        admin_key: adminKey,
        custom_fees: customFees,
        freeze_key: freezeKey,
        kyc_key: kycKey,
        pause_key: pauseKey,
        supply_key: supplyKey,
        wipe_key: wipeKey,
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
      details: {
        hasFees,
        customFees,
        adminKey,
        freezeKey,
        kycKey,
        pauseKey,
        wipeKey,
        supplyKey,
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
  const networkType = process.env.REACT_APP_NETWORK_TYPE as string;
  const client = networkType === 'testnet' ? Client.forTestnet() : Client.forMainnet();
  const { tokens } = await new AccountBalanceQuery().setAccountId(userId).execute(client);

  const keys: string[] = [];
  tokens?._map.forEach((_, key) => keys.push(key));

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
  return hethers.utils.getAddressFromAccount(tokenId);
};

export const addressToContractId = (tokenAddress: string) => {
  return ContractId.fromEvmAddress(0, 0, tokenAddress);
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

  const shareFomatted = stripStringToFixedDecimals(
    formatStringWeiToStringEther(shareBN.toFixed(), 18),
    18,
  );

  return shareFomatted;
};

export const getTokenBalance = async (userId: string, tokenData: ITokenData) => {
  let tokenBalance;

  if (tokenData.type === TokenType.HBAR && userId) {
    const provider = hethers.providers.getDefaultProvider(process.env.REACT_APP_NETWORK_TYPE);
    const userBalanceBN = await provider.getBalance(userId);
    tokenBalance = hethers.utils.formatHbar(userBalanceBN);
  } else if (tokenData.type === TokenType.HTS) {
    const balance = await getHTSTokenWalletBalance(userId, tokenData.hederaId);
    const tokenDecimals = tokenData?.decimals || 8;
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

export const getTokenPrice = (poolsData: IPairData[], tokenAddress: string, hbarPrice: number) => {
  if (hbarPrice === 0) return;
  if (tokenAddress === process.env.REACT_APP_WHBAR_ADDRESS) return hbarPrice.toString();

  const tradesIn = getPossibleTradesExactIn(
    poolsData || [],
    '1',
    process.env.REACT_APP_WHBAR_ADDRESS || '',
    tokenAddress,
    false,
  );
  const sortedTrades = tradesIn.sort(tradeComparator);

  if (sortedTrades.length === 0) return;

  const bestTradeAmount = sortedTrades[0].amountOut;

  return new BigNumber(hbarPrice).div(new BigNumber(bestTradeAmount)).toString();
};

export const NATIVE_TOKEN = {
  hederaId: '',
  name: 'HBAR',
  symbol: 'HBAR',
  address: '',
  decimals: 8,
  type: TokenType.HBAR,
};
