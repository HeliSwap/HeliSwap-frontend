import React, { useState, useEffect, useContext } from 'react';
import { getTokenInfo, getTokensWalletBalance } from '../utils/tokenUtils';
import { ITokenData, IUserToken, ISwapTokenData } from '../interfaces/tokens';
import { IStringToString } from '../interfaces/comon';
import { GlobalContext } from '../providers/Global';

import { useQuery, useLazyQuery } from '@apollo/client';
import { GET_TOKENS, GET_SWAP_RATE } from '../GraphQL/Queries';

import Button from '../components/Button';
import Loader from '../components/Loader';
import Modal from '../components/Modal';
import TokenInputSelector from '../components/TokenInputSelector';

const Swap = () => {
  const initialSwapData: ISwapTokenData = {
    tokenIdIn: '',
    tokenIdOut: '',
    amountIn: '',
    amountOut: '',
  };
  const contextValue = useContext(GlobalContext);
  const { connection } = contextValue;
  const { userId } = connection;

  const [tokenList, setTokenList] = useState<string[]>([]);
  const [userTokenList, setUserTokenList] = useState<IUserToken[]>([]);
  const [tokenDataList, setTokenDataList] = useState<ITokenData[]>([]);

  const [swapData, setSwapData] = useState(initialSwapData);

  const [isLoading, setIsLoading] = useState(true);

  const { error, loading, data } = useQuery(GET_TOKENS);
  const [getSwapRate, { called, loading: loadingRate, data: dataRate }] = useLazyQuery(
    GET_SWAP_RATE,
    {
      variables: {
        amountIn: swapData.amountIn,
        tokenIdIn: swapData.tokenIdIn,
        tokenIdOut: swapData.tokenIdOut,
      },
    },
  );

  function onInputChange(tokenData: IStringToString) {
    setSwapData(prev => ({ ...prev, ...tokenData }));
  }

  function onSelectChange(tokenData: IStringToString) {
    setSwapData(prev => ({ ...prev, ...tokenData }));
  }

  useEffect(() => {
    if (data) {
      const tokenIds = data.getTokensIds.map((item: { id: string }) => item.id);
      setTokenList(tokenIds);
    }
  }, [data]);

  useEffect(() => {
    const getTokensDada = async (tokenList: string[]) => {
      const arrayPromises = tokenList.map(tokenId => getTokenInfo(tokenId));
      const result = await Promise.all(arrayPromises);

      setTokenDataList(result);
    };

    if (tokenList.length > 0) {
      getTokensDada(tokenList);
    }
  }, [tokenList, userTokenList]);

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

  return (
    <div className="d-flex justify-content-center">
      <div className="container-swap">
        {error ? (
          <div className="alert alert-danger mb-5" role="alert">
            <strong>Something went wrong!</strong> Cannot get pairs...
          </div>
        ) : null}

        <div className="d-flex justify-content-between">
          <span className="badge bg-primary text-uppercase">From</span>
          <span></span>
        </div>

        <TokenInputSelector
          inputName="amountIn"
          selectName="tokenIdIn"
          tokenDataList={tokenDataList}
          userTokenList={userTokenList}
          onInputChange={onInputChange}
          onSelectChange={onSelectChange}
        />

        <div className="d-flex justify-content-between mt-5">
          <span className="badge bg-info text-uppercase">To</span>
          <span></span>
        </div>

        <TokenInputSelector
          inputName="amountOut"
          selectName="tokenIdOut"
          tokenDataList={tokenDataList}
          userTokenList={userTokenList}
          onInputChange={onInputChange}
          onSelectChange={onSelectChange}
        />

        <div className="mt-5 d-flex justify-content-center">
          {isLoading || loading ? <Loader /> : <Button onClick={() => getSwapRate()}>Swap</Button>}
        </div>
      </div>
    </div>
  );
};

export default Swap;
