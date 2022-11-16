import { useMemo, useState } from 'react';
import { XAxis, Tooltip, Bar, BarChart } from 'recharts';
import dayjs from 'dayjs';

import { IHistoricalData, VolumeChartView } from '../interfaces/common';

import Button from './Button';
import Loader from './Loader';

import { formatStringToPrice } from '../utils/numberUtils';
import { getTransformedVolumeData } from '../utils/metricsUtils';

interface IBarChartProps {
  chartData: IHistoricalData[];
  aggregatedValue: number;
}

const Chart = ({ chartData, aggregatedValue }: IBarChartProps) => {
  const [value, setValue] = useState<number>(aggregatedValue);
  const [dateLabel, setDateLabel] = useState<string>('');
  const [chartView, setChartView] = useState(VolumeChartView.weekly);

  const formattedVolumeData = useMemo(() => {
    return getTransformedVolumeData(chartData, chartView);
  }, [chartData, chartView]);

  return (
    <div style={{ minHeight: '392px' }}>
      <div className="d-flex flex-row justify-content-between align-items-start">
        <div className="d-flex justify-content-between">
          <div>
            <p className="text-main text-gray">Volume 24H</p>
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
          <div className="d-flex justify-content-end">
            <Button
              type={chartView === VolumeChartView.daily ? 'primary' : 'secondary'}
              size="small"
              className="mx-2"
              onClick={() => {
                if (chartView !== VolumeChartView.daily) {
                  setChartView(VolumeChartView.daily);
                }
              }}
            >
              D
            </Button>
            <Button
              type={chartView === VolumeChartView.weekly ? 'primary' : 'secondary'}
              size="small"
              className="mx-2"
              onClick={() => {
                if (chartView !== VolumeChartView.weekly) {
                  setChartView(VolumeChartView.weekly);
                }
              }}
            >
              W
            </Button>
            <Button
              type={chartView === VolumeChartView.monthly ? 'primary' : 'secondary'}
              size="small"
              className="mx-2"
              onClick={() => {
                if (chartView !== VolumeChartView.monthly) {
                  setChartView(VolumeChartView.monthly);
                }
              }}
            >
              M
            </Button>
          </div>
        ) : null}
      </div>

      {chartData.length !== 0 ? (
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
          data={formattedVolumeData}
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
            tickFormatter={time => dayjs(time).format('MMM YY')}
            minTickGap={10}
          />
          <Tooltip cursor={{ fill: '#F7F8FA' }} contentStyle={{ display: 'none' }} />
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
