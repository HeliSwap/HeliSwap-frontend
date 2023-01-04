import React, { useState } from 'react';

import dayjs from 'dayjs';
import toast from 'react-hot-toast';

import FarmsSDK from '../sdk/farmsSdk';

import { IReward } from '../interfaces/tokens';

import IconToken from '../components/IconToken';
import Button from '../components/Button';

interface IRewardDetailsProps {
  reward: IReward;
  rewardSymbol: string;
  farmAddress: string;
  index: number;
  farmsSDK: FarmsSDK;
}

const MaintainRewardDetails = ({ reward, index, farmsSDK, farmAddress }: IRewardDetailsProps) => {
  //Component state
  const [loadingSendReward, setLoadingSendReward] = useState<boolean>(false);
  const [loadingChangeRewardDuration, setLoadingChangeRewardDuration] = useState<boolean>(false);
  const [loadingApproveReward, setLoadingApproveReward] = useState<boolean>(false);
  const [sendRewardAmount, setSendRewardAmount] = useState<number>(0);
  const [changeRewardDuration, setChangeRewardDuration] = useState<number>(0);
  const [approveRewardAmount, setApproveRewardAmount] = useState<number>(0);

  //Handlers
  const handleSendReward = async (rewardAddress: string) => {
    setLoadingSendReward(true);
    try {
      await farmsSDK.sendReward(farmAddress, rewardAddress, sendRewardAmount);

      setSendRewardAmount(0);
      toast.success('Success! Reward was sent.');
    } catch (error) {
      console.log(error);
      toast.error('Error while sending reward.');
    } finally {
      setLoadingSendReward(false);
    }
  };

  const handleChangeRewardDuration = async (rewardAddress: string) => {
    setLoadingChangeRewardDuration(true);

    try {
      await farmsSDK.setRewardDuration(farmAddress, rewardAddress, changeRewardDuration);

      toast.success('Success! Reward duration set.');
      setChangeRewardDuration(0);
    } catch (error) {
      toast.error('Error while settin duration.');
      console.log(error);
    } finally {
      setLoadingChangeRewardDuration(false);
    }
  };

  const handleWrapAndApproveToken = async (rewardAddress: string, rewardAmount: string) => {
    setLoadingApproveReward(true);
    try {
      await farmsSDK.wrapHBAR(rewardAmount);
      await farmsSDK.approveToken(rewardAddress, farmAddress, approveRewardAmount.toString());
      toast.success('Success! Token was approved.');
      setApproveRewardAmount(0);
    } catch (error) {
      console.log(error);
      toast.error('Error while approving token');
    } finally {
      setLoadingApproveReward(false);
    }
  };

  const handleApproveToken = async (rewardAddress: string) => {
    setLoadingApproveReward(true);
    try {
      await farmsSDK.approveToken(rewardAddress, farmAddress, approveRewardAmount.toString());
      toast.success('Success! Token was approved.');
      setApproveRewardAmount(0);
    } catch (error) {
      console.log(error);
      toast.error('Error while approving token');
    } finally {
      setLoadingApproveReward(false);
    }
  };

  return (
    <div className="mt-3 container-dark p-4" key={index}>
      <div className="d-flex align-items-center mb-4">
        <IconToken symbol={reward.symbol} /> <span className="text-main ms-3">{}</span>
      </div>

      <div className="row mt-4">
        <div className="col-6 col-md-4 d-flex align-items-center">
          <p className="d-flex align-items-center">
            <span className="text-secondary text-small">Total amount USD</span>
          </p>
        </div>
        <div className="col-6 col-md-4">
          <p className="text-main text-numeric">{reward.totalAmountUSD}</p>
        </div>
      </div>

      <div className="row mt-4">
        <div className="col-6 col-md-4 d-flex align-items-center">
          <p className="d-flex align-items-center">
            <span className="text-secondary text-small">Total amount tokens</span>
          </p>
        </div>
        <div className="col-6 col-md-4">
          <p className="text-main text-numeric">{reward.totalAmount}</p>
        </div>
      </div>

      <div className="row mt-4">
        <div className="col-6 col-md-4 d-flex align-items-center">
          <p className="d-flex align-items-center">
            <span className="text-secondary text-small">Reward end date</span>
          </p>
        </div>
        <div className="col-6 col-md-4">
          <p className="text-main text-numeric">
            {reward.rewardEnd !== 0
              ? dayjs(reward.rewardEnd).format('YYYY-MM-DD HH:mm')
              : 'Not set'}
          </p>
        </div>
      </div>

      <div className="row mt-4">
        <div className="col-6 col-md-4 d-flex align-items-center">
          <p className="d-flex align-items-center">
            <span className="text-secondary text-small">Reward duration in seconds</span>
          </p>
        </div>
        <div className="col-6 col-md-4">
          <p className="text-main text-numeric">
            {reward.duration !== 0 ? reward.duration : 'Not set'}
          </p>
        </div>
      </div>

      <hr className="my-5" />

      {/* Actions */}
      <div className="row">
        <div className="col-4">
          <div>
            <p className="text-small mb-3">WEI amount</p>
            <input
              className="form-control"
              value={approveRewardAmount}
              placeholder="Enter WEI amount"
              onChange={(e: any) => setApproveRewardAmount(e.target.value)}
            />
          </div>
          <div className="mt-4">
            <Button
              onClick={() =>
                process.env.REACT_APP_WHBAR_ADDRESS === reward.address
                  ? handleWrapAndApproveToken(reward.address, approveRewardAmount.toString())
                  : handleApproveToken(reward.address)
              }
              loading={loadingApproveReward}
              size="small"
            >
              {process.env.REACT_APP_WHBAR_ADDRESS === reward.address
                ? 'Wrap and Approve'
                : 'Approve token'}
            </Button>
          </div>
        </div>

        <div className="col-4">
          <div>
            <p className="text-small mb-3">WEI amount</p>
            <input
              className="form-control"
              value={sendRewardAmount}
              placeholder="Enter WEI amount"
              onChange={(e: any) => setSendRewardAmount(e.target.value)}
            />
          </div>
          <div className="mt-4">
            <Button
              onClick={() => handleSendReward(reward.address)}
              loading={loadingSendReward}
              size="small"
            >
              Send reward
            </Button>
          </div>
        </div>

        <div className="col-4">
          <div>
            <p className="text-small mb-3">Duration</p>
            <input
              className="form-control"
              value={changeRewardDuration}
              placeholder="Enter new duration"
              onChange={(e: any) => setChangeRewardDuration(e.target.value)}
            />
          </div>
          <div className="mt-4">
            <Button
              onClick={() => handleChangeRewardDuration(reward.address)}
              loading={loadingChangeRewardDuration}
              size="small"
            >
              Set Duration
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MaintainRewardDetails;
