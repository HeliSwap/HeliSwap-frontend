import React, { useEffect, useState, useContext } from 'react';
import { GlobalContext } from '../providers/Global';

import { useLazyQuery } from '@apollo/client';
import { GET_POOLS_BY_USER } from '../GraphQL/Queries';
import { formatBigNumberToNumber } from '../utils/numberUtils';
import { IPairData } from '../interfaces/tokens';
import { idToAddress } from '../utils/tokenUtils';

const Pairs = () => {
  const contextValue = useContext(GlobalContext);
  const { connection } = contextValue;
  const { userId } = connection;

  const [getPoolsByUser, { error, loading, data }] = useLazyQuery(GET_POOLS_BY_USER);
  const [pairData, setPairData] = useState<IPairData[]>([]);

  useEffect(() => {
    userId &&
      getPoolsByUser({
        variables: { address: idToAddress(userId) },
      });
  }, [userId, getPoolsByUser]);

  useEffect(() => {
    data && setPairData(data.getPoolsByUser);
  }, [data]);

  const havePairs = pairData.length > 0;

  return (
    <div className="d-flex justify-content-center">
      <div className="container-swap">
        {error ? (
          <div className="alert alert-danger mt-5" role="alert">
            <strong>Something went wrong!</strong> Cannot get pairs...
          </div>
        ) : null}
        {loading ? (
          <p className="text-info">Loading pairs...</p>
        ) : havePairs ? (
          <div>
            {pairData.map((item, index) => (
              <div className="mt-4 rounded border border-primary p-4" key={index}>
                <h3 className="text-title">{item.pairSymbol}</h3>
                <div className="d-flex justify-content-between align-items-center mt-4">
                  <p>Your total LP tokens:</p>
                  <p>{formatBigNumberToNumber(item.lpShares as number).toFixed(4)}</p>
                </div>
                <div className="d-flex justify-content-between align-items-center mt-2">
                  <p>Pooled {item.token0Symbol}:</p>
                  <p>{formatBigNumberToNumber(item.token0Amount as number).toFixed(4)}</p>
                </div>
                <div className="d-flex justify-content-between align-items-center mt-2">
                  <p>Pooled {item.token1Symbol}:</p>
                  <p>{formatBigNumberToNumber(item.token1Amount as number).toFixed(4)}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-warning">No pools found</p>
        )}
      </div>
    </div>
  );
};

export default Pairs;
