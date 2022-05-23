import React, { useState, useEffect, useContext } from 'react';
import { ITokenData, ISwapTokenData, IPairData } from '../interfaces/tokens';
import { IStringToString } from '../interfaces/comon';
import { GlobalContext } from '../providers/Global';

import errorMessages from '../content/errors';

import { useQuery } from '@apollo/client';
import { GET_TOKENS } from '../GraphQL/Queries';

import Button from '../components/Button';
import Loader from '../components/Loader';
import TokenInputSelector from '../components/TokenInputSelector';
import { getConnectedWallet } from './Helpers';
import { idToAddress } from '../utils/tokenUtils';
import { hethers } from '@hashgraph/hethers';
import { GET_POOLS } from '../GraphQL/Queries';
import { useParams } from 'react-router-dom';

const Swap = () => {
  const connectedWallet = getConnectedWallet();

  const { loading: loadingPool, data: dataPool, refetch } = useQuery(GET_POOLS);
  const [pairData, setPairData] = useState<any>({});
  const [poolsData, setPoolsData] = useState<any>([]);
  const { address } = useParams();

  const contextValue = useContext(GlobalContext);
  const { connection, sdk } = contextValue;
  const { userId, hashconnectConnectorInstance } = connection;

  const [error, setError] = useState(false);
  const [poolReserves, setPoolReserves] = useState({ tokenIn: '0', tokenOut: '0' });
  const [errorMessage, setErrorMessage] = useState('');
  const [tokenInInputValue, setTokenInInputValue] = useState('0');
  const [tokenOutInputValue, setTokenOutInputValue] = useState('0');

  const initialSwapData: ISwapTokenData = {
    tokenIdIn: '',
    tokenIdOut: '',
    amountIn: '',
    amountOut: '',
  };

  useEffect(() => {
    if (dataPool && dataPool.pools.length > 0) {
      setPoolsData(dataPool.pools);
    }
  }, [dataPool, address]);

  const [tokenDataList, setTokenDataList] = useState<ITokenData[]>([]);
  const [tokenApproved, setTokenApproved] = useState(false);

  const [swapData, setSwapData] = useState(initialSwapData);
  useEffect(() => {
    if (swapData.tokenIdIn && swapData.tokenIdOut && poolsData.length > 0) {
      const tokenInAddress = idToAddress(swapData.tokenIdIn);
      const tokenOutAddress = idToAddress(swapData.tokenIdOut);
      const newPairData = poolsData
        .filter((pool: any) => {
          return pool.token0 === tokenInAddress || pool.token1 === tokenInAddress;
        })
        .filter((pool: any) => {
          return pool.token0 === tokenOutAddress || pool.token1 === tokenOutAddress;
        });

      setPairData(newPairData[0]);
    }
  }, [poolsData, swapData]);
  const { error: errorGT, loading, data } = useQuery(GET_TOKENS);

  async function onInputChange(tokenData: IStringToString) {
    const { token0Amount, token1Amount } = pairData;
    console.log(tokenData);

    if (tokenData.tokenIdIn) {
      const swapAmountOut = sdk.getSwapAmountOut(
        process.env.REACT_APP_ROUTER_ADDRESS as string,
        tokenData.amountIn,
        token0Amount,
        token1Amount,
        connectedWallet,
      );

      setTokenOutInputValue(swapAmountOut);
      setSwapData(prev => ({ ...prev, ...tokenData, amountOut: swapAmountOut.toString() }));
    } else if (tokenData.tokenIdOut) {
      const swapAmountIn = sdk.getSwapAmountIn(
        process.env.REACT_APP_ROUTER_ADDRESS as string,
        tokenData.amountOut,
        token0Amount,
        token1Amount,
        connectedWallet,
      );

      setTokenInInputValue(swapAmountIn);
      setSwapData(prev => ({ ...prev, ...tokenData, amountIn: swapAmountIn.toString() }));
    }
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
      const { getTokensData } = data;
      getTokensData.length > 0 && setTokenDataList(getTokensData);
    }
  }, [data]);

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
          inputValue={tokenInInputValue}
          setInputValue={setTokenInInputValue}
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
          inputValue={tokenOutInputValue}
          setInputValue={setTokenOutInputValue}
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
