import React, { useEffect, useState } from 'react';

import { useQuery } from '@apollo/client';
import { GET_PAIRS } from '../GraphQL/Queries';

interface IPairData {
  name: string;
  tvl: string;
  volume24h: string;
  volume7d: string;
}

const Pairs = () => {
  const { error, loading, data } = useQuery(GET_PAIRS);
  const [pairData, setPairData] = useState<IPairData[]>([]);

  useEffect(() => {
    console.log('data', data);
    const pairData = [
      {
        name: 'USDC/ETH',
        tvl: '345666543',
        volume24h: '45678',
        volume7d: '234567',
      },
      {
        name: 'USDC/BTC',
        tvl: '384759375',
        volume24h: '24583',
        volume7d: '237549',
      },
      {
        name: 'BTC/ETH',
        tvl: '245643456',
        volume24h: '35466',
        volume7d: '456322',
      },
    ];
    setPairData(pairData);
  }, [data]);

  return (
    <div className="d-flex justify-content-center">
      <div className="container-pairs">
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
              <div>{item.name}</div>
              <div className="text-end">{item.tvl}</div>
              <div className="text-end">{item.volume24h}</div>
              <div className="text-end">{item.volume7d}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Pairs;
