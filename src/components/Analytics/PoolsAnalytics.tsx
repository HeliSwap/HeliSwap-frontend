import React from 'react';

import { IPoolsAnalytics } from '../../interfaces/tokens';

import { formatStringToPrice } from '../../utils/numberUtils';

interface IPoolsAnalyticsProps {
  poolsAnalytics: IPoolsAnalytics;
}

const PoolsAnalytics = ({ poolsAnalytics }: IPoolsAnalyticsProps) => {
  return (
    <div className="container-blue-neutral-800 d-flex rounded py-4 px-5 my-5">
      <p className="text-small">
        <span className="text-gray">TVL:</span>{' '}
        <span className="text-numeric text-bold">
          {formatStringToPrice(poolsAnalytics.tvl.toString())}
        </span>
      </p>
      <p className="text-small ms-7">
        <span className="text-gray">Volume 24h:</span>{' '}
        <span className="text-numeric text-bold">
          {formatStringToPrice(poolsAnalytics.volume24h.toString())}
        </span>
      </p>
      <p className="text-small ms-7">
        <span className="text-gray">Volume 7d:</span>{' '}
        <span className="text-numeric text-bold">
          {formatStringToPrice(poolsAnalytics.volume7d.toString())}
        </span>
      </p>
    </div>
  );
};

export default PoolsAnalytics;
