import React, { useRef, useState, useEffect, useCallback, useMemo } from 'react';

import { createChart, IChartApi } from 'lightweight-charts';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';

import { ITokenCandleData } from '../interfaces/common';
import { getTransformedCandleData } from '../utils/metricsUtils';
import { formatStringToPriceWithPrecision } from '../utils/numberUtils';

dayjs.extend(utc);

const DEFAULT_HEIGHT = 300;

export type LineChartProps = {
  chartData: ITokenCandleData[];
} & React.HTMLAttributes<HTMLDivElement>;

const CandleChart = ({ chartData }: LineChartProps) => {
  const chartRef = useRef<HTMLDivElement>(null);
  const [chartCreated, setChart] = useState<IChartApi | undefined>();
  const [value, setValue] = useState<number | undefined>();
  const [label, setLabel] = useState<string | undefined>();
  const [initialLoad, setInitialLoad] = useState(true);

  const formattedCandleData = useMemo(() => {
    return getTransformedCandleData(chartData);
  }, [chartData]);

  const handleResize = useCallback(() => {
    if (chartCreated && chartRef?.current?.parentElement) {
      chartCreated.resize(chartRef.current.parentElement.clientWidth - 32, DEFAULT_HEIGHT);
      chartCreated.timeScale().fitContent();
      chartCreated.timeScale().scrollToPosition(0, false);
    }
  }, [chartCreated, chartRef]);

  useEffect(() => {
    setValue(formattedCandleData[formattedCandleData.length - 1].open);
  }, [formattedCandleData]);

  // add event listener for resize
  const isClient = typeof window === 'object';
  useEffect(() => {
    if (!isClient) {
      return;
    }
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isClient, chartRef, handleResize]);

  // if chart not instantiated in canvas, create it
  useEffect(() => {
    if (initialLoad) {
      setInitialLoad(false);
      return;
    }
    if (!chartRef.current || chartCreated || initialLoad) return;
    if (!chartCreated && chartData && !!chartRef?.current?.parentElement) {
      const chart = createChart(chartRef.current, {
        height: DEFAULT_HEIGHT,
        width: chartRef.current.parentElement.clientWidth - 32,
        layout: {
          backgroundColor: 'transparent',
          textColor: '#565A69',
          fontFamily: 'inherit',
        },
        rightPriceScale: {
          scaleMargins: {
            top: 0.1,
            bottom: 0.1,
          },
          borderVisible: false,
        },
        timeScale: {
          borderVisible: false,
          secondsVisible: true,
          tickMarkFormatter: (unixTime: number) => {
            return dayjs.unix(unixTime).format('MM/DD h:mm A');
          },
        },
        watermark: {
          visible: false,
        },
        grid: {
          horzLines: {
            visible: false,
          },
          vertLines: {
            visible: false,
          },
        },
        crosshair: {
          horzLine: {
            visible: false,
            labelVisible: false,
          },
          mode: 1,
          vertLine: {
            visible: true,
            labelVisible: false,
            style: 3,
            width: 1,
            color: '#505050',
            labelBackgroundColor: '#56B2A4',
          },
        },
      });

      chart.timeScale().fitContent();
      setChart(chart);
    }
  }, [chartCreated, chartData, initialLoad]);

  useEffect(() => {
    if (chartCreated && formattedCandleData) {
      const series = chartCreated.addCandlestickSeries({
        upColor: 'green',
        downColor: 'red',
        borderDownColor: 'red',
        borderUpColor: 'green',
        wickDownColor: 'red',
        wickUpColor: 'green',
      });

      series.setData(formattedCandleData as any);

      // update the title when hovering on the chart
      chartCreated.subscribeCrosshairMove(function (param) {
        if (
          chartRef?.current &&
          (param === undefined ||
            param.time === undefined ||
            (param && param.point && param.point.x < 0) ||
            (param && param.point && param.point.x > chartRef.current.clientWidth) ||
            (param && param.point && param.point.y < 0) ||
            (param && param.point && param.point.y > DEFAULT_HEIGHT))
        ) {
          // reset values
          setValue && setValue(formattedCandleData[formattedCandleData.length - 1].close);
          setLabel && setLabel(undefined);
        } else if (series && param) {
          const timestamp = param.time as number;
          const time = dayjs.unix(timestamp).utc().format('MMM D, YYYY h:mm A') + ' (UTC)';
          const parsed = param.seriesPrices.get(series) as { open: number } | undefined;
          setValue && setValue(parsed?.open);
          setLabel && setLabel(time);
        }
      });
    }
  }, [chartCreated, formattedCandleData]);

  return (
    <div>
      {label ? (
        <p className="text-small">{dayjs(label).format('MMM D, YYYY')}</p>
      ) : (
        <p className="text-small">{dayjs.utc().format('MMM D, YYYY')}</p>
      )}
      {value && (
        <p className="text-headline text-bold mt-3">
          {formatStringToPriceWithPrecision(value?.toString() as string)}
        </p>
      )}
      <div ref={chartRef} />
    </div>
  );
};

export default CandleChart;
