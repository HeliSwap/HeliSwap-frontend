import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

import { AnalyticsViews } from '../interfaces/common';

import Loader from '../components/Loader';
import { viewTitleMapping } from './Analytics';
import Icon from '../components/Icon';
import LineChart from '../components/LineChart';

import useHistoricalTokenData from '../hooks/useHistoricalTokenData';

import { analyticsPageInitialCurrentView, useQueryOptions, CHART_DATA } from '../constants';

const AnalyticsTokenDetials = () => {
  const { tokenAddress } = useParams();

  const [currentView, setCurrentView] = useState<AnalyticsViews>(analyticsPageInitialCurrentView);
  const [currentPrice, setCurrentPrice] = useState('');

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
    if (tokenData.length) {
      setCurrentPrice(tokenData[tokenData.length - 1].price);
    }
  }, [tokenData]);

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
                  {/* {formatIcons(
                    [tokenData?.symbol as string, poolData?.token1Symbol as string],
                    'large',
                  )}
                  <p className="text-title text-light mt-3 mt-md-0 ms-md-4">
                    {mapHBARTokenSymbol(poolData.token0Symbol)} /{' '}
                    {mapHBARTokenSymbol(poolData.token1Symbol)}
                  </p> */}
                </div>

                <div className="d-md-flex mt-5">
                  <div className="container-blue-neutral-700 rounded py-2 px-3 d-flex align-items-center">
                    {/* <IconToken symbol={poolData?.token0Symbol as string} />
                    <span className="ms-3">
                      1 {mapHBARTokenSymbol(poolData.token0Symbol)} ={' '}
                      {calculateReservePrice(
                        poolData.token1Amount,
                        poolData.token0Amount,
                        poolData.token1Decimals,
                        poolData.token0Decimals,
                      )}{' '}
                      {mapHBARTokenSymbol(poolData.token1Symbol)}
                    </span> */}
                  </div>

                  <div className="container-blue-neutral-700 rounded py-2 px-3 d-flex align-items-center ms-md-4 mt-3 mt-md-0">
                    {/* <IconToken symbol={poolData?.token1Symbol as string} />
                    <span className="ms-3">
                      1 {mapHBARTokenSymbol(poolData.token1Symbol)} ={' '}
                      {calculateReservePrice(
                        poolData.token0Amount,
                        poolData.token1Amount,
                        poolData.token0Decimals,
                        poolData.token1Decimals,
                      )}{' '}
                      {mapHBARTokenSymbol(poolData.token0Symbol)}
                    </span> */}
                  </div>
                </div>
              </div>

              <div className="d-md-flex align-items-center mt-4 mt-md-0">
                {/* <Link
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
                </Link> */}
              </div>
            </div>

            <div className="row mt-4 mt-md-5">
              <div className="col-md-9 mt-4 mt-md-0 container-blue-neutral-800 rounded p-4">
                {tokenData ? (
                  <div className="mt-6">
                    {tokenData.length ? (
                      <LineChart
                        chartData={tokenData}
                        aggregatedValue={currentPrice}
                        dataType={CHART_DATA.TOKEN}
                      />
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
