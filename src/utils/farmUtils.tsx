import { restrictedFarms } from '../constants';
import {
  IFarmData,
  IFarmDataRaw,
  IPoolData,
  IReward,
  IRewardRaw,
  ISSSData,
  ISSSDataRaw,
  IUserStakingData,
} from '../interfaces/tokens';
import { formatStringWeiToStringEther } from './numberUtils';
import { timestampToDate } from './timeUtils';
import { getTokenPrice, mapHBARTokenSymbol } from './tokenUtils';

export const getProcessedFarms = (
  rawFarms: IFarmDataRaw[],
  pools: IPoolData[],
  hbarPrice: number,
): IFarmData[] => {
  const formatEndDate = (dateInSeconds: number) => {
    const dateSplitted = dateInSeconds.toString().split('.');
    const dateInMilliseconds =
      dateSplitted.length > 1
        ? Number(dateInSeconds.toString().split('.')[0]) * 1000
        : dateInSeconds * 1000;

    return dateInMilliseconds;
  };

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
    const pairSupplyFormatted = formatStringWeiToStringEther(pairSupply);

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

    const lPValue = totalLpValue / Number(pairSupplyFormatted);

    return lPValue;
  };

  const getRewardsProcessed = (currentFarm: IFarmDataRaw) => {
    const { rewardsData } = currentFarm;

    return rewardsData.map((currentReward: IRewardRaw): IReward => {
      const {
        address,
        totalAccumulated,
        totalAmount,
        decimals,
        rewardEnd: rewardEndSeconds,
      } = currentReward;

      const rewardValueUSD = getTokenPrice(pools, address, hbarPrice);
      const rewardAmount = formatStringWeiToStringEther(totalAmount, decimals);
      const rewardEnd = formatEndDate(rewardEndSeconds);

      return {
        ...currentReward,
        rewardEnd,
        totalAmountUSD: (Number(rewardAmount) * Number(rewardValueUSD)).toString(),
        totalAccumulatedUSD: (Number(totalAccumulated) * Number(rewardValueUSD)).toString(),
      };
    });
  };

  const getUserStakingDataProcessed = (
    currentFarm: IFarmDataRaw,
    lPValue: number,
  ): IUserStakingData => {
    const { userStakingData, rewardsData } = currentFarm;

    if (userStakingData.stakedAmount === '0') {
      return {
        stakedAmount: '0',
        stakedAmountUSD: '0',
        rewardsAccumulated: [],
      };
    } else {
      const userStakedFormatted = formatStringWeiToStringEther(userStakingData.stakedAmount || '0');

      const rewardsProcessed =
        userStakingData?.rewardsAccumulated && userStakingData?.rewardsAccumulated!.length > 0
          ? userStakingData?.rewardsAccumulated!.map(reward => {
              const rewardValueUSD = getTokenPrice(pools, reward.address, hbarPrice);
              const rewardAmountWei = reward.totalAccumulated;
              const rewardDecimals = rewardsData.find(
                rewardDataItem => rewardDataItem.address === reward.address,
              )?.decimals;
              const rewardAmount = formatStringWeiToStringEther(rewardAmountWei, rewardDecimals);
              const rewardAmountUSD = (Number(rewardValueUSD) * Number(rewardAmount)).toFixed(2);

              return {
                address: reward.address,
                totalAccumulated: reward.totalAccumulated,
                totalAccumulatedUSD: rewardAmountUSD,
              };
            })
          : [];

      return {
        stakedAmount: userStakingData!.stakedAmount || '0',
        stakedAmountUSD: (lPValue * Number(userStakedFormatted)).toString(),
        rewardsAccumulated: rewardsProcessed,
      };
    }
  };

  const getTotalRewardsUSD = (rewardsData: IReward[]) => {
    return rewardsData.reduce((acc: string, currentValue: IReward) => {
      const { totalAmountUSD, rewardEnd } = currentValue;
      // Check for active reward
      const isActive = rewardEnd > Date.now();

      const accNumber = isActive ? Number(acc) + Number(totalAmountUSD) : Number(acc);

      return accNumber.toString();
    }, '0');
  };

  const getAPR = (rewardsData: IReward[], totalStakedUSD: string, totalRewardsUSD: string) => {
    let maxDuration = 0;

    if (Number(totalStakedUSD) === 0) return '0';

    rewardsData.forEach((reward: IReward) => {
      const { duration, rewardEnd } = reward;
      // Check for active reward
      const isActive = rewardEnd > Date.now();

      if (duration > maxDuration && isActive) {
        maxDuration = duration;
      }
    });

    const durationDays = maxDuration / (60 * 60 * 24);

    const rewardsPerDayUSD = Number(totalRewardsUSD) / durationDays;
    const interest = rewardsPerDayUSD / Number(totalStakedUSD);
    const APR = interest * 365;

    return (APR * 100).toString();
  };

  const getCampaignEndDate = (currentFarm: IFarmDataRaw): number => {
    const { rewardsData } = currentFarm;
    let endTimestamp = 0;

    rewardsData.forEach((currentReward: IRewardRaw) => {
      const { rewardEnd: rewardEndSeconds } = currentReward;
      const rewardEnd = formatEndDate(rewardEndSeconds);
      if (rewardEnd > endTimestamp) {
        endTimestamp = rewardEnd;
      }
    });

    return endTimestamp;
  };

  const hasFarmDeprecatedRewards = (rewardsData: IReward[]): boolean => {
    const found = rewardsData.find(
      reward => reward.address === process.env.REACT_APP_WHBAR_ADDRESS_OLD,
    );
    return found ? true : false;
  };

  const farms: IFarmData[] = rawFarms.map((currentFarm: IFarmDataRaw): IFarmData => {
    // This is needed, cause of discrepancies in the BE data regarding duration & rewardEnd, comming as strings in stead of numbers
    const rewardsDataProcessed = currentFarm.rewardsData.map((rewardsData: IRewardRaw) => ({
      ...rewardsData,
      duration: Number(rewardsData.duration),
      rewardEnd: Number(rewardsData.rewardEnd),
    }));
    const currentFarmProcessed = { ...currentFarm, rewardsData: rewardsDataProcessed };

    const { totalStaked } = currentFarmProcessed;
    const totalStakedFormatted = formatStringWeiToStringEther(totalStaked || '0');
    const lPValue = getLPValue(currentFarmProcessed);
    const totalStakedUSD = (lPValue * Number(totalStakedFormatted)).toString();
    const rewardsData = getRewardsProcessed(currentFarmProcessed);
    const totalRewardsUSD = getTotalRewardsUSD(rewardsData);
    const userStakingData = getUserStakingDataProcessed(currentFarmProcessed, lPValue);
    const campaignEndDate = getCampaignEndDate(currentFarmProcessed);
    const campaignEnded = getCampaignEndDate(currentFarmProcessed) < Date.now();
    const APR =
      campaignEnded || restrictedFarms.includes(currentFarm.address)
        ? '0'
        : getAPR(rewardsData, totalStakedUSD, totalRewardsUSD);
    const isFarmDeprecated = hasFarmDeprecatedRewards(rewardsData);

    const formatted = {
      ...currentFarmProcessed,
      totalStakedUSD,
      rewardsData,
      userStakingData,
      APR,
      totalRewardsUSD,
      campaignEndDate,
      poolData: {
        ...currentFarmProcessed.poolData,
        token0Symbol: mapHBARTokenSymbol(currentFarmProcessed.poolData.token0Symbol),
        token1Symbol: mapHBARTokenSymbol(currentFarmProcessed.poolData.token1Symbol),
      },
      isFarmDeprecated,
    };

    return formatted;
  });

  return farms;
};

