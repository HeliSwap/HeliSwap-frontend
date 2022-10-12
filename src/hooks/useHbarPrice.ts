import { useCallback, useEffect, useState } from 'react';
import axios from 'axios';
import { BALLANCE_FETCH_INTERVAL } from '../constants';

const useHbarPrice = () => {
  const [hbarPrice, setHbarPrice] = useState<number>(0);
  const [loading, setLoading] = useState(false);

  const getPriceFromBase64 = (encoded: any) => {
    const priceString = atob(encoded);
    const splittedOnce = priceString.split(',');
    const splittedTwice = splittedOnce[0].split(':');

    return Number(splittedTwice[1].trim());
  };

  const getHBARPrice = useCallback(async () => {
    setLoading(true);
    const currentTimestampInSeconds = Date.now() / 1000;
    const accountID = '0.0.57';

    const url = `${process.env.REACT_APP_MIRROR_NODE_URL}/api/v1/transactions?account.id=${accountID}&transactiontype=fileupdate&limit=1&timestamp=lt:${currentTimestampInSeconds}`;

    try {
      const response = await axios.get(url);
      const {
        data: { transactions },
        status,
      } = response;

      const { memo_base64 } = transactions[0];
      const currentRate = getPriceFromBase64(memo_base64);

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
