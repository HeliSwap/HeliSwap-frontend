import React, { useEffect, useState } from 'react';

import { useQuery } from '@apollo/client';
import { GET_POOLS, GET_POOL_BY_TOKEN } from '../GraphQL/Queries';
import { formatStringToPrice } from '../utils/numberUtils';

interface IPairData {
  pairName: string;
  pairAddress: string;
  pairSymbol: string;
  token0: string;
  token0Name: string;
  token0Amount: number;
  token0Symbol: string;
  token0Decimals: number;
  token1: string;
  token1Name: string;
  token1Amount: number;
  token1Symbol: string;
  token1Decimals: number;
  tvl: string;
  volume24h: string;
  volume7d: string;
  icons: string[];
}

const Pairs = () => {
  const token = '';
  const { error, loading, data } = useQuery(GET_POOLS);
  const { data: dataPBT } = useQuery(GET_POOL_BY_TOKEN, { variables: { token } });
  const [pairData, setPairData] = useState<IPairData[]>([]);

  useEffect(() => {
    data && setPairData(data.pools);
  }, [data]);

  useEffect(() => {
    console.log('dataPBT', dataPBT?.poolsByToken);
  }, [dataPBT]);

  const formatIcons = (icons: string[]) =>
    icons &&
    icons.length > 0 &&
    icons.map((item, index) => <img key={index} width={20} src={`/icons/${item}.png`} alt="" />);

  const havePairs = pairData.length > 0;

  console.log('data', data);

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
            <div className="container-table-row">
              <div>#</div>
              <div>Pair</div>
              <div className="text-end">TVL</div>
              <div className="text-end">Volume 24H</div>
              <div className="text-end">Volume 7D</div>
            </div>
            {pairData.map((item, index) => (
              <div key={index} className="container-table-row">
                <div>{index + 1}</div>
                <div className="d-flex align-items-center">
                  {formatIcons(item.icons)}
                  <span className="ms-3">{item.pairSymbol}</span>
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
