import React, { useEffect, useState, useContext } from 'react';
import { hethers } from '@hashgraph/hethers';
import { useParams } from 'react-router-dom';
import { IPairData } from '../interfaces/tokens';
import { GlobalContext } from '../providers/Global';

import { useQuery } from '@apollo/client';
import { GET_POOLS } from '../GraphQL/Queries';
import Loader from '../components/Loader';
import { idToAddress } from '../utils/tokenUtils';
import { getConnectedWallet } from './Helpers';
import Button from '../components/Button';

const PairDetails = () => {
  const contextValue = useContext(GlobalContext);
  const { connection, sdk } = contextValue;
  const { userId } = connection;

  const connectedWallet = getConnectedWallet();

  const { address } = useParams();

  const { error, loading, data } = useQuery(GET_POOLS);
  const [pairData, setPairData] = useState<IPairData>({} as IPairData);
  const [pairDataContracts, setPairDataContracts] = useState({
    balance: '0.0',
    totalSupply: '0.0',
    token0: '0.0',
    token1: '0.0',
  });

  useEffect(() => {
    if (data && data.pools.length > 0) {
      const foundPool = data.pools.find((pool: IPairData) => pool.pairAddress === address);

      if (foundPool) {
        setPairData(foundPool);
      }
    }
  }, [data, address]);

  const getPairDataContracts = async () => {
    if (connectedWallet) {
      const userAddress = idToAddress(userId);
      const balanceBN = await sdk.checkBalance(pairData.pairAddress, userAddress, connectedWallet);
      const totalSupplyBN = await sdk.getTotalSupply(pairData.pairAddress, connectedWallet);
      const [token0BN, token1BN] = await sdk.getReserves(pairData.pairAddress, connectedWallet);

      const balanceStr = hethers.utils.formatUnits(balanceBN, 18);
      const totalSupplyStr = hethers.utils.formatUnits(totalSupplyBN, 18);
      const token0Str = hethers.utils.formatUnits(token0BN, 18);
      const token1Str = hethers.utils.formatUnits(token1BN, 18);

      const balanceNum = Number(balanceStr);
      const totalSupplyNum = Number(totalSupplyStr);
      // const token0Num = Number(token0Str);
      // const token1Num = Number(token1Str);

      balanceNum > 0 &&
        setPairDataContracts({
          balance: balanceStr,
          totalSupply: totalSupplyStr,
          token0: token0Str,
          token1: token1Str,
        });
    }
  };

  const hasUserProvided = Number(pairDataContracts.balance) > 0;

  return (
    <div className="d-flex justify-content-center">
      {error ? (
        <div className="alert alert-danger mb-5" role="alert">
          <strong>Something went wrong!</strong> Cannot get pair data...
        </div>
      ) : null}

      {loading ? <Loader loadingText="Loading pool data..." /> : null}

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

          {connectedWallet ? (
            <div className="col-6">
              {hasUserProvided ? (
                <div className="p-3 rounded border border-primary">
                  <p>User LP tokens:</p>
                  <p className="text-title">{pairDataContracts.balance}</p>
                  <p className="mt-3">LP total supply:</p>
                  <p className="text-title">{pairDataContracts.totalSupply}</p>
                  <div className="row mt-3">
                    <div className="col-6">
                      <p>Token0:</p>
                      <p className="text-title">{pairDataContracts.token0}</p>
                    </div>
                    <div className="col-6">
                      <p>Token1:</p>
                      <p className="text-title">{pairDataContracts.token1}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <Button onClick={getPairDataContracts}>Show contract data</Button>
              )}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default PairDetails;
