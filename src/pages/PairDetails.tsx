import React, { useEffect, useState, useContext } from 'react';
import { useParams } from 'react-router-dom';
import { IPairData } from '../interfaces/tokens';
import { GlobalContext } from '../providers/Global';

import { useQuery } from '@apollo/client';
import { GET_POOLS } from '../GraphQL/Queries';
import Loader from '../components/Loader';
import { idToAddress } from '../utils/tokenUtils';
import { getConnectedWallet } from './Helpers';

const PairDetails = () => {
  const contextValue = useContext(GlobalContext);
  const { connection, sdk } = contextValue;
  const { userId } = connection;

  const connectedWallet = getConnectedWallet();

  const { address } = useParams();

  const { error, loading, data } = useQuery(GET_POOLS);
  const [pairData, setPairData] = useState<IPairData>({} as IPairData);
  const [userBalance, setUserBalance] = useState('0.00');

  useEffect(() => {
    if (data && data.pools.length > 0) {
      const foundPool = data.pools.find((pool: IPairData) => pool.pairAddress === address);

      if (foundPool) {
        setPairData(foundPool);
      }
    }
  }, [data, address]);

  useEffect(() => {
    const getBalance = async () => {
      if (connectedWallet) {
        const userAddress = idToAddress(userId);
        const balanceBN = await sdk.checkBalance(
          pairData.pairAddress,
          userAddress,
          connectedWallet,
        );

        Number(balanceBN.toString()) > 0 && setUserBalance(balanceBN.toString());
      } else {
        setUserBalance('0.00');
      }
    };

    userId && connectedWallet && sdk && Object.keys(pairData).length > 0 && getBalance();
  }, [pairData, sdk, userId, connectedWallet]);

  const hasUserProvided = Number(userBalance) > 0;

  return (
    <div className="d-flex justify-content-center">
      {error ? (
        <div className="alert alert-danger mb-5" role="alert">
          <strong>Something went wrong!</strong> Cannot get pair data...
        </div>
      ) : null}

      {loading ? <Loader loadingText="Loading pool data..." /> : null}

      {pairData ? (
        <div className="container-swap">
          <h2 className="text-display">{pairData.pairSymbol} Pair</h2>
          <p className="text-small mt-2">{pairData.pairAddress}</p>

          <div className="row mt-5">
            <div className="col-6">
              <div className="p-3 rounded border border-primary">
                <p>Pooled tokens:</p>
                <p className="text-title">
                  {pairData.token0Amount} {pairData.token0Symbol}
                </p>
                <p className="text-title">
                  {pairData.token1Amount} {pairData.token1Symbol}
                </p>
              </div>
            </div>

            {hasUserProvided ? (
              <div className="col-6">
                <div className="p-3 rounded border border-primary">
                  <p>LP tokens:</p>
                  <p className="text-title">{userBalance}</p>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default PairDetails;
