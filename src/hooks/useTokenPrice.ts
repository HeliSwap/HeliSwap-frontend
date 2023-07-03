import { useCallback, useEffect, useState } from 'react';
import axios from 'axios';
import { BALLANCE_FETCH_INTERVAL } from '../constants';

const useTokenPrice = (tokenAddress: string) => {
  const [tokenPrice, setTokenPrice] = useState<number>(0);
  const [loading, setLoading] = useState(false);

  const getTokenPrice = useCallback(
    async (tokenAddress: string) => {
      setLoading(true);

      const url = `https://heliswap-api.ey.r.appspot.com/tokens/${tokenAddress}`;

      try {
        const response = await axios.get(url);
        const { status, data } = response;

        if (status === 200) {
          const { price } = data;
          setTokenPrice(price);
        } else {
          setTokenPrice(0);
        }
      } catch (e) {
        console.error(e);
        setTokenPrice(0);
      } finally {
        setLoading(false);
      }
    },
    [tokenAddress],
  );

  useEffect(() => {
    getTokenPrice(tokenAddress);

    const fetchInterval = setInterval(() => {
      getTokenPrice(tokenAddress);
    }, BALLANCE_FETCH_INTERVAL);

    return () => {
      clearInterval(fetchInterval);
    };
  }, []);

  return { tokenPrice, loading };
};

export default useTokenPrice;
