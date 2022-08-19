import BigNumber from 'bignumber.js';
import _ from 'lodash';
import { IfStatement } from 'typescript';
import {
  IFarmData,
  IFarmDataRaw,
  IPoolData,
  IPoolExtendedData,
  IReward,
  IRewardRaw,
  IUserStakingData,
  IUserStakingDataRaw,
} from '../interfaces/tokens';
import { formatStringWeiToStringEther } from './numberUtils';
import { getTokenPrice } from './tokenUtils';

export const getProcessedFarms = (
  rawFarms: IFarmDataRaw[],
  pools: IPoolData[],
  hbarPrice: number,
): IFarmData[] => {
  const getLPValue = (currentFarm: IFarmDataRaw) => {
    const {
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

  const getRewardsProcessed = (currentFarm: IFarmDataRaw) => {
    const { rewardsData } = currentFarm;

    return rewardsData.map((currentReward: IRewardRaw): IReward => {
      const { address, totalAccumulated, totalAmount } = currentReward;
      const rewardValueUSD = getTokenPrice(pools, address, hbarPrice);
      return {
        ...currentReward,
        totalAmountUSD: (Number(totalAmount) * Number(rewardValueUSD)).toString(),
        totalAccumulatedUSD: (Number(totalAccumulated) * Number(rewardValueUSD)).toString(),
      };
    });
  };

  const getUserStakingDataProcessed = (currentFarm: IFarmDataRaw): IUserStakingData => {
    const { userStakingData } = currentFarm;
    let rewardsProcessed = {} as IUserStakingData;
    Object.keys(userStakingData?.rewardsAccumulated || {}).forEach((tokenAddress: string) => {
      const rewardValueUSD = getTokenPrice(pools, tokenAddress, hbarPrice);
      rewardsProcessed = {
        ...rewardsProcessed,
        [tokenAddress]: rewardValueUSD,
      };
    });

    return {
      ...(userStakingData as IUserStakingDataRaw),
      rewardsAccumulatedUSD: rewardsProcessed,
    };
  };

  const farms: IFarmData[] = rawFarms.map((currentFarm: IFarmDataRaw): IFarmData => {
    const { totalStaked, userStakingData } = currentFarm;
    const totalStakedFormatted = formatStringWeiToStringEther(totalStaked || '0');
    const userStakedFormatted = formatStringWeiToStringEther(userStakingData?.stakedAmount || '0');

    const lPValue = getLPValue(currentFarm);

    const userStakingDataProcessed = getUserStakingDataProcessed(currentFarm);

    const formatted = {
      ...currentFarm,
      totalStakedUSD: (lPValue * Number(totalStakedFormatted)).toString(),
      userStakedUSD: (lPValue * Number(userStakedFormatted)).toString(),
      rewardsData: getRewardsProcessed(currentFarm),
      userStakingData: userStakingDataProcessed,
    };

    return formatted;
  });
  return farms;
};
