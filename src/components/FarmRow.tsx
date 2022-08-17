import React, { useEffect, useState, useContext } from 'react';
import { GlobalContext } from '../providers/Global';

import Icon from './Icon';

import { formatIcons } from '../utils/iconUtils';

import { POOLS_FEE } from '../constants';
import { IFarmData } from '../interfaces/tokens';

interface IFarmRow {
  campaignData: IFarmData;
  index: number;
  setCurrentPoolIndex: React.Dispatch<React.SetStateAction<number>>;
  collapseAll?: boolean;
  setCollapseAll?: (collapsed: boolean) => void;
}

const FarmRow = ({
  campaignData,
  index,
  setCurrentPoolIndex,
  collapseAll,
  setCollapseAll,
}: IFarmRow) => {
  const contextValue = useContext(GlobalContext);
  const { sdk, connection } = contextValue;
  const { hashconnectConnectorInstance, userId } = connection;

  const [showPoolDetails, setShowPoolDetails] = useState(false);

  useEffect(() => {
    if (collapseAll) setShowPoolDetails(false);
  }, [collapseAll]);

  return (
    <>
      <div className={`table-pools-row with-6-columns `}>
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
        <>
          <div className="table-pools-cell justify-content-end">
            <span className="text-small text-numeric">'N/A'</span>
          </div>
          <div className="table-pools-cell justify-content-end">
            <span className="text-small text-numeric">'N/A'</span>
          </div>
          <div className="table-pools-cell justify-content-end">
            <span className="text-small text-numeric">'N/A'</span>
          </div>
        </>
        <div className="table-pools-cell d-flex justify-content-end"></div>
      </div>
    </>
  );
};

export default FarmRow;
