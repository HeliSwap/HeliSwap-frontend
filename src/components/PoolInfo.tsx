import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { IPairData } from '../interfaces/tokens';

import Button from './Button';
import IconToken from './IconToken';
import Icon from './Icon';

import { formatStringWeiToStringEther } from '../utils/numberUtils';
import { calculateReserves } from '../utils/tokenUtils';
import { formatIcons } from '../utils/iconUtils';

import { POOLS_FEE } from '../constants';

interface IPoolInfoProps {
  pairData: IPairData;
  index: number;
  setShowRemoveContainer: React.Dispatch<React.SetStateAction<boolean>>;
  setCurrentPoolIndex: React.Dispatch<React.SetStateAction<number>>;
}

const PoolInfo = ({
  pairData,
  index,
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
                <div className="container-neutral-500"></div>
                <div className="container-neutral-500 mt-4 d-flex justify-content-between align-items-center">
                  <span className="text-main text-bold">LP Tokens Count</span>
                  <span className="text-main text-numeric ms-4">
                    {formatStringWeiToStringEther(pairData.lpShares as string)}
                  </span>
                </div>
              </div>
            </div>

            <div>
              <div className="d-flex align-items-center">
                <Link className="btn btn-sm btn-primary" to={`/create/${pairData.pairAddress}`}>
                  Add Liquidity
                </Link>
                <Button className="btn-sm ms-3" onClick={handleRemoveButtonClick}>
                  Remove Liquidity
                </Button>
              </div>
            </div>
          </div>
        </>
      ) : null}
    </>
  );
};

export default PoolInfo;
