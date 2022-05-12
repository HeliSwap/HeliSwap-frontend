import React, { useEffect, useState } from 'react';
import { getTokenInfo, tokenAddressToId } from '../utils/tokenUtils';
import { ITokenData, IPairData } from '../interfaces/tokens';

import { useQuery } from '@apollo/client';
import { GET_TOKENS } from '../GraphQL/Queries';
import Loader from '../components/Loader';

const Tokens = () => {
  const { error, loading, data } = useQuery(GET_TOKENS);
  const [loadingGeneral, setLoadingGeneral] = useState(false);
  const [tokenData, setTokenData] = useState<ITokenData[]>([]);
  const [tokenList, setTokenList] = useState<string[]>([]);

  useEffect(() => {
    if (data) {
      const { pools } = data;
      const tokens = pools.reduce((acc: any, item: IPairData) => {
        const item0Id = tokenAddressToId(item.token0);
        const item1Id = tokenAddressToId(item.token1);

        if (!acc.includes(item0Id)) acc.push(item0Id);
        if (!acc.includes(item1Id)) acc.push(item1Id);

        return acc;
      }, []);

      setTokenList(tokens);
    }
  }, [data]);

  useEffect(() => {
    const getTokensDada = async (tokenList: string[]) => {
      setLoadingGeneral(true);
      const arrayPromises = tokenList.map(tokenId => getTokenInfo(tokenId));
      const result = await Promise.all(arrayPromises);

      setTokenData(result);
      setLoadingGeneral(false);
    };

    if (tokenList.length > 0) {
      getTokensDada(tokenList);
    }
  }, [tokenList]);

  const haveTokens = tokenData.length > 0;

  return (
    <div className="d-flex justify-content-center">
      <div className="container-pairs">
        {error ? (
          <div className="alert alert-danger mt-5" role="alert">
            <strong>Something went wrong!</strong> Cannot get pairs...
          </div>
        ) : null}
        {loading || loadingGeneral ? (
          <Loader loadingText="Loading tokens..." />
        ) : haveTokens ? (
          <div className="container-table">
            <div className="container-table-row">
              <div>#</div>
              <div>Token</div>
              <div>Symbol</div>
              <div className="text-end">Total supply</div>
            </div>
            {tokenData.map((item, index) => (
              <div key={index} className="container-table-row">
                <div>{index + 1}</div>
                <div className="d-flex align-items-center">
                  <span className="ms-3">{item.name}</span>
                </div>
                <div>{item.symbol}</div>
                <div className="text-end">{item.totalSupply}</div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-warning">No tokens found</p>
        )}
      </div>
    </div>
  );
};

export default Tokens;
