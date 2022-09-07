import React, { useContext, useEffect, useState } from 'react';

import ReactPaginate from 'react-paginate';

import { GlobalContext } from '../providers/Global';

import { IFarmData } from '../interfaces/tokens';

import FarmDetails from '../components/FarmDetails';
import FarmRow from '../components/FarmRow';
import Button from '../components/Button';

import useFarms from '../hooks/useFarms';
import usePoolsByTokensList from '../hooks/usePoolsByTokensList';

import {
  SORT_DIRECTION,
  SORT_OPTIONS,
  SORT_OPTIONS_ENUM,
  useQueryOptions,
  useQueryOptionsPolling,
} from '../constants';
import BigNumber from 'bignumber.js';
import Icon from '../components/Icon';

interface IFarmsProps {
  itemsPerPage: number;
}

const Farms = ({ itemsPerPage }: IFarmsProps) => {
  const contextValue = useContext(GlobalContext);
  const { tokensWhitelisted, connection } = contextValue;
  const { userId, connected, isHashpackLoading, setShowConnectModal } = connection;

  const tokensWhitelistedAddresses = tokensWhitelisted.map(item => item.address) || [];

  const [currentItems, setCurrentItems] = useState<IFarmData[]>([]);
  const [pageCount, setPageCount] = useState(0);
  const [itemOffset, setItemOffset] = useState(0);
  const [currentFarmIndex, setCurrentFarmIndex] = useState(0);
  const [showFarmDetails, setShowFarmDetails] = useState(false);
  const [sortDirection, setSortDirection] = useState<SORT_DIRECTION>(SORT_DIRECTION.DESC);
  const [farmsSortBy, setPoolsSortBy] = useState<SORT_OPTIONS>(SORT_OPTIONS_ENUM.APR);

  const { poolsByTokenList: pools } = usePoolsByTokensList(
    useQueryOptionsPolling,
    true,
    tokensWhitelistedAddresses,
  );

  const { farms, loading: loadingFarms } = useFarms(useQueryOptions, userId, pools);

  // Handlers
  const handlePageClick = (event: any) => {
    const newOffset = (event.selected * itemsPerPage) % farms.length;
    setItemOffset(newOffset);
  };

  const handleRowClick = () => {
    setShowFarmDetails(prev => !prev);
  };

  const handleSortClick = (sortBy: SORT_OPTIONS) => {
    if (sortBy === farmsSortBy) {
      setSortDirection(
        sortDirection === SORT_DIRECTION.ASC ? SORT_DIRECTION.DESC : SORT_DIRECTION.ASC,
      );
    } else {
      setPoolsSortBy(sortBy);
    }
  };

  useEffect(() => {
    const endOffset = itemOffset + itemsPerPage;
    const sortedFarms = (farms || []).sort((a: IFarmData, b: IFarmData) =>
      sortFarms(a[farmsSortBy as string], b[farmsSortBy as string], sortDirection),
    );
    setCurrentItems(sortedFarms.slice(itemOffset, endOffset));
    setPageCount(Math.ceil(sortedFarms.length / itemsPerPage));
  }, [itemOffset, itemsPerPage, farms, sortDirection, farmsSortBy]);

  const sortFarms = (valueA: string, valueB: string, direction: SORT_DIRECTION) => {
    const valueABN = new BigNumber(valueA);
    const valueBBN = new BigNumber(valueB);

    return direction === SORT_DIRECTION.ASC
      ? Number(valueABN.minus(valueBBN))
      : Number(valueBBN.minus(valueABN));
  };

  const getSortIcon = (option: SORT_OPTIONS) => {
    const icon = <Icon name={`arrow-${sortDirection === SORT_DIRECTION.ASC ? 'up' : 'down'}`} />;

    return option === farmsSortBy ? icon : null;
  };

  const haveFarms = farms.length > 0;

  return connected && !isHashpackLoading ? (
    showFarmDetails ? (
      <FarmDetails
        setShowFarmDetails={setShowFarmDetails}
        farmData={currentItems[currentFarmIndex]}
      />
    ) : (
      <div className="d-flex justify-content-center">
        <div className="container-max-with-1042">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div className="d-flex">
              <h2 className={`text-subheader tab-title is-active mx-4 `}>Farms</h2>
            </div>
          </div>

          <hr />

          {loadingFarms ? (
            <p className="text-info">Loading farms...</p>
          ) : haveFarms ? (
            <>
              <div className="table-pools">
                <div className={`table-pools-row with-6-columns-farms`}>
                  <div className="table-pools-cell">
                    <span className="text-small">#</span>
                  </div>
                  <div className="table-pools-cell">
                    <span className="text-small">Pair Name</span>
                  </div>
                  <div
                    className="table-pools-cell justify-content-end"
                    onClick={() => handleSortClick(SORT_OPTIONS_ENUM.TOTAL_STAKED)}
                  >
                    <span className="text-small ws-no-wrap">
                      Total Staked {getSortIcon(SORT_OPTIONS_ENUM.TOTAL_STAKED)}
                    </span>
                  </div>
                  <div
                    className="table-pools-cell justify-content-end"
                    onClick={() => handleSortClick(SORT_OPTIONS_ENUM.APR)}
                  >
                    <span className="text-small ws-no-wrap">
                      Total APR {getSortIcon(SORT_OPTIONS_ENUM.APR)}
                    </span>
                  </div>
                  <div className="table-pools-cell justify-content-end">
                    <span className="text-small ws-no-wrap">Your Stake</span>
                  </div>
                  <div className="table-pools-cell justify-content-end">
                    <span className="text-small">Closed Campaigns</span>
                  </div>
                </div>

                <>
                  {currentItems.map((item, index) => (
                    <FarmRow
                      key={index}
                      index={index}
                      farmData={item}
                      handleRowClick={handleRowClick}
                      setCurrentFarmIndex={setCurrentFarmIndex}
                    />
                  ))}
                </>
              </div>

              <div className="d-flex justify-content-center mt-4">
                <ReactPaginate
                  breakLabel="..."
                  onPageChange={handlePageClick}
                  pageRangeDisplayed={5}
                  pageCount={pageCount}
                  renderOnZeroPageCount={undefined}
                  breakClassName={'page-item'}
                  breakLinkClassName={'page-link'}
                  containerClassName={'pagination'}
                  pageClassName={'page-item'}
                  pageLinkClassName={'page-link'}
                  previousClassName={'page-item'}
                  previousLinkClassName={'page-link'}
                  nextClassName={'page-item'}
                  nextLinkClassName={'page-link'}
                  activeClassName={'active'}
                />
              </div>
            </>
          ) : (
            <div className="text-center mt-8">
              <p className="text-small">There are no active farms at this moment</p>
            </div>
          )}
        </div>
      </div>
    )
  ) : (
    <div className="text-center mt-8">
      <p>Active Yeild farming campaigns will appear here.</p>
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

export default Farms;
