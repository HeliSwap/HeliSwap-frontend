import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { IPoolExtendedData } from '../interfaces/tokens';

import Button from './Button';
import IconToken from './IconToken';
import Icon from './Icon';

import { formatStringETHtoPriceFormatted, formatStringToPrice } from '../utils/numberUtils';
import { formatIcons } from '../utils/iconUtils';
import { PageViews } from '../interfaces/common';

import { POOLS_FEE } from '../constants';

interface IPoolInfoProps {
  poolData: IPoolExtendedData;
  index: number;
  setShowRemoveContainer: React.Dispatch<React.SetStateAction<boolean>>;
  setCurrentPoolIndex: React.Dispatch<React.SetStateAction<number>>;
  view: PageViews;
  collapseAll?: boolean;
  setCollapseAll?: (collapsed: boolean) => void;
}

const PoolInfo = ({
  poolData,
  index,
  setShowRemoveContainer,
  setCurrentPoolIndex,
  view,
  collapseAll,
  setCollapseAll,
}: IPoolInfoProps) => {
  const [showPoolDetails, setShowPoolDetails] = useState(false);

  const handleRemoveButtonClick = () => {
    setShowRemoveContainer(prev => !prev);
    setCurrentPoolIndex(index);
  };

  useEffect(() => {
    if (collapseAll) setShowPoolDetails(false);
  }, [collapseAll]);

  const renderAllPoolsDetails = () => {
    return (
      <div className="row align-items-center">
        <div className="col-6">
          <div className="container-rounded-dark">
            <p className="text-small">TVL</p>
            <p className="text-title text-numeric">{formatStringToPrice(poolData.tvl)}</p>

            <hr className="my-4" />

            <div className="d-flex justify-content-between align-items-center">
              <div className="d-flex align-items-center">
                <IconToken symbol={poolData.token0Symbol} />
                <span className="text-main text-bold ms-3">{poolData.token0Symbol}</span>
              </div>

              <span className="text-numeric text-small">
                {formatStringETHtoPriceFormatted(poolData.token0AmountFormatted)}
              </span>
            </div>

            <div className="d-flex justify-content-between align-items-center mt-3">
              <div className="d-flex align-items-center">
                <IconToken symbol={poolData.token1Symbol} />
                <span className="text-main text-bold ms-3">{poolData.token1Symbol}</span>
              </div>

              <span className="text-numeric text-small">
                {formatStringETHtoPriceFormatted(poolData.token1AmountFormatted)}
              </span>
            </div>
          </div>
        </div>

        <div className="col-6 d-flex">
          <div className="flex-1">
            <Link className="d-block btn btn-sm btn-primary ms-3" to={`/${poolData.pairAddress}`}>
              Trade
            </Link>
          </div>

          <div className="flex-1">
            <Link
              className="d-block btn btn-sm btn-primary ms-3"
              to={`/create/${poolData.pairAddress}`}
            >
              Add Liquidity
            </Link>
          </div>
        </div>
      </div>
    );
  };

  const renderMyPoolsDetails = () => {
    return (
      <div className="row align-items-center">
        <div className="col-8">
          <div className="row">
            <div className="col-6">
              <div className="container-rounded-dark">
                <p className="text-small">Liquidity</p>
                <p className="text-title text-numeric">{formatStringToPrice(poolData.tvl)}</p>

                <hr className="my-4" />

                <div className="d-flex justify-content-between align-items-center">
                  <div className="d-flex align-items-center">
                    <IconToken symbol={poolData.token0Symbol} />
                    <span className="text-main text-bold ms-3">{poolData.token0Symbol}</span>
                  </div>

                  <span className="text-numeric text-small">
                    {formatStringETHtoPriceFormatted(poolData.token0AmountFormatted)}
                  </span>
                </div>

                <div className="d-flex justify-content-between align-items-center mt-3">
                  <div className="d-flex align-items-center">
                    <IconToken symbol={poolData.token1Symbol} />
                    <span className="text-main text-bold ms-3">{poolData.token1Symbol}</span>
                  </div>

                  <span className="text-numeric text-small">
                    {formatStringETHtoPriceFormatted(poolData.token1AmountFormatted)}
                  </span>
                </div>
              </div>
            </div>

            <div className="col-6">
              <div className="container-rounded-dark">
                <p className="text-small">Unclaimed fees</p>
                <p className="text-title text-numeric">12</p>

                <hr className="my-4" />

                <div className="d-flex justify-content-between align-items-center">
                  <div className="d-flex align-items-center">
                    <IconToken symbol={poolData.token0Symbol} />
                    <span className="text-main text-bold ms-3">{poolData.token0Symbol}</span>
                  </div>

                  <span className="text-numeric text-small">
                    {formatStringETHtoPriceFormatted('1')}
                  </span>
                </div>

                <div className="d-flex justify-content-between align-items-center mt-3">
                  <div className="d-flex align-items-center">
                    <IconToken symbol={poolData.token1Symbol} />
                    <span className="text-main text-bold ms-3">{poolData.token1Symbol}</span>
                  </div>

                  <span className="text-numeric text-small">
                    {formatStringETHtoPriceFormatted('1')}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="container-rounded-dark mt-4">
            <div className="d-flex justify-content-between align-items-center">
              <span className="text-small text-bold">% of the pool</span>
              <span className="text-small text-numeric">{}%</span>
            </div>
          </div>
        </div>

        <div className="col-4">
          <div>
            <Link className="d-block btn btn-sm btn-primary" to={`/create/${poolData.pairAddress}`}>
              Increase Liquidity
            </Link>
          </div>

          <div className="d-grid mt-3">
            <Button
              className="btn-sm"
              type="secondary"
              outline={true}
              onClick={handleRemoveButtonClick}
            >
              Remove Liquidity
            </Button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      <div
        onClick={() => {
          setShowPoolDetails(prev => !prev);
          if (setCollapseAll) {
            setCollapseAll(false);
          }
        }}
        className={`table-pools-row ${showPoolDetails && !collapseAll ? 'is-opened' : ''} ${
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
              <span className="text-small text-numeric">
                {poolData.tokensPriceEvaluated ? formatStringToPrice(poolData.tvl) : 'N/A'}
              </span>
            </div>
            <div className="table-pools-cell justify-content-end">
              <span className="text-small text-numeric">
                {poolData.tokensPriceEvaluated
                  ? formatStringToPrice(poolData.volume7 || '')
                  : 'N/A'}
              </span>
            </div>
            <div className="table-pools-cell justify-content-end">
              <span className="text-small text-numeric">
                {poolData.tokensPriceEvaluated
                  ? formatStringToPrice(poolData.volume24 || '')
                  : 'N/A'}
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
        <div className="container-pool-details">
          {view === PageViews.ALL_POOLS ? renderAllPoolsDetails() : renderMyPoolsDetails()}
        </div>
      ) : null}
    </>
  );
};

export default PoolInfo;
