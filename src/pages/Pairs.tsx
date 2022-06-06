import React from 'react';
import { Link } from 'react-router-dom';
import usePools from '../hooks/usePools';

import { formatStringToPrice } from '../utils/numberUtils';

const Pairs = () => {
  const isLocalDev = process.env.REACT_APP_LOCAL_DEV === 'true';

  const { pools, error, loading } = usePools({
    fetchPolicy: 'network-only',
    pollInterval: 10000,
  });

  const formatIcons = (icons: string[]) =>
    icons &&
    icons.length > 0 &&
    icons.map((item, index) => <img key={index} width={20} src={`/icons/${item}.png`} alt="" />);

  const havePairs = pools && pools.length > 0;

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
        ) : havePairs ? (
          <div className="container-table">
            <div className="container-table-row with-cols-5">
              <div>#</div>
              <div>Pair</div>
              <div className="text-end">TVL</div>
              <div className="text-end">Volume 24H</div>
              <div className="text-end">Volume 7D</div>
            </div>
            {pools.map((item, index) => (
              <div key={index} className="container-table-row with-cols-5">
                <div>{index + 1}</div>
                <div className="d-flex align-items-center">
                  {formatIcons([item.token0Symbol, item.token1Symbol])}
                  <span className="ms-3">
                    {isLocalDev ? (
                      <Link className="link-primary" to={`${item.pairAddress}`}>
                        {item.pairSymbol}
                      </Link>
                    ) : (
                      <p>{item.pairSymbol}</p>
                    )}
                  </span>
                </div>
                <div className="text-end">{formatStringToPrice(item.tvl)}</div>
                <div className="text-end">{formatStringToPrice(item.volume24h)}</div>
                <div className="text-end">{formatStringToPrice(item.volume7d)}</div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-warning">No pairs found</p>
        )}
      </div>
    </div>
  );
};

export default Pairs;
