import React, { ReactNode, useContext, useEffect, useMemo, useState } from 'react';
import Tippy from '@tippyjs/react';
import toast from 'react-hot-toast';
import { useParams, useNavigate } from 'react-router-dom';

import { GlobalContext } from '../providers/Global';

import { IReward, IRewardsAccumulated, ITokenData, TokenType } from '../interfaces/tokens';

import Icon from '../components/Icon';
import IconToken from '../components/IconToken';
import PageHeader from '../components/PageHeader';
import Button from '../components/Button';
import ToasterWrapper from '../components/ToasterWrapper';
import FarmActions from '../components/FarmActions';
import Modal from '../components/Modal';
import ConfirmTransactionModalContent from '../components/Modals/ConfirmTransactionModalContent';
import Confirmation from '../components/Confirmation';
import Loader from '../components/Loader';

import { formatIcons } from '../utils/iconUtils';
import {
  formatStringETHtoPriceFormatted,
  formatStringToPercentage,
  formatStringToPrice,
  formatStringWeiToStringEther,
  stripStringToFixedDecimals,
} from '../utils/numberUtils';
import { renderCampaignEndDate } from '../utils/farmUtils';

import { getUserAssociatedTokens, mapWHBARAddress } from '../utils/tokenUtils';

import usePoolsByTokensList from '../hooks/usePoolsByTokensList';
import useTokensByListIds from '../hooks/useTokensByListIds';
import useFarmByAddress from '../hooks/useFarmByAddress';
import useUserFarmPosition from '../hooks/useUserFarmPosition';

import getErrorMessage from '../content/errors';

import { restrictedFarms, useQueryOptions, useQueryOptionsPoolsFarms } from '../constants';

