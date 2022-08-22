import {
  IFarmData,
  IFarmDataRaw,
  IPoolData,
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

  const getUserStakingDataProcessed = (
    currentFarm: IFarmDataRaw,
    lPValue: number,
  ): IUserStakingData => {
    const { userStakingData } = currentFarm;

    const userStakedFormatted = formatStringWeiToStringEther(userStakingData?.stakedAmount || '0');

    let rewardsProcessed = {} as IUserStakingData;
    Object.keys(userStakingData?.rewardsAccumulated || {}).forEach((tokenAddress: string) => {
      const rewardValueUSD = getTokenPrice(pools, tokenAddress, hbarPrice);
      const rewardAmount = userStakingData?.rewardsAccumulated[tokenAddress];
      rewardsProcessed = {
        ...rewardsProcessed,
        [tokenAddress]: (Number(rewardValueUSD) * Number(rewardAmount)).toString(),
      };
    });

    return {
      ...(userStakingData as IUserStakingDataRaw),
      rewardsAccumulatedUSD: rewardsProcessed,
      userStakedUSD: (lPValue * Number(userStakedFormatted)).toString(),
    };
  };

  const getTotalRewardsUSD = (rewardsData: IReward[]) => {
    return rewardsData.reduce((acc: string, currentValue: IReward) => {
      const { totalAccumulatedUSD } = currentValue;
      return (Number(acc) + Number(totalAccumulatedUSD)).toString();
    }, '0');
  };

  const getAPR = (rewardsData: IReward[], totalStakedUSD: string, totalRewardsUSD: string) => {
    let maxDuration = 0;

    rewardsData.forEach((reward: IReward) => {
      const { duration } = reward;
      if (duration > maxDuration) {
        maxDuration = duration;
      }
    });
    const durationDays = maxDuration / (60 * 60 * 24 * 1000);

    const rewardsPerDayUSD = Number(totalRewardsUSD) / durationDays;
    const interest = rewardsPerDayUSD / Number(totalStakedUSD);
    const APR = interest * 365;
    return (APR * 100).toString();
  };

  const farms: IFarmData[] = rawFarms.map((currentFarm: IFarmDataRaw): IFarmData => {
    const { totalStaked } = currentFarm;
    const totalStakedFormatted = formatStringWeiToStringEther(totalStaked || '0');
    const lPValue = getLPValue(currentFarm);

    const totalStakedUSD = (lPValue * Number(totalStakedFormatted)).toString();

    const rewardsData = getRewardsProcessed(currentFarm);
    const totalRewardsUSD = getTotalRewardsUSD(rewardsData);

    const userStakingDataProcessed = getUserStakingDataProcessed(currentFarm, lPValue);

    const APR = getAPR(rewardsData, totalStakedUSD, totalRewardsUSD);

    const formatted = {
      ...currentFarm,
      totalStakedUSD,
      rewardsData,
      userStakingData: userStakingDataProcessed,
      APR,
      totalRewardsUSD,
    };

    return formatted;
  });
  return farms;
};