export const getProcessedSSS = (
  rawSSS: ISSSDataRaw,
  heliPrice: number,
  hbarPrice: number,
): ISSSData => {
  const formatEndDate = (dateInSeconds: number) => {
    const dateSplitted = dateInSeconds.toString().split('.');
    const dateInMilliseconds =
      dateSplitted.length > 1
        ? Number(dateInSeconds.toString().split('.')[0]) * 1000
        : dateInSeconds * 1000;

    return dateInMilliseconds;
  };

  const getRewardsProcessed = (currentFarm: ISSSDataRaw, heliPrice: number) => {
    const { rewardsData } = currentFarm;

    return rewardsData.map((currentReward: IRewardRaw): IReward => {
      const {
        totalAccumulated,
        totalAmount,
        decimals,
        rewardEnd: rewardEndSeconds,
      } = currentReward;

      const rewardAmount = formatStringWeiToStringEther(totalAmount, decimals);
      const rewardEnd = formatEndDate(rewardEndSeconds);

      return {
        ...currentReward,
        rewardEnd,
        totalAmountUSD: (Number(rewardAmount) * heliPrice).toString(),
        totalAccumulatedUSD: (Number(totalAccumulated) * heliPrice).toString(),
      };
    });
  };

  const getUserStakingDataProcessed = (
    currentFarm: ISSSDataRaw,
    heliPrice: number,
  ): IUserStakingData => {
    const { userStakingData, rewardsData } = currentFarm;

    if (userStakingData.stakedAmount === '0') {
      return {
        stakedAmount: '0',
        stakedAmountUSD: '0',
        rewardsAccumulated: [],
      };
    } else {
      const userStakedFormatted = formatStringWeiToStringEther(
        userStakingData.stakedAmount || '0',
        8,
      );

      const rewardsProcessed =
        userStakingData?.rewardsAccumulated && userStakingData?.rewardsAccumulated!.length > 0
          ? userStakingData?.rewardsAccumulated!.map(reward => {
              const rewardAmountWei = reward.totalAccumulated;
              const rewardDecimals = rewardsData.find(
                rewardDataItem => rewardDataItem.address === reward.address,
              )?.decimals;
              const rewardAmount = formatStringWeiToStringEther(rewardAmountWei, rewardDecimals);
              const rewardAmountUSD = (heliPrice * Number(rewardAmount)).toFixed(2);

              return {
                address: reward.address,
                totalAccumulated: reward.totalAccumulated,
                totalAccumulatedUSD: rewardAmountUSD,
              };
            })
          : [];

      return {
        stakedAmount: userStakingData!.stakedAmount || '0',
        stakedAmountUSD: (heliPrice * Number(userStakedFormatted)).toString(),
        rewardsAccumulated: rewardsProcessed,
      };
    }
  };

  const getTotalRewardsUSD = (rewardsData: IReward[]) => {
    return rewardsData.reduce((acc: string, currentValue: IReward) => {
      const { totalAmountUSD, rewardEnd } = currentValue;
      // Check for active reward
      const isActive = rewardEnd > Date.now();

      const accNumber = isActive ? Number(acc) + Number(totalAmountUSD) : Number(acc);

      return accNumber.toString();
    }, '0');
  };

  const getAPR = (rewardsData: IReward[], totalStakedUSD: string, totalRewardsUSD: string) => {
    let maxDuration = 0;

    if (Number(totalStakedUSD) === 0) return '0';

    rewardsData.forEach((reward: IReward) => {
      const { duration, rewardEnd } = reward;
      // Check for active reward
      const isActive = rewardEnd > Date.now();

      if (duration > maxDuration && isActive) {
        maxDuration = duration;
      }
    });

    const durationDays = maxDuration / (60 * 60 * 24);

    const rewardsPerDayUSD = Number(totalRewardsUSD) / durationDays;
    const interest = rewardsPerDayUSD / Number(totalStakedUSD);
    const APR = interest * 365;

    return (APR * 100).toString();
  };

  const getCampaignEndDate = (currentFarm: ISSSDataRaw): number => {
    const { rewardsData } = currentFarm;
    let endTimestamp = 0;

    rewardsData.forEach((currentReward: IRewardRaw) => {
      const { rewardEnd: rewardEndSeconds } = currentReward;
      const rewardEnd = formatEndDate(rewardEndSeconds);
      if (rewardEnd > endTimestamp) {
        endTimestamp = rewardEnd;
      }
    });

    return endTimestamp;
  };

  // This is needed, cause of discrepancies in the BE data regarding duration & rewardEnd, comming as strings in stead of numbers
  const rewardsDataProcessed = rawSSS.rewardsData.map((rewardsData: IRewardRaw) => ({
    ...rewardsData,
    duration: Number(rewardsData.duration),
    rewardEnd: Number(rewardsData.rewardEnd),
  }));
  const currentFarmProcessed = { ...rawSSS, rewardsData: rewardsDataProcessed };

  const { totalStaked } = currentFarmProcessed;
  const totalStakedFormatted = formatStringWeiToStringEther(totalStaked || '0', 8);
  const totalStakedUSD = (heliPrice * Number(totalStakedFormatted)).toString();
  const rewardsData = getRewardsProcessed(currentFarmProcessed, heliPrice);
  const totalRewardsUSD = getTotalRewardsUSD(rewardsData);
  const userStakingData = getUserStakingDataProcessed(currentFarmProcessed, heliPrice);
  const campaignEndDate = getCampaignEndDate(currentFarmProcessed);
  const campaignEnded = getCampaignEndDate(currentFarmProcessed) < Date.now();
  const APR = campaignEnded ? '0' : getAPR(rewardsData, totalStakedUSD, totalRewardsUSD);

  const processedSSS = {
    ...currentFarmProcessed,
    totalStakedUSD,
    rewardsData,
    userStakingData,
    APR,
    totalRewardsUSD,
    campaignEndDate,
  };

  return processedSSS;
};

