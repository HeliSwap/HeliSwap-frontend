import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';

import { AnalyticsViews } from '../interfaces/common';

import Loader from '../components/Loader';
import { viewTitleMapping } from './Analytics';
import Icon from '../components/Icon';
import LineChart from '../components/LineChart';
import CandleChart from '../components/CandleChart';
import BarChart from '../components/BarChart';
import Button from '../components/Button';

import { formatStringToPrice } from '../utils/numberUtils';
import { formatIcons } from '../utils/iconUtils';

import useHistoricalTokenData from '../hooks/useHistoricalTokenData';

import { analyticsPageInitialCurrentView, useQueryOptions } from '../constants';

const AnalyticsTokenDetials = () => {
  const { tokenAddress } = useParams();

  const [currentView, setCurrentView] = useState<AnalyticsViews>(analyticsPageInitialCurrentView);
  const [currentPrice, setCurrentPrice] = useState('');

  enum ChartToShowEnum {
    tvl,
    volume,
    price,
  }
  const [chartToShow, setChartToShow] = useState<ChartToShowEnum>(ChartToShowEnum.price);

  const navigate = useNavigate();
  const { tokenData, loadingTokenData } = useHistoricalTokenData(
    tokenAddress || '',
    useQueryOptions,
  );

  // Handlers
  const handleTabItemClick = (currentView: AnalyticsViews) => {
    setCurrentView(currentView);
  };

  // useEffects
  useEffect(() => {
    if (tokenData && tokenData.metrics?.length) {
      setCurrentPrice(tokenData.metrics[tokenData.metrics.length - 1].price);
    }
  }, [tokenData]);

  const determineColorClass = (value: number) => {
    return value >= 0 ? 'text-success' : 'text-danger';
  };
  const renderChart = () => {
    if (currentPrice) {
      if (chartToShow === ChartToShowEnum.tvl) {
        const aggregatedValue = tokenData.metrics[tokenData.metrics.length - 1].tvl;
        return <LineChart chartData={tokenData.metrics} aggregatedValue={aggregatedValue} />;
      } else if (chartToShow === ChartToShowEnum.volume) {
        const aggregatedValue = tokenData.metrics[tokenData.metrics.length - 1].volume;
        return <BarChart chartData={tokenData.metrics} aggregatedValue={Number(aggregatedValue)} />;
      } else if (chartToShow === ChartToShowEnum.price) {
        return <CandleChart chartData={tokenData.priceCandles} />;
      } else return null;
    }
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
        {loadingTokenData ? (
          <div className="d-flex justify-content-center mt-5">
            <Loader />
          </div>
        ) : tokenData ? (
          <>
            <div className="mt-6 d-md-flex justify-content-between align-items-start">
              <div>
                <div className="d-md-flex align-items-center">
                  {formatIcons([currentPrice && (tokenData.symbol as string)], 'large')}
                  <p className="text-title text-light mt-3 mt-md-0 ms-md-4">
                    {currentPrice && tokenData.name}
                  </p>
                </div>
              </div>
            </div>
            <div className="row mt-4 mt-md-5">
              <div className="col-md-3">
                <div className="container-blue-neutral-800 heigth-100 rounded d-flex flex-column justify-content-between p-3 p-md-4">
                  <div>
                    <p className="text-small text-gray mt-5">TVL</p>
                    <p className="text-subheader">
                      {formatStringToPrice(
                        currentPrice && tokenData.metrics?.[tokenData.metrics.length - 1].tvl,
                      )}
                    </p>
                    {/* d-none classe to be removed when backend is ready with diff calculations */}
                    <p
                      className={`d-none text-small text-numeric ${determineColorClass(
                        tokenData.tvl,
                      )}`}
                    >
                      (
                      {/* <Icon
                        size="small"
                        color={determineIconProps(poolData.diff.tvl).color}
                        name={determineIconProps(poolData.diff.tvl).name}
                      />
                      {stripStringToFixedDecimals(Math.abs(poolData.diff.tvl).toString(), 2)}%) */}
                    </p>

                    <p className="text-small text-gray mt-5">Volume 24H</p>
                    <p className="text-subheader">
                      {/* {formatStringToPrice(poolData?.volume24hUsd as string)} */}
                    </p>
                    <p className="text-small text-gray mt-5">Fees 24H</p>
                    <p className="text-subheader">
                      {/* {formatStringToPrice(poolData?.fees.amount?.toString() as string)} */}
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
                  <Button
                    type={chartToShow === ChartToShowEnum.price ? 'primary' : 'secondary'}
                    size="small"
                    className="mx-2"
                    onClick={() => {
                      if (chartToShow !== ChartToShowEnum.price) {
                        setChartToShow(ChartToShowEnum.price);
                      }
                    }}
                  >
                    Price
                  </Button>
                </div>
                {tokenData ? (
                  <div className="mt-6">
                    {tokenData.metrics?.length ? (
                      renderChart()
                    ) : (
                      <span className="text-small">No historical data for this token</span>
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
          <p className="text-center my-6">No token found</p>
        )}
      </div>
    </div>
  );
};

export default AnalyticsTokenDetials;
