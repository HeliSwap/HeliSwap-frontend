import { useState, useEffect, useCallback } from 'react';
import dayjs from 'dayjs';
import toast from 'react-hot-toast';
import FarmsSDK from '../sdk/farmsSdk';
import { IReward } from '../interfaces/tokens';

import IconToken from '../components/IconToken';
import Button from '../components/Button';
import { ethers } from 'ethers';
import { formatStringWeiToStringEther } from '../utils/numberUtils';
import {
  getTokenAllowance,
  getHTSTokenInfo,
  requestIdFromAddress,
  addressToId,
  checkAllowanceHTS,
} from '../utils/tokenUtils';

interface IRewardDetailsProps {
  reward: IReward;
  rewardSymbol: string;
  farmAddress: string;
  index: number;
  farmsSDK: FarmsSDK;
}

const MaintainRewardDetails = ({ reward, index, farmsSDK, farmAddress }: IRewardDetailsProps) => {
  const [rewardAmount, setRewardAmount] = useState<number>(0);
  const [sendingReward, setSendingReward] = useState<boolean>(false);
  const [changeRewardDuration, setChangeRewardDuration] = useState<number>(0);
  const [loadingChangeRewardDuration, setLoadingChangeRewardDuration] = useState<boolean>(false);
  const [allowanceAmount, setAllowanceAmount] = useState<number>(0);
  const [canSpend, setCanSpend] = useState<boolean>(false);

  const farmDeployer = process.env.REACT_APP_DEPLOYER_ID as string;
  const isWHBAR =
    process.env.REACT_APP_WHBAR_ADDRESS === reward.address ||
    process.env.REACT_APP_WHBAR_ADDRESS_OLD === reward.address;

  const checkHTSAllowance = useCallback(async () => {
    try {
      const tokenInfo = await getHTSTokenInfo(addressToId(reward.address));
      const formattedAmt = ethers.utils.formatUnits(rewardAmount, 8);
      const farmId = await requestIdFromAddress(farmAddress);
      const allowance = await getTokenAllowance(farmDeployer, farmId, tokenInfo.hederaId);
      const allowanceAmt = allowance[0]?.amount;

      const checkAllowance = await checkAllowanceHTS(
        farmDeployer,
        tokenInfo,
        formattedAmt,
        farmAddress,
      );

      setAllowanceAmount(allowanceAmt);
      setCanSpend(checkAllowance);
    } catch (error) {
      console.error('Error checking HTS allowance:', error);
    }
  }, [farmDeployer, farmAddress, reward.address, rewardAmount]);

  const getWHBARBalance = useCallback(async () => {
    try {
      const balance = await farmsSDK.WHBARBalance();
      console.log(balance);
      setAllowanceAmount(Number(balance));
      if (rewardAmount) setCanSpend(Number(balance) >= rewardAmount);
    } catch (error) {
      console.error('Error getting WHBAR balance:', error);
    }
  }, [farmsSDK, rewardAmount]);

  useEffect(() => {
    if (isWHBAR) {
      getWHBARBalance();
    } else {
      checkHTSAllowance();
    }
  }, [allowanceAmount, isWHBAR, checkHTSAllowance, getWHBARBalance]);

  const handleSendReward = useCallback(async () => {
    setSendingReward(true);
    try {
      await farmsSDK.sendReward(farmAddress, reward.address, rewardAmount);
      setRewardAmount(0);
      toast.success('Success! Reward was sent.');
    } catch (error) {
      console.error('Error sending reward:', error);
      toast.error('Error while sending reward.');
    } finally {
      setSendingReward(false);
    }
  }, [farmAddress, farmsSDK, reward.address, rewardAmount]);

  const handleChangeRewardDuration = useCallback(async () => {
    setLoadingChangeRewardDuration(true);
    try {
      await farmsSDK.setRewardDuration(farmAddress, reward.address, changeRewardDuration);
      toast.success('Success! Reward duration set.');
      setChangeRewardDuration(0);
    } catch (error) {
      console.error('Error setting reward duration:', error);
      toast.error('Error while setting duration.');
    } finally {
      setLoadingChangeRewardDuration(false);
    }
  }, [farmAddress, farmsSDK, reward.address, changeRewardDuration]);

  const handleApprove = useCallback(async () => {
    setSendingReward(true);
    try {
      if (isWHBAR) {
        await farmsSDK.wrapHBAR(rewardAmount.toString());
      }
      await farmsSDK.approveToken(reward.address, farmAddress, rewardAmount.toString());
      toast.success('Success! Token was approved.');
      setRewardAmount(0);
    } catch (error) {
      console.error('Error approving token:', error);
      toast.error('Error while approving token.');
    } finally {
      setSendingReward(false);
    }
  }, [farmAddress, farmsSDK, reward.address, rewardAmount, isWHBAR]);

  return (
    <div className="mt-3 container-dark p-4" key={index}>
      <div className="d-flex align-items-center mb-4">
        <IconToken symbol={reward.symbol} />
        <span className="text-main ms-3">{reward.symbol}</span>
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
          <p className="text-main text-numeric">
            {formatStringWeiToStringEther(reward.totalAmount, reward.decimals)} (
            {reward.totalAmount})
          </p>
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

      <div className="row mt-4">
        <div className="col-6 col-md-4 d-flex align-items-center">
          <p className="d-flex align-items-center">
            <span className="text-secondary text-small">Allowance amount</span>
          </p>
        </div>
        <div className="col-6 col-md-4">
          <p className="text-main text-numeric">
            {allowanceAmount} {isWHBAR ? 'WHBAR' : 'WEI'}
          </p>
        </div>
      </div>

      <hr className="my-5" />

      <div className="row">
        <div className="col-6">
          <div>
            <p className="text-small mb-3">Duration</p>
            <input
              className="form-control"
              value={changeRewardDuration}
              placeholder="Enter new duration"
              onChange={e => setChangeRewardDuration(Number(e.target.value))}
            />
          </div>
          <div className="mt-4">
            <Button
              onClick={handleChangeRewardDuration}
              loading={loadingChangeRewardDuration}
              size="small"
            >
              Set Duration
            </Button>
          </div>
        </div>

        <div className="col-6">
          <div>
            <p className="text-small mb-3">{isWHBAR ? 'WHBAR' : 'WEI'} Amount</p>
            <input
              className="form-control"
              value={rewardAmount}
              placeholder="Enter WEI amount"
              onChange={e => setRewardAmount(Number(e.target.value))}
            />
          </div>
          <div className="mt-4">
            {canSpend ? (
              <Button onClick={handleSendReward} loading={sendingReward} size="small">
                Send token
              </Button>
            ) : (
              <Button onClick={handleApprove} loading={sendingReward} size="small">
                {isWHBAR ? 'Wrap and Approve' : 'Approve token'}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MaintainRewardDetails;
