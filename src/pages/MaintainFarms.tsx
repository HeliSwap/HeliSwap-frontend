import React, { useEffect, useState } from 'react';

import InputToken from '../components/InputToken';
import Button from '../components/Button';
import toast from 'react-hot-toast';
import FarmsSDK from '../sdk/farmsSdk';

const MaintainFarms = () => {
  const [farmsSDK, setFarmsSDK] = useState({} as FarmsSDK);

  //Initialize farms SDK
  useEffect(() => {
    const farmsSDK = new FarmsSDK();
    setFarmsSDK(farmsSDK);
  }, []);

  return (
    <div className="m-4">
      <div className="d-flex justify-content-center">Deploy new farm</div>
      <DeployFarm farmsSDK={farmsSDK} />
      <hr />

      <div className="d-flex justify-content-center">Enable reward</div>
      <EnableReward farmsSDK={farmsSDK} />
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
    try {
      const farmAddress = await farmsSDK.deployFarm(tokenAddress, setLoadingDeploy);

      setNewFarmAddress(farmAddress as string);
      setTokenAddress('');
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="m-4">
      <div className="d-flex justify-content-end m-4">
        <span className="m-4">Staking token address</span>
        <InputToken
          value={tokenAddress}
          placeholder="Enter Token address"
          onChange={(e: any) => setTokenAddress(e.target.value)}
        />
      </div>
      <div className="d-flex justify-content-end m-4">
        <Button onClick={deployFarm} loading={loadingDeploy}>
          Deploy farm
        </Button>
      </div>
      {newFarmAddress ? <div>{`New farm deployed at address: ${newFarmAddress}`}</div> : null}
    </div>
  );
};

interface IEnableRewadProps {
  farmsSDK: FarmsSDK;
}
const EnableReward = ({ farmsSDK }: IEnableRewadProps) => {
  const [farmAddress, setFarmAddress] = useState<string>('');
  const [rewardAddress, setRewardAddress] = useState<string>('');
  const [duration, setDuration] = useState<number>(0);
  const [loadingEnableReward, setLoadingEnableReward] = useState<boolean>(false);

  const enableReward = async () => {
    try {
      await farmsSDK.enableReward(farmAddress, rewardAddress, duration, setLoadingEnableReward);
      setFarmAddress('');
      setRewardAddress('');
      setDuration(0);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="m-4">
      <div className="d-flex justify-content-end m-4">
        <span className="m-4">Farm address</span>
        <InputToken
          value={farmAddress}
          placeholder="Enter Farm address"
          onChange={(e: any) => setFarmAddress(e.target.value)}
        />
      </div>
      <div className="d-flex justify-content-end m-4">
        <span className="m-4">Reward address</span>
        <InputToken
          value={rewardAddress}
          placeholder="Enter Reward address"
          onChange={(e: any) => setRewardAddress(e.target.value)}
        />
      </div>
      <div className="d-flex justify-content-end m-4">
        <span className="m-4">Duration in seconds</span>
        <InputToken
          value={duration}
          placeholder="Enter duration"
          onChange={(e: any) => setDuration(e.target.value)}
        />
      </div>
      <div className="d-flex justify-content-end m-4">
        <Button onClick={enableReward} loading={loadingEnableReward}>
          Enable reward
        </Button>
      </div>
    </div>
  );
};

export default MaintainFarms;