const FarmDetails = () => {
  const contextValue = useContext(GlobalContext);
  const { connection, sdk, tokensWhitelisted, hbarPrice } = contextValue;
  const { userId, connectorInstance, isHashpackLoading, setShowConnectModal, connected } =
    connection;
  console.log('userId', userId);

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

  // Fetch user position from contract when connected
  const {
    userPosition: contractUserPosition,
    loading: loadingUserPosition,
    refetch: refetchUserPosition,
  } = useUserFarmPosition(
    campaignAddress || '',
    userId || '',
    farmData.poolData,
    pools,
    hbarPrice,
    farmData.rewardsData || [],
    connected && !isHashpackLoading && !!campaignAddress && !!userId,
  );

  // Merge contract user position with static farm data
  // Use contract data when available, fallback to static data
  const mergedFarmData = useMemo(() => {
    // If we have contract position data (even if it's empty/zero), use it
    // Only fall back to static data if contract position is null (not fetched yet) and still loading
    if (contractUserPosition !== null) {
      // Contract data is available (even if stakedAmount is '0'), use it
      return {
        ...farmData,
        userStakingData: contractUserPosition,
      };
    }

    // If still loading and no contract data yet, show static data
    // Once loading completes, contractUserPosition will be set (even if empty)
    if (loadingUserPosition) {
      return farmData;
    }

    // Loading completed but no contract position means user has no position
    // Return farm data with empty position
    return {
      ...farmData,
      userStakingData: {
        stakedAmount: '0',
        stakedAmountUSD: '0',
        rewardsAccumulated: [],
      },
    };
  }, [farmData, contractUserPosition, loadingUserPosition]);

  const [loadingHarvest, setLoadingHarvest] = useState(false);
  const [showHarvestModal, setShowHarvestModal] = useState(false);

  const [userAssociatedTokens, setUserAssociatedTokens] = useState<string[]>([]);
  const [loadingAssociate, setLoadingAssociate] = useState(false);

  const userRewardsUSD = useMemo(() => {
    if (Object.keys(mergedFarmData).length !== 0) {
      const { userStakingData } = mergedFarmData;

      if (!userStakingData?.rewardsAccumulated) return '0';

      return userStakingData?.rewardsAccumulated?.reduce((acc: string, currentValue) => {
        return (Number(acc) + Number(currentValue.totalAccumulatedUSD)).toString();
      }, '0');
    }
  }, [mergedFarmData]);

  const userShare = useMemo(() => {
    const { totalStaked, userStakingData } = mergedFarmData;

    if (!userStakingData?.stakedAmount || !totalStaked || Number(totalStaked) === 0) return '0';

    return ((Number(userStakingData?.stakedAmount) / Number(totalStaked)) * 100).toString();
  }, [mergedFarmData]);

  // Handlers
  const handleHarvestConfirm = async () => {
    setLoadingHarvest(true);
    try {
      const receipt = await sdk.collectRewards(connectorInstance, mergedFarmData.address, userId);
      const {
        response: { success, error },
      } = receipt;

      if (success) {
        toast.success('Success! Rewards were harvested.');
        // Refetch user position after successful harvest
        // Wait a bit for the transaction to be processed
        setTimeout(() => {
          refetchUserPosition();
        }, 2000);
      } else {
        toast.error(getErrorMessage(error.status ? error.status : error));
      }
    } catch (err) {
      console.error(err);
      toast('Error on harvest');
    } finally {
      setLoadingHarvest(false);
      setShowHarvestModal(false);
    }
  };

  const handleAssociateClick = async (token: ITokenData) => {
    setLoadingAssociate(true);

    try {
      const receipt = await sdk.associateToken(connectorInstance, userId, token.hederaId);
      const {
        response: { success, error },
      } = receipt;

      if (!success) {
        toast.error(getErrorMessage(error.status ? error.status : error));
      } else {
        const tokens = await getUserAssociatedTokens(userId);
        setUserAssociatedTokens(tokens);
      }
    } catch (err) {
      console.error(err);
      toast('Error on associate');
    } finally {
      setLoadingAssociate(false);
    }
  };

  // Check for associations
  useEffect(() => {
    const checkTokenAssociation = async (userId: string) => {
      const tokens = await getUserAssociatedTokens(userId);
      setUserAssociatedTokens(tokens);
    };

    userId && checkTokenAssociation(userId);
  }, [userId]);

  const getTokenIsAssociated = (token: ITokenData) => {
    const notHTS =
      Object.keys(token).length === 0 ||
      token.type === TokenType.HBAR ||
      token.type === TokenType.ERC20;
    return notHTS || userAssociatedTokens?.includes(token.hederaId);
  };

  const userRewardsAddresses =
    mergedFarmData.userStakingData?.rewardsAccumulated &&
    mergedFarmData.userStakingData?.rewardsAccumulated?.length > 0
      ? mergedFarmData.userStakingData?.rewardsAccumulated.map(reward => reward.address)
      : [];

  // Get selected tokens to check for assosiations
  const { tokens: userRewardsData } = useTokensByListIds(userRewardsAddresses, useQueryOptions);

  const hasUserStaked = mergedFarmData.userStakingData?.stakedAmount !== '0';
  const hasUserProvided = mergedFarmData.poolData?.lpShares !== '0';
  const campaignEnded = mergedFarmData.campaignEndDate < Date.now();
  const haveFarm = Object.keys(mergedFarmData).length !== 0;
  const campaignHasRewards = mergedFarmData.rewardsData?.length > 0;
  const campaignHasActiveRewards = campaignHasRewards
    ? Object.keys(mergedFarmData.rewardsData.find(reward => reward.rewardEnd > Date.now()) || {})
        .length > 0
    : false;

  const tokensToAssociate = userRewardsData?.filter(token => !getTokenIsAssociated(token));

  return isHashpackLoading ? (
    <Loader />
  ) : processingFarms ? (
    <Loader />
  ) : (
    <div className="d-flex justify-content-center">
      <div className="container-max-with-1042">
        <PageHeader title="Manage Farm" handleBackClick={() => navigate('/farms')} />
        {haveFarm ? (
          <div className="row">
            <div className="col-md-7">
              <div className="container-blue-neutral-800 rounded p-4 p-lg-5">
                <div className="d-md-flex justify-content-between align-items-start">
                  <div className="d-flex align-items-center">
                    {formatIcons(
                      [
                        mergedFarmData.poolData?.token0Symbol,
                        mergedFarmData.poolData?.token1Symbol,
                      ],
                      'large',
                    )}
                    <p className="text-subheader text-light ms-4">
                      {mergedFarmData.poolData?.token0Symbol} /{' '}
                      {mergedFarmData.poolData?.token1Symbol}
                    </p>
                  </div>

                  <div className="container-campaign-status mt-4 mt-md-0 d-flex align-items-center">
                    {renderCampaignEndDate(mergedFarmData.campaignEndDate)}
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
                        {formatStringToPercentage(
                          stripStringToFixedDecimals(mergedFarmData.APR, 2),
                        )}
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
                          stripStringToFixedDecimals(mergedFarmData.totalStakedUSD, 2),
                        )}
                      </p>
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
                    <div className="col-6 col-md-4 d-md-flex align-items-center">
                      {campaignHasRewards &&
                        mergedFarmData.rewardsData?.reduce(
                          (acc: ReactNode[], reward: IReward, index) => {
                            // When reward is enabled, but not sent -> do not show
                            const haveRewardSendToCampaign =
                              reward.totalAmount && Number(reward.totalAmount || reward) !== 0;

                            const rewardActive = reward.rewardEnd > Date.now();
                            // When all rewards are inactive -> show all, when at least one is active -> show only active
                            const showReward =
                              haveRewardSendToCampaign &&
                              (rewardActive || !campaignHasActiveRewards);

                            if (showReward) {
                              const rewardSymbol = mapWHBARAddress(reward);

                              acc.push(
                                <div
                                  key={index}
                                  className="d-flex align-items-center mt-3 mt-lg-0 me-4"
                                >
                                  <IconToken symbol={reward.symbol} />{' '}
                                  <span className="text-main ms-3">{rewardSymbol}</span>
                                </div>,
                              );
                            }
                            return acc;
                          },
                          [],
                        )}
                    </div>
                  </div>

                  {connected && !isHashpackLoading ? (
                    <>
                      <hr className="my-5" />

                      {loadingUserPosition ? (
                        <div className="d-flex justify-content-center my-5">
                          <Loader />
                        </div>
                      ) : (
                        <>
                          <div className="row mt-4">
                            <div className="col-6 col-md-4 d-flex align-items-center">
                              <p className="d-flex align-items-center">
                                <span className="text-secondary text-small">Your share</span>
                                <Tippy content="Your staked amount in this farm pool, expressed as a percentage.">
                                  <span className="ms-2">
                                    <Icon name="hint" color="gray" size="small" />
                                  </span>
                                </Tippy>
                              </p>
                            </div>
                            <div className="col-6 col-md-4 d-flex align-items-center">
                              <p className="text-main">
                                {stripStringToFixedDecimals(userShare || '0', 2)}%
                              </p>
                            </div>
                          </div>

                          <div className="row mt-4">
                            <div className="col-6 col-md-4 d-flex align-items-center">
                              <p className="d-flex align-items-center">
                                <span className="text-secondary text-small">Staked LP Tokens</span>
                                <Tippy content="The amount of your staked tokens in $USD, as well as staked tokens count.">
                                  <span className="ms-2">
                                    <Icon name="hint" color="gray" size="small" />
                                  </span>
                                </Tippy>
                              </p>
                            </div>
                            <div className="col-6 col-md-8 d-md-flex align-items-center">
                              <p className="text-subheader text-numeric">
                                {formatStringToPrice(
                                  stripStringToFixedDecimals(
                                    mergedFarmData.userStakingData?.stakedAmountUSD as string,
                                    2,
                                  ),
                                )}
                              </p>
                              <p className="d-flex align-items-center ms-md-3 mt-2">
                                <span className="text-secondary text-main">
                                  {formatStringETHtoPriceFormatted(
                                    formatStringWeiToStringEther(
                                      mergedFarmData.userStakingData?.stakedAmount || '0',
                                    ),
                                  )}
                                </span>

                                <IconToken className="ms-3" symbol="LP" />
                              </p>
                            </div>
                          </div>
                        </>
                      )}
                    </>
                  ) : null}
                </div>

                <div className="container-blue-neutral rounded p-4 p-lg-5 mt-4 mt-lg-5">
                  {connected && !isHashpackLoading ? (
                    hasUserStaked && !restrictedFarms.includes(mergedFarmData.address) ? (
                      <>
                        <div className="d-flex justify-content-between align-items-start">
                          <div className="d-flex align-items-center">
                            <p className="text-small text-bold">Pending rewards</p>
                            <Tippy
                              content={`Your pending rewards are calculated in real time. The amount shown is a time-sensitive estimation, and might slightly differ from the actual amount. Before and after actions are taken, it takes 5-10 secs for the amounts to update.`}
                            >
                              <span className="ms-2">
                                <Icon name="hint" />
                              </span>
                            </Tippy>
                          </div>

                          <div className="d-flex justify-content-end">
                            {tokensToAssociate && tokensToAssociate?.length > 0 ? (
                              tokensToAssociate.map((token, index) => (
                                <Button
                                  key={index}
                                  loading={loadingAssociate}
                                  onClick={() => handleAssociateClick(token)}
                                  size="small"
                                  type="primary"
                                >
                                  {`Associate ${token.symbol}`}
                                </Button>
                              ))
                            ) : (
                              <Button
                                loading={loadingHarvest}
                                onClick={() => setShowHarvestModal(true)}
                                size="small"
                                type="primary"
                              >
                                Harvest
                              </Button>
                            )}
                          </div>
                        </div>

                        <div className="mt-5">
                          <p className="text-title text-success text-numeric">
                            {formatStringToPrice(userRewardsUSD as string, true)}
                          </p>

                          <hr className="my-4" />

                          <div className="mt-4">
                            {campaignHasRewards &&
                              mergedFarmData.rewardsData?.reduce(
                                (acc: ReactNode[], reward: IReward) => {
                                  const userRewardData =
                                    mergedFarmData.userStakingData?.rewardsAccumulated?.find(
                                      (rewardSingle: IRewardsAccumulated) => {
                                        return rewardSingle.address === reward.address;
                                      },
                                    ) || ({} as IRewardsAccumulated);

                                  const userRewardAccumulated =
                                    userRewardData?.totalAccumulated &&
                                    Number(userRewardData.totalAccumulated) > 0;

                                  if (userRewardAccumulated) {
                                    const rewardDecimals = reward.decimals;
                                    const rewardSymbol = mapWHBARAddress(reward);

                                    acc.push(
                                      <p
                                        key={rewardSymbol}
                                        className="text-main d-flex justify-content-between align-items-center mt-4"
                                      >
                                        <span className="d-flex align-items-center text-secondary">
                                          <IconToken symbol={rewardSymbol} />
                                          <span className="ms-3">{rewardSymbol}</span>
                                        </span>
                                        <span className="text-numeric ms-3">
                                          {formatStringWeiToStringEther(
                                            userRewardData.totalAccumulated || '0',
                                            rewardDecimals,
                                          )}
                                        </span>
                                      </p>,
                                    );
                                  }
                                  return acc;
                                },
                                [],
                              )}
                          </div>
                        </div>

                        {showHarvestModal ? (
                          <Modal
                            show={showHarvestModal}
                            closeModal={() => setShowHarvestModal(false)}
                          >
                            <ConfirmTransactionModalContent
                              modalTitle="Harvest Pending Rewards"
                              closeModal={() => setShowHarvestModal(false)}
                              confirmTansaction={handleHarvestConfirm}
                              confirmButtonLabel="Confirm"
                              isLoading={loadingHarvest}
                            >
                              {loadingHarvest ? (
                                <Confirmation confirmationText={'Harvesting reward tokens'} />
                              ) : (
                                <>
                                  <div className="text-small">Estimated pending rewards:</div>
                                  {mergedFarmData.rewardsData?.map((reward: IReward) => {
                                    const userReward =
                                      mergedFarmData.userStakingData?.rewardsAccumulated?.find(
                                        (currReward: IRewardsAccumulated) =>
                                          currReward.address === reward.address,
                                      );
                                    return (
                                      <div
                                        key={reward.address}
                                        className="d-flex justify-content-between align-items-center mt-4"
                                      >
                                        <div className="d-flex align-items-center">
                                          <IconToken symbol={reward.symbol} />
                                          <span className="text-main ms-3">{reward.symbol}</span>
                                        </div>

                                        <div className="text-main text-numeric">
                                          {formatStringWeiToStringEther(
                                            userReward?.totalAccumulated || '0',
                                            reward.decimals,
                                          )}
                                        </div>
                                      </div>
                                    );
                                  })}
                                </>
                              )}
                            </ConfirmTransactionModalContent>
                          </Modal>
                        ) : null}
                      </>
                    ) : campaignEnded ? (
                      <div>
                        <p className="text-small text-bold text-center my-5">
                          Campaign is not active
                        </p>
                      </div>
                    ) : (
                      <div>
                        <p className="text-small text-bold text-center my-5">
                          Stake Your LP Tokens and Earn Rewards
                        </p>
                      </div>
                    )
                  ) : (
                    <div className="text-center">
                      <Button
                        size="small"
                        disabled={isHashpackLoading}
                        onClick={() => setShowConnectModal(true)}
                      >
                        Connect wallet
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <FarmActions
              campaignEnded={campaignEnded}
              hasUserStaked={hasUserStaked}
              hasUserProvided={hasUserProvided}
              farmData={mergedFarmData}
              loadingAssociate={loadingAssociate}
              tokensToAssociate={tokensToAssociate || []}
              handleAssociateClick={handleAssociateClick}
            />
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
