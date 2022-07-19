import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { IPairData } from '../interfaces/tokens';

import Button from './Button';
import IconToken from './IconToken';
import Icon from './Icon';

import {
  formatStringETHtoPriceFormatted,
  formatStringToPrice,
  formatStringWeiToStringEther,
} from '../utils/numberUtils';
import { calculateReserves, getTokenPrice } from '../utils/tokenUtils';
import { formatIcons } from '../utils/iconUtils';
import { PageViews } from '../interfaces/common';

import { POOLS_FEE } from '../constants';

interface IPoolInfoProps {
  pairData: IPairData;
  allPoolsData: IPairData[];
  index: number;
  hbarPrice: number;
  setShowRemoveContainer: React.Dispatch<React.SetStateAction<boolean>>;
  setCurrentPoolIndex: React.Dispatch<React.SetStateAction<number>>;
  view: PageViews;
}

const PoolInfo = ({
  pairData,
  allPoolsData,
  index,
  hbarPrice,
  setShowRemoveContainer,
  setCurrentPoolIndex,
  view,
}: IPoolInfoProps) => {
  const [showPoolDetails, setShowPoolDetails] = useState(false);

  let reserve0 = '0';
  let reserve1 = '0';

  if (view === PageViews.ALL_POOLS) {
    reserve0 = formatStringWeiToStringEther(pairData.token0Amount, pairData.token0Decimals);
    reserve1 = formatStringWeiToStringEther(pairData.token1Amount, pairData.token1Decimals);
  } else if (view === PageViews.MY_POOLS) {
    const { reserve0ShareStr, reserve1ShareStr } = calculateReserves(
      pairData.lpShares as string,
      pairData.pairSupply,
      pairData.token0Amount,
      pairData.token1Amount,
      pairData.token0Decimals,
      pairData.token1Decimals,
    );

    reserve0 = reserve0ShareStr;
    reserve1 = reserve1ShareStr;
  }

  const handleRemoveButtonClick = () => {
    setShowRemoveContainer(prev => !prev);
    setCurrentPoolIndex(index);
  };

  const token0Price = getTokenPrice(allPoolsData, pairData.token0, hbarPrice);
  const token1Price = getTokenPrice(allPoolsData, pairData.token1, hbarPrice);

  const token0Value = Number(reserve0) * Number(token0Price);
  const token1Value = Number(reserve1) * Number(token1Price);
  const totalLpValue = token0Value + token1Value;
  const totalLpValueStr = totalLpValue.toFixed(2);

  return (
    <>
      <div
        onClick={() => setShowPoolDetails(prev => !prev)}
        className={`table-pools-row ${index % 2 === 0 ? 'is-gray' : ''} ${
          view === PageViews.ALL_POOLS ? 'with-4-columns' : ''
        }`}
      >
        <div className="table-pools-cell">
          <span className="text-small">#</span>
        </div>
        <div className="table-pools-cell">
          {formatIcons([pairData.token0Symbol, pairData.token1Symbol])}
          <p className="text-small ms-3">
            {pairData.token0Symbol}/{pairData.token1Symbol}
          </p>
          <span className="text-micro text-numeric badge bg-secondary ms-3">{POOLS_FEE}</span>
        </div>
        {view === PageViews.ALL_POOLS ? (
          <div className="table-pools-cell justify-content-end">
            <span className="text-small text-numeric">{formatStringToPrice(totalLpValueStr)}</span>
          </div>
        ) : null}
        <div className="table-pools-cell d-flex justify-content-end">
          <p className="d-inline-flex align-items-center text-white">
            <span className="text-small text-bold me-2">More</span>
            <Icon name="chevron" />
          </p>
        </div>
      </div>

      {showPoolDetails ? (
        <>
          <div className={`container-pool-details ${index % 2 === 0 ? 'is-gray' : ''}`}>
            <div className="d-flex">
              <div className="container-neutral-500 d-flex flex-column justify-content-between">
                <div className="d-flex justify-content-between align-items-center">
                  <div className="d-flex align-items-center">
                    <IconToken symbol={pairData.token0Symbol} />
                    <span className="text-main text-bold ms-3">{pairData.token0Symbol}</span>
                  </div>

                  <div className="d-flex justify-content-end align-items-center ms-4">
                    <span className="text-numeric text-main">
                      {formatStringETHtoPriceFormatted(reserve0)}
                    </span>
                  </div>
                </div>

                <div className="d-flex justify-content-between align-items-center mt-2">
                  <div className="d-flex align-items-center">
                    <IconToken symbol={pairData.token1Symbol} />
                    <span className="text-main text-bold ms-3">{pairData.token1Symbol}</span>
                  </div>

                  <div className="d-flex justify-content-end align-items-center ms-4">
                    <span className="text-numeric text-main">
                      {formatStringETHtoPriceFormatted(reserve1)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="ms-4">
                <div className="container-neutral-500 d-flex justify-content-between align-items-center">
                  <span className="text-main text-bold">Liquidity</span>
                  <span className="text-main text-numeric ms-4">
                    {formatStringToPrice(totalLpValueStr)}
                  </span>
                </div>
                <div className="container-neutral-500 mt-4 d-flex justify-content-between align-items-center">
                  <span className="text-main text-bold">LP Tokens Count</span>
                  <span className="text-main text-numeric ms-4">
                    {formatStringETHtoPriceFormatted(
                      formatStringWeiToStringEther(
                        view === PageViews.MY_POOLS
                          ? (pairData.lpShares as string)
                          : (pairData.pairSupply as string),
                      ),
                    )}
                  </span>
                </div>
              </div>
            </div>

            <div>
              <div className="d-flex align-items-center">
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

                <Link
                  className="btn btn-sm btn-secondary ms-3"
                  to={`/create/${pairData.pairAddress}`}
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
