import { useEffect, useState, useRef } from 'react';
import { QueryHookOptions } from '@apollo/client';
import { IPoolExtendedData } from '../interfaces/tokens';
import { filterPoolsByTokens } from '../utils/poolDataLoader';

/**
 * Hook to load pools filtered by a list of token addresses from static pools.json file
 * Replaces the previous GraphQL-based implementation
 * @param useQueryOptions - Kept for backward compatibility but not used
 * @param getExtended - If true, returns extended pool data (pools.json already has extended data)
 * @param tokensList - Array of token addresses to filter pools by
 * @returns Object containing filtered pools, loading state, error state, refetch function, and processing state
 */
const usePoolsByTokensList = (
  useQueryOptions: QueryHookOptions = {},
  getExtended = false,
  tokensList: string[] = [],
) => {
  const [pools, setPools] = useState<IPoolExtendedData[]>([]);
  const [processingPools, setProcessingPools] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<any>(null);

  // Use ref to store previous tokensList string to prevent unnecessary re-renders
  const prevTokensListRef = useRef<string>('');

  useEffect(() => {
    // Convert tokensList to string for comparison to avoid array reference issues
    const tokensListStr = JSON.stringify(tokensList.sort());

    // Skip if tokensList hasn't actually changed
    if (tokensListStr === prevTokensListRef.current) {
      return;
    }

    prevTokensListRef.current = tokensListStr;

    // Skip if tokensList is empty (matching previous behavior)
    if (tokensList.length === 0) {
      setPools([]);
      setLoading(false);
      setProcessingPools(false);
      return;
    }

    try {
      // Filter pools by token addresses
      const filteredPools = filterPoolsByTokens(tokensList);

      // pools.json already contains extended data, so we can return it directly
      setPools(filteredPools);
      setLoading(false);
      setProcessingPools(false);
    } catch (err) {
      console.error('Error while loading pools data:', err);
      setError(err);
      setLoading(false);
      setProcessingPools(false);
    }
  }, [tokensList, getExtended]);

  // refetch function kept for backward compatibility but does nothing
  const refetch = () => {
    // No-op since data is static
  };

  return {
    poolsByTokenList: pools,
    loadingPoolsByTokenList: loading,
    errorPoolsByTokenList: error,
    refetchPoolsByTokenList: refetch,
    processingPools,
  };
};

export default usePoolsByTokensList;
