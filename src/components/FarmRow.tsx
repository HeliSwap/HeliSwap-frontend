import React from 'react';

import { IFarmData } from '../interfaces/tokens';

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
  setCurrentFarmIndex: React.Dispatch<React.SetStateAction<number>>;
  collapseAll?: boolean;
  setCollapseAll?: (collapsed: boolean) => void;
  handleRowClick: () => void;
}

const FarmRow = ({ farmData, index, handleRowClick, setCurrentFarmIndex }: IFarmRowProps) => {
  const handleViewDetailsRowClick = () => {
    handleRowClick();
    setCurrentFarmIndex(index);
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
              Until <span className="text-bold">{timestampToDate(campaignEndDate)}</span>
            </>
          )}
        </span>
      </>
    );

    return <div className="d-flex align-items-center">{dateContent}</div>;
  };

  return (
    <div onClick={handleViewDetailsRowClick} className={`table-pools-row with-6-columns-farms`}>
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
      <div className="table-pools-cell justify-content-end">
        <span className="text-small text-numeric">
          {formatStringToPrice(
            stripStringToFixedDecimals(farmData.userStakingData?.userStakedUSD || '0', 2),
          )}
        </span>
      </div>
      <div className="table-pools-cell d-flex justify-content-end">
        {renderCampaignEndDate(farmData.campaignEndDate)}
      </div>
    </div>
  );
};

export default FarmRow;
