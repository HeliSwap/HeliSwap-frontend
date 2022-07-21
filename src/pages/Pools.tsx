import React, { useState, useContext } from 'react';
import { GlobalContext } from '../providers/Global';
import { Link } from 'react-router-dom';

import { PageViews } from '../interfaces/common';

import PoolInfo from '../components/PoolInfo';
import Button from '../components/Button';
import RemoveLiquidity from '../components/RemoveLiquidity';

import { REFRESH_TIME } from '../constants';

import usePools from '../hooks/usePools';
import usePoolsByUser from '../hooks/usePoolsByUser';

const Pools = () => {
  const contextValue = useContext(GlobalContext);
  const { connection } = contextValue;
  const { userId, connected, connectWallet } = connection;

  const {
    error,
    loading: loadingPools,
    pools,
  } = usePools(
    {
      fetchPolicy: 'network-only',
      pollInterval: REFRESH_TIME,
    },
    true,
  );

  const { loading: loadingPoolsByUser, poolsByUser } = usePoolsByUser(
    {
      fetchPolicy: 'network-only',
      pollInterval: REFRESH_TIME,
    },
    userId,
    pools,
  );

  const [showRemoveContainer, setShowRemoveContainer] = useState(false);
  const [currentPoolIndex, setCurrentPoolIndex] = useState(0);

  const initialCurrentView: PageViews = PageViews.ALL_POOLS;
  const [currentView, setCurrentView] = useState<PageViews>(initialCurrentView);

  const viewTitleMapping = {
    [PageViews.ALL_POOLS]: 'All pools',
    [PageViews.MY_POOLS]: 'My positions',
  };

  const poolsMapping = {
    [PageViews.ALL_POOLS]: pools,
    [PageViews.MY_POOLS]: poolsByUser,
  };

  const poolsToShow = poolsMapping[currentView];

  const handleTabItemClick = (currentView: PageViews) => {
    setCurrentView(currentView);
  };

  const havePools = poolsToShow!.length > 0;

  return (
    <div className="d-flex justify-content-center">
      {showRemoveContainer && poolsByUser[currentPoolIndex] ? (
        <RemoveLiquidity
          pairData={poolsByUser[currentPoolIndex]}
          setShowRemoveContainer={setShowRemoveContainer}
        />
      ) : (
        <div className="container-pools">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div className="d-flex">
              <h2
                onClick={() => handleTabItemClick(PageViews.ALL_POOLS)}
                className={`text-subheader tab-title mx-4 ${
                  PageViews.ALL_POOLS === currentView ? 'is-active' : ''
                }`}
              >
                {viewTitleMapping[PageViews.ALL_POOLS]}
              </h2>
              <h2
                onClick={() => handleTabItemClick(PageViews.MY_POOLS)}
                className={`text-subheader tab-title mx-4 ${
                  PageViews.MY_POOLS === currentView ? 'is-active' : ''
                } ms-3`}
              >
                {viewTitleMapping[PageViews.MY_POOLS]}
              </h2>
            </div>
          </div>

          <hr />

          <div className="d-flex justify-content-end align-items-center my-5">
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

          {connected ? (
            loadingPools && loadingPoolsByUser ? (
              <p className="text-info">Loading pools...</p>
            ) : havePools ? (
              <div className="table-pools">
                <div
                  className={`table-pools-row ${
                    currentView === PageViews.ALL_POOLS ? 'with-6-columns' : ''
                  }`}
                >
                  <div className="table-pools-cell">
                    <span className="text-small">#</span>
                  </div>
                  <div className="table-pools-cell">
                    <span className="text-small">Pool</span>
                  </div>
                  {currentView === PageViews.ALL_POOLS ? (
                    <>
                      <div className="table-pools-cell justify-content-end">
                        <span className="text-small">TVL</span>
                      </div>
                      <div className="table-pools-cell justify-content-end">
                        <span className="text-small">Volume 7d</span>
                      </div>
                      <div className="table-pools-cell justify-content-end">
                        <span className="text-small">Volume 24h</span>
                      </div>
                    </>
                  ) : null}
                  <div className="table-pools-cell justify-content-end">
                    <span className="text-small"></span>
                  </div>
                </div>
                {poolsToShow.map((item, index) => (
                  <PoolInfo
                    setShowRemoveContainer={setShowRemoveContainer}
                    setCurrentPoolIndex={setCurrentPoolIndex}
                    index={index}
                    key={index}
                    poolData={item}
                    view={currentView}
                  />
                ))}
              </div>
            ) : (
              <p className="text-warning text-center">No pools found</p>
            )
          ) : (
            <div className="rounded bg-dark p-4 text-center">
              <p>Your active liquidity positions will appear here.</p>
              <div className="mt-5">
                <Button onClick={connectWallet} type="primary">
                  Connect Wallet
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Pools;
