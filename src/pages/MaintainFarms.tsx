import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import InputToken from '../components/InputToken';
import Button from '../components/Button';
import toast from 'react-hot-toast';
import FarmsSDK from '../sdk/farmsSdk';
import ToasterWrapper from '../components/ToasterWrapper';
import useFarms from '../hooks/useFarms';
import { useQueryOptionsPoolsFarms } from '../constants';
import usePoolsByTokensList from '../hooks/usePoolsByTokensList';
import { GlobalContext } from '../providers/Global';
import Loader from '../components/Loader';
import FarmRow from '../components/FarmRow';

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
    <div className="">
      <div className="container-max-with-1042">
        <div className="d-flex justify-content-center">Deploy new farm</div>
        <DeployFarm farmsSDK={farmsSDK} />
        <hr />
      </div>

      <div className="d-flex justify-content-center">
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
      </div>
      <ToasterWrapper />
    </div>
  );
};

interface IDeployFarmProps {
  farmsSDK: FarmsSDK;
}

const DeployFarm = ({ farmsSDK }: IDeployFarmProps) => {
  const [tokenAddress, setTokenAddress] = useState<string>('');
  const [newFarmAddress, setNewFarmAddress] = useState<string>('');
  const [loadingDeploy, setLoadingDeploy] = useState<boolean>(false);

  const deployFarm = async () => {
    setLoadingDeploy(true);
    try {
      const farmAddress = await farmsSDK.deployFarm(tokenAddress);

      setNewFarmAddress(farmAddress as string);
      setTokenAddress('');
      toast.success('Success! New farm was deployed.');
    } catch (error) {
      console.log(error);
      toast.error('Error while deploying farm');
    } finally {
      setLoadingDeploy(false);
    }
  };

  return (
    <div className="d-flex justify-content-end m-4">
      <div className="m-4">
        <span className="m-4">Staking token address</span>
        <InputToken
          value={tokenAddress}
          placeholder="Enter Token address"
          onChange={(e: any) => setTokenAddress(e.target.value)}
        />
      </div>
      <div className="m-4">
        <Button onClick={deployFarm} loading={loadingDeploy}>
          Deploy farm
        </Button>
      </div>
      {newFarmAddress ? <div>{`New farm deployed at address: ${newFarmAddress}`}</div> : null}
    </div>
  );
};

export default MaintainFarms;
