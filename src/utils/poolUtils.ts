import BigNumber from 'bignumber.js';
import { IPoolData, IPoolExtendedData } from '../interfaces/tokens';
import { formatStringWeiToStringEther } from './numberUtils';
import { getTokenPrice } from './tokenUtils';

export const getProcessedPools = (
  pools: any,
  getExtended: boolean,
  hbarPrice: number | undefined,
) => {
  if (getExtended) {
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
        } = pool;

        const token0Price = getTokenPrice(pools, token0, hbarPrice);
        const token1Price = getTokenPrice(pools, token1, hbarPrice);

        const token0AmountFormatted = formatStringWeiToStringEther(token0Amount, token0Decimals);
        const token1AmountFormatted = formatStringWeiToStringEther(token1Amount, token1Decimals);
        const volume7d = formatStringWeiToStringEther(volume7dWei, token0Decimals);
        const volume24h = formatStringWeiToStringEther(volume24hWei, token0Decimals);

        const token0Value = Number(token0AmountFormatted) * Number(token0Price);
        const token1Value = Number(token1AmountFormatted) * Number(token1Price);

        const totalLpValue = token0Value + token1Value;
        const totalLpValueStr = totalLpValue.toFixed(2);

        const volume7dValue = Number(volume7d) * Number(token0Price);
        const volume24hValue = Number(volume24h) * Number(token0Price);

        const volume7dValueStr = volume7dValue.toFixed(2);
        const volume24hValueStr = volume24hValue.toFixed(2);

        const tokensPriceEvaluated =
          !isNaN(Number(token0Price)) &&
          Number(token0Price) !== 0 &&
          !isNaN(Number(token1Price)) &&
          Number(token1Price) !== 0;

        const poolData: IPoolExtendedData = {
          ...pool,
          token0AmountFormatted,
          token1AmountFormatted,
          tvlBN: new BigNumber(totalLpValueStr),
          tvl: totalLpValueStr,
          volume24: volume24hValueStr,
          volume24Num: volume24hValue,
          volume7: volume7dValueStr,
          volume7Num: volume7dValue,
          tokensPriceEvaluated,
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
