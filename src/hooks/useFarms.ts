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
          address: '0x0000000000000000000000000000000002dDB292', //campaign address
          stakingTokenAddress: '0x978264868aA0730718FBe0A3CCCF8C09f6eb74C3',
          totalStaked: '3000000000',
          userStakingData: {
            stakedAmount: '3000000000',
            rewardsAccumulated: {
              '0x0000000000000000000000000000000002be8c90': '3448959',
              '0x0000000000000000000000000000000002121D51': '178047',
            },
          },
          rewardsData: [
            {
              address: '0x0000000000000000000000000000000002be8c90',
              symbol: 'WHBAR',
              totalAmount: '100',
              duration: 31536000,
              decimals: 8,
              totalAccumulated: '100',
              rewardEnd: 1693296281000,
            },
            {
              address: '0x0000000000000000000000000000000002121D51',
              symbol: 'USDT',
              totalAmount: '1000',
              duration: 31536000,
              decimals: 6,
              totalAccumulated: '0.1',
              rewardEnd: 1677320620000,
            },
          ],
          poolData: {
            lpShares: '3665807496',
            pairAddress: '0x978264868aA0730718FBe0A3CCCF8C09f6eb74C3',
            pairName: 'USD Hedera Token Wrapped Hbar LP',
            pairSupply: '31594287583',
            pairSymbol: 'USDT WHBAR',
            token0: '0x0000000000000000000000000000000002121D51',
            token0Amount: '861864340',
            token0Decimals: 6,
            token0Name: 'tokenHTS2',
            token0Symbol: 'USDT',
            token1: '0x0000000000000000000000000000000002be8c90',
            token1Amount: '1158276405442',
            token1Decimals: 8,
            token1Name: 'WHBAR',
            token1Symbol: 'WHBAR',
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
