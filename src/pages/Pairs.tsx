import React, { useEffect, useState } from 'react';

import { useQuery } from '@apollo/client';
import { GET_PAIRS } from '../GraphQL/Queries';
import { formatStringToPrice } from '../utils/numberUtils';

interface IPairData {
  name: string;
  tvl: string;
  volume24h: string;
  volume7d: string;
  icons: string[];
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
        icons: ['usdc', 'ethereum'],
      },
      {
        name: 'USDC/BTC',
        tvl: '384759375',
        volume24h: '24583',
        volume7d: '237549',
        icons: ['usdc', 'btc'],
      },
      {
        name: 'BTC/ETH',
        tvl: '245643456',
        volume24h: '35466',
        volume7d: '456322',
        icons: ['btc', 'ethereum'],
      },
    ];
    setPairData(pairData);
  }, [data]);

  const formatIcons = (icons: string[]) =>
    icons.map((item, index) => <img key={index} width={20} src={`/icons/${item}.png`} alt="" />);

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
              <div className="d-flex align-items-center">
                {formatIcons(item.icons)}
                <span className="ms-3">{item.name}</span>
              </div>
              <div className="text-end">{formatStringToPrice(item.tvl)}</div>
              <div className="text-end">{formatStringToPrice(item.volume24h)}</div>
              <div className="text-end">{formatStringToPrice(item.volume7d)}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Pairs;
