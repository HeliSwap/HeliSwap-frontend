import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import weekOfYear from 'dayjs/plugin/weekOfYear';
import { GenericChartEntry, IHistoricalData, VolumeChartView } from '../interfaces/common';

// format dayjs with the libraries that we need
dayjs.extend(utc);
dayjs.extend(weekOfYear);

export function unixToDate(unix: string, format = 'YYYY-MM-DD'): string {
  return dayjs.unix(Number(unix)).utc().format(format);
}

export function getTransformedVolumeData(chartData: IHistoricalData[], type: VolumeChartView) {
  if (chartData) {
    if (type === VolumeChartView.daily) {
      return chartData.map(day => {
        return {
          time: unixToDate(day.time),
          value: Number(day.volume),
        };
      });
    } else {
      const data: Record<string, GenericChartEntry> = {};

      chartData.forEach(({ time, volume }: { time: string; volume: string }) => {
        const group = unixToType(time, type);
        if (data[group]) {
          data[group].value += Number(volume);
        } else {
          data[group] = {
            time: unixToDate(time),
            value: Number(volume),
          };
        }
      });

      return Object.values(data);
    }
  } else {
    return [];
  }
}

export function getTransformedTvlData(chartData: IHistoricalData[]) {
  if (chartData) {
    return chartData.map(day => {
      return {
        time: unixToDate(day.time),
        value: Number(day.tvl),
      };
    });
  } else {
    return [];
  }
}

function unixToType(unix: string, type: VolumeChartView) {
  const date = dayjs.unix(Number(unix)).utc();

  switch (type) {
    case VolumeChartView.monthly:
      return date.format('YYYY-MM');
    case VolumeChartView.weekly:
      let week = String(date.week());
      if (week.length === 1) {
        week = `0${week}`;
      }
      return `${date.year()}-${week}`;
    default:
      return date.format('YYYY-MM');
  }
}
