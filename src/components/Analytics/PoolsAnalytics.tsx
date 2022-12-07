import React from 'react';

import { IPoolsAnalytics } from '../../interfaces/tokens';

import { formatStringToPrice } from '../../utils/numberUtils';

interface IPoolsAnalyticsProps {
  poolsAnalytics: IPoolsAnalytics;
}

const PoolsAnalytics = ({ poolsAnalytics }: IPoolsAnalyticsProps) => {
  return (
    <div className="container-blue-neutral-800 d-md-flex rounded p-4 px-md-5 my-5">
      <p className="d-flex justify-content-between d-md-inline text-small">
        <span className="text-gray">TVL:</span>{' '}
        <span className="text-numeric text-bold">
          {formatStringToPrice(poolsAnalytics.tvl.toString())}
        </span>
      </p>
      <p className="d-flex justify-content-between d-md-inline text-small ms-md-7 mt-3 mt-md-0">
        <span className="text-gray">Volume 24h:</span>{' '}
        <span className="text-numeric text-bold">
          {formatStringToPrice(poolsAnalytics.volume24h.toString())}
        </span>
      </p>
      <p className="d-flex justify-content-between d-md-inline text-small ms-md-7 mt-3 mt-md-0">
        <span className="text-gray">Volume 7d:</span>{' '}
        <span className="text-numeric text-bold">
          {formatStringToPrice(poolsAnalytics.volume7d.toString())}
        </span>
      </p>
    </div>
  );
};

export default PoolsAnalytics;
