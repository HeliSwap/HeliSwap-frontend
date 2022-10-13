import { useContext, useEffect, useState } from 'react';
import { GlobalContext } from '../providers/Global';

import { QueryHookOptions, useQuery } from '@apollo/client';
import { GET_FARMS } from '../GraphQL/Queries';

import { IFarmData, IFarmDataRaw, IPoolData } from '../interfaces/tokens';

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

  const [farmRaw, setFarmRaw] = useState<IFarmDataRaw>({} as IFarmDataRaw);
  const [farm, setFarm] = useState<IFarmData>({} as IFarmData);

  const address = userId ? idToAddress(userId) : '';

  const { loading, data, error, startPolling, stopPolling } = useQuery(GET_FARMS, {
    variables: { address },
    ...useQueryOptions,
    skip: !farmAddress,
  });

  useEffect(() => {
    const getFarmsData = () => {
      const { getCampaignData } = data;
      if (getCampaignData && getCampaignData.length > 0) {
        const farmRaw = getCampaignData.find(
          (currFarm: IFarmDataRaw) => currFarm.address === farmAddress,
        );
        setFarmRaw(farmRaw);
      }
    };

    data && getFarmsData();
  }, [data, farmAddress]);

  useEffect(() => {
    startPolling(useQueryOptions.pollInterval || REFRESH_TIME);
    return () => {
      stopPolling();
    };
  }, [startPolling, stopPolling, useQueryOptions]);

  useEffect(() => {
    if (farmRaw && Object.keys(farmRaw).length !== 0 && pools.length && hbarPrice !== 0) {
      const processedFarm = getProcessedFarms([farmRaw], pools, hbarPrice);
      setFarm(processedFarm[0]);
    }
  }, [farmRaw, pools, hbarPrice]);

  return { farm, loading, error };
};

export default useFarmByAddress;
