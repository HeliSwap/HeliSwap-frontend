import React, { useState, useEffect, useContext } from 'react';
import { getTokenInfo, addressToId } from '../utils/tokenUtils';
import { ITokenData, ISwapTokenData, IPairData } from '../interfaces/tokens';
import { IStringToString } from '../interfaces/comon';
import { GlobalContext } from '../providers/Global';

import errorMessages from '../content/errors';

import { useQuery, useLazyQuery } from '@apollo/client';
import { GET_SWAP_RATE, GET_TOKENS } from '../GraphQL/Queries';

import Button from '../components/Button';
import Loader from '../components/Loader';
import TokenInputSelector from '../components/TokenInputSelector';

const Swap = () => {
  const contextValue = useContext(GlobalContext);
  const { connection, sdk } = contextValue;
  const { userId, hashconnectConnectorInstance } = connection;

  const [error, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const initialSwapData: ISwapTokenData = {
    tokenIdIn: '',
    tokenIdOut: '',
    amountIn: '',
    amountOut: '',
  };

  const [tokenList, setTokenList] = useState<string[]>([]);
  const [tokenDataList, setTokenDataList] = useState<ITokenData[]>([]);
  const [tokenApproved, setTokenApproved] = useState(false);

  const [swapData, setSwapData] = useState(initialSwapData);

  const { error: errorGT, loading, data } = useQuery(GET_TOKENS);
  const [getSwapRate] = useLazyQuery(GET_SWAP_RATE, {
    variables: {
      amountIn: swapData.amountIn,
      tokenIdIn: swapData.tokenIdIn,
      tokenIdOut: swapData.tokenIdOut,
    },
  });

  function onInputChange(tokenData: IStringToString) {
    setSwapData(prev => ({ ...prev, ...tokenData }));
  }

  function onSelectChange(tokenData: IStringToString) {
    setSwapData(prev => ({ ...prev, ...tokenData }));
  }

  function handleApproveClick() {
    setTokenApproved(true);
  }

  async function handleSwapClick() {
    const { tokenIdIn, tokenIdOut, amountIn, amountOut } = swapData;

    try {
      const receipt = await sdk.swapTokens(
        hashconnectConnectorInstance,
        userId,
        tokenIdIn,
        tokenIdOut,
        amountIn,
        amountOut,
      );

      const {
        response: { success, error },
      } = receipt;

      if (!success) {
        setError(true);
        setErrorMessage(error);
      } else {
      }
    } catch (err) {
      console.error(`[Error on swap]: ${err}`);
      setError(true);
    } finally {
    }
  }

  useEffect(() => {
    if (data) {
      const { pools } = data;
      const tokens = pools.reduce((acc: any, item: IPairData) => {
        const item0Id = addressToId(item.token0);
        const item1Id = addressToId(item.token1);

        if (!acc.includes(item0Id)) acc.push(item0Id);
        if (!acc.includes(item1Id)) acc.push(item1Id);

        return acc;
      }, []);

      setTokenList(tokens);
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
  }, [tokenList]);

  return (
    <div className="d-flex justify-content-center">
      <div className="container-swap">
        {errorGT ? (
          <div className="alert alert-danger mb-5" role="alert">
            <strong>Something went wrong!</strong> Cannot get pairs...
          </div>
        ) : null}

        {error ? (
          <div className="alert alert-danger my-5" role="alert">
            <strong>Something went wrong!</strong>
            <p>{errorMessages[errorMessage]}</p>
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
          onInputChange={onInputChange}
          onSelectChange={onSelectChange}
        />

        <div className="mt-5 d-flex justify-content-center">
          {loading ? (
            <Loader />
          ) : tokenApproved ? (
            <Button onClick={() => handleSwapClick()}>Swap</Button>
          ) : (
            <Button onClick={() => handleApproveClick()}>Approve</Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Swap;
