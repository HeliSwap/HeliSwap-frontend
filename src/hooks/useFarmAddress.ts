import { useEffect, useState } from 'react';

import { QueryHookOptions, useQuery } from '@apollo/client';
import { GET_FARMS } from '../GraphQL/Queries';

import { REFRESH_TIME } from '../constants';
import { IFarmDataRaw } from '../interfaces/tokens';

const useFarmAddress = (useQueryOptions: QueryHookOptions = {}, poolAddress: string) => {
  const [processingFarmAddress, setProcessingFarmAddress] = useState<boolean>(true);
  const [farmAddress, setFarmAddress] = useState<string>('');

  const { loading, data, error, startPolling, stopPolling } = useQuery(GET_FARMS, {
    variables: { userAddress: '' },
    ...useQueryOptions,
  });

  useEffect(() => {
    const getFarmsData = () => {
      const { getFarmsOverview } = data;

      if (getFarmsOverview && getFarmsOverview.length > 0) {
        try {
          const farm = getFarmsOverview.find(
            (farm: IFarmDataRaw) => farm.poolData.pairAddress === poolAddress,
          );
          if (farm && Object.keys(farm).length !== 0) setFarmAddress(farm.address);
        } catch (e) {
          console.error('Error while processing campaigns data');
        } finally {
          setProcessingFarmAddress(false);
        }
      }
    };

    data && getFarmsData();
  }, [data, poolAddress]);
  useEffect(() => {
    if (
      !loading &&
      (error || (data && (!data.getFarmsOverview || data?.getFarmsOverview?.length === 0)))
    ) {
      setProcessingFarmAddress(false);
    }
  }, [loading, data, error]);

  useEffect(() => {
    startPolling(useQueryOptions.pollInterval || REFRESH_TIME);
    return () => {
      stopPolling();
    };
  }, [startPolling, stopPolling, useQueryOptions]);

  return { farmAddress, loading, error, processingFarmAddress };
};

export default useFarmAddress;
