import React, { useContext, useEffect, useState } from 'react';

import ReactPaginate from 'react-paginate';

import { GlobalContext } from '../providers/Global';

import { IFarmData } from '../interfaces/tokens';

import FarmDetails from '../components/FarmDetails';
import FarmRow from '../components/FarmRow';

import useFarms from '../hooks/useFarms';
import usePoolsByTokensList from '../hooks/usePoolsByTokensList';

import { useQueryOptions, useQueryOptionsPolling } from '../constants';

interface IFarmsProps {
  itemsPerPage: number;
}

const Farms = ({ itemsPerPage }: IFarmsProps) => {
  const contextValue = useContext(GlobalContext);
  const { tokensWhitelisted } = contextValue;

  const tokensWhitelistedAddresses = tokensWhitelisted.map(item => item.address) || [];

  const [currentItems, setCurrentItems] = useState<IFarmData[]>([]);
  const [pageCount, setPageCount] = useState(0);
  const [itemOffset, setItemOffset] = useState(0);
  const [currentFarmIndex, setCurrentFarmIndex] = useState(0);
  const [showFarmDetails, setShowFarmDetails] = useState(false);

  const { poolsByTokenList: pools } = usePoolsByTokensList(
    useQueryOptionsPolling,
    true,
    tokensWhitelistedAddresses,
  );

  const { farms } = useFarms(useQueryOptions, pools);

  // Handlers
  const handlePageClick = (event: any) => {
    const newOffset = (event.selected * itemsPerPage) % farms.length;
    setItemOffset(newOffset);
  };

  const handleRowClick = () => {
    setShowFarmDetails(prev => !prev);
  };

  useEffect(() => {
    const endOffset = itemOffset + itemsPerPage;

    setCurrentItems(farms.slice(itemOffset, endOffset));
    setPageCount(Math.ceil(farms.length / itemsPerPage));
  }, [itemOffset, itemsPerPage, farms]);

  const haveFarms = farms.length > 0;

  return showFarmDetails ? (
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

        {haveFarms ? (
          <>
            <div className="table-pools">
              <div className={`table-pools-row with-6-columns-farms`}>
                <div className="table-pools-cell">
                  <span className="text-small">#</span>
                </div>
                <div className="table-pools-cell">
                  <span className="text-small">Pair Name</span>
                </div>
                <div className="table-pools-cell justify-content-end">
                  <span className="text-small ws-no-wrap">Total Staked</span>
                </div>
                <div className="table-pools-cell justify-content-end">
                  <span className="text-small ws-no-wrap">Total APR</span>
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
        ) : null}
      </div>
    </div>
  );
};

export default Farms;
