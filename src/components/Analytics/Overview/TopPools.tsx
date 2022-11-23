import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import ReactPaginate from 'react-paginate';
import BigNumber from 'bignumber.js';
import Tippy from '@tippyjs/react';

import { IPoolExtendedData } from '../../../interfaces/tokens';

import Icon from '../../Icon';

import { formatIcons } from '../../../utils/iconUtils';
import { formatStringToPrice } from '../../../utils/numberUtils';

import { generalFeesAndKeysWarning } from '../../../content/messages';

import {
  POOLS_FEE,
  POOLS_PER_PAGE,
  SORT_DIRECTION,
  SORT_OPTIONS,
  SORT_OPTIONS_ENUM,
} from '../../../constants';

interface ITopPoolsProps {
  error: any; //! TODO: ApolloError type?
  pools: IPoolExtendedData[];
}

const TopPools = ({ pools, error }: ITopPoolsProps) => {
  const [offset, setOffset] = useState(0);
  const [sortBy, setSortBy] = useState<SORT_OPTIONS>(SORT_OPTIONS_ENUM.TVL);
  const [currentItems, setCurrentItems] = useState<IPoolExtendedData[]>([]);
  const [sortDirection, setSortDirection] = useState<SORT_DIRECTION>(SORT_DIRECTION.DESC);
  const [pageCount, setPageCount] = useState(0);

  const navigate = useNavigate();

  // Handlers
  const handleSortClick = (_sortBy: SORT_OPTIONS) => {
    if (_sortBy === sortBy) {
      setSortDirection(
        sortDirection === SORT_DIRECTION.ASC ? SORT_DIRECTION.DESC : SORT_DIRECTION.ASC,
      );
    } else {
      setSortBy(_sortBy);
    }
  };

  const handlePageClick = (event: any) => {
    const newOffset = (event.selected * POOLS_PER_PAGE) % pools.length;
    setOffset(newOffset);
  };

  const getSortIcon = (option: SORT_OPTIONS) => {
    const icon = <Icon name={`arrow-${sortDirection === SORT_DIRECTION.ASC ? 'up' : 'down'}`} />;

    return option === sortBy ? icon : null;
  };

  useEffect(() => {
    const endOffset = offset + POOLS_PER_PAGE;
    const sortedPoolsToShow = (pools || []).sort((a: IPoolExtendedData, b: IPoolExtendedData) =>
      sortPools(a[sortBy as string], b[sortBy as string], sortDirection),
    );

    setCurrentItems(sortedPoolsToShow.slice(offset, endOffset));
    setPageCount(Math.ceil(sortedPoolsToShow.length / POOLS_PER_PAGE));
  }, [offset, sortBy, sortDirection, pools]);

  // Helpers
  const sortPools = (valueA: string, valueB: string, direction: SORT_DIRECTION) => {
    const valueABN = new BigNumber(valueA);
    const valueBBN = new BigNumber(valueB);

    return direction === SORT_DIRECTION.ASC
      ? Number(valueABN.minus(valueBBN))
      : Number(valueBBN.minus(valueABN));
  };

  if (error) {
    return (
      <div className="d-flex justify-content-center">
        <div className="alert alert-danger d-inline-flex align-items-center mt-5" role="alert">
          <Icon className="me-3 alert-icon" name="warning" color="danger" />
          <p className="alert-message">Something went wrong! Cannot get pools...</p>
        </div>
      </div>
    );
  }

  const havePools = currentItems.length;

  return havePools ? (
    <>
      <div className="table-pools">
        <div className="d-none d-md-grid table-pools-row with-5-columns">
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
        </div>

        {currentItems.map((pool: IPoolExtendedData, index) => {
          const poolNum = index + 1;
          return (
            <div
              onClick={() => navigate(`pool/${pool.pairAddress}`)}
              key={pool.id}
              className="table-pools-row with-5-columns"
            >
              <div className="d-none d-md-flex table-pools-cell">
                <span className="text-small">{poolNum + offset}</span>
              </div>
              <div className="table-pools-cell">
                {formatIcons([pool.token0Symbol, pool.token1Symbol])}
                <p className="text-small ms-3">
                  {pool.token0Symbol}/{pool.token1Symbol}
                </p>
                <span className="text-micro text-numeric badge bg-secondary-800 ms-3">
                  {POOLS_FEE}
                </span>

                {pool.hasProblematicToken ? (
                  <Tippy content={generalFeesAndKeysWarning}>
                    <span className="ms-3">
                      <Icon name="info" color="info" />
                    </span>
                  </Tippy>
                ) : null}
              </div>
              <div className="table-pools-cell justify-content-between justify-content-md-end">
                <span className="d-md-none text-small">TVL</span>
                <span className="text-small text-numeric">
                  {pool.tokensPriceEvaluated ? formatStringToPrice(pool.tvl) : 'N/A'}
                </span>
              </div>
              <div className="table-pools-cell justify-content-between justify-content-md-end">
                <span className="d-md-none text-small">Volume 24h</span>
                <span className="text-small text-numeric">
                  {pool.tokensPriceEvaluated ? formatStringToPrice(pool.volume24 || '') : 'N/A'}
                </span>
              </div>
              <div className="table-pools-cell justify-content-between justify-content-md-end">
                <span className="d-md-none text-small">Volume 7d</span>
                <span className="text-small text-numeric">
                  {pool.tokensPriceEvaluated ? formatStringToPrice(pool.volume7 || '') : 'N/A'}
                </span>
              </div>
            </div>
          );
        })}
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
    <p>There are no active pools at this moment.</p>
  );
};

export default TopPools;
