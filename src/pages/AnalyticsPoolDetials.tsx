import React, { useState, useEffect, useContext } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';

import { GlobalContext } from '../providers/Global';

import { AnalyticsViews, IHistoricalData } from '../interfaces/common';
import { IPoolExtendedData } from '../interfaces/tokens';

import IconToken from '../components/IconToken';
import Loader from '../components/Loader';
import { viewTitleMapping } from './Analytics';
import Icon from '../components/Icon';

import { formatIcons } from '../utils/iconUtils';
import {
  formatStringETHtoPriceFormatted,
  formatStringToPrice,
  formatStringWeiToStringEther,
  stripStringToFixedDecimals,
} from '../utils/numberUtils';
import { mapHBARTokenSymbol } from '../utils/tokenUtils';

import usePoolByAddress from '../hooks/usePoolByAddress';

import {
  analyticsPageInitialCurrentView,
  POOLS_FEE,
  useQueryOptionsProvideSwapRemove,
} from '../constants';
import LineChart from '../components/LineChart';
import Button from '../components/Button';
import BarChart from '../components/BarChart';

const AnalyticsPoolDetials = () => {
  const contextValue = useContext(GlobalContext);
  const { tokensWhitelisted } = contextValue;

  const { poolAddress } = useParams();
  const navigate = useNavigate();

  const [currentView, setCurrentView] = useState<AnalyticsViews>(analyticsPageInitialCurrentView);
  const [poolData, setPoolData] = useState<IPoolExtendedData>();

  const [tokensWhitelistedIds, setTokensWhitelistedIds] = useState<string[]>([]);
  const [historicalDataToShow, setHistoricalDataToShow] = useState<IHistoricalData[]>([]);

  enum ChartToShowEnum {
    tvl,
    volume,
  }
  const [chartToShow, setChartToShow] = useState<ChartToShowEnum>(ChartToShowEnum.tvl);

  const { pool, loadingPoolsByTokenList: loadingPool } = usePoolByAddress(
    useQueryOptionsProvideSwapRemove,
    true,
    poolAddress as string,
    tokensWhitelistedIds,
  );

  // Handlers
  const handleTabItemClick = (currentView: AnalyticsViews) => {
    setCurrentView(currentView);
  };

  // Use Effects
  useEffect(() => {
    if (tokensWhitelisted && tokensWhitelisted.length !== 0) {
      const tokensWhitelistedIds = tokensWhitelisted.map(item => item.address);
      setTokensWhitelistedIds(tokensWhitelistedIds);
    }
  }, [tokensWhitelisted]);

  useEffect(() => {
    if (pool && Object.keys(pool).length > 0) {
      setPoolData(pool);
    }
  }, [pool, poolAddress]);

  //Replace last historical tvl value with the current tvl
  useEffect(() => {
    if (poolData?.tvlUsd && poolData?.historicalData) {
      const historicalDataToShow = [...poolData?.historicalData];
      historicalDataToShow[historicalDataToShow.length - 1] = {
        ...historicalDataToShow[historicalDataToShow.length - 1],
        tvl: poolData?.tvlUsd,
      };
      setHistoricalDataToShow(historicalDataToShow);
    }
  }, [poolData?.tvlUsd, poolData?.historicalData]);

  const calculateReservePrice = (
    reserve0: string,
    reserve1: string,
    token0Decimals: number,
    token1Decimals: number,
  ) => {
    const token0AmountFormatted = formatStringWeiToStringEther(reserve0, token0Decimals);
    const token1AmountFormatted = formatStringWeiToStringEther(reserve1, token1Decimals);

    const result = Number(token0AmountFormatted) / Number(token1AmountFormatted);
    return result.toString();
  };

  const determineColorClass = (value: number) => {
    return value >= 0 ? 'text-success' : 'text-danger';
  };

  const determineIconProps = (value: number) => {
    return value >= 0
      ? { name: 'arrow-up', color: 'success' }
      : { name: 'arrow-down', color: 'danger' };
  };

  return (
    <div className="d-flex justify-content-center">
      <div className="container-max-with-1042">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div className="d-flex">
            <h2
              onClick={() => handleTabItemClick(AnalyticsViews.OVERVIEW)}
              className={`text-subheader tab-title mx-4 ${
                AnalyticsViews.OVERVIEW === currentView ? 'is-active' : ''
              }`}
            >
              {viewTitleMapping[AnalyticsViews.OVERVIEW]}
            </h2>
          </div>
        </div>

        <hr />

        <div className="mt-6">
          <span className="cursor-pointer" onClick={() => navigate('/analytics')}>
            <Icon name="arrow-left" />
          </span>
        </div>

        {loadingPool ? (
          <div className="d-flex justify-content-center mt-5">
            <Loader />
          </div>
        ) : poolData ? (
          <>
            <div className="mt-6 d-md-flex justify-content-between align-items-start">
              <div>
                <div className="d-md-flex align-items-center">
                  {formatIcons(
                    [poolData?.token0Symbol as string, poolData?.token1Symbol as string],
                    'large',
                  )}
                  <p className="text-title text-light mt-3 mt-md-0 ms-md-4">
                    {mapHBARTokenSymbol(poolData.token0Symbol)} /{' '}
                    {mapHBARTokenSymbol(poolData.token1Symbol)}
                  </p>

                  <span className="text-main text-normal text-numeric badge bg-secondary-800 ms-5 d-none d-md-inline-block">
                    {POOLS_FEE}
                  </span>
                </div>

                <div className="d-md-flex mt-5">
                  <div className="container-blue-neutral-700 rounded py-2 px-3 d-flex align-items-center">
                    <IconToken symbol={poolData?.token0Symbol as string} />
                    <span className="ms-3">
                      1 {mapHBARTokenSymbol(poolData.token0Symbol)} ={' '}
                      {calculateReservePrice(
                        poolData.token1Amount,
                        poolData.token0Amount,
                        poolData.token1Decimals,
                        poolData.token0Decimals,
                      )}{' '}
                      {mapHBARTokenSymbol(poolData.token1Symbol)}
                    </span>
                  </div>

                  <div className="container-blue-neutral-700 rounded py-2 px-3 d-flex align-items-center ms-md-4 mt-3 mt-md-0">
                    <IconToken symbol={poolData?.token1Symbol as string} />
                    <span className="ms-3">
                      1 {mapHBARTokenSymbol(poolData.token1Symbol)} ={' '}
                      {calculateReservePrice(
                        poolData.token0Amount,
                        poolData.token1Amount,
                        poolData.token0Decimals,
                        poolData.token1Decimals,
                      )}{' '}
                      {mapHBARTokenSymbol(poolData.token0Symbol)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="d-md-flex align-items-center mt-4 mt-md-0">
                <Link
                  to={`/${poolData?.token0}/${poolData?.token1}`}
                  className="btn btn-sm btn-secondary d-block d-sm-inline-block"
                >
                  Trade
                </Link>
                <Link
                  to={`/create/${poolData?.token0}/${poolData?.token1}`}
                  className="btn btn-sm btn-primary d-block d-sm-inline-block mt-3 mt-sm-0 ms-sm-3"
                >
                  Add Liquidity
                </Link>
              </div>
            </div>

            <div className="row mt-4 mt-md-5">
              <div className="col-md-3">
                <div className="container-blue-neutral-800 heigth-100 rounded d-flex flex-column justify-content-between p-3 p-md-4">
                  <div className="container-blue-neutral rounded p-3 p-md-4">
                    <p className="text-small">Total Tokens Locked</p>
                    <div className="mt-4 d-flex justify-content-between align-items-center">
                      <IconToken symbol={poolData?.token0Symbol as string} />

                      <span className="text-small">
                        {poolData?.token0Amount &&
                          formatStringETHtoPriceFormatted(
                            poolData?.token0AmountFormatted as string,
                          )}
                      </span>
                    </div>

                    <div className="mt-3 d-flex justify-content-between align-items-center">
                      <IconToken symbol={poolData?.token1Symbol as string} />

                      <span className="text-small">
                        {poolData?.token1Amount &&
                          formatStringETHtoPriceFormatted(
                            poolData?.token1AmountFormatted as string,
                          )}
                      </span>
                    </div>
                  </div>

                  <div>
                    <p className="text-small text-gray mt-5">TVL</p>
                    <p className="text-subheader">{formatStringToPrice(poolData?.tvlUsd)}</p>
                    {/* d-none classe to be removed when backend is ready with diff calculations */}
                    <p
                      className={`d-none text-small text-numeric ${determineColorClass(
                        poolData.diff.tvl,
                      )}`}
                    >
                      (
                      <Icon
                        size="small"
                        color={determineIconProps(poolData.diff.tvl).color}
                        name={determineIconProps(poolData.diff.tvl).name}
                      />
                      {stripStringToFixedDecimals(Math.abs(poolData.diff.tvl).toString(), 2)}%)
                    </p>

                    <p className="text-small text-gray mt-5">Volume 24H</p>
                    <p className="text-subheader">
                      {formatStringToPrice(poolData?.volume24hUsd as string)}
                    </p>
                    {/* d-none classe to be removed when backend is ready with diff calculations */}
                    <p
                      className={`d-none text-small text-numeric ${determineColorClass(
                        poolData.diff.volume,
                      )}`}
                    >
                      (
                      <Icon
                        size="small"
                        color={determineIconProps(poolData.diff.volume).color}
                        name={determineIconProps(poolData.diff.volume).name}
                      />
                      {stripStringToFixedDecimals(Math.abs(poolData.diff.volume).toString(), 2)}%)
                    </p>

                    <p className="text-small text-gray mt-5">Fees 24H</p>
                    <p className="text-subheader">
                      {formatStringToPrice(poolData?.fees.amount?.toString() as string)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="col-md-9 mt-4 mt-md-0 container-blue-neutral-800 rounded p-4">
                <div className="d-flex justify-content-end">
                  <Button
                    type={chartToShow === ChartToShowEnum.tvl ? 'primary' : 'secondary'}
                    size="small"
                    className="mx-2"
                    onClick={() => {
                      if (chartToShow !== ChartToShowEnum.tvl) {
                        setChartToShow(ChartToShowEnum.tvl);
                      }
                    }}
                  >
                    TVL
                  </Button>
                  <Button
                    type={chartToShow === ChartToShowEnum.volume ? 'primary' : 'secondary'}
                    size="small"
                    className="mx-2"
                    onClick={() => {
                      if (chartToShow !== ChartToShowEnum.volume) {
                        setChartToShow(ChartToShowEnum.volume);
                      }
                    }}
                  >
                    Volume
                  </Button>
                </div>
                {poolData?.historicalData ? (
                  <div className="mt-6">
                    {poolData?.historicalData.length !== 0 ? (
                      chartToShow === ChartToShowEnum.tvl ? (
                        <LineChart
                          chartData={historicalDataToShow}
                          aggregatedValue={poolData?.tvlUsd}
                        />
                      ) : (
                        <BarChart
                          chartData={poolData?.historicalData}
                          aggregatedValue={Number(poolData.volume24hUsd)}
                        />
                      )
                    ) : (
                      <span className="text-small">No historical data for this pool</span>
                    )}
                  </div>
                ) : (
                  <div className="d-flex justify-content-center my-6">
                    <Loader />
                  </div>
                )}
              </div>
            </div>
          </>
        ) : (
          <p className="text-center my-6">No pool found</p>
        )}
      </div>
    </div>
  );
};

export default AnalyticsPoolDetials;
