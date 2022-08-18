import { useEffect, useState } from 'react';
import { IFarmData } from '../interfaces/tokens';

import { QueryHookOptions } from '@apollo/client';
// import { GET_FARMS } from '../GraphQL/Queries';

const useFarms = (useQueryOptions: QueryHookOptions = {}) => {
  const [farmsRaw, setFarmsRaw] = useState<any[]>([]);
  const [farms, setFarms] = useState<IFarmData[]>([]);

  // const { loading, data, error, startPolling, stopPolling } = useQuery(GET_FARMS, useQueryOptions);

  useEffect(() => {
    const getFarmsData = () => {
      setFarmsRaw([
        {
          address: '0x0000000000000000000000000000000002da4531', //campaign address
          stakingTokenAddress: '0x1165f6115eb38eD34E93B303f9388a901b6d47d4',
          totalStaked: 123123,
          userData: {
            userStaked: 123123,
          },
          rewardsData: [
            {
              address: '0x0000000000000000000000000000000002121D51',
              symbol: 'USDT',
              totalAmount: '1000',
              duration: 86400,
              decimals: 6,
              userRewardPerTokenPaid: 12312, //this is specific for every user per token
              rewards: 123, //this is specific for every user per token(from rewards mapping)
              //directly from Reward struct
              rewardsDistributor: 'address',
              rewardsDuration: 123123,
              periodFinish: 123123,
              rewardRate: 123123,
              lastUpdateTime: 123123,
              rewardPerTokenStored: 123123,
            },
            {
              address: '0x0000000000000000000000000000000002121d92',
              symbol: 'WETH',
              totalAmount: '1000',
              duration: 86400,
              decimals: 10,
              userRewardPerTokenPaid: 12312, //this is specific for every user
              rewards: 123, //this is specific for every user per token(from rewards mapping)
              //directly from Reward struct
              rewardsDistributor: 'address',
              rewardsDuration: 123123,
              periodFinish: 123123,
              rewardRate: 123123,
              lastUpdateTime: 123123,
              rewardPerTokenStored: 123123,
            },
          ],
          poolData: {
            id: '5',
            pairAddress: '0x1165f6115eb38eD34E93B303f9388a901b6d47d4', //staking token address
            pairName: 'token5 Wrapped Hbar LP',
            pairSupply: '1110000000000000',
            pairSymbol: 't5 WHBAR',
            token0: '0x0000000000000000000000000000000002bd649B',
            token0Amount: '111000000000000000000',
            token0Decimals: 18,
            token0Name: 'token5',
            token1: '0x0000000000000000000000000000000002be8c90',
            token1Amount: '11100000000',
            token1Decimals: 8,
            token1Name: 'Wrapped Hbar',
            token1Symbol: 'WHBAR',
            token0Symbol: 't5',
          },
        },
      ]);
    };

    getFarmsData();
  }, []);

  useEffect(() => {
    const getPoolsByAddresses = async () => {
      const addresses = farmsRaw.map(item => item.stakingTokenAddress);
    };

    getPoolsByAddresses();
  }, [farmsRaw]);

  useEffect(() => {
    const farms: IFarmData[] = farmsRaw.map(item => {
      const formatted = {
        ...item,
      };

      return formatted;
    });
    setFarms(farms);
  }, [farmsRaw]);

  return { farms };
};

export default useFarms;
