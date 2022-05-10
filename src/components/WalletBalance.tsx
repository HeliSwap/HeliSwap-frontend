import React, { useState, useEffect } from 'react';
import { ITokenData, IUserToken } from '../interfaces/tokens';
import { getTokensWalletBalance } from '../utils/tokenUtils';

interface IWalletBalance {
  userId: string;
  tokenData: ITokenData;
  setMaxNumber?: (maxNum: string) => void;
}

const WalletBalance = ({ userId, tokenData, setMaxNumber }: IWalletBalance) => {
  const [tokenBalance, setTokenBalance] = useState('0.00');
  const [userTokenList, setUserTokenList] = useState<IUserToken[]>([]);

  useEffect(() => {
    const getUserTokensData = async () => {
      const { tokens } = await getTokensWalletBalance(userId);
      setUserTokenList(tokens);
    };

    if (userId) {
      getUserTokensData();
    }
  }, [userId]);

  useEffect(() => {
    const getTokenBalance = () => {
      const tokenFound = userTokenList.find(item => item.tokenId === tokenData.tokenId);
      const tokenDecimals = tokenData.decimals || 2;
      const tokenBalance = tokenFound
        ? (tokenFound.balance / Math.pow(10, tokenDecimals)).toFixed(tokenDecimals)
        : '0.00';
      console.log('tokenBalance', tokenBalance);

      setTokenBalance(tokenBalance);
      setMaxNumber && setMaxNumber(tokenBalance);
    };

    tokenData && getTokenBalance();
  }, [userTokenList, tokenData]);

  return <p className="text-steel mt-3 text-end">Wallet balance: {tokenBalance}</p>;
};

export default WalletBalance;
