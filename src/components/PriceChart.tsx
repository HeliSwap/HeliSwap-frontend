import { useEffect, useMemo, useState } from 'react';
import { XAxis, Tooltip, Bar, BarChart, ResponsiveContainer } from 'recharts';

import dayjs from 'dayjs';

import { ITokenHistoricalData } from '../interfaces/common';

import Loader from './Loader';

import { formatStringToPrice } from '../utils/numberUtils';
import { getTransformedPriceData } from '../utils/metricsUtils';

import { INITIAL_CHART_LABELS } from '../constants';

interface ICandleChartProps {
  chartData: ITokenHistoricalData[];
  aggregatedValue: string;
}

const Chart = ({ chartData, aggregatedValue }: ICandleChartProps) => {
  const [value, setValue] = useState(aggregatedValue);
  const [dateLabel, setDateLabel] = useState('');

  const formattedPriceData = useMemo(() => {
    return getTransformedPriceData(chartData);
  }, [chartData]);

  useEffect(() => {
    setValue(aggregatedValue);
  }, [aggregatedValue]);

  return (
    <div style={{ minHeight: '392px' }}>
      <div className="d-flex flex-row justify-content-between align-items-start">
        <div className="d-flex justify-content-between">
          <div>
            <p className="text-main text-gray">{INITIAL_CHART_LABELS.TOKEN_BAR_CHART}</p>
            <p className="text-headline text-bold mt-3">{formatStringToPrice(value)}</p>
          </div>
        </div>
      </div>

      {chartData.length !== 0 ? (
        <ResponsiveContainer height={300}>
          <BarChart
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
            data={formattedPriceData}
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
            <XAxis
              dataKey="time"
              axisLine={false}
              tickLine={false}
              tickFormatter={time => dayjs(time).format('MMM')}
              minTickGap={10}
              interval="preserveStart"
            />
            <Tooltip cursor={{ fill: '#7979a3' }} contentStyle={{ display: 'none' }} />
            <Bar
              dataKey="value"
              fill={'white'}
              shape={props => {
                return (
                  <CustomBar
                    height={props.height}
                    width={props.width}
                    x={props.x}
                    y={props.y}
                    fill={'#4D5FFF'}
                  />
                );
              }}
            />
          </BarChart>
        </ResponsiveContainer>
      ) : (
        <Loader />
      )}
    </div>
  );
};

const CustomBar = ({
  x,
  y,
  width,
  height,
  fill,
}: {
  x: number;
  y: number;
  width: number;
  height: number;
  fill: string;
}) => {
  return (
    <g>
      <rect x={x} y={y} fill={fill} width={width} height={height} rx="2" />
    </g>
  );
};

export default Chart;
