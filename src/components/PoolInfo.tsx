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

import { POOLS_FEE } from '../constants';

interface IPoolInfoProps {
  pairData: IPairData;
  allPoolsData: IPairData[];
  index: number;
  hbarPrice: number;
  setShowRemoveContainer: React.Dispatch<React.SetStateAction<boolean>>;
  setCurrentPoolIndex: React.Dispatch<React.SetStateAction<number>>;
}

const PoolInfo = ({
  pairData,
  allPoolsData,
  index,
  hbarPrice,
  setShowRemoveContainer,
  setCurrentPoolIndex,
}: IPoolInfoProps) => {
  const [showPoolDetails, setShowPoolDetails] = useState(false);

  const { reserve0ShareStr, reserve1ShareStr } = calculateReserves(
    pairData.lpShares as string,
    pairData.pairSupply,
    pairData.token0Amount,
    pairData.token1Amount,
    pairData.token0Decimals,
    pairData.token1Decimals,
  );

  const handleRemoveButtonClick = () => {
    setShowRemoveContainer(prev => !prev);
    setCurrentPoolIndex(index);
  };

  const token0Price = getTokenPrice(allPoolsData, pairData.token0, hbarPrice);
  const token1Price = getTokenPrice(allPoolsData, pairData.token1, hbarPrice);

  const token0Value = Number(reserve0ShareStr) * Number(token0Price);
  const token1Value = Number(reserve1ShareStr) * Number(token1Price);
  const totalLpValue = token0Value + token1Value;
  const totalLpValueStr = totalLpValue.toFixed(2);

  return (
    <>
      <div className={`table-pools-row ${index % 2 === 0 ? 'is-gray' : ''}`}>
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
        <div className="table-pools-cell d-flex justify-content-end">
          <p
            onClick={() => setShowPoolDetails(prev => !prev)}
            className="d-inline-flex align-items-center link"
          >
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
                    <span className="text-numeric text-main">{reserve0ShareStr}</span>
                  </div>
                </div>

                <div className="d-flex justify-content-between align-items-center mt-2">
                  <div className="d-flex align-items-center">
                    <IconToken symbol={pairData.token1Symbol} />
                    <span className="text-main text-bold ms-3">{pairData.token1Symbol}</span>
                  </div>

                  <div className="d-flex justify-content-end align-items-center ms-4">
                    <span className="text-numeric text-main">{reserve1ShareStr}</span>
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
                    {formatStringWeiToStringEther(pairData.lpShares as string)}
                  </span>
                </div>
                <div className="container-neutral-500 mt-4 d-flex justify-content-between align-items-center">
                  <span className="text-main text-bold">LP Tokens Count</span>
                  <span className="text-main text-numeric ms-4">
                    {formatStringETHtoPriceFormatted(
                      formatStringWeiToStringEther(pairData.lpShares as string),
                    )}
                  </span>
                </div>
              </div>
            </div>

            <div>
              <div className="d-flex align-items-center">
                <Button
                  className="btn-sm"
                  type="outline-secondary"
                  onClick={handleRemoveButtonClick}
                >
                  Remove Liquidity
                </Button>
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
