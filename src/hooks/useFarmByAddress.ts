import { useEffect, useState } from 'react';
import { QueryHookOptions } from '@apollo/client';
import { IFarmData, IPoolData } from '../interfaces/tokens';
import { getFarmByAddress } from '../utils/farmDataLoader';

/**
 * Hook to load a single farm by address from static farms.json file
 * Replaces the previous GraphQL-based implementation
 * @param useQueryOptions - Kept for backward compatibility but not used
 * @param userId - User ID (kept for backward compatibility but not used since farms.json has default user data)
 * @param pools - Pools data (kept for backward compatibility but not used since farms.json already has processed data)
 * @param farmAddress - The address of the farm to retrieve
 * @returns Object containing farm data, loading state, error state, and processing state
 */
const useFarmByAddress = (
  useQueryOptions: QueryHookOptions = {},
  userId: string,
  pools: IPoolData[],
  farmAddress: string,
) => {
  const [processingFarms, setProcessingFarms] = useState<boolean>(true);
  const [farm, setFarm] = useState<IFarmData>({} as IFarmData);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<any>(null);

  useEffect(() => {
    // Skip if no farmAddress provided
    if (!farmAddress) {
      setProcessingFarms(false);
      setLoading(false);
      return;
    }

    try {
      // Get farm by address from static JSON file
      // farms.json already contains processed data
      const farmData = getFarmByAddress(farmAddress);

      if (farmData) {
        setFarm(farmData);
      } else {
        setError(new Error(`Farm with address ${farmAddress} not found`));
      }

      setLoading(false);
      setProcessingFarms(false);
    } catch (err) {
      console.error('Error loading farm data:', err);
      setError(err);
      setLoading(false);
      setProcessingFarms(false);
    }
  }, [farmAddress]); // Only depend on farmAddress

  return { farm, loading, error, processingFarms };
};

export default useFarmByAddress;
