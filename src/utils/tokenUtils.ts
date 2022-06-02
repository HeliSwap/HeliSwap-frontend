import axios from 'axios';
import { hethers } from '@hashgraph/hethers';

import { ITokenData, IWalletBalance, TokenType } from '../interfaces/tokens';
import { ContractId } from '@hashgraph/sdk';

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
      },
    } = await axios(url);

    const tokenInfo = {
      hederaId,
      name,
      symbol,
      decimals: Number(decimals),
      totalSupply,
      expiryTimestamp,
      address: idToAddress(hederaId),
      type: TokenType.HTS,
    };

    return tokenInfo;
  } catch (e) {
    console.error(e);
    return {} as ITokenData;
  }
};

export const getHTSTokensWalletBalance = async (userId: string): Promise<IWalletBalance> => {
  const url = `${process.env.REACT_APP_MIRROR_NODE_URL}/api/v1/balances?order=asc&account.id=${userId}`;

  try {
    const {
      data: { balances },
    } = await axios(url);

    const { balance, tokens: tokensRaw } = balances[0];
    const tokens = tokensRaw.map((token: { token_id: string; balance: number }) => ({
      tokenId: token.token_id,
      balance: token.balance,
    }));

    return { balance, tokens };
  } catch (e) {
    console.error(e);
    return {} as IWalletBalance;
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

export const NATIVE_TOKEN = {
  hederaId: '',
  name: 'HBAR',
  symbol: 'HBAR',
  address: '',
  decimals: 8,
  type: TokenType.HBAR,
};
