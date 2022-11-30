import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { GlobalContext } from '../providers/Global';

import FarmsSDK from '../sdk/farmsSdk';

import ToasterWrapper from '../components/ToasterWrapper';

import Loader from '../components/Loader';
import FarmRow from '../components/FarmRow';
import DeployFarm from '../components/DeployFarm';

import useFarms from '../hooks/useFarms';
import usePoolsByTokensList from '../hooks/usePoolsByTokensList';

import { useQueryOptionsPoolsFarms } from '../constants';

const MaintainFarms = () => {
  // Context values
  const contextValue = useContext(GlobalContext);
  const { tokensWhitelisted } = contextValue;

  //Hooks
  const tokensWhitelistedAddresses = tokensWhitelisted.map(item => item.address) || [];
  const { poolsByTokenList: pools } = usePoolsByTokensList(
    useQueryOptionsPoolsFarms,
    true,
    tokensWhitelistedAddresses,
  );
  const navigate = useNavigate();

  // State
  const { farms, processingFarms } = useFarms(useQueryOptionsPoolsFarms, '', pools);
  const [farmsSDK, setFarmsSDK] = useState({} as FarmsSDK);

  // Handlers
  const handleRowClick = (farmAddress: string) => {
    navigate(`/maintain-farms/${farmAddress}`);
  };

  //Initialize farms SDK
  useEffect(() => {
    const farmsSDK = new FarmsSDK();
    setFarmsSDK(farmsSDK);
  }, []);

  const haveFarms = farms.length > 0;
  return (
    <div className="d-flex justify-content-center">
      <div className="container-max-with-1042">
        <div className="mb-4">
          <div className="d-flex">
            <h2 className={`text-subheader tab-title is-active mx-4 `}>Manage Farms</h2>
          </div>
        </div>

        <hr />

        <DeployFarm farmsSDK={farmsSDK} />

        <hr />

        {processingFarms ? (
          <div className="d-flex justify-content-center my-6">
            <Loader />
          </div>
        ) : haveFarms ? (
          <>
            <div className="table-pools">
              <div className={`d-none d-md-grid table-pools-row with-5-columns-farms`}>
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
                  <span className="text-small">Campaign Status</span>
                </div>
              </div>

              <>
                {farms.map((item, index) => (
                  <FarmRow
                    key={index}
                    index={index}
                    farmData={item}
                    handleRowClick={handleRowClick}
                  />
                ))}
              </>
            </div>
          </>
        ) : (
          <div className="text-center mt-8">
            <p className="text-small">There are no active farms at this moment</p>
          </div>
        )}
        <ToasterWrapper />
      </div>
    </div>
  );
};

export default MaintainFarms;
