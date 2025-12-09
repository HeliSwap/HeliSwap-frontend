import { IFarmData, IReward } from '../interfaces/tokens';
import farmsData from '../data/farms.json';
import { farmsToExclude } from '../constants';

/**
 * Transforms rewardsData to ensure all required fields are present
 * The JSON data might be missing totalAccumulated field which is required by IReward
 */
const transformRewardsData = (rewardsData: any[]): IReward[] => {
  return rewardsData.map((reward: any) => ({
    ...reward,
    // Ensure totalAccumulated exists (default to "0" if missing)
    totalAccumulated: reward.totalAccumulated || '0',
    // Ensure totalAmountUSD exists (default to "0" if missing)
    totalAmountUSD: reward.totalAmountUSD || '0',
    // Ensure totalAccumulatedUSD exists (default to "0" if missing or NaN)
    totalAccumulatedUSD:
      reward.totalAccumulatedUSD === 'NaN' || !reward.totalAccumulatedUSD
        ? '0'
        : reward.totalAccumulatedUSD,
  }));
};

/**
 * Transforms a farm object to ensure it matches IFarmData interface
 */
const transformFarm = (farm: any): IFarmData => {
  return {
    ...farm,
    rewardsData: transformRewardsData(farm.rewardsData || []),
  };
};

/**
 * Loads all farms from the static farms.json file
 * Filters out excluded farms and transforms data to match IFarmData interface
 * @returns Array of all farms (excluding farms in farmsToExclude)
 */
export const loadAllFarms = (): IFarmData[] => {
  // Transform and filter farms
  return (farmsData as any[])
    .map(transformFarm)
    .filter(farm => !farmsToExclude.includes(farm.address));
};

/**
 * Gets a single farm by its address
 * @param farmAddress - The address of the farm to retrieve
 * @returns The farm data if found, undefined otherwise
 */
export const getFarmByAddress = (farmAddress: string): IFarmData | undefined => {
  const allFarms = loadAllFarms();
  return allFarms.find(farm => farm.address.toLowerCase() === farmAddress.toLowerCase());
};
