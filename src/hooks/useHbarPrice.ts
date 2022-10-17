import { useCallback, useEffect, useState } from 'react';
import axios from 'axios';
import { BALLANCE_FETCH_INTERVAL } from '../constants';

const useHbarPrice = () => {
  const [hbarPrice, setHbarPrice] = useState<number>(0);
  const [loading, setLoading] = useState(false);

  const getHBARPrice = useCallback(async () => {
    setLoading(true);

    const url = `${process.env.REACT_APP_MIRROR_NODE_URL}/api/v1/network/exchangerate`;

    try {
      const response = await axios.get(url);
      const { data, status } = response;
      const {
        current_rate: { hbar_equivalent, cent_equivalent },
      } = data;

      const currentRate = cent_equivalent / hbar_equivalent / 100;

      setHbarPrice(status === 200 ? currentRate : hbarPrice);
    } catch (e) {
      console.error(e);
      setHbarPrice(hbarPrice);
    } finally {
      setLoading(false);
    }
  }, [hbarPrice]);

  useEffect(() => {
    getHBARPrice();

    const fetchInterval = setInterval(() => {
      getHBARPrice();
    }, BALLANCE_FETCH_INTERVAL);
    return () => {
      clearInterval(fetchInterval);
    };
  }, [getHBARPrice]);

  return { hbarPrice, loading };
};

export default useHbarPrice;
