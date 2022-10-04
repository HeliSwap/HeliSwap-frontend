import { ApolloClient, InMemoryCache, NormalizedCacheObject } from '@apollo/client';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import weekOfYear from 'dayjs/plugin/weekOfYear';
import gql from 'graphql-tag';
import { ChartDayData, GenericChartEntry, PoolChartEntry } from '../interfaces/common';

export const client = new ApolloClient({
  uri: 'https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v3',
  cache: new InMemoryCache({
    typePolicies: {
      Token: {
        // Singleton types that have no identifying field can use an empty
        // array for their keyFields.
        keyFields: false,
      },
      Pool: {
        // Singleton types that have no identifying field can use an empty
        // array for their keyFields.
        keyFields: false,
      },
    },
  }),
  queryDeduplication: true,
  defaultOptions: {
    watchQuery: {
      fetchPolicy: 'no-cache',
    },
    query: {
      fetchPolicy: 'no-cache',
      errorPolicy: 'all',
    },
  },
});

// format dayjs with the libraries that we need
dayjs.extend(utc);
dayjs.extend(weekOfYear);
const ONE_DAY_UNIX = 24 * 60 * 60;

const POOL_CHART = gql`
  query poolDayDatas($startTime: Int!, $skip: Int!, $address: Bytes!) {
    poolDayDatas(
      first: 1000
      skip: $skip
      where: { pool: $address, date_gt: $startTime }
      orderBy: date
      orderDirection: asc
      subgraphError: allow
    ) {
      date
      volumeUSD
      tvlUSD
      feesUSD
      pool {
        feeTier
      }
    }
  }
`;

interface ChartResults {
  poolDayDatas: {
    date: number;
    volumeUSD: string;
    tvlUSD: string;
    feesUSD: string;
    pool: {
      feeTier: string;
    };
  }[];
}

export async function fetchPoolChartData(
  address: string,
  client: ApolloClient<NormalizedCacheObject>,
) {
  let data: {
    date: number;
    volumeUSD: string;
    tvlUSD: string;
    feesUSD: string;
    pool: {
      feeTier: string;
    };
  }[] = [];
  const startTimestamp = 1619170975;
  const endTimestamp = dayjs.utc().unix();

  let error = false;
  let skip = 0;
  let allFound = false;

  try {
    while (!allFound) {
      const {
        data: chartResData,
        error,
        loading,
      } = await client.query<ChartResults>({
        query: POOL_CHART,
        variables: {
          address: address,
          startTime: startTimestamp,
          skip,
        },
        fetchPolicy: 'cache-first',
      });
      if (!loading) {
        skip += 1000;
        if (chartResData.poolDayDatas.length < 1000 || error) {
          allFound = true;
        }
        if (chartResData) {
          data = data.concat(chartResData.poolDayDatas);
        }
      }
    }
  } catch {
    error = true;
  }

  if (data) {
    const formattedExisting = data.reduce((accum: any, dayData) => {
      const roundedDate = parseInt((dayData.date / ONE_DAY_UNIX).toFixed(0));
      const feePercent = parseFloat(dayData.pool.feeTier) / 10000;
      const tvlAdjust = dayData?.volumeUSD ? parseFloat(dayData.volumeUSD) * feePercent : 0;

      accum[roundedDate] = {
        date: dayData.date,
        volumeUSD: parseFloat(dayData.volumeUSD),
        totalValueLockedUSD: parseFloat(dayData.tvlUSD) - tvlAdjust,
        feesUSD: parseFloat(dayData.feesUSD),
      };
      return accum;
    }, {});

    const firstEntry = formattedExisting[parseInt(Object.keys(formattedExisting)[0])];

    // fill in empty days ( there will be no day datas if no trades made that day )
    let timestamp = firstEntry?.date ?? startTimestamp;
    let latestTvl = firstEntry?.totalValueLockedUSD ?? 0;
    while (timestamp < endTimestamp - ONE_DAY_UNIX) {
      const nextDay = timestamp + ONE_DAY_UNIX;
      const currentDayIndex = parseInt((nextDay / ONE_DAY_UNIX).toFixed(0));
      if (!Object.keys(formattedExisting).includes(currentDayIndex.toString())) {
        formattedExisting[currentDayIndex] = {
          date: nextDay,
          volumeUSD: 0,
          totalValueLockedUSD: latestTvl,
          feesUSD: 0,
        };
      } else {
        latestTvl = formattedExisting[currentDayIndex].totalValueLockedUSD;
      }
      timestamp = nextDay;
    }

    const dateMap = Object.keys(formattedExisting).map(key => {
      return formattedExisting[parseInt(key)];
    });

    return {
      data: dateMap,
      error: false,
    };
  } else {
    return {
      data: undefined,
      error,
    };
  }
}

export function unixToDate(unix: number, format = 'YYYY-MM-DD'): string {
  return dayjs.unix(unix).utc().format(format);
}

export function getTransformedVolumeData(
  chartData: ChartDayData[] | PoolChartEntry[],
  type: 'month' | 'week',
) {
  if (chartData) {
    const data: Record<string, GenericChartEntry> = {};

    chartData.forEach(({ date, volumeUSD }: { date: number; volumeUSD: number }) => {
      const group = unixToType(date, type);
      if (data[group]) {
        data[group].value += volumeUSD;
      } else {
        data[group] = {
          time: unixToDate(date),
          value: volumeUSD,
        };
      }
    });

    return Object.values(data);
  } else {
    return [];
  }
}

export function getTransformedTvlData(chartData: ChartDayData[], type: 'month' | 'week') {
  if (chartData) {
    const data: Record<string, GenericChartEntry> = {};

    chartData.forEach(({ date, tvlUSD }: { date: number; tvlUSD: number }) => {
      const group = unixToType(date, type);
      if (data[group]) {
        data[group].value += tvlUSD;
      } else {
        data[group] = {
          time: unixToDate(date),
          value: tvlUSD,
        };
      }
    });

    return Object.values(data);
  } else {
    return [];
  }
}

function unixToType(unix: number, type: 'month' | 'week') {
  const date = dayjs.unix(unix).utc();

  switch (type) {
    case 'month':
      return date.format('YYYY-MM');
    case 'week':
      let week = String(date.week());
      if (week.length === 1) {
        week = `0${week}`;
      }
      return `${date.year()}-${week}`;
  }
}
