import { useState, useContext, useEffect, useMemo } from 'react';
import { GlobalContext } from '../providers/Global';
import { Link } from 'react-router-dom';
import _ from 'lodash';

import { REFRESH_TIME } from '../constants';

import { PageViews } from '../interfaces/common';
import { IPoolExtendedData } from '../interfaces/tokens';

import SearchArea from '../components/SearchArea';
import AllPools from '../components/AllPools';
import MyPools from '../components/MyPools';
import RemoveLiquidity from '../components/RemoveLiquidity';

import { filterPoolsByPattern } from '../utils/poolUtils';

import usePoolsByUser from '../hooks/usePoolsByUser';
import usePoolsByFilter from '../hooks/usePoolsByFilter';
import usePoolsByTokensList from '../hooks/usePoolsByTokensList';

const searchThreshold = 2;

interface IPoolsProps {
  itemsPerPage: number;
}

const Pools = ({ itemsPerPage }: IPoolsProps) => {
  const contextValue = useContext(GlobalContext);
  const { connection, tokensWhitelisted } = contextValue;
  const { userId, connected, isHashpackLoading, setShowConnectModal } = connection;

  const [searchQuery, setSearchQuery] = useState({});
  const [showRemoveContainer, setShowRemoveContainer] = useState(false);
  const [currentPoolIndex, setCurrentPoolIndex] = useState(0);
  const [poolsToShow, setPoolsToShow] = useState<IPoolExtendedData[]>([]);
  const [userPoolsToShow, setUserPoolsToShow] = useState<IPoolExtendedData[]>([]);
  const [havePools, setHavePools] = useState(false);
  const [haveUserPools, setHaveUserPools] = useState(false);

  //Search area state
  const [inputValue, setInputValue] = useState('');

  const searchFunc = useMemo(
    () => (value: string) => {
      if (value.length > searchThreshold) setSearchQuery({ keyword: value });
    },
    [],
  );

  const tokensWhitelistedAddresses = tokensWhitelisted.map(item => item.address) || [];

  const {
    poolsByTokenList: pools,
    loadingPoolsByTokenList: loadingPools,
    errorPoolsByTokenList: errorPoools,
  } = usePoolsByTokensList(
    {
      fetchPolicy: 'network-only',
      pollInterval: REFRESH_TIME,
    },
    true,
    tokensWhitelistedAddresses,
  );

  const { filteredPools, filteredPoolsLoading } = usePoolsByFilter(
    {
      fetchPolicy: 'network-only',
    },
    searchQuery,
    true,
    pools,
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

  const initialCurrentView: PageViews = PageViews.ALL_POOLS;
  const [currentView, setCurrentView] = useState<PageViews>(initialCurrentView);

  const viewTitleMapping = {
    [PageViews.ALL_POOLS]: 'All pools',
    [PageViews.MY_POOLS]: 'My positions',
  };

  const handleTabItemClick = (currentView: PageViews) => {
    setCurrentView(currentView);
  };

  useEffect(() => {
    if ((pools || filteredPools) && !filteredPoolsLoading && !loadingPools) {
      const whitelistedFilteredPools = filterPoolsByPattern(inputValue, pools, searchThreshold);
      const visiblePools = _.unionBy(whitelistedFilteredPools, filteredPools, 'id');

      setPoolsToShow(visiblePools);
    }

    setHavePools(pools && pools.length !== 0);
  }, [pools, filteredPools, inputValue, filteredPoolsLoading, loadingPools]);

  useEffect(() => {
    if (poolsByUser) setUserPoolsToShow(poolsByUser);

    setHaveUserPools(poolsByUser && poolsByUser.length !== 0);
  }, [poolsByUser]);

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
            <>
              <div className="d-flex justify-content-between align-items-center my-5">
                {currentView === PageViews.ALL_POOLS ? (
                  <div>
                    <SearchArea
                      searchFunc={searchFunc}
                      inputValue={inputValue}
                      setInputValue={setInputValue}
                      minLength={searchThreshold + 1}
                    />
                  </div>
                ) : null}
                <Link className="btn btn-sm btn-primary" to="/create">
                  Create pool
                </Link>
              </div>
            </>
          ) : null}

          {errorPoools || errorPooolsByUser ? (
            <div className="alert alert-danger mt-5" role="alert">
              <strong>Something went wrong!</strong> Cannot get pools...
            </div>
          ) : null}

          <>
            {currentView === PageViews.ALL_POOLS ? (
              <AllPools
                loadingPools={loadingPools}
                havePools={havePools}
                itemsPerPage={itemsPerPage}
                pools={poolsToShow}
                setShowRemoveContainer={setShowRemoveContainer}
                setCurrentPoolIndex={setCurrentPoolIndex}
                currentView={currentView}
                renderEmptyPoolsState={renderEmptyPoolsState}
              />
            ) : (
              <MyPools
                connected={connected}
                isHashpackLoading={isHashpackLoading}
                loadingPools={loadingPoolsByUser}
                pools={userPoolsToShow}
                havePools={haveUserPools}
                setShowRemoveContainer={setShowRemoveContainer}
                setCurrentPoolIndex={setCurrentPoolIndex}
                currentView={currentView}
                renderEmptyPoolsState={renderEmptyPoolsState}
                setShowConnectModal={setShowConnectModal}
                itemsPerPage={itemsPerPage}
              />
            )}
          </>
        </div>
      )}
    </div>
  );
};

export default Pools;
