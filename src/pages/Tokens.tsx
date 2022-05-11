import React, { useEffect, useState } from 'react';
import { getTokenInfo } from '../utils/tokenUtils';
import { ITokenData } from '../interfaces/tokens';

import { useQuery } from '@apollo/client';
import { GET_TOKENS } from '../GraphQL/Queries';

const Tokens = () => {
  const { error, loading, data } = useQuery(GET_TOKENS);
  const [tokenData, setTokenData] = useState<ITokenData[]>([]);
  const [tokenList, setTokenList] = useState<string[]>([]);

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

      setTokenData(result);
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
        {loading ? (
          <p className="text-info">Loading pairs...</p>
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