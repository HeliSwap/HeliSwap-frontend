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
          address: '0x0000000000000000000000000000000002DdF9F9', //campaign address
          stakingTokenAddress: '0xe97aB1284c3f9Cc1829A2A80F221ea7b09039CF0',
          totalStaked: '5099018512',
          userStakingData: {
            stakedAmount: '2549509756',
            rewardsAccumulated: {
              '0x0000000000000000000000000000000002be8c90': '0',
            },
          },
          rewardsData: [
            {
              address: '0x0000000000000000000000000000000002be8c90',
              symbol: 'WHBAR',
              totalAmount: '100',
              duration: 604800,
              decimals: 8,
              totalAccumulated: '0',
              rewardEnd: 1662448478000,
            },
          ],
          poolData: {
            pairSymbol: 'USDT WHBAR',
            pairSupply: '5099019512',
            pairAddress: '0xe97aB1284c3f9Cc1829A2A80F221ea7b09039CF0',
            pairName: 'USD Hedera Token Wrapped Hbar LP',
            lpShares: '2549509756',
            token0: '0x0000000000000000000000000000000002121D51',
            token0Symbol: 'USDT',
            token0Decimals: 6,
            token0Name: 'USD Hedera Token',
            token1: '0x0000000000000000000000000000000002be8c90',
            token1Symbol: 'WHBAR',
            token1Decimals: 8,
            token1Name: 'Wrapped Hbar',
            volume24h: '',
            volume7d: '',
            token0Amount: '65000000',
            token1Amount: '100000000000',
          },
        },
        {
          address: '0x0000000000000000000000000000000002DDfB0e', //campaign address
          stakingTokenAddress: '0xe97aB1284c3f9Cc1829A2A80F221ea7b09039CF0',
          totalStaked: '5099018512',
          userStakingData: {
            stakedAmount: '2549509756',
            rewardsAccumulated: {
              '0x0000000000000000000000000000000002be8c90': '0',
            },
          },
          rewardsData: [
            {
              address: '0x0000000000000000000000000000000002121D51',
              symbol: 'USDT',
              totalAmount: '500',
              duration: 604800,
              decimals: 6,
              totalAccumulated: '0',
              rewardEnd: 1664440074000,
            },
          ],
          poolData: {
            pairSymbol: 'USDT WHBAR',
            pairSupply: '5099019512',
            pairAddress: '0xe97aB1284c3f9Cc1829A2A80F221ea7b09039CF0',
            pairName: 'USD Hedera Token Wrapped Hbar LP',
            lpShares: '2549509756',
            token0: '0x0000000000000000000000000000000002121D51',
            token0Symbol: 'USDT',
            token0Decimals: 6,
            token0Name: 'USD Hedera Token',
            token1: '0x0000000000000000000000000000000002be8c90',
            token1Symbol: 'WHBAR',
            token1Decimals: 8,
            token1Name: 'Wrapped Hbar',
            volume24h: '',
            volume7d: '',
            token0Amount: '65000000',
            token1Amount: '100000000000',
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
