import axios from 'axios';
import { ITokenData } from '../interfaces/tokens';

export const getTokenInfo = async (tokenId: string): Promise<ITokenData> => {
  const url = `${process.env.REACT_APP_MIRROR_NODE_URL}/api/v1/tokens/${tokenId}`;

  try {
    const {
      data: {
        token_id: tokenId,
        name,
        symbol,
        decimals,
        total_supply: totalSupply,
        expiry_timestamp: expiryTimestamp,
      },
    } = await axios(url);

    const tokenInfo = {
      tokenId,
      name,
      symbol,
      decimals,
      totalSupply,
      expiryTimestamp,
    };

    return tokenInfo;
  } catch (e) {
    console.error(e);
    return {} as ITokenData;
  }
};

export const getWalletBalanceByTokenId = async (userId: string) => {
  const url = `${process.env.REACT_APP_MIRROR_NODE_URL}/api/v1/balances?order=asc&account.id=${userId}`;

  try {
    const {
      data: { balances },
    } = await axios(url);

    const { balance, tokens } = balances[0];

    return { balance, tokens };
  } catch (e) {
    console.error(e);
  } finally {
  }
};
