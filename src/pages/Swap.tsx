import React, { useState, useEffect, useContext } from 'react';
import { getTokenInfo, getTokensWalletBalance } from '../utils/tokenUtils';
import { ITokenData, IUserToken } from '../interfaces/tokens';
import { GlobalContext } from '../providers/Global';

import Button from '../components/Button';
import Loader from '../components/Loader';
import Modal from '../components/Modal';

interface IFormState {
  [key: string]: string;
}

const Swap = () => {
  const contextValue = useContext(GlobalContext);
  const { connection } = contextValue;
  const { userId } = connection;

  const [tokenList, setTokenList] = useState<string[]>([]);
  const [userTokenList, setUserTokenList] = useState<IUserToken[]>([]);
  const [tokenDataList, setTokenDataList] = useState<ITokenData[]>([]);

  const [isLoading, setIsLoading] = useState(true);

  const [formState, setFormState] = useState<IFormState>({
    swapTo: '0',
    swapFrom: '0',
  });
  const [walletBallances, setWalletBalances] = useState({
    token1Balance: '0.00',
    token2Balance: '0.00',
  });

  const handleSelectChange = (e: any) => {
    const {
      target: { name, value },
    } = e;

    setFormState(prev => ({ ...prev, [name]: value }));
  };

  const handleInputChange = (e: any) => {
    const {
      target: { name, value },
    } = e;

    // Validate value
    const valueNum = Number(value);
    const updatedValue = valueNum < 0 ? 0 : valueNum;

    setFormState(prev => ({ ...prev, [name]: updatedValue }));
    calculateRate(name, value);
  };

  const calculateRate = (name: string, value: string) => {
    const inputs = ['swapFrom', 'swapTo'];
    const inputToUpdate = inputs.filter(item => item !== name)[0];

    // Mock calculated data
    const calculatedValue = Number(value) * 2;
    setFormState(prev => ({ ...prev, [inputToUpdate]: calculatedValue.toString() }));
  };

  useEffect(() => {
    setTokenList([
      '0.0.447200',
      '0.0.34250206',
      '0.0.34250234',
      '0.0.34250245',
      '0.0.34250875',
      '0.0.34247708',
    ]);
  }, []);

  useEffect(() => {
    const getTokensDada = async (tokenList: string[]) => {
      const arrayPromises = tokenList.map(tokenId => getTokenInfo(tokenId));
      const result = await Promise.all(arrayPromises);

      setTokenDataList(result);
      setFormState(prev => ({
        ...prev,
        selectFrom: result[0].tokenId,
        selectТо: result[1].tokenId,
      }));
    };

    if (tokenList.length > 0) {
      getTokensDada(tokenList);
    }
  }, [tokenList, userTokenList]);

  useEffect(() => {
    const updateUserBalances = () => {
      const foundToken1 = userTokenList.find(item => item.tokenId === formState['selectFrom']);
      const foundToken2 = userTokenList.find(item => item.tokenId === formState['selectТо']);

      const token1Decimals =
        tokenDataList.find(item => item.tokenId === formState['selectFrom'])?.decimals || 2;
      const token2Decimals =
        tokenDataList.find(item => item.tokenId === formState['selectТо'])?.decimals || 2;

      const token1Balance = foundToken1
        ? (foundToken1.balance / Math.pow(10, token1Decimals)).toFixed(token1Decimals)
        : '0.00';
      const token2Balance = foundToken2
        ? (foundToken2.balance / Math.pow(10, token2Decimals)).toFixed(token2Decimals)
        : '0.00';

      setWalletBalances({ token1Balance, token2Balance });
    };

    Object.keys(formState).length > 0 &&
      tokenList.length > 0 &&
      userTokenList.length > 0 &&
      updateUserBalances();
  }, [tokenList, userTokenList, formState, tokenDataList]);

  useEffect(() => {
    const getUserTokensData = async () => {
      const { tokens } = await getTokensWalletBalance(userId);
      setUserTokenList(tokens);
    };

    if (userId) {
      getUserTokensData();
      setIsLoading(false);
    }
  }, [userId, tokenList]);

  const hasTokens = tokenDataList.length > 0;

  return (
    <div className="d-flex justify-content-center">
      <div className="container-swap">
        <div className="d-flex justify-content-between">
          <span className="badge bg-primary text-uppercase">From</span>
          <span></span>
        </div>

        <div className="row justify-content-between align-items-end mt-3">
          <div className="col-8">
            <input
              value={formState['swapFrom']}
              name="swapFrom"
              onChange={handleInputChange}
              type="number"
              className="form-control mt-2"
            />
            <p className="text-success mt-3">$0.00</p>
          </div>

          <div className="col-4">
            {hasTokens && formState ? (
              <select
                value={formState['selectFrom']}
                onChange={handleSelectChange}
                name="selectFrom"
                id=""
                className="form-control"
              >
                {tokenDataList.map(item => (
                  <option key={item.tokenId} value={item.tokenId}>
                    {item.symbol}
                  </option>
                ))}
              </select>
            ) : null}

            <p className="text-steel mt-3 text-end">
              Wallet balance: {walletBallances.token1Balance}
            </p>
          </div>
        </div>

        <div className="d-flex justify-content-between mt-5">
          <span className="badge bg-info text-uppercase">To</span>
          <span></span>
        </div>

        <div className="row justify-content-between align-items-end mt-3">
          <div className="col-8">
            <input
              value={formState['swapTo']}
              onChange={handleInputChange}
              name="swapTo"
              type="number"
              className="form-control mt-2"
            />
            <p className="text-success mt-3">$0.00</p>
          </div>

          <div className="col-4">
            {hasTokens && formState ? (
              <select
                value={formState['selectТо']}
                onChange={handleSelectChange}
                name="selectТо"
                id=""
                className="form-control"
              >
                {tokenDataList.map(item => (
                  <option key={item.tokenId} value={item.tokenId}>
                    {item.symbol}
                  </option>
                ))}
              </select>
            ) : null}
            <p className="text-steel mt-3 text-end">
              Wallet balance: {walletBallances.token2Balance}
            </p>
          </div>
        </div>

        <div className="mt-5 d-flex justify-content-center">
          {isLoading ? <Loader /> : <Button>Swap</Button>}
        </div>

        <Modal />
      </div>
    </div>
  );
};

export default Swap;
