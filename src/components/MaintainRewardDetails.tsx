import { useState, useEffect, useCallback } from 'react';
import dayjs from 'dayjs';
import toast from 'react-hot-toast';
import FarmsSDK from '../sdk/farmsSdk';
import { IReward } from '../interfaces/tokens';

import IconToken from '../components/IconToken';
import Button from '../components/Button';
import Modal from './Modal';

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
  const [changeRewardDuration, setChangeRewardDuration] = useState<number>(0);
  const [allowanceAmount, setAllowanceAmount] = useState<number>(0);
  const [unWrapAmount, setUnWrapAmount] = useState<number>(0);
  const [sendingReward, setSendingReward] = useState<boolean>(false);
  const [loadingChangeRewardDuration, setLoadingChangeRewardDuration] = useState<boolean>(false);
  const [showTransferModal, setShowTransferModal] = useState<boolean>(false);
  const [canSpend, setCanSpend] = useState<boolean | undefined>(undefined);

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

      if (canSpend === undefined || allowanceAmount <= rewardAmount || rewardAmount === 0) {
        const checkAllowance = await checkAllowanceHTS(
          farmDeployer,
          tokenInfo,
          formattedAmt,
          farmAddress,
        );
        setCanSpend(checkAllowance);
      }

      setAllowanceAmount(allowanceAmt);
    } catch (error) {
      console.error('Error checking HTS allowance:', error);
    }
  }, [reward.address, rewardAmount, farmAddress, farmDeployer, canSpend, allowanceAmount]);

  const getWHBARBalance = useCallback(async () => {
    try {
      // If rewardAmount is 0, fetch the balance and update allowanceAmount and canSpend.
      if (rewardAmount === 0) {
        const balance = await farmsSDK.WHBARBalance();
        setAllowanceAmount(Number(balance));
        setCanSpend(Number(balance) >= rewardAmount);
      } else {
        // Directly set canSpend based on the comparison, removing the need for an else block.
        setCanSpend(allowanceAmount >= rewardAmount);
      }
    } catch (error) {
      console.error('Error getting WHBAR balance:', error);
    }
  }, [farmsSDK, rewardAmount, allowanceAmount]);

  const checkWHBARAllowance = useCallback(async () => {
    try {
      await getWHBARBalance();
    } catch (error) {
      console.error('Error getting WHBAR balance:', error);
    }
  }, [getWHBARBalance]);

  useEffect(() => {
    if (isWHBAR) {
      checkWHBARAllowance();
    } else {
      checkHTSAllowance();
    }
  }, [allowanceAmount, isWHBAR, checkHTSAllowance, checkWHBARAllowance]);

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
      let approveAmount = rewardAmount;
      if (allowanceAmount) {
        approveAmount = rewardAmount - allowanceAmount;
      }

      if (isWHBAR) {
        await farmsSDK.wrapHBAR(approveAmount.toString());
      }
      await farmsSDK.approveToken(reward.address, farmAddress, approveAmount.toString());
      toast.success('Success! Token was approved.');
      setRewardAmount(0);
    } catch (error) {
      console.error('Error approving token:', error);
      toast.error('Error while approving token.');
    } finally {
      setSendingReward(false);
    }
  }, [rewardAmount, allowanceAmount, isWHBAR, farmsSDK, reward.address, farmAddress]);

  const handleUnwrapHbar = useCallback(async () => {
    setSendingReward(true);
    try {
      await farmsSDK.unWrapHBAR(unWrapAmount);
      toast.success('Success! WHBAR was unwrapped.');
      setRewardAmount(0);
    } catch (error) {
      console.error('Error unwrapping WHBAR:', error);
      toast.error('Error while unwrapping WHBAR.');
    } finally {
      setSendingReward(false);
    }
  }, [farmsSDK, unWrapAmount]);

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
          <div className="text-main text-numeric">
            {allowanceAmount}{' '}
            {isWHBAR ? (
              <>
                WHBAR
                <Button
                  onClick={() => setShowTransferModal(true)}
                  size="small"
                  className="mx-4 w-50 p-1"
                >
                  Unwrap
                </Button>
              </>
            ) : (
              'WEI'
            )}
          </div>
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

        <Modal show={showTransferModal} closeModal={() => setShowTransferModal(false)}>
          <div className="p-5">
            <div>
              <p className="text-small mb-3">{isWHBAR ? 'WHBAR' : 'WEI'} Amount</p>
              <input
                className="form-control"
                value={unWrapAmount}
                placeholder="Enter WEI amount"
                onChange={e => setUnWrapAmount(Number(e.target.value))}
              />
            </div>
            <div className="mt-4">
              <Button onClick={handleUnwrapHbar} loading={sendingReward} size="small">
                Unwrap WHBAR
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </div>
  );
};

export default MaintainRewardDetails;
