import { useState, useContext, ReactNode } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Tippy from '@tippyjs/react';

import { GlobalContext } from '../providers/Global';

import { IReward } from '../interfaces/tokens';

import Button from '../components/Button';
import Loader from '../components/Loader';
import PageHeader from '../components/PageHeader';
import IconToken from '../components/IconToken';
import Icon from '../components/Icon';

import { formatIcons } from '../utils/iconUtils';
import { timestampToDate } from '../utils/timeUtils';
import { mapWHBARAddress } from '../utils/tokenUtils';

import usePoolsByTokensList from '../hooks/usePoolsByTokensList';
import useFarmByAddress from '../hooks/useFarmByAddress';
import useTokens from '../hooks/useTokens';

import { useQueryOptions, useQueryOptionsPoolsFarms } from '../constants';

const ManageFarmDetails = () => {
  const contextValue = useContext(GlobalContext);
  const { connection, sdk, tokensWhitelisted } = contextValue;
  const { userId, connectorInstance, isHashpackLoading, setShowConnectModal } = connection;

  const navigate = useNavigate();
  const { address } = useParams();
  const tokensWhitelistedAddresses = tokensWhitelisted.map(item => item.address) || [];

  const { tokens, loading: loadingTokens } = useTokens(useQueryOptions);

  const { poolsByTokenList: pools } = usePoolsByTokensList(
    useQueryOptionsPoolsFarms,
    true,
    tokensWhitelistedAddresses,
  );

  const { farm: farmData, processingFarms } = useFarmByAddress(
    useQueryOptionsPoolsFarms,
    userId,
    pools,
    address || '',
  );

  const [selectedDuration, setSelectedDuration] = useState(0);
  const [selectedReward, setSelectedReward] = useState('');
  const [loadingEnableReward, setLoadingEnableReward] = useState(false);

  // Events
  const handleSelectDurationChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedDuration(Number(event.target.value));
  };

  const handleSelectRewardChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedReward(event.target.value);
  };

  const handleEnableRewardClick = async () => {
    setLoadingEnableReward(true);

    try {
      const tx = await sdk.enableReward(connectorInstance, address || '', selectedDuration, userId);

      console.log('tx', tx);
    } catch (e) {
      console.log('error', e);
    } finally {
      setLoadingEnableReward(false);
    }
  };

  const haveFarm = Object.keys(farmData).length !== 0;
  const campaignHasRewards = farmData.rewardsData?.length > 0;
  const campaignHasActiveRewards = campaignHasRewards
    ? Object.keys(farmData.rewardsData.find(reward => reward.rewardEnd > Date.now()) || {}).length >
      0
    : false;
  const canEnableReward = selectedDuration > 0 && selectedReward !== '';

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

                <p className="text-small text-bold mb-2">Duration</p>
                <select
                  onChange={handleSelectDurationChange}
                  value={selectedDuration}
                  className="form-control mb-4"
                >
                  <option value={0}>Select duration</option>
                  <option value={1}>1 month</option>
                  <option value={2}>2 months</option>
                  <option value={3}>3 months</option>
                </select>

                {loadingTokens ? (
                  <p>Lodaing tokens...</p>
                ) : tokens!.length > 0 ? (
                  <>
                    <p className="text-small text-bold mb-2">Reward</p>
                    <select
                      value={selectedReward}
                      onChange={handleSelectRewardChange}
                      className="form-control mb-4"
                    >
                      <option>Select token</option>
                      {tokens?.map((token, index) => (
                        <option key={index}>
                          {token.symbol} ({token.hederaId})
                        </option>
                      ))}
                    </select>
                  </>
                ) : (
                  <p>No tokens tokens...</p>
                )}

                <Button
                  loading={loadingEnableReward}
                  onClick={handleEnableRewardClick}
                  disabled={!canEnableReward}
                >
                  Enable reward
                </Button>

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
                <div className="">
                  {campaignHasRewards &&
                    farmData.rewardsData?.reduce((acc: ReactNode[], reward: IReward, index) => {
                      // When reward is enabled, but not sent -> do not show
                      const haveRewardSendToCampaign =
                        reward.totalAmount && Number(reward.totalAmount || reward) !== 0;

                      const rewardActive = reward.rewardEnd > Date.now();
                      // When all rewards are inactive -> show all, when at least one is active -> show only active
                      const showReward =
                        haveRewardSendToCampaign && (rewardActive || !campaignHasActiveRewards);
                      if (showReward) {
                        const rewardSymbol = mapWHBARAddress(reward);

                        acc.push(
                          <div key={index} className="d-flex align-items-center my-4">
                            <IconToken symbol={reward.symbol} />{' '}
                            <span className="text-main ms-3">{rewardSymbol}</span>
                            {rewardActive ? (
                              <span className="text-small text-success ms-3">
                                Active untill {timestampToDate(reward.rewardEnd)}
                              </span>
                            ) : (
                              <span className="text-small text-danger ms-3">Expired</span>
                            )}
                          </div>,
                        );
                      }
                      return acc;
                    }, [])}
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
    </div>
  );
};

export default ManageFarmDetails;
