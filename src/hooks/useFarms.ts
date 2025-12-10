import { useEffect, useState } from 'react';
import { QueryHookOptions } from '@apollo/client';
import { IFarmData, IPoolData } from '../interfaces/tokens';
import { loadAllFarms } from '../utils/farmDataLoader';

/**
 * Hook to load farms from static farms.json file
 * Replaces the previous GraphQL-based implementation
 * @param useQueryOptions - Kept for backward compatibility but not used
 * @param userId - User ID (kept for backward compatibility but not used since farms.json has default user data)
 * @param pools - Pools data (kept for backward compatibility but not used since farms.json already has processed data)
 * @returns Object containing farms array, loading state, error state, and processing state
 */
const useFarms = (useQueryOptions: QueryHookOptions = {}, userId: string, pools: IPoolData[]) => {
  const [processingFarms, setProcessingFarms] = useState<boolean>(true);
  const [farms, setFarms] = useState<IFarmData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<any>(null);

  useEffect(() => {
    try {
      // Load all farms from static JSON file
      // farms.json already contains processed data (totalStakedUSD, APR, totalRewardsUSD, etc.)
      // and excluded farms are filtered out in loadAllFarms
      const allFarms = loadAllFarms();
      setFarms(allFarms);
      setLoading(false);
      setProcessingFarms(false);
    } catch (err) {
      console.error('Error loading farms data:', err);
      setError(err);
      setLoading(false);
      setProcessingFarms(false);
    }
  }, []); // Empty dependency array since data is static

  return { farms, loading, error, processingFarms };
};

export default useFarms;
