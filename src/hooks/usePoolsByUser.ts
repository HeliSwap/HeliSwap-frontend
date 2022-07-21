import { useEffect, useState } from 'react';
import BigNumber from 'bignumber.js';

import { QueryHookOptions, useQuery } from '@apollo/client';
import { GET_POOLS_BY_USER } from '../GraphQL/Queries';

import { REFRESH_TIME } from '../constants';

import { IPoolData, IPoolExtendedData } from '../interfaces/tokens';

import { getTokenPrice, getHBarPrice, idToAddress, calculateReserves } from '../utils/tokenUtils';

const usePoolsByUser = (
  useQueryOptions: QueryHookOptions = {},
  userId: string,
  poolsExtended: IPoolExtendedData[],
) => {
  const [hbarPrice, setHbarPrice] = useState(0);
  const [poolsByUser, setPoolsByUser] = useState<IPoolExtendedData[]>([]);

  const address = userId ? idToAddress(userId) : '';

  const { loading, data, error, startPolling, stopPolling, refetch } = useQuery(GET_POOLS_BY_USER, {
    variables: { address },
    ...useQueryOptions,
    skip: !userId,
  });

  useEffect(() => {
    const getHBARPrice = async () => {
      const hbarPrice = await getHBarPrice();
      setHbarPrice(hbarPrice);
    };

    getHBARPrice();
  }, []);

  useEffect(() => {
    startPolling(useQueryOptions.pollInterval || REFRESH_TIME);
    return () => {
      stopPolling();
    };
  }, [startPolling, stopPolling, useQueryOptions]);

  useEffect(() => {
    if (data) {
      const { getPoolsByUser } = data;

      if (getPoolsByUser.length > 0) {
        const poolsFormatted = getPoolsByUser.map((pool: IPoolData) => {
          const {
            token0Amount,
            token1Amount,
            token0Decimals,
            token1Decimals,
            token0,
            token1,
            lpShares,
            pairSupply,
          } = pool;

          const { reserve0ShareStr, reserve1ShareStr } = calculateReserves(
            lpShares as string,
            pairSupply,
            token0Amount,
            token1Amount,
            token0Decimals,
            token1Decimals,
          );

          const token0Price = getTokenPrice(poolsExtended, token0, hbarPrice);
          const token1Price = getTokenPrice(poolsExtended, token1, hbarPrice);

          const token0Value = Number(reserve0ShareStr) * Number(token0Price);
          const token1Value = Number(reserve1ShareStr) * Number(token1Price);
          const totalLpValue = token0Value + token1Value;
          const totalLpValueStr = totalLpValue.toFixed(2);

          const poolData: IPoolExtendedData = {
            ...pool,
            token0AmountFormatted: reserve0ShareStr,
            token1AmountFormatted: reserve1ShareStr,
            tvl: totalLpValueStr,
            tvlBN: new BigNumber(totalLpValueStr),
          };

          return poolData;
        });

        const sortedPools = poolsFormatted.sort((a: IPoolExtendedData, b: IPoolExtendedData) => {
          return Number(b.tvlBN.minus(a.tvlBN));
        });

        setPoolsByUser(sortedPools);
      }
    }
  }, [data, hbarPrice, poolsExtended]);

  return { poolsByUser, loading, error, refetch };
};

export default usePoolsByUser;