export const renderCampaignEndDate = (campaignEndDate: number) => {
  const campaignEnded = campaignEndDate < Date.now();
  const campaignNotStarted = campaignEndDate === 0;

  const statusLabel = campaignNotStarted ? 'Not started' : campaignEnded ? 'Ended' : 'Active';

  const dateContent = (
    <>
      <span
        className={`icon-campaign-status ${
          !campaignNotStarted ? (!campaignEnded ? 'is-active' : '') : 'not-started'
        }`}
      ></span>
      <span className="text-micro ms-3">{statusLabel}</span>
    </>
  );

  return <div className="d-flex align-items-center">{dateContent}</div>;
};

export const renderSSSEndDate = (campaignEndDate: number) => {
  const campaignEnded = campaignEndDate < Date.now();
  const campaignNotStarted = campaignEndDate === 0;

  const statusLabel = campaignNotStarted ? (
    'Campaign not started'
  ) : campaignEnded ? (
    'Campaign Ended'
  ) : (
    <>
      Until <span className="text-bold">{timestampToDate(campaignEndDate)}</span>
    </>
  );

  const dateContent = (
    <>
      <span
        className={`icon-campaign-status ${
          !campaignNotStarted ? (!campaignEnded ? 'is-active' : '') : 'not-started'
        }`}
      ></span>
      <span className="text-micro ms-3">{statusLabel}</span>
    </>
  );

  return <div className="d-flex align-items-center">{dateContent}</div>;
};
