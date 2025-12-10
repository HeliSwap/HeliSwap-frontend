import { useState, useEffect } from 'react';
import { IPoolExtendedData } from '../interfaces/tokens';
import { loadAllPools } from '../utils/poolDataLoader';

/**
 * Hook to load pools from static pools.json file
 * Replaces the previous GraphQL-based implementation
 * @param useQueryOptions - Kept for backward compatibility but not used
 * @param getExtended - If true, returns extended pool data (pools.json already has extended data)
 * @returns Object containing pools array, loading state, error state, and refetch function
 */
const usePools = (useQueryOptions: any = {}, getExtended = false) => {
  const [pools, setPools] = useState<IPoolExtendedData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<any>(null);

  useEffect(() => {
    try {
      // Load all pools from static JSON file
      const allPools = loadAllPools();

      // pools.json already contains extended data, so we can return it directly
      // If getExtended is false, we still return the same data since it's already processed
      setPools(allPools);
      setLoading(false);
    } catch (err) {
      console.error('Error loading pools data:', err);
      setError(err);
      setLoading(false);
    }
  }, [getExtended]);

  // refetch function kept for backward compatibility but does nothing
  const refetch = () => {
    // No-op since data is static
  };

  return { pools, loading, error, refetch };
};

export default usePools;
