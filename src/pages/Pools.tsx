import { useState, useContext, useEffect, useMemo } from 'react';
import { GlobalContext } from '../providers/Global';
import Tippy from '@tippyjs/react';
import { Link } from 'react-router-dom';
import _ from 'lodash';

import { REFRESH_TIME, ASYNC_SEARCH_THRESHOLD } from '../constants';

import { PageViews } from '../interfaces/common';
import { IPoolExtendedData } from '../interfaces/tokens';

import SearchArea from '../components/SearchArea';
import AllPools from '../components/AllPools';
import MyPools from '../components/MyPools';
import RemoveLiquidity from '../components/RemoveLiquidity';
import Icon from '../components/Icon';

import { filterPoolsByPattern } from '../utils/poolUtils';

import usePoolsByUser from '../hooks/usePoolsByUser';
import usePoolsByFilter from '../hooks/usePoolsByFilter';
import usePoolsByTokensList from '../hooks/usePoolsByTokensList';

interface IPoolsProps {
  itemsPerPage: number;
}

const Pools = ({ itemsPerPage }: IPoolsProps) => {
  const contextValue = useContext(GlobalContext);
  const { connection, tokensWhitelisted } = contextValue;
  const { userId, connected, isHashpackLoading, setShowConnectModal } = connection;

  const [showRemoveContainer, setShowRemoveContainer] = useState(false);
  const [currentPoolIndex, setCurrentPoolIndex] = useState(0);
  const [poolsToShow, setPoolsToShow] = useState<IPoolExtendedData[]>([]);
  const [userPoolsToShow, setUserPoolsToShow] = useState<IPoolExtendedData[]>([]);
  const [havePools, setHavePools] = useState(false);
  const [haveUserPools, setHaveUserPools] = useState(false);

  //Search area state
  const [inputValue, setInputValue] = useState('');
  const [searchingResults, setSearchingResults] = useState(false);

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

  const { filteredPools, filteredPoolsLoading, loadExtraPools } = usePoolsByFilter(
    {
      fetchPolicy: 'network-only',
    },
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

  const searchFunc = useMemo(
    () => (value: string) => {
      if (value.length > ASYNC_SEARCH_THRESHOLD) loadExtraPools({ variables: { keyword: value } });
      if (value.length > ASYNC_SEARCH_THRESHOLD) {
        loadExtraPools({ variables: { keyword: value } });
      } else {
        setSearchingResults(false);
      }
    },
    [loadExtraPools],
  );

  const viewTitleMapping = {
    [PageViews.ALL_POOLS]: 'All pools',
    [PageViews.MY_POOLS]: 'My positions',
  };

  const handleTabItemClick = (currentView: PageViews) => {
    setCurrentView(currentView);
  };

  useEffect(() => {
    if (
      (pools.length !== 0 || filteredPools.length !== 0) &&
      !filteredPoolsLoading &&
      !loadingPools &&
      !searchingResults
    ) {
      const whitelistedFilteredPools = filterPoolsByPattern(
        inputValue,
        pools,
        ASYNC_SEARCH_THRESHOLD,
      );
      const visiblePools = _.unionBy(whitelistedFilteredPools, filteredPools, 'id');

      setPoolsToShow(visiblePools);
    }

    setHavePools(pools && pools.length !== 0);
  }, [pools, filteredPools, inputValue, filteredPoolsLoading, loadingPools, searchingResults]);

  useEffect(() => {
    if (poolsByUser) setUserPoolsToShow(poolsByUser);

    setHaveUserPools(poolsByUser && poolsByUser.length !== 0);
  }, [poolsByUser]);

  useEffect(() => {
    setSearchingResults(false);
  }, [filteredPools]);

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
                  <>
                    <div className="d-flex align-items-center">
                      <SearchArea
                        searchFunc={searchFunc}
                        inputValue={inputValue}
                        setInputValue={(value: string) => {
                          setSearchingResults(true);
                          setInputValue(value);
                        }}
                        minLength={ASYNC_SEARCH_THRESHOLD + 1}
                      />
                      <Tippy content="By default only whitelisted pools are visible. Searching by pool name or token symbol will show all pools. Resetting your search will display the last search results combined with the default pools.">
                        <span className="ms-2">
                          <Icon color="gray" name="hint" />
                        </span>
                      </Tippy>
                    </div>
                    <Link className="btn btn-sm btn-primary" to="/create">
                      Create pool
                    </Link>
                  </>
                ) : null}

                {currentView === PageViews.MY_POOLS && poolsByUser.length > 0 ? (
                  <Link className="btn btn-sm btn-primary" to="/create">
                    Create pool
                  </Link>
                ) : null}
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
                loadingPools={loadingPools || filteredPoolsLoading}
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
