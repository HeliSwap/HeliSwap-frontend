import React, { useState, useEffect } from 'react';
import { getTokenInfo } from '../utils/tokenUtils';
import { ITokenData, ISwapTokenData } from '../interfaces/tokens';
import { IStringToString } from '../interfaces/comon';

import { useQuery, useLazyQuery } from '@apollo/client';
import { GET_TOKENS, GET_SWAP_RATE } from '../GraphQL/Queries';

import Button from '../components/Button';
import Loader from '../components/Loader';
import TokenInputSelector from '../components/TokenInputSelector';

const Swap = () => {
  const initialSwapData: ISwapTokenData = {
    tokenIdIn: '',
    tokenIdOut: '',
    amountIn: '',
    amountOut: '',
  };

  const [tokenList, setTokenList] = useState<string[]>([]);
  const [tokenDataList, setTokenDataList] = useState<ITokenData[]>([]);

  const [swapData, setSwapData] = useState(initialSwapData);

  const { error, loading, data } = useQuery(GET_TOKENS);
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
  }, [tokenList]);

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
          {loading ? <Loader /> : <Button onClick={() => getSwapRate()}>Swap</Button>}
        </div>
      </div>
    </div>
  );
};

export default Swap;
