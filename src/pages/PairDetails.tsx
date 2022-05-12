import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { IPairData } from '../interfaces/tokens';

import { useQuery } from '@apollo/client';
import { GET_POOLS } from '../GraphQL/Queries';
import Loader from '../components/Loader';

const PairDetails = () => {
  const { address } = useParams();

  const { error, loading, data } = useQuery(GET_POOLS);
  const [pairData, setPairData] = useState<IPairData>({} as IPairData);

  useEffect(() => {
    if (data && data.pools.length > 0) {
      const foundPool = data.pools.find((pool: IPairData) => pool.pairAddress === address);

      if (foundPool) {
        setPairData(foundPool);
      }
    }
  }, [data, address]);

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
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default PairDetails;
