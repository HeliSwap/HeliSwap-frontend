import React, { useEffect, useState } from 'react';
import { ITokenData } from '../interfaces/tokens';

import { useQuery } from '@apollo/client';
import { GET_TOKENS } from '../GraphQL/Queries';
import Loader from '../components/Loader';

const Tokens = () => {
  const { error, loading, data } = useQuery(GET_TOKENS);
  const [tokenData, setTokenData] = useState<ITokenData[]>([]);

  useEffect(() => {
    if (data) {
      const { getTokensData } = data;

      getTokensData.length > 0 && setTokenData(getTokensData);
    }
  }, [data]);

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
          <Loader loadingText="Loading tokens..." />
        ) : haveTokens ? (
          <div className="container-table">
            <div className="container-table-row">
              <div>#</div>
              <div>Token</div>
              <div>Symbol</div>
              <div className="text-end">Decimals</div>
              <div className="text-end">Hedera Id</div>
            </div>
            {tokenData.map((item, index) => (
              <div key={index} className="container-table-row">
                <div>{index + 1}</div>
                <div className="d-flex align-items-center">
                  <span className="ms-3">{item.name}</span>
                </div>
                <div>{item.symbol}</div>
                <div className="text-end">{item.decimals}</div>
                <div className="text-end">
                  <p>{item.hederaId}</p>
                </div>
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
