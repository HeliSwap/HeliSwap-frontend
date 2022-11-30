import React, { useState } from 'react';

import Button from '../components/Button';
import toast from 'react-hot-toast';
import FarmsSDK from '../sdk/farmsSdk';

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
    <div className="m-4">
      <h2 className={`text-main mb-3`}>Deploy new farm</h2>
      <div className="d-flex align-items-center">
        <input
          className="form-control"
          value={tokenAddress}
          placeholder="Staking token address"
          onChange={(e: any) => setTokenAddress(e.target.value)}
        />
        <Button className="ms-3" onClick={deployFarm} loading={loadingDeploy}>
          Deploy
        </Button>
      </div>
      {newFarmAddress ? <div>{`New farm deployed at address: ${newFarmAddress}`}</div> : null}
    </div>
  );
};

export default DeployFarm;
