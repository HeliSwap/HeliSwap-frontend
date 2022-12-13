import React, { useEffect, useState } from 'react';
import ReactPaginate from 'react-paginate';
import BigNumber from 'bignumber.js';

import PoolInfo from './PoolInfo';
import Button from './Button';
import Loader from './Loader';

import { IPoolExtendedData } from '../interfaces/tokens';
import { PageViews } from '../interfaces/common';

import { SORT_DIRECTION, SORT_OPTIONS_ENUM } from '../constants/index';

interface IMyPoolsProps {
  loadingPools: boolean;
  havePools: boolean;
  pools: IPoolExtendedData[];
  itemsPerPage: number;
  currentView: PageViews;
  connected: boolean;
  isHashpackLoading: boolean;
  renderEmptyPoolsState: (message: string) => any;
  setShowConnectModal: (show: boolean) => void;
  setShowRemoveContainer: React.Dispatch<React.SetStateAction<boolean>>;
  setCurrentPoolAddress: React.Dispatch<React.SetStateAction<string>>;
}

const MyPools = ({
  loadingPools,
  havePools,
  pools,
  itemsPerPage,
  currentView,
  connected,
  isHashpackLoading,
  renderEmptyPoolsState,
  setShowConnectModal,
  setShowRemoveContainer,
  setCurrentPoolAddress,
}: IMyPoolsProps) => {
  const [collapseAll, setCollapseAll] = useState<boolean>(false);

  const [currentItems, setCurrentItems] = useState<IPoolExtendedData[]>([]);
  const [pageCount, setPageCount] = useState(0);
  const [itemOffset, setItemOffset] = useState(0);

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
      sortPools(a[SORT_OPTIONS_ENUM.TVL], b[SORT_OPTIONS_ENUM.TVL], SORT_DIRECTION.DESC),
    );

    setCurrentItems(sortedPoolsToShow.slice(itemOffset, endOffset));
    setPageCount(Math.ceil(sortedPoolsToShow.length / itemsPerPage));
  }, [itemOffset, itemsPerPage, pools]);

  const handlePageClick = (event: any) => {
    setCollapseAll(true);

    const newOffset = (event.selected * itemsPerPage) % pools.length;
    setItemOffset(newOffset);
  };

  return connected && !isHashpackLoading ? (
    loadingPools ? (
      <div className="d-flex justify-content-center my-6">
        <Loader />
      </div>
    ) : havePools ? (
      <>
        <div className="table-pools">
          <div className={`d-none d-md-grid table-pools-row`}>
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
          <>
            {currentItems
              .sort((a: IPoolExtendedData, b: IPoolExtendedData) =>
                sortPools(a[SORT_OPTIONS_ENUM.TVL], b[SORT_OPTIONS_ENUM.TVL], SORT_DIRECTION.DESC),
              )
              .map((item, index) => (
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
      renderEmptyPoolsState('You don’t have active pools at this moment.')
    )
  ) : (
    <div className="text-center mt-8">
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

export default MyPools;
