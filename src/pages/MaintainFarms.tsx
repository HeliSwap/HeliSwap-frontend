import React, { useState } from 'react';

import InputToken from '../components/InputToken';
import Button from '../components/Button';
import { hethers } from '@hashgraph/hethers';
import FactoryContractABI from './FactoryABI.json';
import MultirewardsContractABI from './MultirewardsABI.json';
import toast from 'react-hot-toast';

const MaintainFarms = () => {
  const [loadingDeploy, setLoadingDeploy] = useState<boolean>(false);
  const [loadingEnableReward, setLoadingEnableReward] = useState<boolean>(false);
  const [farmAddress, setFarmAddress] = useState<string>('');

  const factoryAddress = '0x0000000000000000000000000000000002eafc23';
  const walletId = '0.0.34226199';
  const walletAddress = '0x00000000000000000000000000000000020A4017';
  const walletPrivateKey = '0xb9ea0174648293031e3730c3a9b48aa075fe36343dbd5b3015595aeba36f547f';
  const provider = hethers.providers.getDefaultProvider('testnet');

  const eoaAccount = {
    account: walletId,
    privateKey: walletPrivateKey,
  };
  // @ts-ignore
  const walletEoaAccount = new hethers.Wallet(eoaAccount, provider);
  // @ts-ignore
  const connectedWallet = walletEoaAccount.connect(provider);

  const factoryContract = new hethers.Contract(factoryAddress, FactoryContractABI, connectedWallet);

  const deployFarm = async (tokenAddress: string) => {
    setLoadingDeploy(true);
    try {
      const deployTx = await factoryContract.deploy(walletAddress, tokenAddress, {
        gasLimit: 3000000,
      });

      setTimeout(async () => {
        await deployTx.wait();

        const numberOfCampaignsStr = await factoryContract.getCampaignsLength({
          gasLimit: 300000,
        });
        const numberOfCampaigns = parseInt(numberOfCampaignsStr);

        const campaign = await factoryContract.campaigns(numberOfCampaigns - 1, {
          gasLimit: 300000,
        });
        console.log('campaign', campaign);
        setLoadingDeploy(false);
        setFarmAddress(campaign);
      }, 4000);
    } catch (error) {
      console.log(error);
      toast.error('Something went wrong with campaign deployment');
      setLoadingDeploy(false);
    }
  };

  const enableReward = async (farmAddress: string, rewardAddress: string, duration: number) => {
    setLoadingEnableReward(true);
    try {
      const multirewardsContract = new hethers.Contract(
        farmAddress,
        MultirewardsContractABI,
        connectedWallet,
      );
      await multirewardsContract.enableReward(rewardAddress, true, duration, {
        gasLimit: 1000000,
      });
      console.log('success');

      setLoadingEnableReward(false);
    } catch (error) {
      console.log(error);
      toast.error('Something went wrong with enabling reward');
      setLoadingEnableReward(false);
    }
  };

  return (
    <div className=" justify-content-center">
      <div>Deploy new farm</div>
      <DeployFarm loadingDeploy={loadingDeploy} deployFarm={deployFarm} />
      {farmAddress ? <div>{`New farm deployed at address: ${farmAddress}`}</div> : null}
      <hr />

      <div>Enable reward</div>
      <EnableReward loadingEnableReward={loadingEnableReward} enableReward={enableReward} />
    </div>
  );
};

interface IDeployFarmProps {
  loadingDeploy: boolean;
  deployFarm: (tokenAddress: string) => void;
}

const DeployFarm = ({ loadingDeploy, deployFarm }: IDeployFarmProps) => {
  const [tokenAddress, setFarmAddress] = useState<string>('');
  return (
    <div className="m-4">
      <div className="d-flex justify-content-end m-4">
        <span className="m-4">Staking token address</span>
        <InputToken
          placeholder="Enter Token address"
          onChange={(e: any) => setFarmAddress(e.target.value)}
        />
      </div>
      <div className="d-flex justify-content-end m-4">
        <Button onClick={() => deployFarm(tokenAddress)} loading={loadingDeploy}>
          Deploy farm
        </Button>
      </div>
    </div>
  );
};

interface IEnableRewadProps {
  loadingEnableReward: boolean;
  enableReward: (farmAddress: string, rewardAddress: string, duration: number) => void;
}
const EnableReward = ({ loadingEnableReward, enableReward }: IEnableRewadProps) => {
  const [farmAddress, setFarmAddress] = useState<string>('');
  const [rewardAddress, setRewardAddress] = useState<string>('');
  const [duration, setDuration] = useState<number>(0);
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
        <Button
          onClick={() => enableReward(farmAddress, rewardAddress, duration)}
          loading={loadingEnableReward}
        >
          Enable reward
        </Button>
      </div>
    </div>
  );
};

export default MaintainFarms;
