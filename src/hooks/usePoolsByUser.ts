import { useEffect, useState } from 'react';
import BigNumber from 'bignumber.js';

import { QueryHookOptions, useQuery } from '@apollo/client';
import { GET_POOLS_BY_USER } from '../GraphQL/Queries';

import { REFRESH_TIME } from '../constants';

import { IPoolData, IPoolExtendedData } from '../interfaces/tokens';

import {
  getTokenPrice,
  getHBarPrice,
  idToAddress,
  calculateReserves,
  calculatePercentageByShare,
} from '../utils/tokenUtils';
import { formatStringWeiToStringEther } from '../utils/numberUtils';

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
            fee0,
            fee1,
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

          const fee0Formatted = formatStringWeiToStringEther(fee0 as string);
          const fee1Formatted = formatStringWeiToStringEther(fee1 as string);

          const fee0Value = Number(fee0Formatted) * Number(token0Price);
          const fee1Value = Number(fee1Formatted) * Number(token0Price);
          const totalFeeValue = fee0Value + fee1Value;
          const totalFeeValueString = totalFeeValue.toFixed(2);

          const token0Value = Number(reserve0ShareStr) * Number(token0Price);
          const token1Value = Number(reserve1ShareStr) * Number(token1Price);
          const totalLpValue = token0Value + token1Value;
          const totalLpValueStr = totalLpValue.toFixed(2);

          const userPercentageShare = calculatePercentageByShare(pairSupply, lpShares as string);

          const poolData: IPoolExtendedData = {
            ...pool,
            token0AmountFormatted: reserve0ShareStr,
            token1AmountFormatted: reserve1ShareStr,
            tvl: totalLpValueStr,
            tvlBN: new BigNumber(totalLpValueStr),
            feesNum: totalFeeValue,
            feesStr: totalFeeValueString,
            poolPercenatage: userPercentageShare,
            fee0AmountFormatted: fee0Formatted,
            fee1AmountFormatted: fee1Formatted,
          };

          return poolData;
        });

        const sortedPools = poolsFormatted.sort((a: IPoolExtendedData, b: IPoolExtendedData) => {
          return Number(b.tvlBN.minus(a.tvlBN));
        });

        setPoolsByUser(sortedPools);
      } else {
        setPoolsByUser([]);
      }
    }
  }, [userId, data, hbarPrice, poolsExtended]);

  return { poolsByUser, loading, error, refetch };
};

export default usePoolsByUser;
