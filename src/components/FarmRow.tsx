import React from 'react';

import { IFarmData } from '../interfaces/tokens';

import { formatIcons } from '../utils/iconUtils';

import { POOLS_FEE } from '../constants';

interface IFarmRowProps {
  campaignData: IFarmData;
  index: number;
  setCurrentFarmIndex: React.Dispatch<React.SetStateAction<number>>;
  collapseAll?: boolean;
  setCollapseAll?: (collapsed: boolean) => void;
  handleRowClick: () => void;
}

const FarmRow = ({ campaignData, index, handleRowClick, setCurrentFarmIndex }: IFarmRowProps) => {
  const handleViewDetailsRowClick = () => {
    handleRowClick();
    setCurrentFarmIndex(index);
  };

  return (
    <div onClick={handleViewDetailsRowClick} className={`table-pools-row  with-6-columns `}>
      <div className="table-pools-cell">
        <span className="text-small">{index + 1}</span>
      </div>
      <div className="table-pools-cell">
        {formatIcons([campaignData.poolData.token0Symbol, campaignData.poolData.token1Symbol])}
        <p className="text-small ms-3">
          {campaignData.poolData.token0Symbol}/{campaignData.poolData.token1Symbol}
        </p>
        <span className="text-micro text-numeric badge bg-secondary-800 ms-3">{POOLS_FEE}</span>
      </div>
      <div className="table-pools-cell justify-content-end">
        <span className="text-small text-numeric">{campaignData.totalStakedUSD}</span>
      </div>
      <div className="table-pools-cell justify-content-end">
        <span className="text-small text-numeric">'N/A'</span>
      </div>
      <div className="table-pools-cell justify-content-end">
        <span className="text-small text-numeric">{campaignData.userStakedUSD}</span>
      </div>
      <div className="table-pools-cell d-flex justify-content-end"></div>
    </div>
  );
};

export default FarmRow;
