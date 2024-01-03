import { useContext } from 'react';
import { GlobalContext } from '../providers/Global';

import { IFarmData, IReward } from '../interfaces/tokens';

import { formatIcons } from '../utils/iconUtils';
import {
  formatStringToPercentage,
  formatStringToPrice,
  stripStringToFixedDecimals,
} from '../utils/numberUtils';
import { mapWHBARAddress } from '../utils/tokenUtils';
import { renderCampaignEndDate } from '../utils/farmUtils';
import Tippy from '@tippyjs/react';
import Icon from './Icon';
import { boostedPools, notVerifiedTokens, restrictedFarms } from '../constants';

interface IFarmRowProps {
  farmData: IFarmData;
  index: number;
  collapseAll?: boolean;
  setCollapseAll?: (collapsed: boolean) => void;
  handleRowClick: (address: string) => void;
  showUserStaked?: boolean;
}

const FarmRow = ({ farmData, index, handleRowClick, showUserStaked = true }: IFarmRowProps) => {
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
            const rewardSymbol = mapWHBARAddress(reward);

            acc.push(rewardSymbol);
          }
          return acc;
        }, [])
      : [];

    const sortedRewardsSymbols = rewardsSymbols.sort((a, b) =>
      a === 'HBAR' ? -1 : b === 'HBAR' ? 1 : 0,
    );

    return formatIcons(sortedRewardsSymbols);
  };

  const haveNotVerifiedTokens =
    notVerifiedTokens.includes(farmData.poolData.token0) ||
    notVerifiedTokens.includes(farmData.poolData.token1);

  return (
    <div
      onClick={handleViewDetailsRowClick}
      className={`table-pools-row with-${userId && showUserStaked ? '7' : '6'}-columns-farms`}
    >
      <div className="d-none d-md-flex table-pools-cell">
        <span className="text-small">{index + 1}</span>
      </div>
      <div className="table-pools-cell">
        {formatIcons([farmData.poolData.token0Symbol, farmData.poolData.token1Symbol])}
        <p className="text-small ms-3">
          {farmData.poolData.token0Symbol}/{farmData.poolData.token1Symbol}
        </p>
        {farmData.isFarmDeprecated || restrictedFarms.includes(farmData.address) ? (
          <>
            <span className="text-micro text-uppercase badge bg-warning ms-3">Deprecated</span>
            <Tippy content="This farm has been deprecated. If you see it in the UI, it means, that you have liquidity in the pool and need to actively migrate it to the new pool with the same name.">
              <span className="ms-3">
                <Icon name="info" color="info" />
              </span>
            </Tippy>
          </>
        ) : null}

        {boostedPools.length > 0 && boostedPools.includes(farmData.poolData.pairAddress) ? (
          <>
            <span className="text-micro text-uppercase badge bg-success ms-3">Super Farm</span>
            <Tippy content="This Yield Farm has increased HBAR Rewards (almost 50% of USD Reward Value are HBAR)">
              <span className="ms-3">
                <Icon name="info" color="success" />
              </span>
            </Tippy>
          </>
        ) : null}

        {haveNotVerifiedTokens ? (
          <>
            <span className="text-micro text-uppercase badge bg-warning ms-3">Unverified</span>
            <Tippy content="One or both of the tokens in this liquidity pool have not been verified by the DAO. Be cautious when engaging with any tokens and please do your own due diligence">
              <span className="ms-3">
                <Icon name="info" color="warning" />
              </span>
            </Tippy>
          </>
        ) : null}
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

      {userId && showUserStaked ? (
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
