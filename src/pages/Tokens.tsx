import React from 'react';
import useTokens from '../hooks/useTokens';
import Loader from '../components/Loader';
import IconToken from '../components/IconToken';
import { REFRESH_TIME } from '../constants';

const Tokens = () => {
  const {
    tokens,
    error: errorTokens,
    loading: loadingTokens,
  } = useTokens({
    fetchPolicy: 'network-only',
    pollInterval: REFRESH_TIME,
  });

  const haveTokens = tokens && tokens.length > 0;

  return (
    <div className="d-flex justify-content-center">
      <div className="container-pairs">
        {errorTokens ? (
          <div className="alert alert-danger mt-5" role="alert">
            <strong>Something went wrong!</strong> Cannot get pairs...
          </div>
        ) : null}
        {loadingTokens ? (
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
            {tokens!.map((item, index) => (
              <div key={index} className="container-table-row with-cols-6">
                <div>{index + 1}</div>
                <div className="d-flex align-items-center">
                  <IconToken symbol={item.symbol} />
                  <span className="ms-3">{item.name}</span>
                </div>
                <div>{item.type}</div>
                <div>{item.symbol}</div>
                <div className="text-end text-numeric">{item.decimals}</div>
                <div className="text-end text-numeric">
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
