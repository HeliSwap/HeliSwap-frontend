import { useEffect, useState } from 'react';
import { IFarmData, IFarmDataRaw, IPoolData } from '../interfaces/tokens';

import { QueryHookOptions } from '@apollo/client';
import { getProcessedFarms } from '../utils/farmUtils';
import { getHBarPrice } from '../utils/tokenUtils';
// import { GET_FARMS } from '../GraphQL/Queries';

const useFarms = (useQueryOptions: QueryHookOptions = {}, pools: IPoolData[]) => {
  const [farmsRaw, setFarmsRaw] = useState<IFarmDataRaw[]>([]);
  const [farms, setFarms] = useState<IFarmData[]>([]);
  const [hbarPrice, setHbarPrice] = useState(0);

  // const { loading, data, error, startPolling, stopPolling } = useQuery(GET_FARMS, useQueryOptions);

  useEffect(() => {
    const getFarmsData = () => {
      setFarmsRaw([
        {
          address: '0x0000000000000000000000000000000002da4531', //campaign address
          stakingTokenAddress: '0x32Abf27699EcE08F61dd05b5b8cfc35Db0b472D8',
          totalStaked: '11256869348',
          userStakingData: {
            stakedAmount: '1125686934',
            rewardsAccumulated: {
              '0x000000000000000000000000000000000215311b': '12312',
              '0x0000000000000000000000000000000002121d92': '12312',
            },
          },
          rewardsData: [
            {
              address: '0x000000000000000000000000000000000215311b',
              symbol: 'tHTS2',
              totalAmount: '1000',
              duration: 86400,
              decimals: 6,
              totalAccumulated: '123',
            },
            {
              address: '0x0000000000000000000000000000000002121d92',
              symbol: 'WETH',
              totalAmount: '1000',
              duration: 86400,
              decimals: 10,
              totalAccumulated: '123',
            },
          ],
          poolData: {
            pairAddress: '0x32Abf27699EcE08F61dd05b5b8cfc35Db0b472D8',
            pairName: 'tokenHTS2 tokenDA LP',
            pairSupply: '112568693488',
            pairSymbol: 'tHTS2 tDA',
            token0: '0x000000000000000000000000000000000215311b',
            token0Amount: '122195025422',
            token0Decimals: 8,
            token0Name: 'tokenHTS2',
            token0Symbol: 'tHTS2',
            token1: '0x0000000000000000000000000000000002d76e92',
            token1Amount: '103726966058',
            token1Decimals: 8,
            token1Name: 'tokenDA',
            token1Symbol: 'tDA',
            volume7d: '385876939',
            volume24h: '0',
          },
        },
      ]);
    };

    getFarmsData();
  }, []);

  useEffect(() => {
    const getHBARPrice = async () => {
      const hbarPrice = await getHBarPrice();
      setHbarPrice(hbarPrice);
    };

    getHBARPrice();
  }, []);

  useEffect(() => {
    if (farmsRaw.length && pools.length && hbarPrice !== 0) {
      const processedFarms = getProcessedFarms(farmsRaw, pools, hbarPrice);
      setFarms(processedFarms);
    }
  }, [farmsRaw, pools, hbarPrice]);

  return { farms };
};

export default useFarms;
