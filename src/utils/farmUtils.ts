import BigNumber from 'bignumber.js';
import _ from 'lodash';
import { IFarmData, IFarmDataRaw, IPoolData, IPoolExtendedData } from '../interfaces/tokens';
import { formatStringWeiToStringEther } from './numberUtils';
import { getTokenPrice } from './tokenUtils';

export const getProcessedFarms = (
  rawFarms: IFarmDataRaw[],
  pools: IPoolData[],
  hbarPrice: number,
): IFarmData[] => {
  const getLPValue = (currentFarm: IFarmDataRaw) => {
    const {
      totalStaked,
      poolData: {
        token0Amount,
        token1Amount,
        pairSupply,
        token0,
        token1,
        token0Decimals,
        token1Decimals,
      },
    } = currentFarm;
    const token0Price = getTokenPrice(pools, token0, hbarPrice);
    const token1Price = getTokenPrice(pools, token1, hbarPrice);

    const token0AmountFormatted = formatStringWeiToStringEther(token0Amount, token0Decimals);
    const token1AmountFormatted = formatStringWeiToStringEther(token1Amount, token1Decimals);
    const pairSypplyFormatted = formatStringWeiToStringEther(pairSupply);

    const token0Value = Number(token0AmountFormatted) * Number(token0Price);
    const token1Value = Number(token1AmountFormatted) * Number(token1Price);

    let totalLpValue = 0;
    if (token0Value !== 0 && token1Value !== 0) {
      totalLpValue = token0Value + token1Value;
    } else if (token0Value !== 0) {
      totalLpValue = 2 * token0Value;
    } else if (token1Value !== 0) {
      totalLpValue = 2 * token1Value;
    }
    const lPValue = totalLpValue / Number(pairSypplyFormatted);
    return lPValue;
  };

  const farms: IFarmData[] = rawFarms.map((currentFarm: IFarmDataRaw) => {
    const { totalStaked, userStakingData } = currentFarm;
    const totalStakedFormatted = formatStringWeiToStringEther(totalStaked || '0');
    const userStakedFormatted = formatStringWeiToStringEther(userStakingData?.stakedAmount || '0');

    const lPValue = getLPValue(currentFarm);

    const formatted = {
      ...currentFarm,
      totalStakedUSDT: (lPValue * Number(totalStakedFormatted)).toString(),
      userStakedUSDT: (lPValue * Number(userStakedFormatted)).toString(),
    };

    return formatted;
  });
  return farms;
};
