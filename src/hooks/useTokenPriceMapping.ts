import { useCallback, useEffect, useState } from 'react';
import { BALLANCE_FETCH_INTERVAL } from '../constants';
import { getTokenPriceByAddress } from '../utils/tokenUtils';

interface ITokenPriceMapping {
  [key: string]: string;
}

const useTokenPriceMapping = (tokenAddresses: string[]) => {
  const [tokenPriceMapping, setTokenPriceMapping] = useState({} as ITokenPriceMapping);

  const getTokenPriceMapping = useCallback(async () => {
    let tokenPriceMapping: ITokenPriceMapping = {};
    if (tokenAddresses && tokenAddresses.length > 0) {
      for (let i = 0; i < tokenAddresses.length; i++) {
        tokenPriceMapping[tokenAddresses[i]] = await getTokenPriceByAddress(tokenAddresses[i]);
      }

      setTokenPriceMapping(tokenPriceMapping);
    }
  }, [tokenAddresses]);

  useEffect(() => {
    getTokenPriceMapping();

    const fetchInterval = setInterval(() => {
      getTokenPriceMapping();
    }, BALLANCE_FETCH_INTERVAL);

    return () => {
      clearInterval(fetchInterval);
    };
  }, [getTokenPriceMapping]);

  return tokenPriceMapping;
};

export default useTokenPriceMapping;
