import { useEffect, useState } from 'react';
import axios from 'axios';
import { ITokenListData } from '../interfaces/tokens';
import testnetTokenList from '../token-list/testnet.tokenlist.json';
import mainnetTokenList from '../token-list/mainnet.tokenlist.json';

const useTokensWhitelisted = () => {
  const [tokens, setTokens] = useState<ITokenListData[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const getTokens = async () => {
      const url = process.env.REACT_APP_TOKEN_LIST_URL as string;
      const network = process.env.REACT_APP_NETWORK_TYPE as string;

      const fallbackTokenList =
        network === 'mainnet' ? mainnetTokenList.tokens : testnetTokenList.tokens;

      if (url && url !== '') {
        setLoading(true);

        try {
          const result = await axios(url);
          const { status, data } = result;

          if (status === 200) {
            const { tokens } = data;
            setTokens(tokens);
          } else {
            setTokens(fallbackTokenList);
          }
        } catch (e) {
          console.error(e);
          setTokens(fallbackTokenList);
        } finally {
          setLoading(false);
        }
      } else {
        setTokens(fallbackTokenList);
      }
    };

    getTokens();
  }, []);

  return { tokens, loading };
};

export default useTokensWhitelisted;
