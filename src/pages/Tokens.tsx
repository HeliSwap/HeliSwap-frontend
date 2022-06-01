import React, { useEffect, useState } from 'react';
import { ITokenData, TokenType } from '../interfaces/tokens';

import { useQuery } from '@apollo/client';
import { GET_TOKENS } from '../GraphQL/Queries';
import Loader from '../components/Loader';

const Tokens = () => {
  const { error, loading, data } = useQuery(GET_TOKENS, {
    fetchPolicy: 'network-only',
    pollInterval: 10000,
  });
  const [tokenData, setTokenData] = useState<ITokenData[]>([]);

  useEffect(() => {
    if (data) {
      const { getTokensData } = data;

      const tokensData = getTokensData.map((item: any) => ({
        hederaId: item.hederaId,
        name: item.name,
        symbol: item.symbol,
        address: item.address,
        decimals: item.decimals,
        type: item.isHTS ? TokenType.HTS : TokenType.ERC20,
      }));

      getTokensData.length > 0 && setTokenData(tokensData);
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
            <div className="container-table-row with-cols-6">
              <div>#</div>
              <div>Token</div>
              <div>Type</div>
              <div>Symbol</div>
              <div className="text-end">Decimals</div>
              <div className="text-end">Hedera Id</div>
            </div>
            {tokenData.map((item, index) => (
              <div key={index} className="container-table-row with-cols-6">
                <div>{index + 1}</div>
                <div className="d-flex align-items-center">
                  <img key={index} width={20} src={`/icons/${item.symbol}.png`} alt="" />
                  <span className="ms-3">{item.name}</span>
                </div>
                <div>{item.type}</div>
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
