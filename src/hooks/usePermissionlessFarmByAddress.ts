import { useContext, useEffect, useState } from 'react';
import { GlobalContext } from '../providers/Global';

import { QueryHookOptions, useQuery } from '@apollo/client';
import { GET_PERMISSIONLESS_FARM_DETAILS } from '../GraphQL/Queries';

import { IFarmData, IPoolData } from '../interfaces/tokens';

import { getProcessedFarms } from '../utils/farmUtils';
import { idToAddress } from '../utils/tokenUtils';

import { REFRESH_TIME } from '../constants';

const useFarmByAddress = (
  useQueryOptions: QueryHookOptions = {},
  userId: string,
  pools: IPoolData[],
  farmAddress: string,
) => {
  const contextValue = useContext(GlobalContext);
  const { hbarPrice } = contextValue;

  const [processingFarms, setProcessingFarms] = useState<boolean>(true);
  const [farm, setFarm] = useState<IFarmData>({} as IFarmData);

  const userAddress = userId ? idToAddress(userId) : '';

  const { loading, data, error, startPolling, stopPolling } = useQuery(
    GET_PERMISSIONLESS_FARM_DETAILS,
    {
      variables: { farmAddress, userAddress },
      ...useQueryOptions,
      skip: !farmAddress,
    },
  );

  useEffect(() => {
    const getFarmData = () => {
      const { getPermissionlessFarmDetails } = data;
      if (
        getPermissionlessFarmDetails &&
        Object.keys(getPermissionlessFarmDetails).length > 0 &&
        pools.length &&
        hbarPrice !== 0
      ) {
        try {
          const processedFarm = getProcessedFarms([getPermissionlessFarmDetails], pools, hbarPrice);
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
        !data.getPermissionlessFarmDetails ||
        Object.keys(data.getPermissionlessFarmDetails).length === 0)
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

export default useFarmByAddress;
