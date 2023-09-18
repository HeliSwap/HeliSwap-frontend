import { useState, useContext } from 'react';
import { Link } from 'react-router-dom';

import { GlobalContext } from '../providers/Global';

import Button from '../components/Button';
import Loader from '../components/Loader';

import { formatIcons } from '../utils/iconUtils';

import usePools from '../hooks/usePools';
import useFarms from '../hooks/useFarms';

import { useQueryOptionsPoolsFarms } from '../constants';

const ManageFarms = () => {
  const contextValue = useContext(GlobalContext);
  const { connection, sdk } = contextValue;
  const { userId, connectorInstance, isHashpackLoading, setShowConnectModal } = connection;

  // Get pools withouth farms - usePoolWithouthFarms
  const { pools: poolsWithouthFarms, loading: loadingPools } = usePools();

  // Get all perimissionless farms - usePermissionlessFarms
  const { farms, processingFarms } = useFarms(
    useQueryOptionsPoolsFarms,
    userId,
    poolsWithouthFarms,
  );

  const [tokenAddresses, setTokenAddress] = useState('');

  const [loadingFarmDeploy, setLoadingFarmDeploy] = useState(false);

  // Events
  const handlePoolSelectChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setTokenAddress(event.target.value);
  };

  const handleDeployFarmButtonClick = async () => {
    setLoadingFarmDeploy(true);

    try {
      const tx = await sdk.deployFarm(connectorInstance, tokenAddresses, userId);
      console.log('tx', tx);
    } catch (error) {
      console.log('error', error);
    } finally {
      setLoadingFarmDeploy(false);
    }
  };

  return (
    <div className="d-flex justify-content-center">
      <div className="container-max-with-1042">
        <div className="mb-4">
          <div className="d-flex">
            <h2 className={`text-subheader tab-title is-active mx-4 `}>Manage Farms</h2>
          </div>
        </div>

        <hr />

        {!isHashpackLoading && userId ? (
          <>
            <div className="d-flex align-items-center">
              {loadingPools ? (
                <p className="text-small">Loading pools...</p>
              ) : poolsWithouthFarms.length > 0 ? (
                <select onChange={handlePoolSelectChange} className="form-control" name="" id="">
                  <option>Please select pool</option>
                  {poolsWithouthFarms.map((pool, index) => (
                    <option key={index} value={`${pool.token0},${pool.token1}`}>
                      {pool.token0Name}/{pool.token1Name}
                    </option>
                  ))}
                </select>
              ) : (
                <p className="text-small">No pools...</p>
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
              ) : farms.length > 0 ? (
                <div>
                  {farms.map((farm, index) => (
                    <div key={index}>
                      <Link
                        className="link-primary d-flex align-items-center my-4"
                        to={`/manage-permissionless-farms/${farm.address}`}
                      >
                        {formatIcons([farm.poolData.token0Symbol, farm.poolData.token1Symbol])}
                        <span className="text-small ms-3">
                          {farm.poolData.token0Symbol}/{farm.poolData.token1Symbol}
                        </span>
                      </Link>
                    </div>
                  ))}
                </div>
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
    </div>
  );
};

export default ManageFarms;
