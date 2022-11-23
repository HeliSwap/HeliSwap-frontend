import React, { useState } from 'react';
import { useParams } from 'react-router-dom';

import { AnalyticsViews } from '../interfaces/common';

import { viewTitleMapping } from './Analytics';

import { analyticsPageInitialCurrentView } from '../constants';

const AnalyticsPoolDetials = () => {
  const { poolAddress } = useParams();

  const [currentView, setCurrentView] = useState<AnalyticsViews>(analyticsPageInitialCurrentView);

  // Handlers
  const handleTabItemClick = (currentView: AnalyticsViews) => {
    setCurrentView(currentView);
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

        <div></div>

        <div>
          <div></div>
          <div></div>
        </div>

        <div>
          <div></div>
          <div></div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPoolDetials;
