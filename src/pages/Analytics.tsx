import { useState } from 'react';

import { AnalyticsViews } from '../interfaces/common';

import Overview from '../components/Analytics/Overview/Overview';
import Farms from '../components/Analytics/Farms';
import Tokens from '../components/Analytics/Tokens';

import { analyticsPageInitialCurrentView } from '../constants';

const viewTitleMapping = {
  [AnalyticsViews.OVERVIEW]: 'Overview',
  [AnalyticsViews.TOKENS]: 'Tokens',
  [AnalyticsViews.FARMS]: 'Farms',
};

const Analytics = () => {
  const [currentView, setCurrentView] = useState<AnalyticsViews>(analyticsPageInitialCurrentView);

  // Handlers
  const handleTabItemClick = (currentView: AnalyticsViews) => {
    setCurrentView(currentView);
  };

  const renderCurrentView = () => {
    if (currentView === AnalyticsViews.TOKENS) {
      return <Tokens />;
    } else if (currentView === AnalyticsViews.FARMS) {
      return <Farms />;
    }

    return <Overview />;
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
            {/* <h2
              onClick={() => handleTabItemClick(AnalyticsViews.TOKENS)}
              className={`text-subheader tab-title mx-4 ms-3 ${
                AnalyticsViews.TOKENS === currentView ? 'is-active' : ''
              }`}
            >
              {viewTitleMapping[AnalyticsViews.TOKENS]}
            </h2>
            <h2
              onClick={() => handleTabItemClick(AnalyticsViews.FARMS)}
              className={`text-subheader tab-title mx-4 ms-3 ${
                AnalyticsViews.FARMS === currentView ? 'is-active' : ''
              }`}
            >
              {viewTitleMapping[AnalyticsViews.FARMS]}
            </h2> */}
          </div>
        </div>
        <hr />
        {renderCurrentView()}
      </div>
    </div>
  );
};

export default Analytics;
