import { useContext, useEffect, useState } from 'react';
import { GlobalContext } from '../providers/Global';

import { QueryHookOptions, useQuery } from '@apollo/client';
import { GET_PERMISSIONLESS_FARM_REWARDS } from '../GraphQL/Queries';

import { IFarmData, IPoolData } from '../interfaces/tokens';

import { getProcessedFarms } from '../utils/farmUtils';

import { REFRESH_TIME } from '../constants';

const usePermissionlessFarmRewardsByAddress = (
  useQueryOptions: QueryHookOptions = {},
  pools: IPoolData[],
  farmAddress: string,
) => {
  const contextValue = useContext(GlobalContext);
  const { hbarPrice } = contextValue;

  const [processingFarms, setProcessingFarms] = useState<boolean>(true);
  const [farm, setFarm] = useState<IFarmData>({} as IFarmData);

  const { loading, data, error, startPolling, stopPolling } = useQuery(
    GET_PERMISSIONLESS_FARM_REWARDS,
    {
      variables: { farmAddress },
      ...useQueryOptions,
      skip: !farmAddress,
    },
  );

  useEffect(() => {
    const getFarmData = () => {
      const { getRewardsByFarmAddress } = data;
      if (
        getRewardsByFarmAddress &&
        Object.keys(getRewardsByFarmAddress).length > 0 &&
        pools.length &&
        hbarPrice !== 0
      ) {
        try {
          const processedFarm = getProcessedFarms([getRewardsByFarmAddress], pools, hbarPrice);
          setFarm(processedFarm[0]);
          setProcessingFarms(false);
        } catch (error) {
          console.error('Error while processing campaign data');
        } finally {
          setProcessingFarms(false);
        }
      }
    };

    data && getFarmData();
  }, [data, farmAddress, pools, hbarPrice]);

  useEffect(() => {
    if (
      !loading &&
      (error ||
        !data.getRewardsByFarmAddress ||
        Object.keys(data.getRewardsByFarmAddress).length === 0)
    ) {
      setProcessingFarms(false);
    }
  }, [loading, error, data]);

  useEffect(() => {
    startPolling(useQueryOptions.pollInterval || REFRESH_TIME);
    return () => {
      stopPolling();
    };
  }, [startPolling, stopPolling, useQueryOptions]);

  return { farm, loading, error, processingFarms };
};

export default usePermissionlessFarmRewardsByAddress;
