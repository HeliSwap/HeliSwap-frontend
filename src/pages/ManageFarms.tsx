import { useState, useContext, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import ReactPaginate from 'react-paginate';
import toast from 'react-hot-toast';
import BigNumber from 'bignumber.js';

import { GlobalContext } from '../providers/Global';

import { IFarmData } from '../interfaces/tokens';

import Button from '../components/Button';
import Loader from '../components/Loader';
import FarmRow from '../components/FarmRow';
import ToasterWrapper from '../components/ToasterWrapper';
import Icon from '../components/Icon';

import usePools from '../hooks/usePoolsWithoutFarms';
import usePoolsByTokensList from '../hooks/usePoolsByTokensList';
import useFarms from '../hooks/usePermissionlessFarms';

import {
  SORT_DIRECTION,
  SORT_OPTIONS,
  SORT_OPTIONS_ENUM,
  useQueryOptionsPoolsFarms,
  useQueryOptionsPoolsWithoutFarms,
} from '../constants';

import getErrorMessage from '../content/errors';

interface IManageFarmsProps {
  itemsPerPage: number;
}

const ManageFarms = ({ itemsPerPage }: IManageFarmsProps) => {
  const contextValue = useContext(GlobalContext);
  const { connection, sdk, tokensWhitelisted } = contextValue;
  const { userId, connectorInstance, isHashpackLoading, setShowConnectModal } = connection;
  const navigate = useNavigate();

  const tokensWhitelistedAddresses = tokensWhitelisted.map(item => item.address) || [];

  // Get pools withouth farms - usePoolWithouthFarms with minimum liquidity
  const { pools: poolsWithouthFarms, loading: loadingPools } = usePools(
    useQueryOptionsPoolsWithoutFarms,
  );

  const { poolsByTokenList: pools } = usePoolsByTokensList(
    useQueryOptionsPoolsFarms,
    true,
    tokensWhitelistedAddresses,
  );

  // Get all perimissionless farms - usePermissionlessFarms
  const { farms, processingFarms } = useFarms(useQueryOptionsPoolsFarms, userId, pools);

  const [tokenAddresses, setTokenAddress] = useState('');

  const [loadingFarmDeploy, setLoadingFarmDeploy] = useState(false);
  const [currentItems, setCurrentItems] = useState<IFarmData[]>([]);
  const [pageCount, setPageCount] = useState(0);
  const [itemOffset, setItemOffset] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [sortDirection, setSortDirection] = useState<SORT_DIRECTION>(SORT_DIRECTION.DESC);
  const [farmsSortBy, setFarmsSortby] = useState<SORT_OPTIONS>(SORT_OPTIONS_ENUM.APR);

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

  // Events
  const handlePageClick = (event: any) => {
    const newOffset = (event.selected * itemsPerPage) % farms.length;

    setCurrentPage(event.selected);
    setItemOffset(newOffset);
  };

  const handleRowClick = (farmAddress: string) => {
    navigate(`/manage-permissionless-farms/${farmAddress}`);
  };

  const handlePoolSelectChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setTokenAddress(event.target.value);
  };

  const handleDeployFarmButtonClick = async () => {
    setLoadingFarmDeploy(true);

    try {
      const receipt = await sdk.deployFarm(connectorInstance, tokenAddresses, userId);
      const {
        response: { success, error },
      } = receipt;

      if (!success) {
        toast.error(getErrorMessage(error.status ? error.status : error));
      } else {
        toast.success('Success! Campaign is deployed. Please wait few seconds to see the farm.');
      }
    } catch (error) {
      console.log('error', error);
    } finally {
      setLoadingFarmDeploy(false);
    }
  };

  const handleSortClick = (sortBy: SORT_OPTIONS) => {
    if (sortBy === farmsSortBy) {
      setSortDirection(
        sortDirection === SORT_DIRECTION.ASC ? SORT_DIRECTION.DESC : SORT_DIRECTION.ASC,
      );
    } else {
      setFarmsSortby(sortBy);
    }
  };

  const getSortIcon = (option: SORT_OPTIONS) => {
    const icon = <Icon name={`arrow-${sortDirection === SORT_DIRECTION.ASC ? 'up' : 'down'}`} />;

    return option === farmsSortBy ? icon : null;
  };

  useEffect(() => {
    const endOffset = itemOffset + itemsPerPage;

    let sortedFarms: IFarmData[];

    sortedFarms = [...farms].sort((a: IFarmData, b: IFarmData) => sortFarms(a, b, sortDirection));

    if (sortedFarms.length < itemOffset) {
      setCurrentItems(sortedFarms.slice(0, itemsPerPage));
      setCurrentPage(0);
      setItemOffset(0);
    } else {
      setCurrentItems(sortedFarms.slice(itemOffset, endOffset));
    }
    setPageCount(Math.ceil(sortedFarms.length / itemsPerPage));
  }, [itemOffset, itemsPerPage, farms, sortDirection, farmsSortBy, sortFarms]);

  return (
    <div className="d-flex justify-content-center">
      <div className="container-max-with-1042">
        <div className="mb-4">
          <div className="d-flex">
            <h2 className={`text-subheader tab-title is-active mx-4 `}>
              Manage Permissionless Farms
            </h2>
          </div>
        </div>

        <hr />

        <div className="mb-4">
          <p className="text-small">
            Creating a permissionless farm is a multi step process.
            <br />
            First you need to choose a pool without a farm. Then you need to deploy a farm contract.
            <br />
            After that select a farm to set a duration and sent rewards.
          </p>
        </div>

        {!isHashpackLoading && userId ? (
          <>
            <div className="d-flex align-items-center">
              {loadingPools ? (
                <p className="text-small">Loading pools...</p>
              ) : (
                <select onChange={handlePoolSelectChange} className="form-control" name="" id="">
                  {poolsWithouthFarms.length > 0 ? (
                    <>
                      <option>Please select pool</option>
                      {poolsWithouthFarms.map((pool, index) => (
                        <option key={index} value={`${pool.token0},${pool.token1}`}>
                          {pool.token0Name}/{pool.token1Name}
                        </option>
                      ))}
                    </>
                  ) : (
                    <option>There are no pools without farm</option>
                  )}
                </select>
              )}

              <Button
                disabled={!tokenAddresses}
                loading={loadingFarmDeploy}
                className="ws-no-wrap ms-3"
                onClick={handleDeployFarmButtonClick}
              >
                Deploy farm
              </Button>
            </div>

            <hr />

            <div>
              {processingFarms ? (
                <div className="d-flex justify-content-center align-items-center">
                  <Loader />
                </div>
              ) : currentItems.length > 0 ? (
                <>
                  <div className="table-pools">
                    <div className={`d-none d-md-grid table-pools-row with-6-columns-farms`}>
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
                      <div className="table-pools-cell">
                        <span className="text-small">Rewards</span>
                      </div>
                      <div className="table-pools-cell justify-content-end">
                        <span className="text-small">Status</span>
                      </div>
                    </div>
                    {currentItems.map((farm, index) => (
                      <FarmRow
                        key={index}
                        farmData={farm}
                        index={0}
                        handleRowClick={() => handleRowClick(farm.address)}
                        showUserStaked={false}
                      />
                    ))}
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
                <p className="text-small">No farms...</p>
              )}
            </div>
          </>
        ) : (
          <div className="text-center mt-8">
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
        )}
      </div>
      <ToasterWrapper />
    </div>
  );
};

export default ManageFarms;
