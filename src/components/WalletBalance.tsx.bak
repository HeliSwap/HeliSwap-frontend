import React, { useState, useEffect } from 'react';
import { hethers } from '@hashgraph/hethers';
import { ITokenData, IUserToken, TokenType } from '../interfaces/tokens';
import { getHTSTokensWalletBalance } from '../utils/tokenUtils';

interface IWalletBalance {
  userId: string;
  tokenData?: ITokenData;
  setMaxNumber?: (maxNum: string) => void;
}

const WalletBalance = ({ userId, tokenData, setMaxNumber }: IWalletBalance) => {
  const [tokenBalance, setTokenBalance] = useState('0.00');
  const [userTokenList, setUserTokenList] = useState<IUserToken[]>([]);

  useEffect(() => {
    const getUserTokensData = async () => {
      const { tokens } = await getHTSTokensWalletBalance(userId);
      setUserTokenList(tokens);
    };

    if (userId) {
      getUserTokensData();
    }
  }, [userId]);

  useEffect(() => {
    const getTokenBalance = async () => {
      const tokenFound = userTokenList.find(item => item.tokenId === tokenData?.hederaId);
      let tokenBalance = '0.00';

      // Check for native token (HBAR)
      if (tokenData?.type === TokenType.HBAR) {
        const provider = hethers.providers.getDefaultProvider(process.env.REACT_APP_NETWORK_TYPE);
        const userBalanceBN = await provider.getBalance(userId);
        tokenBalance = hethers.utils.formatHbar(userBalanceBN);
      } else {
        const tokenDecimals = tokenData?.decimals || 2;
        tokenBalance = tokenFound
          ? (tokenFound.balance / Math.pow(10, tokenDecimals)).toFixed(tokenDecimals)
          : '0.00';
      }

      setTokenBalance(tokenBalance);
      setMaxNumber && setMaxNumber(tokenBalance);
    };

    tokenData && getTokenBalance();
  }, [userTokenList, tokenData, setMaxNumber, userId]);

  return (
    <p className="text-gray text-small">
      Wallet balance: <span className="text-numeric">{tokenBalance}</span>
    </p>
  );
};

export default WalletBalance;
