import { useMemo, useState } from 'react';
import { XAxis, AreaChart, Area, Tooltip } from 'recharts';
import dayjs from 'dayjs';

import { IHistoricalData } from '../interfaces/common';

import Loader from './Loader';

import { formatStringToPrice } from '../utils/numberUtils';
import { getTransformedTvlData } from '../utils/metricsUtils';

interface ILineChartProps {
  chartData: IHistoricalData[];
  aggregatedValue: number;
}

const Chart = ({ chartData, aggregatedValue }: ILineChartProps) => {
  const [value, setValue] = useState<number>(aggregatedValue);
  const [dateLabel, setDateLabel] = useState<string>('');

  const formattedTvlData = useMemo(() => {
    return getTransformedTvlData(chartData);
  }, [chartData]);

  return (
    <div style={{ minHeight: '392px' }}>
      <div className="d-flex justify-content-between align-items-start">
        <div>
          <p className="text-main text-gray">TVL</p>
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
            tickFormatter={time => dayjs(time).format('MMM YY')}
            minTickGap={10}
          />
          <Tooltip cursor={{ stroke: '#8884d8' }} contentStyle={{ display: 'none' }} />
          <Area dataKey="value" type="monotone" strokeWidth={2} stroke="#E541EE" fill="#19193F" />
        </AreaChart>
      ) : (
        <Loader />
      )}
    </div>
  );
};

export default Chart;
