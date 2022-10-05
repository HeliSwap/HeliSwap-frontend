import { useContext, useEffect, useState } from 'react';
import { GlobalContext } from '../providers/Global';

import { QueryHookOptions, useQuery } from '@apollo/client';
import { GET_FARMS } from '../GraphQL/Queries';

import { IFarmData, IFarmDataRaw, IPoolData } from '../interfaces/tokens';

import { getProcessedFarms } from '../utils/farmUtils';
import { idToAddress } from '../utils/tokenUtils';

import { REFRESH_TIME } from '../constants';

const useFarms = (useQueryOptions: QueryHookOptions = {}, userId: string, pools: IPoolData[]) => {
  const contextValue = useContext(GlobalContext);
  const { hbarPrice } = contextValue;

  const [farmsRaw, setFarmsRaw] = useState<IFarmDataRaw[]>([]);
  const [farms, setFarms] = useState<IFarmData[]>([]);

  const address = userId ? idToAddress(userId) : '';

  const { loading, data, error, startPolling, stopPolling } = useQuery(GET_FARMS, {
    variables: { address },
    ...useQueryOptions,
    skip: !userId,
  });

  useEffect(() => {
    const getFarmsData = () => {
      const { getCampaignData } = data;
      getCampaignData && getCampaignData.length > 0 && setFarmsRaw(getCampaignData);
    };

    data && getFarmsData();
  }, [data]);

  useEffect(() => {
    startPolling(useQueryOptions.pollInterval || REFRESH_TIME);
    return () => {
      stopPolling();
    };
  }, [startPolling, stopPolling, useQueryOptions]);

  useEffect(() => {
    if (farmsRaw.length > 0 && pools.length && hbarPrice !== 0) {
      const processedFarms = getProcessedFarms(farmsRaw, pools, hbarPrice);
      setFarms(processedFarms);
    }
  }, [farmsRaw, pools, hbarPrice]);

  return { farms, loading, error };
};

export default useFarms;
