import { useContext, useEffect, useState } from 'react';
import { GlobalContext } from '../providers/Global';

import { QueryHookOptions, useQuery } from '@apollo/client';
import { GET_FARMS } from '../GraphQL/Queries';

import { IFarmData, IPoolData } from '../interfaces/tokens';

import { getProcessedFarms } from '../utils/farmUtils';
import { idToAddress } from '../utils/tokenUtils';

import { REFRESH_TIME } from '../constants';

const useFarms = (useQueryOptions: QueryHookOptions = {}, userId: string, pools: IPoolData[]) => {
  const contextValue = useContext(GlobalContext);
  const { hbarPrice } = contextValue;

  const [processingFarms, setProcessingFarms] = useState<boolean>(true);
  const [farms, setFarms] = useState<IFarmData[]>([]);

  const userAddress = userId ? idToAddress(userId) : '';

  const { loading, data, error, startPolling, stopPolling } = useQuery(GET_FARMS, {
    variables: { userAddress },
    ...useQueryOptions,
  });

  useEffect(() => {
    const getFarmsData = () => {
      const { getFarmsOverview } = data;

      if (getFarmsOverview && getFarmsOverview.length > 0 && pools.length && hbarPrice !== 0) {
        try {
          const processedFarms = getProcessedFarms(getFarmsOverview, pools, hbarPrice);
          setFarms(processedFarms);
        } catch (e) {
          console.error('Error while processing campaigns data');
        } finally {
          setProcessingFarms(false);
        }
      }
    };

    data && getFarmsData();
  }, [data, pools, hbarPrice]);
  useEffect(() => {
    if (
      !loading &&
      (error || (data && (!data.getFarmsOverview || data?.getFarmsOverview?.length === 0)))
    ) {
      setProcessingFarms(false);
    }
  }, [loading, data, error]);

  useEffect(() => {
    startPolling(useQueryOptions.pollInterval || REFRESH_TIME);
    return () => {
      stopPolling();
    };
  }, [startPolling, stopPolling, useQueryOptions]);

  return { farms, loading, error, processingFarms };
};

export default useFarms;
