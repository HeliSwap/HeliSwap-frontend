import React, { useEffect, useState, useContext } from 'react';
import { GlobalContext } from '../providers/Global';
import { Link } from 'react-router-dom';

import { useLazyQuery, useQuery } from '@apollo/client';
import { GET_POOLS_BY_USER, GET_POOLS } from '../GraphQL/Queries';
import { IPairData } from '../interfaces/tokens';
import { PageViews } from '../interfaces/common';
import { getHBarPrice, idToAddress } from '../utils/tokenUtils';

import PoolInfo from '../components/PoolInfo';
import RemoveLiquidity from '../components/RemoveLiquidity';

const Pools = () => {
  const contextValue = useContext(GlobalContext);
  const { connection } = contextValue;
  const { userId } = connection;

  const [getPoolsByUser, { error, loading, data }] = useLazyQuery(GET_POOLS_BY_USER);
  const { loading: loadingPools, data: dataPools } = useQuery(GET_POOLS);

  const initialCurrentView: PageViews = PageViews.ALL_POOLS;
  const [currentView, setCurrentView] = useState<PageViews>(initialCurrentView);
  const viewTitleMapping = {
    [PageViews.ALL_POOLS]: 'All pools',
    [PageViews.MY_POOLS]: 'My positions',
  };

  const [pairData, setPairData] = useState<IPairData[]>([]);
  const [allPairsData, setAllPairsData] = useState<IPairData[]>([]);
  const [showRemoveContainer, setShowRemoveContainer] = useState(false);
  const [currentPoolIndex, setCurrentPoolIndex] = useState(0);
  const [hbarPrice, setHbarPrice] = useState(0);

  const handleTabItemClick = (currentView: PageViews) => {
    setCurrentView(currentView);
  };

  useEffect(() => {
    userId &&
      getPoolsByUser({
        variables: { address: idToAddress(userId) },
        pollInterval: 10000,
        fetchPolicy: 'network-only',
      });
  }, [userId, getPoolsByUser]);

  useEffect(() => {
    data && setPairData(data.getPoolsByUser);
  }, [data]);

  useEffect(() => {
    dataPools && setAllPairsData(dataPools.pools);
  }, [dataPools]);

  useEffect(() => {
    const getHBARPrice = async () => {
      const hbarPrice = await getHBarPrice();
      setHbarPrice(hbarPrice);
    };

    getHBARPrice();
  }, []);

  const havePools = pairData.length > 0;

  const poolsMapping = {
    [PageViews.ALL_POOLS]: allPairsData,
    [PageViews.MY_POOLS]: pairData,
  };

  const poolsToShow = poolsMapping[currentView];

  return (
    <div className="d-flex justify-content-center">
      {showRemoveContainer ? (
        <RemoveLiquidity
          pairData={pairData[currentPoolIndex]}
          setShowRemoveContainer={setShowRemoveContainer}
        />
      ) : (
        <div className="container-pools">
          <div className="d-flex justify-content-between align-items-center mb-6">
            <div className="d-flex">
              <h2
                onClick={() => handleTabItemClick(PageViews.ALL_POOLS)}
                className={`text-subheader tab-title ${
                  PageViews.ALL_POOLS === currentView ? 'is-active' : ''
                }`}
              >
                {viewTitleMapping[PageViews.ALL_POOLS]}
              </h2>
              <h2
                onClick={() => handleTabItemClick(PageViews.MY_POOLS)}
                className={`text-subheader tab-title ${
                  PageViews.MY_POOLS === currentView ? 'is-active' : ''
                } ms-3`}
              >
                {viewTitleMapping[PageViews.MY_POOLS]}
              </h2>
            </div>
            <Link className="btn btn-sm btn-primary" to="/create">
              Create pool
            </Link>
          </div>

          {error ? (
            <div className="alert alert-danger mt-5" role="alert">
              <strong>Something went wrong!</strong> Cannot get pairs...
              <p>{error.message}</p>
            </div>
          ) : null}

          {loading || loadingPools ? (
            <p className="text-info">Loading pools...</p>
          ) : havePools ? (
            <div className="table-pools">
              <div
                className={`table-pools-row ${
                  currentView === PageViews.ALL_POOLS ? 'with-4-columns' : ''
                }`}
              >
                <div className="table-pools-cell">
                  <span className="text-small">#</span>
                </div>
                <div className="table-pools-cell">
                  <span className="text-small">Pool</span>
                </div>
                {currentView === PageViews.ALL_POOLS ? (
                  <div className="table-pools-cell justify-content-end">
                    <span className="text-small">TVL</span>
                  </div>
                ) : null}
              </div>
              {poolsToShow.map((item, index) => (
                <PoolInfo
                  setShowRemoveContainer={setShowRemoveContainer}
                  setCurrentPoolIndex={setCurrentPoolIndex}
                  index={index}
                  key={index}
                  pairData={item}
                  allPoolsData={allPairsData}
                  hbarPrice={hbarPrice}
                  view={currentView}
                />
              ))}
            </div>
          ) : (
            <p className="text-warning">No pools found</p>
          )}
        </div>
      )}
    </div>
  );
};

export default Pools;
