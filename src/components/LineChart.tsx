import { useEffect, useMemo, useState } from 'react';
import { XAxis, AreaChart, Area, Tooltip, ResponsiveContainer } from 'recharts';
import Tippy from '@tippyjs/react';

import dayjs from 'dayjs';

import { IHistoricalData, ITokenHistoricalData } from '../interfaces/common';

import Loader from './Loader';
import Icon from './Icon';

import { formatStringToPrice } from '../utils/numberUtils';
import { getTransformedTvlData, getTransformedTokenData } from '../utils/metricsUtils';

import { INITIAL_CHART_LABELS, CHART_DATA } from '../constants';

interface ILineChartProps {
  chartData: IHistoricalData[] | ITokenHistoricalData[];
  aggregatedValue: string;
  dataType: string;
}

const Chart = ({ chartData, aggregatedValue, dataType }: ILineChartProps) => {
  const [value, setValue] = useState(aggregatedValue);
  const [dateLabel, setDateLabel] = useState('');
  const [chartLabel, setChartLabel] = useState('');

  const formattedTvlData = useMemo(() => {
    if (dataType === CHART_DATA.TVL) {
      return getTransformedTvlData(chartData as IHistoricalData[]);
    } else if (dataType === CHART_DATA.TOKEN) {
      return getTransformedTokenData(chartData as ITokenHistoricalData[]);
    }
  }, [chartData, dataType]);

  useEffect(() => {
    if (chartData.length) {
      if (dataType === CHART_DATA.TVL) {
        setChartLabel(INITIAL_CHART_LABELS.TVL_LINE_CHART);
      } else if (dataType === CHART_DATA.TOKEN) {
        setChartLabel((chartData[0] as ITokenHistoricalData).symbol);
      }
    }
  }, [dataType, chartData]);

  return (
    <div style={{ minHeight: '392px' }}>
      <div className="d-flex justify-content-between align-items-start">
        <div>
          <p className="text-main text-gray d-flex align-items-center">
            {chartLabel}{' '}
            {dataType === CHART_DATA.TVL && (
              <Tippy content={`Total value locked`}>
                <span className="ms-2">
                  <Icon color="gray" name="hint" />
                </span>
              </Tippy>
            )}
          </p>
          <p className="text-headline text-bold mt-3">
            {formatStringToPrice(value?.toString() as string)}
          </p>
          {dateLabel ? (
            <p className="text-small">{dayjs(dateLabel).format('MMM D, YYYY')}</p>
          ) : (
            <p className="text-small">-</p>
          )}
        </div>
      </div>
      {chartData.length !== 0 ? (
        <ResponsiveContainer height={300}>
          <AreaChart
            onMouseMove={(e: any) => {
              if (e && e.activePayload) {
                const { time: currTime, value: currValue } = e.activePayload[0]?.payload;
                if (currTime !== dateLabel || value !== currValue) {
                  setValue(currValue);
                  setDateLabel(currTime);
                }
              }
            }}
            width={500}
            height={300}
            data={formattedTvlData}
            margin={{
              top: 5,
              right: 30,
              left: 20,
              bottom: 5,
            }}
            onMouseLeave={() => {
              setValue(aggregatedValue);
              setDateLabel('');
            }}
          >
            <defs>
              <linearGradient id="gradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopOpacity={0.5} />
                <stop offset="100%" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="time"
              axisLine={false}
              tickLine={false}
              tickFormatter={time => dayjs(time).format('D')}
              minTickGap={10}
              interval="preserveStartEnd"
            />
            <Tooltip cursor={{ stroke: '#8884d8' }} contentStyle={{ display: 'none' }} />
            <Area dataKey="value" type="monotone" strokeWidth={2} stroke="#E541EE" fill="#19193F" />
          </AreaChart>
        </ResponsiveContainer>
      ) : (
        <Loader />
      )}
    </div>
  );
};

export default Chart;
