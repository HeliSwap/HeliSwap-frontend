import { useCallback, useEffect, useState } from 'react';
import axios from 'axios';
import { BALLANCE_FETCH_INTERVAL } from '../constants';

const useHeliPrice = () => {
  const [heliPrice, setHeliPrice] = useState<number>(0);
  const [loading, setLoading] = useState(false);

  const getHeliPrice = useCallback(async () => {
    setLoading(true);

    const url = 'https://heliswap-api.ey.r.appspot.com/tokens/heli/';

    try {
      const response = await axios.get(url);
      console.log('response', response);

      setHeliPrice(0);
    } catch (e) {
      console.error(e);
      setHeliPrice(0);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    getHeliPrice();

    const fetchInterval = setInterval(() => {
      getHeliPrice();
    }, BALLANCE_FETCH_INTERVAL);
    return () => {
      clearInterval(fetchInterval);
    };
  }, [getHeliPrice]);

  return { heliPrice, loading };
};

export default useHeliPrice;
