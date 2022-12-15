import BigNumber from 'bignumber.js';
import _ from 'lodash';
import { IPoolData, IPoolExtendedData } from '../interfaces/tokens';
import { formatStringWeiToStringEther } from './numberUtils';
import { getTokenPrice, mapHBARTokenSymbol } from './tokenUtils';

export const getProcessedPools = (
  pools: IPoolExtendedData[],
  getExtended: boolean,
  hbarPrice: number | undefined,
  restPools: IPoolExtendedData[] = [],
) => {
  if (getExtended) {
    const mergedPools = _.unionBy(restPools, pools, 'id');

    if (pools.length > 0 && hbarPrice) {
      const formatPoolData = (pool: IPoolData) => {
        const {
          token0Amount,
          token1Amount,
          token0Decimals,
          token1Decimals,
          token0,
          token1,
          volume7d: volume7dWei,
          volume24h: volume24hWei,
          tvl: tvlUsd,
          volume24hUsd,
          volume7dUsd,
        } = pool;

        const token0Price = getTokenPrice(mergedPools, token0, hbarPrice);
        const token1Price = getTokenPrice(mergedPools, token1, hbarPrice);
        const token0AmountFormatted = formatStringWeiToStringEther(token0Amount, token0Decimals);
        const token1AmountFormatted = formatStringWeiToStringEther(token1Amount, token1Decimals);
        const token0Value = Number(token0AmountFormatted) * Number(token0Price);
        const token1Value = Number(token1AmountFormatted) * Number(token1Price);

        let volume7d, volume24h, volume7dValue, volume24hValue;
        if (token0Value !== 0) {
          volume7d = formatStringWeiToStringEther(volume7dWei, token0Decimals);
          volume24h = formatStringWeiToStringEther(volume24hWei, token0Decimals);
          volume7dValue = Number(volume7d) * Number(token0Price);
          volume24hValue = Number(volume24h) * Number(token0Price);
        } else {
          volume7d = formatStringWeiToStringEther(volume7dWei, token1Decimals);
          volume24h = formatStringWeiToStringEther(volume24hWei, token1Decimals);
          volume7dValue = Number(volume7d) * Number(token1Price);
          volume24hValue = Number(volume24h) * Number(token1Price);
        }

        let totalLpValue = 0;
        if (token0Value !== 0 && token1Value !== 0) {
          totalLpValue = token0Value + token1Value;
        } else if (token0Value !== 0) {
          totalLpValue = 2 * token0Value;
        } else if (token1Value !== 0) {
          totalLpValue = 2 * token1Value;
        }

        const totalLpValueStr = totalLpValue.toFixed(2);

        const volume7dValueStr = volume7dValue.toFixed(2);
        const volume24hValueStr = volume24hValue.toFixed(2);

        const tokensPriceEvaluated =
          (!isNaN(Number(token0Price)) && Number(token0Price) !== 0) ||
          (!isNaN(Number(token1Price)) && Number(token1Price) !== 0);

        const poolData: IPoolExtendedData = {
          ...pool,
          token0Symbol: mapHBARTokenSymbol(pool.token0Symbol),
          token1Symbol: mapHBARTokenSymbol(pool.token1Symbol),
          token0AmountFormatted,
          token1AmountFormatted,
          tvlBN: new BigNumber(totalLpValueStr),
          tvl: totalLpValueStr,
          volume24: volume24hValueStr,
          volume24Num: volume24hValue,
          volume7: volume7dValueStr,
          volume7Num: volume7dValue,
          tokensPriceEvaluated,
          tvlUsd,
          volume24hUsd,
          volume7dUsd,
        };

        return poolData;
      };

      const poolsFormatted = pools.map(formatPoolData);
      return poolsFormatted;
    }
  } else {
    if (pools.length > 0) {
      return pools;
    }
  }
};

export const filterPoolsByPattern = (
  inputValue: string,
  pools: IPoolExtendedData[],
  searchThreshold: number = 2,
) => {
  if (inputValue.length <= searchThreshold) return pools;

  return pools.filter((pool: IPoolExtendedData) => {
    const matchedPairAddress = pool.pairAddress.indexOf(inputValue) !== -1;
    const matchedPairName = pool.pairName.indexOf(inputValue) !== -1;
    const matchedPairSymbol = pool.pairName.indexOf(inputValue) !== -1;

    const matchedToken0Address = pool.token0.indexOf(inputValue) !== -1;
    const matchedToken1Address = pool.token1.indexOf(inputValue) !== -1;

    return (
      matchedPairAddress ||
      matchedPairName ||
      matchedPairSymbol ||
      matchedToken0Address ||
      matchedToken1Address
    );
  });
};
