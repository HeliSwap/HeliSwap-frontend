import React, { useState, useEffect, useContext } from 'react';
import { getTokenInfo, getTokensWalletBalance } from '../utils/tokenUtils';
import { ITokenData, IUserToken } from '../interfaces/tokens';
import { GlobalContext } from '../providers/Global';

import { useQuery } from '@apollo/client';
import { GET_TOKENS } from '../GraphQL/Queries';

import Button from '../components/Button';
import Loader from '../components/Loader';
import Modal from '../components/Modal';
import TokenInputSelector from '../components/TokenInputSelector';

const Swap = () => {
  const contextValue = useContext(GlobalContext);
  const { error, loading, data } = useQuery(GET_TOKENS);
  const { connection } = contextValue;
  const { userId } = connection;

  const [tokenList, setTokenList] = useState<string[]>([]);
  const [userTokenList, setUserTokenList] = useState<IUserToken[]>([]);
  const [tokenDataList, setTokenDataList] = useState<ITokenData[]>([]);

  const [isLoading, setIsLoading] = useState(true);

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
      {error ? (
        <div className="alert alert-danger mt-5" role="alert">
          <strong>Something went wrong!</strong> Cannot get pairs...
        </div>
      ) : null}

      <div className="container-swap">
        <div className="d-flex justify-content-between">
          <span className="badge bg-primary text-uppercase">From</span>
          <span></span>
        </div>

        <TokenInputSelector
          inputName="swapFrom"
          selectName="selectFrom"
          tokenDataList={tokenDataList}
          userTokenList={userTokenList}
        />

        <div className="d-flex justify-content-between mt-5">
          <span className="badge bg-info text-uppercase">To</span>
          <span></span>
        </div>

        <TokenInputSelector
          inputName="swapTo"
          selectName="selectTo"
          tokenDataList={tokenDataList}
          userTokenList={userTokenList}
        />

        <div className="mt-5 d-flex justify-content-center">
          {isLoading || loading ? <Loader /> : <Button>Swap</Button>}
        </div>

        <Modal />
      </div>
    </div>
  );
};

export default Swap;
