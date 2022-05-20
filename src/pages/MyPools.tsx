import React, { useEffect, useState, useContext } from 'react';
import { GlobalContext } from '../providers/Global';

import { useLazyQuery } from '@apollo/client';
import { GET_POOLS_BY_USER } from '../GraphQL/Queries';
import { IPairData } from '../interfaces/tokens';
import { idToAddress } from '../utils/tokenUtils';

import PoolInfo from '../components/PoolInfo';

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
              <PoolInfo key={index} pairData={item} />
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
