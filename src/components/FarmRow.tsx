import React, { useContext } from 'react';
import { GlobalContext } from '../providers/Global';

import { IFarmData, IReward } from '../interfaces/tokens';

import { formatIcons } from '../utils/iconUtils';
import {
  formatStringToPercentage,
  formatStringToPrice,
  stripStringToFixedDecimals,
} from '../utils/numberUtils';
import { NATIVE_TOKEN } from '../utils/tokenUtils';
import { renderCampaignEndDate } from '../utils/farmUtils';

interface IFarmRowProps {
  farmData: IFarmData;
  index: number;
  collapseAll?: boolean;
  setCollapseAll?: (collapsed: boolean) => void;
  handleRowClick: (address: string) => void;
}

const FarmRow = ({ farmData, index, handleRowClick }: IFarmRowProps) => {
  const contextValue = useContext(GlobalContext);
  const { connection } = contextValue;
  const { userId } = connection;

  const handleViewDetailsRowClick = () => {
    handleRowClick(farmData.address);
  };

  const renderCampaignRewards = (farmData: IFarmData) => {
    const campaignHasRewards = farmData.rewardsData?.length > 0;
    const campaignHasActiveRewards = campaignHasRewards
      ? Object.keys(farmData.rewardsData.find(reward => reward.rewardEnd > Date.now()) || {})
          .length > 0
      : false;

    const rewardsSymbols = campaignHasRewards
      ? farmData.rewardsData?.reduce((acc: string[], reward: IReward, index) => {
          // When reward is enabled, but not sent -> do not show
          const haveRewardSendToCampaign =
            reward.totalAmount && Number(reward.totalAmount || reward) !== 0;

          const rewardActive = reward.rewardEnd > Date.now();
          // When all rewards are inactive -> show all, when at least one is active -> show only active
          const showReward =
            haveRewardSendToCampaign && (rewardActive || !campaignHasActiveRewards);

          if (showReward) {
            const rewardSymbol =
              reward.address === process.env.REACT_APP_WHBAR_ADDRESS
                ? NATIVE_TOKEN.symbol
                : reward.symbol;

            acc.push(rewardSymbol);
          }
          return acc;
        }, [])
      : [];

    return formatIcons(rewardsSymbols);
  };

  return (
    <div
      onClick={handleViewDetailsRowClick}
      className={`table-pools-row with-${userId ? '7' : '6'}-columns-farms`}
    >
      <div className="d-none d-md-flex table-pools-cell">
        <span className="text-small">{index + 1}</span>
      </div>
      <div className="table-pools-cell">
        {formatIcons([farmData.poolData.token0Symbol, farmData.poolData.token1Symbol])}
        <p className="text-small ms-3">
          {farmData.poolData.token0Symbol}/{farmData.poolData.token1Symbol}
        </p>
      </div>
      <div className="table-pools-cell justify-content-between justify-content-md-end">
        <span className="d-md-none text-small">Total Staked</span>
        <span className="text-small text-numeric">
          {formatStringToPrice(stripStringToFixedDecimals(farmData.totalStakedUSD, 2))}
        </span>
      </div>
      <div className="table-pools-cell justify-content-between justify-content-md-end">
        <span className="d-md-none text-small">Total APR</span>
        <span className="text-small text-numeric">
          {formatStringToPercentage(stripStringToFixedDecimals(farmData.APR, 2))}
        </span>
      </div>

      {userId ? (
        <div className="table-pools-cell justify-content-between justify-content-md-end">
          <span className="d-md-none text-small">Your Stake</span>
          <span className="text-small text-numeric">
            {formatStringToPrice(
              stripStringToFixedDecimals(farmData.userStakingData.stakedAmountUSD || '0', 2),
            )}
          </span>
        </div>
      ) : null}

      <div className="d-none d-md-flex table-pools-cell">{renderCampaignRewards(farmData)}</div>

      <div className="table-pools-cell d-flex justify-content-between justify-content-md-end">
        <span className="d-md-none text-small">Campaign Status</span>
        {renderCampaignEndDate(farmData.campaignEndDate)}
      </div>
    </div>
  );
};

export default FarmRow;
