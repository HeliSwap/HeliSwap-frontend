import React from 'react';

import { IFarmData } from '../interfaces/tokens';

import { formatIcons } from '../utils/iconUtils';

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

  return (
    <div onClick={handleViewDetailsRowClick} className={`table-pools-row  with-6-columns `}>
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
        <span className="text-small text-numeric">{farmData.totalStakedUSD}</span>
      </div>
      <div className="table-pools-cell justify-content-end">
        <span className="text-small text-numeric">{farmData.APR}%</span>
      </div>
      <div className="table-pools-cell justify-content-end">
        <span className="text-small text-numeric">{farmData.userStakingData?.userStakedUSD}</span>
      </div>
      <div className="table-pools-cell d-flex justify-content-end"></div>
    </div>
  );
};

export default FarmRow;
