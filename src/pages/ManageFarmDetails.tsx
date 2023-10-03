import { useState, useContext, ReactNode, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

import Tippy from '@tippyjs/react';
import toast from 'react-hot-toast';

import { GlobalContext } from '../providers/Global';

import { IReward } from '../interfaces/tokens';

import Button from '../components/Button';
import Loader from '../components/Loader';
import PageHeader from '../components/PageHeader';
import IconToken from '../components/IconToken';
import Icon from '../components/Icon';
import ToasterWrapper from '../components/ToasterWrapper';
import ManageReward from '../components/ManageReward';

import { formatIcons } from '../utils/iconUtils';
import { mapWHBARAddress } from '../utils/tokenUtils';
import { formatStringWeiToStringEther } from '../utils/numberUtils';
import { MONTH_IN_SECONDS } from '../utils/timeUtils';

import usePoolsByTokensList from '../hooks/usePoolsByTokensList';
import useFarmByAddress from '../hooks/usePermissionlessFarmRewardsByAddress';
import usePYFContract from '../hooks/usePYFContract';

import { MAX_PYF_DURATION, useQueryOptionsPoolsFarms } from '../constants';

import getErrorMessage from '../content/errors';

const ManageFarmDetails = () => {
  const contextValue = useContext(GlobalContext);
  const { connection, sdk, tokensWhitelisted } = contextValue;
  const { userId, connectorInstance, isHashpackLoading, setShowConnectModal } = connection;

  const navigate = useNavigate();
  const { address } = useParams();
  const tokensWhitelistedAddresses = tokensWhitelisted.map(item => item.address) || [];

  const { poolsByTokenList: pools } = usePoolsByTokensList(
    useQueryOptionsPoolsFarms,
    true,
    tokensWhitelistedAddresses,
  );

  const { farm: farmData, processingFarms } = useFarmByAddress(
    useQueryOptionsPoolsFarms,
    pools,
    address || '',
  );

  const farmContract = usePYFContract(address || '');

  const [selectedDuration, setSelectedDuration] = useState(1);
  const [loadingEnableReward, setLoadingEnableReward] = useState(false);
  const [showManageReward, setShowManageReward] = useState(false);
  const [selectedRewardToken, setSelectedRewardToken] = useState<IReward>({} as IReward);
  const [campaignEnd, setCampaignEnd] = useState(0);
  const [campaignDuration, setCampaignDuration] = useState(0);
  const [selectOptions, setSelectOptions] = useState<ReactNode[]>([]);

  // Events
  const handleSelectDurationChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedDuration(Number(event.target.value));
  };

  const handleEnableRewardClick = async () => {
    setLoadingEnableReward(true);

    try {
      const receipt = await sdk.enableReward(
        connectorInstance,
        address || '',
        selectedDuration,
        userId,
      );

      const {
        response: { success, error },
      } = receipt;

      if (!success) {
        toast.error(getErrorMessage(error.status ? error.status : error));
      } else {
        toast.success('Success! Duration is set.');
        getContractData();
      }
    } catch (e) {
      console.log('error', e);
    } finally {
      setLoadingEnableReward(false);
    }
  };

  const handleRewardClick = (token: IReward) => {
    setSelectedRewardToken(token);
    setShowManageReward(true);
  };

  const haveFarm = Object.keys(farmData).length !== 0;
  const campaignHasRewards = farmData.rewardsData?.length > 0;
  // const rewardsDuration = farmData.rewardsData?.reduce((acc, reward) => {
  //   if (reward.duration > acc && reward.rewardEnd > Date.now()) {
  //     acc = reward.duration;
  //   }
  //   return acc;
  // }, 0);
  const campaignHasActiveRewards = campaignHasRewards
    ? Object.keys(farmData.rewardsData.find(reward => reward.rewardEnd > Date.now()) || {}).length >
      0
    : false;
  const canEnableReward = selectedDuration > 0 && !campaignHasActiveRewards;

  const getContractData = useCallback(async () => {
    const promisesArray = [farmContract.periodFinish(), farmContract.rewardsDuration()];

    const [periodFinish, rewardsDuration] = await Promise.all(promisesArray);
    console.log('periodFinish', periodFinish);
    setCampaignDuration(Number(rewardsDuration.toString()) / MONTH_IN_SECONDS);
  }, [farmContract]);

  useEffect(() => {
    campaignDuration > 0 && setSelectedDuration(campaignDuration);
  }, [campaignDuration]);

  useEffect(() => {
    if (Object.keys(farmData).length > 0 && farmData.rewardsData.length > 0) {
      const campaignEnd = farmData.rewardsData.reduce((acc, reward) => {
        if (reward.rewardEnd > acc) {
          acc = reward.rewardEnd;
        }
        return acc;
      }, 0);

      setCampaignEnd(campaignEnd);
    }
  }, [farmData]);

  useEffect(() => {
    haveFarm && farmContract && getContractData();
  }, [farmContract, haveFarm, getContractData]);

  const renderSelectDurationOptions = (campaignDuration: number) => {
    const options = [];

    for (let i = 1; i <= MAX_PYF_DURATION; i++) {
      options.push(
        campaignDuration === i ? (
          <option selected key={i} value={i}>
            {`${i} ${i > 1 ? 'months' : 'month'}`}
          </option>
        ) : (
          <option key={i} value={i}>
            {`${i} ${i > 1 ? 'months' : 'month'}`}
          </option>
        ),
      );
    }

    return options;
  };

  useEffect(() => {
    setSelectOptions(renderSelectDurationOptions(campaignDuration));
  }, [campaignDuration]);

  return isHashpackLoading ? (
    <Loader />
  ) : processingFarms ? (
    <Loader />
  ) : (
    <div className="d-flex justify-content-center">
      <div className="container-max-with-1042">
        <PageHeader
          title="Manage Farm"
          handleBackClick={() => navigate('/manage-permissionless-farms')}
        />
        {!isHashpackLoading && userId ? (
          haveFarm ? (
            <div className="">
              <div className="">
                <div className="d-flex align-items-center mb-5">
                  {formatIcons(
                    [farmData.poolData?.token0Symbol, farmData.poolData?.token1Symbol],
                    'large',
                  )}
                  <p className="text-subheader text-light ms-4">
                    {farmData.poolData?.token0Symbol} / {farmData.poolData?.token1Symbol}
                  </p>
                </div>

                <div className="d-flex align-items-end">
                  <div className="flex-1">
                    <p className="text-small text-bold mb-2">Duration</p>
                    <select
                      disabled={campaignHasActiveRewards}
                      onChange={handleSelectDurationChange}
                      value={selectedDuration}
                      className="form-control"
                    >
                      {selectOptions}
                    </select>
                  </div>

                  <Button
                    className="ws-no-wrap ms-3"
                    loading={loadingEnableReward}
                    onClick={handleEnableRewardClick}
                    disabled={!canEnableReward}
                  >
                    Set duration
                  </Button>
                </div>

                <hr />

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
                {campaignDuration === 0 ? (
                  <div className="my-4">
                    <p className="text-warning">Please set campaign duration</p>
                  </div>
                ) : (
                  <div className="row">
                    <div className="col-6">
                      {campaignHasRewards &&
                        farmData.rewardsData?.reduce((acc: ReactNode[], reward: IReward, index) => {
                          const rewardActive = reward.rewardEnd > Date.now();
                          const rewardSymbol = mapWHBARAddress(reward);

                          acc.push(
                            <div
                              onClick={() => handleRewardClick(reward)}
                              key={index}
                              className={`d-flex justify-content-between align-items-center my-4 container-farm-reward ${
                                selectedRewardToken.symbol === reward.symbol ? 'is-selected' : ''
                              }`}
                            >
                              <div className="d-flex align-items-center">
                                <IconToken symbol={reward.symbol} />{' '}
                                <span className="text-main ms-3">{rewardSymbol}</span>
                              </div>
                              <div>
                                {rewardActive ? (
                                  <span className="text-small text-numeric">
                                    {formatStringWeiToStringEther(
                                      reward.totalAmount,
                                      reward.decimals,
                                    )}
                                  </span>
                                ) : null}
                              </div>
                              {/* {rewardActive ? (
                                <span className="text-small text-success ms-3">
                                  Active untill {timestampToDate(reward.rewardEnd)}
                                </span>
                              ) : (
                                <span className="text-small text-danger ms-3">Expired</span>
                              )} */}
                            </div>,
                          );
                          return acc;
                        }, [])}
                    </div>
                    <div className="col-6">
                      {showManageReward && (
                        <ManageReward
                          token={selectedRewardToken}
                          userId={userId}
                          farmAddress={address || ''}
                          sdk={sdk}
                          connectorInstance={connectorInstance}
                          selectedDuration={selectedDuration}
                          campaignEnd={campaignEnd}
                        />
                      )}
                    </div>
                  </div>
                )}
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
          )
        ) : (
          <div className="text-center mt-8">
            <div className="mt-4">
              <Button
                disabled={isHashpackLoading}
                size="small"
                onClick={() => setShowConnectModal(true)}
                type="primary"
              >
                Connect Wallet
              </Button>
            </div>
          </div>
        )}
      </div>
      <ToasterWrapper />
    </div>
  );
};

export default ManageFarmDetails;
