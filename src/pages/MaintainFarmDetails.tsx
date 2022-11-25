import React, { ReactNode, useContext, useEffect, useState } from 'react';
import Tippy from '@tippyjs/react';
import { useParams, useNavigate } from 'react-router-dom';

import { GlobalContext } from '../providers/Global';

import { IReward } from '../interfaces/tokens';

import Icon from '../components/Icon';
import IconToken from '../components/IconToken';
import PageHeader from '../components/PageHeader';
import ToasterWrapper from '../components/ToasterWrapper';

import { formatIcons } from '../utils/iconUtils';
import {
  formatStringToPercentage,
  formatStringToPrice,
  stripStringToFixedDecimals,
} from '../utils/numberUtils';

import { timestampToDate } from '../utils/timeUtils';
import { NATIVE_TOKEN } from '../utils/tokenUtils';
import usePoolsByTokensList from '../hooks/usePoolsByTokensList';
import useFarmByAddress from '../hooks/useFarmByAddress';
import { useQueryOptionsPoolsFarms } from '../constants';
import Loader from '../components/Loader';
import dayjs from 'dayjs';
import FarmsSDK from '../sdk/farmsSdk';
import InputToken from '../components/InputToken';
import Button from '../components/Button';
import toast from 'react-hot-toast';

const FarmDetails = () => {
  const contextValue = useContext(GlobalContext);
  const { connection, tokensWhitelisted } = contextValue;
  const { userId, isHashpackLoading } = connection;

  const navigate = useNavigate();
  const { campaignAddress } = useParams();
  const tokensWhitelistedAddresses = tokensWhitelisted.map(item => item.address) || [];

  const { poolsByTokenList: pools } = usePoolsByTokensList(
    useQueryOptionsPoolsFarms,
    true,
    tokensWhitelistedAddresses,
  );

  const { farm: farmData, processingFarms } = useFarmByAddress(
    useQueryOptionsPoolsFarms,
    userId,
    pools,
    campaignAddress || '',
  );
  //SDK state
  const [farmsSDK, setFarmsSDK] = useState({} as FarmsSDK);
  //Enable reward state
  const [enableRewardAddress, setEnableRewardAddress] = useState<string>('');
  const [enableRewardDuration, setEnableRewardDuration] = useState<number>(0);
  const [loadingEnableReward, setLoadingEnableReward] = useState<boolean>(false);
  const [loadingSendReward, setLoadingSendReward] = useState<boolean>(false);
  const [loadingChangeRewardDuration, setLoadingChangeRewardDuration] = useState<boolean>(false);
  const [loadingApproveReward, setLoadingApproveReward] = useState<boolean>(false);
  const [sendRewardAmount, setSendRewardAmount] = useState<number>(0);
  const [changeRewardDuration, setChangeRewardDuration] = useState<number>(0);
  const [approveRewardAmount, setApproveRewardAmount] = useState<number>(0);

  //Initialize farms SDK
  useEffect(() => {
    const farmsSDK = new FarmsSDK();
    setFarmsSDK(farmsSDK);
  }, []);

  // Handlers
  const HandleEnableReward = async () => {
    setLoadingEnableReward(true);
    try {
      await farmsSDK.enableReward(farmData.address, enableRewardAddress, enableRewardDuration);
      setEnableRewardAddress('');
      setEnableRewardDuration(0);
      toast.success('Success! Reward was enabled.');
    } catch (error) {
      console.log(error);
      toast.error('Error while enabling reward');
    } finally {
      setLoadingEnableReward(false);
    }
  };

  const handleSendReward = async (rewardAddress: string) => {
    setLoadingSendReward(true);
    try {
      await farmsSDK.sendReward(farmData.address, rewardAddress, sendRewardAmount);

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
      await farmsSDK.setRewardDuration(farmData.address, rewardAddress, changeRewardDuration);

      toast.success('Success! Reward duration set.');
      setChangeRewardDuration(0);
    } catch (error) {
      toast.error('Error while settin duration.');
      console.log(error);
    } finally {
      setLoadingChangeRewardDuration(false);
    }
  };

  const handleApproveToken = async (rewardAddress: string) => {
    setLoadingApproveReward(true);
    try {
      await farmsSDK.approveToken(farmData.address, rewardAddress, approveRewardAmount);
      toast.success('Success! Token was approved.');
      setApproveRewardAmount(0);
    } catch (error) {
      console.log(error);
      toast.error('Error while approving token');
    } finally {
      setLoadingApproveReward(false);
    }
  };

  // Renders
  const renderCampaignEndDate = (campaignEndDate: number, rewardsData: IReward[]) => {
    const campaignEnded = campaignEndDate < Date.now();
    const campaignNotStarted = campaignEndDate === 0;

    const statusLabel = campaignNotStarted ? (
      'Campaign not started'
    ) : campaignEnded ? (
      'Campaign Ended'
    ) : (
      <>
        Until <span className="text-bold">{timestampToDate(campaignEndDate)}</span>
      </>
    );

    const dateContent = (
      <>
        <span
          className={`icon-campaign-status ${
            !campaignNotStarted ? (!campaignEnded ? 'is-active' : '') : 'not-started'
          }`}
        ></span>
        <span className="text-micro ms-3">{statusLabel}</span>
      </>
    );

    return <div className="d-flex align-items-center">{dateContent}</div>;
  };

  const haveFarm = Object.keys(farmData).length !== 0;
  const campaignHasRewards = farmData.rewardsData?.length > 0;

  return isHashpackLoading ? (
    <Loader />
  ) : processingFarms ? (
    <Loader />
  ) : (
    <div className="d-flex justify-content-center">
      <div className="container-max-with-1042">
        <PageHeader title="Manage Farm" handleBackClick={() => navigate('/maintain-farms')} />
        {haveFarm ? (
          <div className="row">
            <div className="col-md-7">
              <div className="container-blue-neutral-800 rounded p-4 p-lg-5">
                <div className="d-md-flex justify-content-between align-items-start">
                  <div className="d-flex align-items-center">
                    {formatIcons(
                      [farmData.poolData?.token0Symbol, farmData.poolData?.token1Symbol],
                      'large',
                    )}
                    <p className="text-subheader text-light ms-4">
                      {farmData.poolData?.token0Symbol} / {farmData.poolData?.token1Symbol}
                    </p>
                  </div>

                  <div className="container-campaign-status mt-4 mt-md-0 d-flex align-items-center">
                    {renderCampaignEndDate(farmData.campaignEndDate, farmData.rewardsData)}
                  </div>
                </div>

                <div className="container-border-rounded-bn-500 mt-4 mt-lg-6">
                  <div className="row">
                    <div className="col-6 col-md-4 d-flex align-items-center">
                      <p className="d-flex align-items-center">
                        <span className="text-secondary text-small">Total APR</span>
                        <Tippy content="Your annual rate of return, expressed as a percentage. Interest paid in previous periods is not accounted for.">
                          <span className="ms-2">
                            <Icon name="hint" color="gray" size="small" />
                          </span>
                        </Tippy>
                      </p>
                    </div>
                    <div className="col-6 col-md-4">
                      <p className="text-subheader text-numeric">
                        {formatStringToPercentage(stripStringToFixedDecimals(farmData.APR, 2))}
                      </p>
                    </div>
                  </div>

                  <div className="row mt-4">
                    <div className="col-6 col-md-4 d-flex align-items-center">
                      <p className="d-flex align-items-center">
                        <span className="text-secondary text-small">Total Staked</span>
                        <Tippy content="The total amount of staked tokens in this farm pool, denominated in $USD.">
                          <span className="ms-2">
                            <Icon name="hint" color="gray" size="small" />
                          </span>
                        </Tippy>
                      </p>
                    </div>
                    <div className="col-6 col-md-4">
                      <p className="text-main text-numeric">
                        {formatStringToPrice(
                          stripStringToFixedDecimals(farmData.totalStakedUSD, 2),
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="m-4 d-flex justify-content-between">
                    <div className=" m-4">
                      <span className="m-4">Reward address</span>
                      <InputToken
                        value={enableRewardAddress}
                        placeholder="Enter Reward address"
                        onChange={(e: any) => setEnableRewardAddress(e.target.value)}
                      />
                    </div>
                    <div className=" m-4">
                      <span className="m-4">Duration in seconds</span>
                      <InputToken
                        value={enableRewardDuration}
                        placeholder="Enter duration"
                        onChange={(e: any) => setEnableRewardDuration(e.target.value)}
                      />
                    </div>
                    <div className=" m-4">
                      <Button onClick={HandleEnableReward} loading={loadingEnableReward}>
                        Enable reward
                      </Button>
                    </div>
                  </div>

                  <hr className="my-5" />

                  <div className="row mt-4">
                    <div className="col-6 col-md-4 d-flex align-items-center">
                      <p className="d-flex align-items-center">
                        <span className="text-secondary text-small">Rewards</span>
                        <Tippy content="The tokens you will be rewarded with upon harvest.">
                          <span className="ms-2">
                            <Icon name="hint" color="gray" size="small" />
                          </span>
                        </Tippy>
                      </p>
                    </div>
                    <div className="m-4">
                      {campaignHasRewards &&
                        farmData.rewardsData?.reduce((acc: ReactNode[], reward: IReward, index) => {
                          const rewardSymbol =
                            reward.address === process.env.REACT_APP_WHBAR_ADDRESS
                              ? NATIVE_TOKEN.symbol
                              : reward.symbol;

                          acc.push(
                            <div key={index} className="m-4">
                              <IconToken symbol={reward.symbol} />{' '}
                              <span className="text-main ms-3">{rewardSymbol}</span>
                              <div className="d-flex justify-content-between m-4">
                                <span className="text-main ms-3">Total amount USD</span>
                                <span className="text-main ms-3">{reward.totalAmountUSD}</span>
                              </div>
                              <div className="d-flex justify-content-between m-4">
                                <span className="text-main ms-3">Total amount tokens</span>
                                <span className="text-main ms-3">{reward.totalAmount}</span>
                              </div>
                              <div className="d-flex justify-content-between m-4">
                                <span className="text-main ms-3">Reward end date</span>
                                <span className="text-main ms-3">
                                  {reward.rewardEnd !== 0
                                    ? dayjs(reward.rewardEnd).format('YYYY-MM-DD HH:mm')
                                    : 'Not set'}
                                </span>
                              </div>
                              <div className="d-flex justify-content-between m-4">
                                <span className="text-main ms-3">Reward duration in seconds</span>
                                <span className="text-main ms-3">
                                  {reward.duration !== 0 ? reward.duration : 'Not set'}
                                </span>
                              </div>
                              {/* Actions */}
                              <div className=" m-4">
                                <div className="d-flex m-4 justify-content-end">
                                  <div className="d-flex justify-content-end m-4">
                                    <span className="m-4">WEI amount</span>
                                    <InputToken
                                      value={approveRewardAmount}
                                      placeholder="Enter WEI amount"
                                      onChange={(e: any) => setApproveRewardAmount(e.target.value)}
                                    />
                                  </div>
                                  <div className="d-flex justify-content-end m-4">
                                    <Button
                                      onClick={() => handleApproveToken(reward.address)}
                                      loading={loadingApproveReward}
                                    >
                                      Approve token
                                    </Button>
                                  </div>
                                </div>
                                <div className="d-flex m-4 justify-content-end">
                                  <div className="d-flex justify-content-end m-4">
                                    <span className="m-4">WEI amount</span>
                                    <InputToken
                                      value={sendRewardAmount}
                                      placeholder="Enter WEI amount"
                                      onChange={(e: any) => setSendRewardAmount(e.target.value)}
                                    />
                                  </div>
                                  <div className="d-flex justify-content-end m-4">
                                    <Button
                                      onClick={() => handleSendReward(reward.address)}
                                      loading={loadingSendReward}
                                    >
                                      Send reward
                                    </Button>
                                  </div>
                                </div>

                                <div className="d-flex m-4 justify-content-end">
                                  <div className="d-flex justify-content-end m-4">
                                    <span className="m-4">Duration</span>
                                    <InputToken
                                      value={changeRewardDuration}
                                      placeholder="Enter new duration"
                                      onChange={(e: any) => setChangeRewardDuration(e.target.value)}
                                    />
                                  </div>
                                  <div className="d-flex justify-content-end m-4">
                                    <Button
                                      onClick={() => handleChangeRewardDuration(reward.address)}
                                      loading={loadingChangeRewardDuration}
                                    >
                                      Set Duration
                                    </Button>
                                  </div>
                                </div>
                              </div>
                              <hr />
                            </div>,
                          );

                          return acc;
                        }, [])}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="row">
            <div className="col-md-6 offset-md-3">
              <div className="alert alert-warning d-flex align-items-center">
                <Icon color="warning" name="warning" />
                <p className="ms-3">This farm does not exist</p>
              </div>
            </div>
          </div>
        )}
      </div>
      <ToasterWrapper />
    </div>
  );
};

export default FarmDetails;
