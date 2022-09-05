import React, { useContext, useMemo, useState } from 'react';
import Tippy from '@tippyjs/react';
import toast from 'react-hot-toast';

import { GlobalContext } from '../providers/Global';

import { IFarmData, IReward } from '../interfaces/tokens';

import Icon from './Icon';
import IconToken from './IconToken';
import PageHeader from './PageHeader';
import Button from './Button';
import ToasterWrapper from './ToasterWrapper';
import FarmActions from './FarmActions';

import { formatIcons } from '../utils/iconUtils';
import {
  formatStringETHtoPriceFormatted,
  formatStringToPercentage,
  formatStringToPrice,
  formatStringWeiToStringEther,
  stripStringToFixedDecimals,
} from '../utils/numberUtils';

import getErrorMessage from '../content/errors';
import { timestampToDate } from '../utils/timeUtils';

interface IFarmDetailsProps {
  farmData: IFarmData;
  setShowFarmDetails: React.Dispatch<React.SetStateAction<boolean>>;
}

const FarmDetails = ({ farmData, setShowFarmDetails }: IFarmDetailsProps) => {
  const contextValue = useContext(GlobalContext);
  const { connection, sdk } = contextValue;
  const { userId, hashconnectConnectorInstance } = connection;

  const [loadingHarvest, setLoadingHarvest] = useState(false);

  const userRewardsUSD = useMemo(() => {
    const { userStakingData } = farmData;

    return userStakingData.rewardsAccumulated?.reduce((acc: string, currentValue) => {
      return (Number(acc) + Number(currentValue.totalAccumulatedUSD)).toString();
    }, '0');
  }, [farmData]);

  const userShare = useMemo(() => {
    const { totalStaked, userStakingData } = farmData;

    if (Number(totalStaked) === 0) return '0';

    return ((Number(userStakingData.stakedAmount) / Number(totalStaked)) * 100).toString();
  }, [farmData]);

  // Handlers
  const handleHarvestClick = async () => {
    setLoadingHarvest(true);
    try {
      const receipt = await sdk.collectRewards(
        hashconnectConnectorInstance,
        farmData.address,
        userId,
      );
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
    }
  };

  const renderCampaignEndDate = (campaignEndDate: number) => {
    const campaignEnded = campaignEndDate < Date.now();

    const dateContent = (
      <>
        <span className={`icon-campaign-status ${!campaignEnded ? 'is-active' : ''}`}></span>
        <span className="text-micro ms-3">
          {campaignEnded ? (
            'Campaign Ended'
          ) : (
            <>
              Active until <span className="text-bold">{timestampToDate(campaignEndDate)}</span>
            </>
          )}
        </span>
      </>
    );

    return <div className="d-flex align-items-center">{dateContent}</div>;
  };

  const hasUserStaked = farmData.userStakingData.stakedAmount !== '0';
  const hasUserProvided = farmData.poolData.lpShares !== '0';
  const campaignEnded = farmData.campaignEndDate < Date.now();

  return (
    <div className="d-flex justify-content-center">
      <div className="container-max-with-1042">
        <PageHeader title="Manage Farm" handleBackClick={() => setShowFarmDetails(false)} />
        <div className="row">
          <div className="col-8">
            <div className="container-blue-neutral-800 rounded p-5">
              <div className="d-flex justify-content-between align-items-start">
                <div className="d-flex align-items-center">
                  {formatIcons(
                    [farmData.poolData.token0Symbol, farmData.poolData.token1Symbol],
                    'large',
                  )}
                  <p className="text-subheader text-light ms-4">
                    {farmData.poolData.token0Symbol} / {farmData.poolData.token1Symbol}
                  </p>
                </div>

                <div className="container-campaign-status d-flex align-items-center">
                  {renderCampaignEndDate(farmData.campaignEndDate)}
                </div>
              </div>

              <div className="container-border-rounded-bn-500 mt-6">
                <div className="row">
                  <div className="col-4 d-flex align-items-center">
                    <p className="d-flex align-items-center">
                      <span className="text-secondary text-small">Total APR</span>
                      <Tippy content="Your annual rate of return, expressed as a percentage. Interest paid in previous periods is not accounted for.">
                        <span className="ms-2">
                          <Icon name="hint" color="gray" size="small" />
                        </span>
                      </Tippy>
                    </p>
                  </div>
                  <div className="col-4">
                    <p className="text-subheader text-numeric">
                      {formatStringToPercentage(stripStringToFixedDecimals(farmData.APR, 2))}
                    </p>
                  </div>
                </div>

                <div className="row mt-4">
                  <div className="col-4 d-flex align-items-center">
                    <p className="d-flex align-items-center">
                      <span className="text-secondary text-small">Total Staked</span>
                      <Tippy content="The total amount of staked tokens in this farm pool, denominated in $USD.">
                        <span className="ms-2">
                          <Icon name="hint" color="gray" size="small" />
                        </span>
                      </Tippy>
                    </p>
                  </div>
                  <div className="col-4">
                    <p className="text-main text-numeric">
                      {formatStringToPrice(stripStringToFixedDecimals(farmData.totalStakedUSD, 2))}
                    </p>
                  </div>
                </div>

                <hr className="my-5" />

                <div className="row mt-4">
                  <div className="col-4 d-flex align-items-center">
                    <p className="d-flex align-items-center">
                      <span className="text-secondary text-small">Rewards</span>
                      <Tippy content="The tokens you will be rewarded with upon harvest.">
                        <span className="ms-2">
                          <Icon name="hint" color="gray" size="small" />
                        </span>
                      </Tippy>
                    </p>
                  </div>
                  <div className="col-4 d-flex align-items-center">
                    {farmData.rewardsData.length > 0 &&
                      farmData.rewardsData.map((reward, index) => (
                        <div key={index} className="d-flex align-items-center me-4">
                          <IconToken symbol={reward.symbol} />{' '}
                          <span className="text-main ms-3">{reward.symbol}</span>
                        </div>
                      ))}
                  </div>
                </div>

                <hr className="my-5" />

                <div className="row mt-4">
                  <div className="col-4 d-flex align-items-center">
                    <p className="d-flex align-items-center">
                      <span className="text-secondary text-small">Your share</span>
                      <Tippy content="Your staked amount in this farm pool, expressed as a percentage.">
                        <span className="ms-2">
                          <Icon name="hint" color="gray" size="small" />
                        </span>
                      </Tippy>
                    </p>
                  </div>
                  <div className="col-4 d-flex align-items-center">
                    <p className="text-main">{stripStringToFixedDecimals(userShare, 2)}%</p>
                  </div>
                </div>

                <div className="row mt-4">
                  <div className="col-4 d-flex align-items-center">
                    <p className="d-flex align-items-center">
                      <span className="text-secondary text-small">Staked LP Tokens</span>
                      <Tippy content="The amount of your staked tokens in $USD, as well as staked tokens count.">
                        <span className="ms-2">
                          <Icon name="hint" color="gray" size="small" />
                        </span>
                      </Tippy>
                    </p>
                  </div>
                  <div className="col-8 d-flex align-items-center">
                    <p className="text-subheader text-numeric">
                      {formatStringToPrice(
                        stripStringToFixedDecimals(
                          farmData.userStakingData.stakedAmountUSD as string,
                          2,
                        ),
                      )}
                    </p>
                    <p className="d-flex align-items-center ms-3 mt-2">
                      <span className="text-secondary text-main">
                        {formatStringETHtoPriceFormatted(
                          formatStringWeiToStringEther(
                            farmData.userStakingData.stakedAmount || '0',
                          ),
                        )}
                      </span>

                      <IconToken className="ms-3" symbol="LP" />
                    </p>
                  </div>
                </div>
              </div>

              <div className="container-blue-neutral rounded p-5 mt-5">
                {hasUserStaked ? (
                  <>
                    <div className="d-flex justify-content-between align-items-start">
                      <p className="text-small text-bold">Pending rewards</p>
                      <div className="d-flex justify-content-end">
                        <Button
                          loading={loadingHarvest}
                          onClick={handleHarvestClick}
                          size="small"
                          type="primary"
                        >
                          Harvest
                        </Button>
                      </div>
                    </div>

                    <div className="mt-5">
                      <p className="text-title text-numeric">
                        {formatStringToPrice(userRewardsUSD as string)}
                      </p>

                      <div className="d-flex align-items-center mt-4">
                        {farmData.userStakingData.rewardsAccumulated?.map(reward => {
                          const rewardData =
                            farmData.rewardsData.find((rewardSingle: IReward) => {
                              return rewardSingle.address === reward.address;
                            }) || ({} as IReward);

                          const rewardSymbol = rewardData.symbol;
                          const rewardDecimals = rewardData.decimals;

                          return (
                            <p
                              key={rewardSymbol}
                              className="text-main text-secondary d-flex align-items-center me-3"
                            >
                              <span className="text-numeric me-3">
                                {formatStringWeiToStringEther(
                                  reward.totalAccumulated || '0',
                                  rewardDecimals,
                                )}
                              </span>
                              <IconToken symbol={rewardSymbol} />
                              <span className="ms-3">{rewardSymbol}</span>
                            </p>
                          );
                        })}
                      </div>
                    </div>
                  </>
                ) : campaignEnded ? (
                  <div>
                    <p className="text-small text-bold text-center my-5">Campaign is not active</p>
                  </div>
                ) : (
                  <div>
                    <p className="text-small text-bold text-center my-5">
                      Stake Your LP Tokens and Earn Rewards
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <FarmActions
            campaignEnded={campaignEnded}
            hasUserStaked={hasUserStaked}
            hasUserProvided={hasUserProvided}
            farmData={farmData}
          />
        </div>
      </div>
      <ToasterWrapper />
    </div>
  );
};

export default FarmDetails;
