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
          const token0PriceNum = Number(token0Price);
          const token1PriceNum = Number(token1Price);

          const fee0Formatted = formatStringWeiToStringEther(fee0 as string, token0Decimals);
          const fee1Formatted = formatStringWeiToStringEther(fee1 as string, token1Decimals);

          let totalFeeValue = 0;
          let totalLpValue = 0;

          let fee0Value, fee1Value, token0Value, token1Value;

          if (token0PriceNum !== 0 && token1PriceNum !== 0) {
            fee0Value = Number(fee0Formatted) * token0PriceNum;
            fee1Value = Number(fee1Formatted) * token1PriceNum;
            totalFeeValue = fee0Value + fee1Value;

            token0Value = Number(reserve0ShareStr) * token0PriceNum;
            token1Value = Number(reserve1ShareStr) * token1PriceNum;
            totalLpValue = token0Value + token1Value;
          } else if (token0PriceNum !== 0) {
            fee0Value = Number(fee0Formatted) * token0PriceNum;
            totalFeeValue = 2 * fee0Value;

            token0Value = Number(reserve0ShareStr) * token0PriceNum;
            totalLpValue = 2 * token0Value;
          } else if (token1PriceNum !== 0) {
            fee1Value = Number(fee1Formatted) * token1PriceNum;
            totalFeeValue = 2 * fee1Value;

            token1Value = Number(reserve1ShareStr) * token1PriceNum;
            totalLpValue = 2 * token1Value;
          }

          const totalFeeValueString = totalFeeValue.toString();
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
