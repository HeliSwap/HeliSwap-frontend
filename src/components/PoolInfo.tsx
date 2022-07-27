import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { IPoolExtendedData } from '../interfaces/tokens';

import Button from './Button';
import IconToken from './IconToken';
import Icon from './Icon';

import {
  formatStringETHtoPriceFormatted,
  formatStringToPrice,
  formatStringWeiToStringEther,
} from '../utils/numberUtils';
import { formatIcons } from '../utils/iconUtils';
import { PageViews } from '../interfaces/common';

import { POOLS_FEE } from '../constants';

interface IPoolInfoProps {
  poolData: IPoolExtendedData;
  index: number;
  setShowRemoveContainer: React.Dispatch<React.SetStateAction<boolean>>;
  setCurrentPoolIndex: React.Dispatch<React.SetStateAction<number>>;
  view: PageViews;
}

const PoolInfo = ({
  poolData,
  index,
  setShowRemoveContainer,
  setCurrentPoolIndex,
  view,
}: IPoolInfoProps) => {
  const [showPoolDetails, setShowPoolDetails] = useState(false);

  const handleRemoveButtonClick = () => {
    setShowRemoveContainer(prev => !prev);
    setCurrentPoolIndex(index);
  };

  return (
    <>
      <div
        onClick={() => setShowPoolDetails(prev => !prev)}
        className={`table-pools-row ${showPoolDetails ? 'is-opened' : ''} ${
          view === PageViews.ALL_POOLS ? 'with-6-columns' : ''
        }`}
      >
        <div className="table-pools-cell">
          <span className="text-small">#</span>
        </div>
        <div className="table-pools-cell">
          {formatIcons([poolData.token0Symbol, poolData.token1Symbol])}
          <p className="text-small ms-3">
            {poolData.token0Symbol}/{poolData.token1Symbol}
          </p>
          <span className="text-micro text-numeric badge bg-secondary ms-3">{POOLS_FEE}</span>
        </div>
        {view === PageViews.ALL_POOLS ? (
          <>
            <div className="table-pools-cell justify-content-end">
              <span className="text-small text-numeric">{formatStringToPrice(poolData.tvl)}</span>
            </div>
            <div className="table-pools-cell justify-content-end">
              <span className="text-small text-numeric">
                {formatStringToPrice(poolData.volume7 || '')}
              </span>
            </div>
            <div className="table-pools-cell justify-content-end">
              <span className="text-small text-numeric">
                {formatStringToPrice(poolData.volume24 || '')}
              </span>
            </div>
          </>
        ) : null}
        <div className="table-pools-cell d-flex justify-content-end">
          <p className="d-inline-flex align-items-center text-white">
            <span className="text-small text-bold me-2">{showPoolDetails ? 'Less' : 'More'}</span>
            <Icon name={`chevron-${showPoolDetails ? 'up' : 'down'}`} />
          </p>
        </div>
      </div>

      {showPoolDetails ? (
        <>
          <div className="container-pool-details">
            <div className="container-pool-details-row">
              <div className="container-transparent-border d-flex flex-column justify-content-between">
                <div className="d-flex justify-content-between align-items-center">
                  <div className="d-flex align-items-center">
                    <IconToken symbol={poolData.token0Symbol} />
                    <span className="text-main text-bold ms-3">{poolData.token0Symbol}</span>
                  </div>

                  <div className="d-flex justify-content-end align-items-center ms-4">
                    <span className="text-numeric text-main">
                      {formatStringETHtoPriceFormatted(poolData.token0AmountFormatted)}
                    </span>
                  </div>
                </div>

                <div className="d-flex justify-content-between align-items-center mt-2">
                  <div className="d-flex align-items-center">
                    <IconToken symbol={poolData.token1Symbol} />
                    <span className="text-main text-bold ms-3">{poolData.token1Symbol}</span>
                  </div>

                  <div className="d-flex justify-content-end align-items-center ms-4">
                    <span className="text-numeric text-main">
                      {formatStringETHtoPriceFormatted(poolData.token1AmountFormatted)}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <div className="container-transparent-border d-flex justify-content-between align-items-center">
                  <span className="text-main text-bold">Liquidity</span>
                  <span className="text-main text-numeric ms-4">
                    {formatStringToPrice(poolData.tvl)}
                  </span>
                </div>
                <div className="container-transparent-border mt-4 d-flex justify-content-between align-items-center">
                  <span className="text-main text-bold">LP Tokens Count</span>
                  <span className="text-main text-numeric ms-4">
                    {formatStringETHtoPriceFormatted(
                      formatStringWeiToStringEther(
                        view === PageViews.MY_POOLS
                          ? (poolData.lpShares as string)
                          : (poolData.pairSupply as string),
                      ),
                    )}
                  </span>
                </div>
              </div>

              <div className="d-flex justify-content-end align-items-center">
                {view === PageViews.MY_POOLS ? (
                  <Button
                    className="btn-sm"
                    type="secondary"
                    outline={true}
                    onClick={handleRemoveButtonClick}
                  >
                    Remove Liquidity
                  </Button>
                ) : null}
                <Link className="btn btn-sm btn-primary ms-3" to={`/${poolData.pairAddress}`}>
                  Swap
                </Link>
                <Link
                  className="btn btn-sm btn-primary ms-3"
                  to={`/create/${poolData.pairAddress}`}
                >
                  Add Liquidity
                </Link>
              </div>
            </div>
          </div>
        </>
      ) : null}
    </>
  );
};

export default PoolInfo;
