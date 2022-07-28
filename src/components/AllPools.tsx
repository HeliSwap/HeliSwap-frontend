import React, { useEffect, useState } from 'react';

import ReactPaginate from 'react-paginate';
import BigNumber from 'bignumber.js';

import Icon from './Icon';

import { IPoolExtendedData } from '../interfaces/tokens';
import { PageViews } from '../interfaces/common';
import { SORT_DIRECTION, SORT_OPTIONS, SORT_OPTIONS_ENUM } from '../constants/index';

import PoolInfo from './PoolInfo';

interface IAllPoolsProps {
  loadingPools: boolean;
  havePools: boolean;
  pools: IPoolExtendedData[];
  itemsPerPage: number;
  currentView: PageViews;
  renderEmptyPoolsState: (message: string) => any;
  setShowRemoveContainer: React.Dispatch<React.SetStateAction<boolean>>;
  setCurrentPoolIndex: React.Dispatch<React.SetStateAction<number>>;
}

const AllPools = ({
  loadingPools,
  havePools,
  itemsPerPage,
  pools,
  currentView,
  renderEmptyPoolsState,
  setShowRemoveContainer,
  setCurrentPoolIndex,
}: IAllPoolsProps) => {
  const [collapseAll, setCollapseAll] = useState<boolean>(false);
  const [sortDirection, setSortDirection] = useState<SORT_DIRECTION>(SORT_DIRECTION.DESC);
  const [poolsSortBy, setPoolsSortBy] = useState<SORT_OPTIONS>(SORT_OPTIONS_ENUM.TVL);

  const [currentItems, setCurrentItems] = useState<IPoolExtendedData[]>([]);
  const [pageCount, setPageCount] = useState(0);
  const [itemOffset, setItemOffset] = useState(0);

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
    const icon =
      sortDirection === SORT_DIRECTION.ASC ? <Icon name="arrow-up" /> : <Icon name="arrow-down" />;
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
    // Fetch items from another resources.
    const endOffset = itemOffset + itemsPerPage;
    const sortedPoolsToShow = (pools || []).sort((a: IPoolExtendedData, b: IPoolExtendedData) =>
      sortPools(a[poolsSortBy as string], b[poolsSortBy as string], sortDirection),
    );
    setCurrentItems(sortedPoolsToShow.slice(itemOffset, endOffset));
    setPageCount(Math.ceil(sortedPoolsToShow.length / itemsPerPage));
  }, [itemOffset, itemsPerPage, poolsSortBy, sortDirection, pools]);

  // Invoke when user click to request another page.
  const handlePageClick = (event: any) => {
    setCollapseAll(true);

    const newOffset = (event.selected * itemsPerPage) % pools.length;
    setItemOffset(newOffset);
  };

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
        <div
          className="table-pools-cell justify-content-end"
          onClick={() => handleSortClick(SORT_OPTIONS_ENUM.TVL)}
        >
          <span className="text-small ws-no-wrap">TVL {getSortIcon(SORT_OPTIONS_ENUM.TVL)}</span>
        </div>
        <div
          className="table-pools-cell justify-content-end"
          onClick={() => handleSortClick(SORT_OPTIONS_ENUM.VOL_7)}
        >
          <span className="text-small ws-no-wrap">
            Volume 7d {getSortIcon(SORT_OPTIONS_ENUM.VOL_7)}
          </span>
        </div>
        <div
          className="table-pools-cell justify-content-end"
          onClick={() => handleSortClick(SORT_OPTIONS_ENUM.VOL_24)}
        >
          <span className="text-small ws-no-wrap">
            Volume 24h {getSortIcon(SORT_OPTIONS_ENUM.VOL_24)}
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
            setCurrentPoolIndex={setCurrentPoolIndex}
            index={index}
            key={index}
            poolData={item}
            view={currentView}
            collapseAll={collapseAll}
            setCollapseAll={setCollapseAll}
          />
        ))}
        <ReactPaginate
          breakLabel="..."
          nextLabel="next >"
          onPageChange={handlePageClick}
          pageRangeDisplayed={5}
          pageCount={pageCount}
          previousLabel="< previous"
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
      </>
    </div>
  ) : (
    renderEmptyPoolsState('There are no active pools at this moment.')
  );
};

export default AllPools;
