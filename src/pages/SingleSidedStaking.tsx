import { ReactNode, useContext, useEffect, useMemo, useState } from 'react';
import Tippy from '@tippyjs/react';
import toast from 'react-hot-toast';

import { GlobalContext } from '../providers/Global';

import {
  IPoolExtendedData,
  IReward,
  IRewardsAccumulated,
  ITokenData,
  IUserStakingData,
  TokenType,
} from '../interfaces/tokens';

import Icon from '../components/Icon';
import IconToken from '../components/IconToken';
import PageHeader from '../components/PageHeader';
import Button from '../components/Button';
import ToasterWrapper from '../components/ToasterWrapper';
import SingleSidedStakingActions from '../components/SingleSidedStakingActions';
import Modal from '../components/Modal';
import ConfirmTransactionModalContent from '../components/Modals/ConfirmTransactionModalContent';
import Confirmation from '../components/Confirmation';
import Loader from '../components/Loader';

import {
  formatStringETHtoPriceFormatted,
  formatStringToPercentage,
  formatStringToPrice,
  formatStringWeiToStringEther,
  stripStringToFixedDecimals,
} from '../utils/numberUtils';
import { renderCampaignEndDate } from '../utils/farmUtils';

import {
  addressToId,
  getHTSTokenWalletBalance,
  getUserAssociatedTokens,
  mapWHBARAddress,
} from '../utils/tokenUtils';

import usePoolsByTokensList from '../hooks/usePoolsByTokensList';
import useTokensByListIds from '../hooks/useTokensByListIds';
import useSSSByAddress from '../hooks/useSSSByAddress';

import getErrorMessage from '../content/errors';

import { useQueryOptions, useQueryOptionsPoolsFarms } from '../constants';

