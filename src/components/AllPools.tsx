import React, { useEffect, useState } from 'react';
import ReactPaginate from 'react-paginate';
import BigNumber from 'bignumber.js';

import Icon from './Icon';
import PoolInfo from './PoolInfo';
import Loader from './Loader';

import { IPoolExtendedData, IPoolsAnalytics } from '../interfaces/tokens';
import { PageViews } from '../interfaces/common';

import PoolsAnalytics from './Analytics/PoolsAnalytics';

import { SORT_DIRECTION, SORT_OPTIONS, SORT_OPTIONS_ENUM } from '../constants/index';

interface IAllPoolsProps {
  loadingPools: boolean;
  pools: IPoolExtendedData[];
  itemsPerPage: number;
  currentView: PageViews;
  renderEmptyPoolsState: (message: string) => any;
  setShowRemoveContainer: React.Dispatch<React.SetStateAction<boolean>>;
  setCurrentPoolAddress: React.Dispatch<React.SetStateAction<string>>;
  poolsAnalytics: IPoolsAnalytics;
}

const AllPools = ({
  loadingPools,
  itemsPerPage,
  pools,
  currentView,
  renderEmptyPoolsState,
  setShowRemoveContainer,
  setCurrentPoolAddress,
  poolsAnalytics,
}: IAllPoolsProps) => {
  const [collapseAll, setCollapseAll] = useState<boolean>(false);
  const [sortDirection, setSortDirection] = useState<SORT_DIRECTION>(SORT_DIRECTION.DESC);
  const [poolsSortBy, setPoolsSortBy] = useState<SORT_OPTIONS>(SORT_OPTIONS_ENUM.TVL);

  const [currentItems, setCurrentItems] = useState<IPoolExtendedData[]>([]);
  const [pageCount, setPageCount] = useState(0);
  const [itemOffset, setItemOffset] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);

  const handleSortClick = (sortBy: SORT_OPTIONS) => {
    setCollapseAll(true);

    if (sortBy === poolsSortBy) {
      setSortDirection(
        sortDirection === SORT_DIRECTION.ASC ? SORT_DIRECTION.DESC : SORT_DIRECTION.ASC,
      );
    } else {
      setPoolsSortBy(sortBy);
    }
  };

  const getSortIcon = (option: SORT_OPTIONS) => {
    const icon = <Icon name={`arrow-${sortDirection === SORT_DIRECTION.ASC ? 'up' : 'down'}`} />;

    return option === poolsSortBy ? icon : null;
  };

  const sortPools = (valueA: string, valueB: string, direction: SORT_DIRECTION) => {
    const valueABN = new BigNumber(valueA);
    const valueBBN = new BigNumber(valueB);

    return direction === SORT_DIRECTION.ASC
      ? Number(valueABN.minus(valueBBN))
      : Number(valueBBN.minus(valueABN));
  };

  useEffect(() => {
    const endOffset = itemOffset + itemsPerPage;
    const sortedPoolsToShow = (pools || []).sort((a: IPoolExtendedData, b: IPoolExtendedData) =>
      sortPools(a[poolsSortBy as string], b[poolsSortBy as string], sortDirection),
    );

    if (pools.length < itemOffset) {
      setCurrentItems(sortedPoolsToShow.slice(0, itemsPerPage));
      setCurrentPage(0);
      setItemOffset(0);
    } else {
      setCurrentItems(sortedPoolsToShow.slice(itemOffset, endOffset));
    }
    setPageCount(Math.ceil(sortedPoolsToShow.length / itemsPerPage));
  }, [itemOffset, itemsPerPage, poolsSortBy, sortDirection, pools]);

  const handlePageClick = (event: any) => {
    setCollapseAll(true);
    setCurrentPage(event.selected);

    const newOffset = (event.selected * itemsPerPage) % pools.length;
    setItemOffset(newOffset);
  };

  const havePools = currentItems.length > 0;

  return loadingPools ? (
    <div className="d-flex justify-content-center my-6">
      <Loader />
    </div>
  ) : havePools ? (
    <>
      <PoolsAnalytics poolsAnalytics={poolsAnalytics} />

      <div className="table-pools">
        <div className={`d-none d-md-grid table-pools-row with-6-columns`}>
          <div className="table-pools-cell">
            <span className="text-small">#</span>
          </div>
          <div className="table-pools-cell">
            <span className="text-small">Pool</span>
          </div>
          <div
            className="table-pools-cell justify-content-end"
            onClick={() => handleSortClick(SORT_OPTIONS_ENUM.TVL)}
          >
            <span className="text-small ws-no-wrap">TVL {getSortIcon(SORT_OPTIONS_ENUM.TVL)}</span>
          </div>
          <div
            className="table-pools-cell justify-content-end"
            onClick={() => handleSortClick(SORT_OPTIONS_ENUM.VOL_24)}
          >
            <span className="text-small ws-no-wrap">
              Volume 24h {getSortIcon(SORT_OPTIONS_ENUM.VOL_24)}
            </span>
          </div>
          <div
            className="table-pools-cell justify-content-end"
            onClick={() => handleSortClick(SORT_OPTIONS_ENUM.VOL_7)}
          >
            <span className="text-small ws-no-wrap">
              Volume 7d {getSortIcon(SORT_OPTIONS_ENUM.VOL_7)}
            </span>
          </div>
          <div className="table-pools-cell justify-content-end">
            <span className="text-small"></span>
          </div>
        </div>

        <>
          {currentItems.map((item, index) => (
            <PoolInfo
              setShowRemoveContainer={setShowRemoveContainer}
              setCurrentPoolAddress={setCurrentPoolAddress}
              index={index + itemOffset}
              key={index}
              poolData={item}
              view={currentView}
              collapseAll={collapseAll}
              setCollapseAll={setCollapseAll}
            />
          ))}
        </>
      </div>

      <div className="d-flex justify-content-center mt-4">
        <ReactPaginate
          forcePage={currentPage}
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
    renderEmptyPoolsState('There are no active pools at this moment.')
  );
};

export default AllPools;
