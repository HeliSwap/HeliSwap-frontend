import { useEffect, useState } from 'react';
import { IFarmData } from '../interfaces/tokens';

import { QueryHookOptions } from '@apollo/client';
// import { GET_FARMS } from '../GraphQL/Queries';

const useFarms = (useQueryOptions: QueryHookOptions = {}) => {
  const [farms, setFarms] = useState<IFarmData[]>([]);

  // const { loading, data, error, startPolling, stopPolling } = useQuery(GET_FARMS, useQueryOptions);

  useEffect(() => {
    setFarms([
      {
        address: '0x0000000000000000000000000000000002da4531',
        stakingTokenAddress: '0x1165f6115eb38eD34E93B303f9388a901b6d47d4',
        totalStaked: '0',
        rewardsData: [
          {
            address: '0x0000000000000000000000000000000002121D51',
            symbol: 'USDT',
            totalAmount: '1000',
            duration: 86400,
          },
          {
            address: '0x0000000000000000000000000000000002121d92',
            symbol: 'WETH',
            totalAmount: '1000',
            duration: 86400,
          },
        ],
      },
    ]);
  }, []);

  return { farms };
};

export default useFarms;
