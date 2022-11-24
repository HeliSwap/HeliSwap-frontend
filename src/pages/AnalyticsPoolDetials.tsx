import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';

import { AnalyticsViews } from '../interfaces/common';
import { IPoolExtendedData } from '../interfaces/tokens';

import IconToken from '../components/IconToken';
import { viewTitleMapping } from './Analytics';

import { formatIcons } from '../utils/iconUtils';

import usePools from '../hooks/usePools';

import { analyticsPageInitialCurrentView, POOLS_FEE } from '../constants';
import { formatStringETHtoPriceFormatted } from '../utils/numberUtils';
import Loader from '../components/Loader';

const AnalyticsPoolDetials = () => {
  const { poolAddress } = useParams();

  const [currentView, setCurrentView] = useState<AnalyticsViews>(analyticsPageInitialCurrentView);
  const [poolData, setPoolData] = useState<IPoolExtendedData>();

  // TODO
  const { pools, loading } = usePools();

  // Handlers
  const handleTabItemClick = (currentView: AnalyticsViews) => {
    setCurrentView(currentView);
  };

  // Use Effects
  useEffect(() => {
    if (pools && pools.length > 0) {
      const found = pools.find(item => item.pairAddress === poolAddress);
      if (found) setPoolData(found);
    }
  }, [pools, poolAddress]);

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

        {loading ? (
          <div className="d-flex justify-content-center mt-5">
            <Loader />
          </div>
        ) : (
          <>
            <div className="mt-6 d-md-flex justify-content-between align-items-start">
              <div>
                <div className="d-md-flex align-items-center">
                  {formatIcons(
                    [poolData?.token0Symbol as string, poolData?.token1Symbol as string],
                    'large',
                  )}
                  <p className="text-title text-light mt-3 mt-md-0 ms-md-4">
                    {poolData?.token0Symbol} / {poolData?.token1Symbol}
                  </p>

                  <span className="text-main text-normal text-numeric badge bg-secondary-800 ms-5 d-none d-md-inline-block">
                    {POOLS_FEE}
                  </span>
                </div>

                <div className="d-md-flex mt-5">
                  <div className="container-blue-neutral-700 rounded py-2 px-3 d-flex align-items-center">
                    <IconToken symbol={poolData?.token0Symbol as string} />
                    <span className="ms-3">
                      1 {poolData?.token0Symbol as string} = {}
                      {poolData?.token1Symbol as string}
                    </span>
                  </div>

                  <div className="container-blue-neutral-700 rounded py-2 px-3 d-flex align-items-center ms-md-4 mt-3 mt-md-0">
                    <IconToken symbol={poolData?.token1Symbol as string} />
                    <span className="ms-3">
                      1 {poolData?.token1Symbol as string} = {}
                      {poolData?.token0Symbol as string}
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
                <div className="container-blue-neutral-800 rounded p-3 p-md-4">
                  <div className="container-blue-neutral rounded p-3 p-md-4">
                    <p className="text-small">Total Tokens Locked</p>
                    <div className="mt-4 d-flex justify-content-between align-items-center">
                      <IconToken symbol={poolData?.token0Symbol as string} />

                      <span className="text-small">
                        {poolData?.token0Amount &&
                          formatStringETHtoPriceFormatted(poolData?.token0Amount as string)}
                      </span>
                    </div>

                    <div className="mt-3 d-flex justify-content-between align-items-center">
                      <IconToken symbol={poolData?.token1Symbol as string} />

                      <span className="text-small">
                        {poolData?.token1Amount &&
                          formatStringETHtoPriceFormatted(poolData?.token1Amount as string)}
                      </span>
                    </div>
                  </div>

                  <p className="text-small text-gray mt-5">TVL</p>
                  <p className="text-subheader">{poolData?.tvl}</p>

                  <p className="text-small text-gray mt-5">Volume 24H</p>
                  <p className="text-subheader">{poolData?.volume24h}</p>
                </div>
              </div>
              <div className="col-md-9 mt-4 mt-md-0">
                <div className="container-blue-neutral-800 rounded p-2 p-md-4 heigth-100"></div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AnalyticsPoolDetials;