const SingleSidedStaking = () => {
  const contextValue = useContext(GlobalContext);
  const { connection, sdk, tokensWhitelisted, hbarPrice } = contextValue;
  const { userId, connectorInstance, isHashpackLoading, setShowConnectModal, connected } =
    connection;

  const campaignAddress = process.env.REACT_APP_SINGLE_SIDED_STAKING_ADDRESS;
  const stakingTokenId = addressToId(process.env.REACT_APP_HELI_TOKEN_ADDRESS as string);
  const tokensWhitelistedAddresses = tokensWhitelisted.map(item => item.address) || [];

  const heliPoolTokens = [
    process.env.REACT_APP_HELI_TOKEN_ADDRESS as string,
    process.env.REACT_APP_WHBAR_ADDRESS as string,
  ];

  const { poolsByTokenList: pools } = usePoolsByTokensList(
    useQueryOptionsPoolsFarms,
    true,
    tokensWhitelistedAddresses,
  );

  const heliPool =
    pools.find(
      pool => heliPoolTokens.includes(pool.token0) && heliPoolTokens.includes(pool.token1),
    ) || ({} as IPoolExtendedData);

  let heliPrice = 0;

  if (pools && pools.length > 0) {
    const { token0AmountFormatted, token1AmountFormatted } = heliPool;
    const heliForHbar = Number(token1AmountFormatted) / Number(token0AmountFormatted);
    heliPrice = hbarPrice / heliForHbar;
  }

  const { sss: sssData, processingSss } = useSSSByAddress(
    useQueryOptionsPoolsFarms,
    userId,
    heliPrice,
    campaignAddress || '',
  );

  const [loadingHarvest, setLoadingHarvest] = useState(false);
  const [showHarvestModal, setShowHarvestModal] = useState(false);

  const [userAssociatedTokens, setUserAssociatedTokens] = useState<string[]>([]);
  const [loadingAssociate, setLoadingAssociate] = useState(false);
  const [stakingTokenBalance, setStakingTokenBalance] = useState(0);

  const userRewardsUSD = useMemo(() => {
    if (Object.keys(sssData).length !== 0) {
      const { userStakingData } = sssData;

      if (!userStakingData?.rewardsAccumulated) return '0';

      return userStakingData?.rewardsAccumulated?.reduce((acc: string, currentValue) => {
        return (Number(acc) + Number(currentValue.totalAccumulatedUSD)).toString();
      }, '0');
    }
  }, [sssData]);

  const userShare = useMemo(() => {
    const { totalStaked, userStakingData } = sssData;

    if (!userStakingData?.stakedAmount || !totalStaked || Number(totalStaked) === 0) return '0';

    return ((Number(userStakingData?.stakedAmount) / Number(totalStaked)) * 100).toString();
  }, [sssData]);

  // Handlers
  const handleHarvestConfirm = async () => {
    setLoadingHarvest(true);
    try {
      const receipt = await sdk.collectRewards(connectorInstance, sssData.address, userId);
      const {
        response: { success, error },
      } = receipt;

      if (success) {
        toast.success('Success! Rewards were harvested.');
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

  useEffect(() => {
    const getStakingTokenBalance = async (userId: string, stakingTokenId: string) => {
      const stakingToken = await getHTSTokenWalletBalance(userId, stakingTokenId);
      setStakingTokenBalance(stakingToken);
    };

    userId && stakingTokenId && getStakingTokenBalance(userId, stakingTokenId);
  }, [userId, stakingTokenId]);

  const userRewardsAddresses =
    sssData.userStakingData?.rewardsAccumulated &&
    sssData.userStakingData?.rewardsAccumulated?.length > 0
      ? sssData.userStakingData?.rewardsAccumulated.map(reward => reward.address)
      : [];

  // Get selected tokens to check for assosiations
  const { tokens: userRewardsData } = useTokensByListIds(userRewardsAddresses, useQueryOptions);

  const hasUserStaked = sssData.userStakingData?.stakedAmount !== '0';
  const hasUserProvided = stakingTokenBalance !== 0;
  const campaignEnded = sssData.campaignEndDate < Date.now();
  const haveFarm = Object.keys(sssData).length !== 0;
  const campaignHasRewards = sssData.rewardsData?.length > 0;
  const campaignHasActiveRewards = campaignHasRewards
    ? Object.keys(sssData.rewardsData.find(reward => reward.rewardEnd > Date.now()) || {}).length >
      0
    : false;

  const tokensToAssociate = userRewardsData?.filter(token => !getTokenIsAssociated(token));

  return isHashpackLoading ? (
    <Loader />
  ) : processingSss ? (
    <Loader />
  ) : (
    <div className="d-flex justify-content-center">
      <div className="container-max-with-1042">
        <PageHeader title="Single Sided Staking" />
        {haveFarm ? (
          <div className="row">
            <div className="col-md-7">
              <div className="container-blue-neutral-800 rounded p-4 p-lg-5">
                <div className="d-md-flex justify-content-between align-items-start">
                  <div className="d-flex align-items-center">
                    <IconToken size={'large'} symbol={'HELI'} />
                    <p className="text-subheader text-light ms-3">HELI</p>
                  </div>

                  <div className="container-campaign-status mt-4 mt-md-0 d-flex align-items-center">
                    {renderCampaignEndDate(sssData.campaignEndDate)}
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
                        {formatStringToPercentage(stripStringToFixedDecimals(sssData.APR, 2))}
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
                        {formatStringToPrice(stripStringToFixedDecimals(sssData.totalStakedUSD, 2))}
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
                        sssData.rewardsData?.reduce((acc: ReactNode[], reward: IReward, index) => {
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
                        }, [])}
                    </div>
                  </div>

                  {connected && !isHashpackLoading ? (
                    <>
                      <hr className="my-5" />

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
                            <span className="text-secondary text-small">Staked HELI Tokens</span>
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
                                sssData.userStakingData?.stakedAmountUSD as string,
                                2,
                              ),
                            )}
                          </p>
                          <p className="d-flex align-items-center ms-md-3 mt-2">
                            <span className="text-secondary text-main">
                              {formatStringETHtoPriceFormatted(
                                formatStringWeiToStringEther(
                                  sssData.userStakingData?.stakedAmount || '0',
                                  8,
                                ),
                              )}
                            </span>

                            <IconToken className="ms-3" symbol="HELI" />
                          </p>
                        </div>
                      </div>
                    </>
                  ) : null}
                </div>

                <div className="container-blue-neutral rounded p-4 p-lg-5 mt-4 mt-lg-5">
                  {connected && !isHashpackLoading ? (
                    hasUserStaked ? (
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
                              sssData.rewardsData?.reduce((acc: ReactNode[], reward: IReward) => {
                                const userRewardData =
                                  sssData.userStakingData?.rewardsAccumulated?.find(
                                    (rewardSingle: IUserStakingData) => {
                                      return rewardSingle.address === reward.address;
                                    },
                                  ) || ({} as IUserStakingData);

                                const userRewardAccumulated = userRewardData.totalAccumulated > 0;

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
                              }, [])}
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
                                  {sssData.rewardsData?.map((reward: IReward) => {
                                    const userReward =
                                      sssData.userStakingData?.rewardsAccumulated?.find(
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
                          Stake Your HELI Tokens and Earn Rewards
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
            <SingleSidedStakingActions
              campaignEnded={campaignEnded}
              hasUserStaked={hasUserStaked}
              hasUserProvided={hasUserProvided}
              stakingTokenBalance={stakingTokenBalance}
              sssData={sssData}
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

export default SingleSidedStaking;
