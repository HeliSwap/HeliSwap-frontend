import React, { useState, useEffect, useContext } from 'react';
import { ITokenData, ISwapTokenData, IPairData } from '../interfaces/tokens';
import { IStringToString } from '../interfaces/comon';
import { GlobalContext } from '../providers/Global';

import { useQuery } from '@apollo/client';
import { GET_TOKENS, GET_POOLS } from '../GraphQL/Queries';

import Button from '../components/Button';
import Loader from '../components/Loader';
import TokenInputSelector from '../components/TokenInputSelector';

import errorMessages from '../content/errors';
import { addressToId, idToAddress } from '../utils/tokenUtils';

const Swap = () => {
  const contextValue = useContext(GlobalContext);
  const { connection, sdk } = contextValue;
  const { userId, hashconnectConnectorInstance } = connection;

  const initialSwapData: ISwapTokenData = {
    tokenIdIn: '',
    tokenIdOut: '',
    amountIn: '',
    amountOut: '',
  };

  const { loading: loadingPools, data: dataPool } = useQuery(GET_POOLS);
  const { error: errorGT, loading: loadingTokens, data: dataTokens } = useQuery(GET_TOKENS);

  const [poolsData, setPoolsData] = useState<IPairData[]>([]);
  const [tokenDataList, setTokenDataList] = useState<ITokenData[]>([]);
  const [selectedPoolData, setSelectedPoolData] = useState<IPairData>({} as IPairData);

  const [error, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const [swapData, setSwapData] = useState(initialSwapData);

  const onInputChange = async (tokenData: IStringToString) => {
    const { tokenIdIn, amountIn, tokenIdOut, amountOut } = tokenData;
    const { token0Amount, token1Amount, token0Decimals, token1Decimals } = selectedPoolData;

    if (Object.keys(selectedPoolData).length === 0) return;

    const tokenInFirstAtPool = addressToId(selectedPoolData.token0) === tokenIdIn;
    const tokenOutFirstAtPool = addressToId(selectedPoolData.token0) === tokenIdOut;

    let resIn, resOut, decIn, decOut;

    if (tokenIdIn && amountIn) {
      resIn = tokenInFirstAtPool ? token0Amount : token1Amount;
      resOut = tokenInFirstAtPool ? token1Amount : token0Amount;
      decIn = tokenInFirstAtPool ? token0Decimals : token1Decimals;
      decOut = tokenInFirstAtPool ? token1Decimals : token0Decimals;

      const swapAmountOut = sdk.getSwapAmountOut(amountIn, resIn, resOut, decIn, decOut);

      setSwapData(prev => ({ ...prev, ...tokenData, amountOut: swapAmountOut.toString() }));
    } else if (tokenIdOut && amountOut) {
      resIn = tokenOutFirstAtPool ? token1Amount : token0Amount;
      resOut = tokenOutFirstAtPool ? token0Amount : token1Amount;
      decIn = tokenOutFirstAtPool ? token1Decimals : token0Decimals;
      decOut = tokenOutFirstAtPool ? token0Decimals : token1Decimals;

      const swapAmountIn = sdk.getSwapAmountIn(amountOut, resIn, resOut, decIn, decOut);

      setSwapData(prev => ({ ...prev, ...tokenData, amountIn: swapAmountIn.toString() }));
    } else {
      setSwapData(prev => ({ ...prev, amountIn: '', amountOut: '' }));
    }
  };

  const onSelectChange = (tokenData: IStringToString) => {
    setSwapData(prev => ({ ...prev, ...tokenData }));
  };

  const handleSwapClick = async () => {
    const { tokenIdIn, tokenIdOut, amountIn, amountOut } = swapData;
    const { token0, token0Decimals, token1Decimals } = selectedPoolData;

    const tokenInSamePool = tokenIdIn === addressToId(token0);

    const decIn = tokenInSamePool ? token0Decimals : token1Decimals;
    const decOut = tokenInSamePool ? token1Decimals : token0Decimals;

    try {
      const receipt = await sdk.swapTokens(
        hashconnectConnectorInstance,
        userId,
        tokenIdIn,
        tokenIdOut,
        amountIn,
        amountOut,
        decIn,
        decOut,
      );

      const {
        response: { success, error },
      } = receipt;

      if (!success) {
        setError(true);
        setErrorMessage(error);
      } else {
        setSwapData(initialSwapData);
      }
    } catch (err) {
      console.error(`[Error on swap]: ${err}`);
      setError(true);
    } finally {
    }
  };

  useEffect(() => {
    if (dataPool) {
      const { pools } = dataPool;
      pools.length > 0 && setPoolsData(pools);
    }
  }, [dataPool]);

  useEffect(() => {
    if (dataTokens) {
      const { getTokensData } = dataTokens;
      getTokensData.length > 0 && setTokenDataList(getTokensData);
    }
  }, [dataTokens]);

  useEffect(() => {
    if (swapData.tokenIdIn && swapData.tokenIdOut && poolsData.length > 0) {
      const tokenInAddress = idToAddress(swapData.tokenIdIn);
      const tokenOutAddress = idToAddress(swapData.tokenIdOut);

      const selectedPoolData = poolsData.filter((pool: any) => {
        return (
          //Both tokens are in the same pool
          (pool.token0 === tokenInAddress || pool.token1 === tokenInAddress) &&
          (pool.token0 === tokenOutAddress || pool.token1 === tokenOutAddress)
        );
      });

      setSelectedPoolData(selectedPoolData[0]);
    } else {
      setSelectedPoolData({} as IPairData);
    }
  }, [poolsData, swapData]);

  useEffect(() => {
    if (tokenDataList.length > 0 && !swapData.tokenIdIn && !swapData.tokenIdOut) {
      setSwapData({
        ...swapData,
        //Set the first token to the first one in the token list. This will be probably set to WHBAR in future
        tokenIdIn: tokenDataList[0].hederaId,
      });
    }
  }, [tokenDataList, swapData]);

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
          inputValue={swapData.amountIn}
          selectValue={swapData.tokenIdIn}
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
          inputValue={swapData.amountOut}
          selectValue={swapData.tokenIdOut}
          inputName="amountOut"
          selectName="tokenIdOut"
          tokenDataList={tokenDataList}
          onInputChange={onInputChange}
          onSelectChange={onSelectChange}
        />
        <div className="mt-5 d-flex justify-content-center">
          {loadingTokens || loadingPools ? (
            <Loader />
          ) : (
            <Button onClick={() => handleSwapClick()}>Swap</Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Swap;
