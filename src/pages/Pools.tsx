import React, { useState, useContext } from 'react';
import { GlobalContext } from '../providers/Global';
import { Link } from 'react-router-dom';

import { PageViews } from '../interfaces/common';

import PoolInfo from '../components/PoolInfo';
import Button from '../components/Button';
import RemoveLiquidity from '../components/RemoveLiquidity';
import Icon from '../components/Icon';

import { REFRESH_TIME } from '../constants';

import usePools from '../hooks/usePools';
import usePoolsByUser from '../hooks/usePoolsByUser';

const Pools = () => {
  const contextValue = useContext(GlobalContext);
  const { connection } = contextValue;
  const { userId, connected, isHashpackLoading, setShowConnectModal } = connection;

  const {
    error: errorPoools,
    loading: loadingPools,
    pools,
  } = usePools(
    {
      fetchPolicy: 'network-only',
      pollInterval: REFRESH_TIME,
    },
    true,
  );

  const {
    error: errorPooolsByUser,
    loading: loadingPoolsByUser,
    poolsByUser,
  } = usePoolsByUser(
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

  const renderAllPools = () => {
    return loadingPools ? (
      <p className="text-info">Loading pools...</p>
    ) : havePools ? (
      <div className="table-pools">
        <div className={`table-pools-row with-6-columns`}>
          <div className="table-pools-cell">
            <span className="text-small">#</span>
          </div>
          <div className="table-pools-cell">
            <span className="text-small">Pool</span>
          </div>
          <div className="table-pools-cell justify-content-end">
            <span className="text-small">
              TVL <Icon name="arrow-down" />
            </span>
          </div>
          <div className="table-pools-cell justify-content-end">
            <span className="text-small">Volume 7d</span>
          </div>
          <div className="table-pools-cell justify-content-end">
            <span className="text-small">Volume 24h</span>
          </div>
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
      renderEmptyPoolsState('There are no active pools at this moment.')
    );
  };

  const renderUserPools = () => {
    return connected && !isHashpackLoading ? (
      loadingPoolsByUser ? (
        <p className="text-info">Loading pools...</p>
      ) : havePools ? (
        <div className="table-pools">
          <div className={`table-pools-row`}>
            <div className="table-pools-cell">
              <span className="text-small">#</span>
            </div>
            <div className="table-pools-cell">
              <span className="text-small">Pool</span>
            </div>
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
        renderEmptyPoolsState('You don’t have active pools at this moment.')
      )
    ) : (
      <div className="text-center mt-10">
        <p>Your active liquidity positions will appear here.</p>
        <div className="mt-4">
          <Button
            disabled={isHashpackLoading}
            size="small"
            onClick={() => setShowConnectModal(true)}
            type="primary"
          >
            Connect Wallet
          </Button>
        </div>
      </div>
    );
  };

  const renderEmptyPoolsState = (infoMessage: string) => (
    <div className="text-center mt-10">
      <p className="text-small">{infoMessage}</p>
      <Link to="/create" className="btn btn-primary btn-sm mt-5">
        Create pool
      </Link>
    </div>
  );

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

          {connected && !isHashpackLoading && havePools ? (
            <div className="d-flex justify-content-end align-items-center my-5">
              <Link className="btn btn-sm btn-primary" to="/create">
                Create pool
              </Link>
            </div>
          ) : null}

          {errorPoools || errorPooolsByUser ? (
            <div className="alert alert-danger mt-5" role="alert">
              <strong>Something went wrong!</strong> Cannot get pools...
            </div>
          ) : null}

          <>{currentView === PageViews.ALL_POOLS ? renderAllPools() : renderUserPools()}</>
        </div>
      )}
    </div>
  );
};

export default Pools;
