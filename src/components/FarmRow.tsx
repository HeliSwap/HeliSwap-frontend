import React, { useContext } from 'react';
import { GlobalContext } from '../providers/Global';

import { IFarmData, IReward } from '../interfaces/tokens';

import { formatIcons } from '../utils/iconUtils';
import {
  formatStringToPercentage,
  formatStringToPrice,
  stripStringToFixedDecimals,
} from '../utils/numberUtils';
import { timestampToDate } from '../utils/timeUtils';

interface IFarmRowProps {
  farmData: IFarmData;
  index: number;
  setCurrentFarm: React.Dispatch<React.SetStateAction<string>>;
  collapseAll?: boolean;
  setCollapseAll?: (collapsed: boolean) => void;
  handleRowClick: () => void;
}

const FarmRow = ({ farmData, index, handleRowClick, setCurrentFarm }: IFarmRowProps) => {
  const contextValue = useContext(GlobalContext);
  const { connection } = contextValue;
  const { userId } = connection;

  const handleViewDetailsRowClick = () => {
    handleRowClick();
    setCurrentFarm(farmData.address);
  };

  const renderCampaignEndDate = (campaignEndDate: number, rewardsData: IReward[]) => {
    const campaignEnded = campaignEndDate < Date.now();
    const campaignNotStarted = rewardsData.length === 0;

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

  return (
    <div
      onClick={handleViewDetailsRowClick}
      className={`table-pools-row with-${userId ? '6' : '5'}-columns-farms`}
    >
      <div className="table-pools-cell">
        <span className="text-small">{index + 1}</span>
      </div>
      <div className="table-pools-cell">
        {formatIcons([farmData.poolData.token0Symbol, farmData.poolData.token1Symbol])}
        <p className="text-small ms-3">
          {farmData.poolData.token0Symbol}/{farmData.poolData.token1Symbol}
        </p>
      </div>
      <div className="table-pools-cell justify-content-end">
        <span className="text-small text-numeric">
          {formatStringToPrice(stripStringToFixedDecimals(farmData.totalStakedUSD, 2))}
        </span>
      </div>
      <div className="table-pools-cell justify-content-end">
        <span className="text-small text-numeric">
          {formatStringToPercentage(stripStringToFixedDecimals(farmData.APR, 2))}
        </span>
      </div>

      {userId ? (
        <div className="table-pools-cell justify-content-end">
          <span className="text-small text-numeric">
            {formatStringToPrice(
              stripStringToFixedDecimals(farmData.userStakingData.stakedAmountUSD || '0', 2),
            )}
          </span>
        </div>
      ) : null}

      <div className="table-pools-cell d-flex justify-content-end">
        {renderCampaignEndDate(farmData.campaignEndDate, farmData.rewardsData)}
      </div>
    </div>
  );
};

export default FarmRow;
