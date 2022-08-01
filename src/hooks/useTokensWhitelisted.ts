import { useEffect, useState } from 'react';
import axios from 'axios';
import { ITokenListData } from '../interfaces/tokens';

const useTokensWhitelisted = () => {
  const [tokens, setTokens] = useState<ITokenListData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    const getTokens = async () => {
      const url = process.env.REACT_APP_TOKEN_LIST_URL as string;

      if (url && url !== '') {
        setLoading(true);

        try {
          const result = await axios(url);
          const { status, data } = result;

          if (status === 200) {
            const { tokens } = data;
            setTokens(tokens);
          } else {
            setError(true);
          }
        } catch (e) {
          console.error(e);
          setError(true);
        } finally {
          setLoading(false);
        }
      } else {
        setError(true);
      }
    };

    getTokens();
  }, []);

  return { tokens, loading, error };
};

export default useTokensWhitelisted;
