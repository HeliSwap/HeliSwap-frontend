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
        {/* <div className="d-flex justify-content-center">Enable reward</div>
        <EnableReward farmsSDK={farmsSDK} />
        <hr />
        <div className="d-flex justify-content-center">Approve token</div>
        <ApproveToken farmsSDK={farmsSDK} />
        <hr />
        <div className="d-flex justify-content-center">Send reward</div>
        <SendReward farmsSDK={farmsSDK} />
        <hr />
        <div className="d-flex justify-content-center">Set reward duration</div>
        <SetRewardDuration farmsSDK={farmsSDK} /> */}
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
    setLoadingEnableReward(true);
    try {
      await farmsSDK.enableReward(farmAddress, rewardAddress, duration);
      setFarmAddress('');
      setRewardAddress('');
      setDuration(0);
      toast.success('Success! Reward was enabled.');
    } catch (error) {
      console.log(error);
      toast.error('Error while enabling reward');
    } finally {
      setLoadingEnableReward(false);
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

const ApproveToken = ({ farmsSDK }: IDeployFarmProps) => {
  const [loadingApprove, setLoadingApprove] = useState<boolean>(false);
  const [tokenAddress, setTokenAddress] = useState<string>('');
  const [spenderAddress, setSpenderAddress] = useState<string>('');
  const [amount, setAmount] = useState<number>(0);

  const approveToken = async () => {
    setLoadingApprove(true);
    try {
      await farmsSDK.approveToken(spenderAddress, tokenAddress, amount);
      toast.success('Success! Token was approved.');
      setTokenAddress('');
      setSpenderAddress('');
      setAmount(0);
    } catch (error) {
      console.log(error);
      toast.error('Error while approving token');
    } finally {
      setLoadingApprove(false);
    }
  };

  return (
    <div className="m-4">
      <div className="d-flex justify-content-end m-4">
        <span className="m-4">Token address</span>
        <InputToken
          value={tokenAddress}
          placeholder="Enter token address"
          onChange={(e: any) => setTokenAddress(e.target.value)}
        />
      </div>
      <div className="d-flex justify-content-end m-4">
        <span className="m-4">Spender adddress</span>
        <InputToken
          value={spenderAddress}
          placeholder="Enter spender address"
          onChange={(e: any) => setSpenderAddress(e.target.value)}
        />
      </div>
      <div className="d-flex justify-content-end m-4">
        <span className="m-4">WEI amount</span>
        <InputToken
          value={amount}
          placeholder="Enter WEI amount"
          onChange={(e: any) => setAmount(e.target.value)}
        />
      </div>
      <div className="d-flex justify-content-end m-4">
        <Button onClick={approveToken} loading={loadingApprove}>
          Approve token
        </Button>
      </div>
    </div>
  );
};

const SendReward = ({ farmsSDK }: IDeployFarmProps) => {
  const [loadingSendReward, setLoadingSendReward] = useState<boolean>(false);
  const [farmAddress, setFarmAddress] = useState<string>('');
  const [rewardAddress, setRewardAddress] = useState<string>('');
  const [amount, setAmount] = useState<number>(0);

  const sendReward = async () => {
    setLoadingSendReward(true);
    try {
      await farmsSDK.sendReward(farmAddress, rewardAddress, amount);

      setFarmAddress('');
      setRewardAddress('');
      setAmount(0);
      toast.success('Success! Reward was sent.');
    } catch (error) {
      console.log(error);
      toast.error('Error while sending reward.');
    } finally {
      setLoadingSendReward(false);
    }
  };

  return (
    <div className="m-4">
      <div className="d-flex justify-content-end m-4">
        <span className="m-4">Farm Address</span>
        <InputToken
          value={farmAddress}
          placeholder="Enter farm address"
          onChange={(e: any) => setFarmAddress(e.target.value)}
        />
      </div>
      <div className="d-flex justify-content-end m-4">
        <span className="m-4">Reward address</span>
        <InputToken
          value={rewardAddress}
          placeholder="Enter reward address"
          onChange={(e: any) => setRewardAddress(e.target.value)}
        />
      </div>
      <div className="d-flex justify-content-end m-4">
        <span className="m-4">WEI amount</span>
        <InputToken
          value={amount}
          placeholder="Enter WEI amount"
          onChange={(e: any) => setAmount(e.target.value)}
        />
      </div>
      <div className="d-flex justify-content-end m-4">
        <Button onClick={sendReward} loading={loadingSendReward}>
          Send reward
        </Button>
      </div>
    </div>
  );
};

const SetRewardDuration = ({ farmsSDK }: IDeployFarmProps) => {
  const [loadingChangeDuration, setLoadingChangeDuration] = useState<boolean>(false);
  const [farmAddress, setFarmAddress] = useState<string>('');
  const [rewardAddress, setRewardAddress] = useState<string>('');
  const [duration, setDuration] = useState<number>(0);

  const sendReward = async () => {
    setLoadingChangeDuration(true);

    try {
      await farmsSDK.setRewardDuration(farmAddress, rewardAddress, duration);

      toast.success('Success! Reward duration set.');
      setFarmAddress('');
      setRewardAddress('');
      setDuration(0);
    } catch (error) {
      toast.error('Error while settin duration.');
      console.log(error);
    } finally {
      setLoadingChangeDuration(false);
    }
  };

  return (
    <div className="m-4">
      <div className="d-flex justify-content-end m-4">
        <span className="m-4">Farm Address</span>
        <InputToken
          value={farmAddress}
          placeholder="Enter farm address"
          onChange={(e: any) => setFarmAddress(e.target.value)}
        />
      </div>
      <div className="d-flex justify-content-end m-4">
        <span className="m-4">Reward address</span>
        <InputToken
          value={rewardAddress}
          placeholder="Enter reward address"
          onChange={(e: any) => setRewardAddress(e.target.value)}
        />
      </div>
      <div className="d-flex justify-content-end m-4">
        <span className="m-4">Duration</span>
        <InputToken
          value={duration}
          placeholder="Enter new duration"
          onChange={(e: any) => setDuration(e.target.value)}
        />
      </div>
      <div className="d-flex justify-content-end m-4">
        <Button onClick={sendReward} loading={loadingChangeDuration}>
          Send reward
        </Button>
      </div>
    </div>
  );
};

export default MaintainFarms;
