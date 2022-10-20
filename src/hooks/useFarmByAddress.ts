import { useContext, useEffect, useState } from 'react';
import { GlobalContext } from '../providers/Global';

import { QueryHookOptions, useQuery } from '@apollo/client';
import { GET_FARM_BY_ADDRESS } from '../GraphQL/Queries';

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

  const { loading, data, error } = useQuery(GET_FARM_BY_ADDRESS, {
    variables: { address: farmAddress, eoaAddress: userAddress },
    ...useQueryOptions,
    skip: !farmAddress,
    pollInterval: useQueryOptions.pollInterval || REFRESH_TIME,
  });

  useEffect(() => {
    const getFarmData = () => {
      const { getFarmDetails } = data;
      if (
        getFarmDetails &&
        Object.keys(getFarmDetails).length > 0 &&
        pools.length &&
        hbarPrice !== 0
      ) {
        const processedFarm = getProcessedFarms([getFarmDetails], pools, hbarPrice);
        setFarm(processedFarm[0]);
        setProcessingFarms(false);
      }
    };

    data && getFarmData();
  }, [data, farmAddress, pools, hbarPrice]);

  useEffect(() => {
    if (!loading && error) {
      setProcessingFarms(false);
    }
  }, [loading, error]);

  return { farm, loading, error, processingFarms };
};

export default useFarmByAddress;
