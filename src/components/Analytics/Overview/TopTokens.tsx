import { useEffect, useState } from 'react';

import BigNumber from 'bignumber.js';
import ReactPaginate from 'react-paginate';

import { ITokenDataAnalytics } from '../../../interfaces/tokens';

import Icon from '../../Icon';
import IconToken from '../../IconToken';

import { formatStringToPrice, formatStringToPriceWithPrecision } from '../../../utils/numberUtils';

import {
  SORT_DIRECTION,
  SORT_OPTIONS,
  SORT_OPTIONS_ENUM,
  TOKENS_PER_PAGE,
} from '../../../constants';

interface ITopTokensProps {
  tokens: ITokenDataAnalytics[];
}

const TopTokens = ({ tokens }: ITopTokensProps) => {
  const [offset, setOffset] = useState(0);
  const [currentItems, setCurrentItems] = useState<any[]>([]);
  const [sortBy, setSortBy] = useState<SORT_OPTIONS>(SORT_OPTIONS_ENUM.TVL);
  const [sortDirection, setSortDirection] = useState<SORT_DIRECTION>(SORT_DIRECTION.DESC);
  const [pageCount, setPageCount] = useState(0);

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
    const newOffset = (event.selected * TOKENS_PER_PAGE) % tokens.length;
    setOffset(newOffset);
  };

  const getSortIcon = (option: SORT_OPTIONS) => {
    const icon = <Icon name={`arrow-${sortDirection === SORT_DIRECTION.ASC ? 'up' : 'down'}`} />;

    return option === sortBy ? icon : null;
  };

  useEffect(() => {
    const endOffset = offset + TOKENS_PER_PAGE;
    const sortedTokensToShow = (tokens || []).sort((a: any, b: any) =>
      sortTokens(a[sortBy as string], b[sortBy as string], sortDirection),
    );

    setCurrentItems(sortedTokensToShow.slice(offset, endOffset));
    setPageCount(Math.ceil(sortedTokensToShow.length / TOKENS_PER_PAGE));
  }, [offset, sortBy, sortDirection, tokens]);

  // Helpers
  const sortTokens = (valueA: string, valueB: string, direction: SORT_DIRECTION) => {
    const valueABN = new BigNumber(valueA);
    const valueBBN = new BigNumber(valueB);

    return direction === SORT_DIRECTION.ASC
      ? Number(valueABN.minus(valueBBN))
      : Number(valueBBN.minus(valueABN));
  };

  const haveTokens = currentItems.length;

  return haveTokens ? (
    <>
      <div className="table-pools">
        <div className="d-none d-md-grid table-pools-row with-4-columns">
          <div className="table-pools-cell">#</div>
          <div className="table-pools-cell">Name</div>
          <div
            className="table-pools-cell justify-content-end"
            // onClick={() => handleSortClick(SORT_OPTIONS_ENUM.)}
          >
            Price
          </div>
          {/* <div
            className="table-pools-cell justify-content-end ws-no-wrap"
            onClick={() => handleSortClick(SORT_OPTIONS_ENUM.VOL_24)}
          >
            Volume 24H
            {getSortIcon(SORT_OPTIONS_ENUM.VOL_24)}
          </div> */}
          <div
            className="table-pools-cell justify-content-end"
            onClick={() => handleSortClick(SORT_OPTIONS_ENUM.TVL)}
          >
            <span>TVL {getSortIcon(SORT_OPTIONS_ENUM.TVL)}</span>
          </div>
        </div>

        {currentItems && currentItems.length
          ? currentItems.map((token: ITokenDataAnalytics, index: number) => {
              const tokenNum = index + 1;
              return (
                <div key={token.address} className="table-pools-row no-pointer with-4-columns">
                  <div className="d-none d-md-flex table-pools-cell">
                    <span className="text-small">{tokenNum + offset}</span>
                  </div>
                  <div className="table-pools-cell">
                    <IconToken symbol={token.symbol} />
                    <p className="text-small ms-3">
                      <span className="me-2">{token.name}</span>
                      <span className="text-gray">({token.symbol})</span>
                    </p>
                  </div>
                  <div className="table-pools-cell justify-content-between justify-content-md-end">
                    <span className="d-md-none text-small">Price</span>
                    <span className="text-numeric">
                      {formatStringToPriceWithPrecision(token.price || '')}
                    </span>
                  </div>
                  <div className="table-pools-cell justify-content-between justify-content-md-end">
                    <span className="d-md-none text-small">TVL</span>
                    <span className="text-numeric">{formatStringToPrice(token.tvl || '')}</span>
                  </div>
                </div>
              );
            })
          : null}
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
    <p>There are no tokens at this moment.</p>
  );
};

export default TopTokens;
