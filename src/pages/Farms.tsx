import React, { useContext, useEffect, useMemo, useState } from 'react';

import ReactPaginate from 'react-paginate';
import { useNavigate } from 'react-router-dom';

import { GlobalContext } from '../providers/Global';

import { IFarmData } from '../interfaces/tokens';

import FarmRow from '../components/FarmRow';
import Button from '../components/Button';
import Loader from '../components/Loader';

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

interface IFarmsProps {
  itemsPerPage: number;
}

const Farms = ({ itemsPerPage }: IFarmsProps) => {
  const contextValue = useContext(GlobalContext);
  const { tokensWhitelisted, connection } = contextValue;
  const { userId, isHashpackLoading, setShowConnectModal } = connection;
  const navigate = useNavigate();

  const tokensWhitelistedAddresses = tokensWhitelisted.map(item => item.address) || [];

  const [currentItems, setCurrentItems] = useState<IFarmData[]>([]);
  const [pageCount, setPageCount] = useState(0);
  const [itemOffset, setItemOffset] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [sortDirection] = useState<SORT_DIRECTION>(SORT_DIRECTION.DESC);
  const [farmsSortBy] = useState<SORT_OPTIONS>(SORT_OPTIONS_ENUM.APR);

  const { poolsByTokenList: pools } = usePoolsByTokensList(
    useQueryOptionsPolling,
    true,
    tokensWhitelistedAddresses,
  );

  const { farms, processingFarms } = useFarms(useQueryOptions, userId, pools);

  const sortFarms = useMemo(
    () => (farmA: IFarmData, farmB: IFarmData, direction: SORT_DIRECTION) => {
      const valueABN = new BigNumber(farmA[farmsSortBy]);
      const valueBBN = new BigNumber(farmB[farmsSortBy]);

      return direction === SORT_DIRECTION.ASC
        ? Number(valueABN.minus(valueBBN))
        : Number(valueBBN.minus(valueABN));
    },
    [farmsSortBy],
  );

  // Handlers
  const handlePageClick = (event: any) => {
    const newOffset = (event.selected * itemsPerPage) % farms.length;

    setCurrentPage(event.selected);
    setItemOffset(newOffset);
  };

  const handleRowClick = (farmAddress: string) => {
    navigate(`/farms/${farmAddress}`);
  };

  useEffect(() => {
    const endOffset = itemOffset + itemsPerPage;

    const userCampaigns: IFarmData[] = [];
    const otherCampaigns: IFarmData[] = [];

    ([...farms] || []).forEach((farm: IFarmData) => {
      if (Number(farm.userStakingData.stakedAmount) !== 0) {
        userCampaigns.push(farm);
      } else {
        otherCampaigns.push(farm);
      }
    });

    const sortedUserCampaigns = [...userCampaigns].sort((a: IFarmData, b: IFarmData) =>
      sortFarms(a, b, sortDirection),
    );

    const sortedOtherCampaigns = [...otherCampaigns].sort((a: IFarmData, b: IFarmData) =>
      sortFarms(a, b, sortDirection),
    );
    const sortedFarms = sortedUserCampaigns.concat(sortedOtherCampaigns);

    setCurrentItems(sortedFarms.slice(itemOffset, endOffset));
    setPageCount(Math.ceil(sortedFarms.length / itemsPerPage));
  }, [itemOffset, itemsPerPage, farms, sortDirection, farmsSortBy, sortFarms]);

  const haveFarms = farms.length > 0;

  return !isHashpackLoading ? (
    <div className="d-flex justify-content-center">
      <div className="container-max-with-1042">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div className="d-flex">
            <h2 className={`text-subheader tab-title is-active mx-4 `}>Farms</h2>
          </div>
        </div>

        <hr />

        {processingFarms ? (
          <div className="d-flex justify-content-center my-6">
            <Loader />
          </div>
        ) : haveFarms ? (
          <>
            <div className="table-pools">
              <div className={`table-pools-row with-${userId ? '6' : '5'}-columns-farms`}>
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
                {userId ? (
                  <div className="table-pools-cell justify-content-end">
                    <span className="text-small ws-no-wrap">Your Stake</span>
                  </div>
                ) : null}
                <div className="table-pools-cell justify-content-end">
                  <span className="text-small">Campaign Status</span>
                </div>
              </div>

              <>
                {currentItems.map((item, index) => (
                  <FarmRow
                    key={index}
                    index={index + itemOffset}
                    farmData={item}
                    handleRowClick={handleRowClick}
                  />
                ))}
              </>
            </div>

            <div className="d-flex justify-content-center mt-4">
              <ReactPaginate
                forcePage={pageCount > 1 ? currentPage : -1}
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
  ) : (
    <div className="text-center mt-8">
      <p>Active Yield farming campaigns will appear here.</p>
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
