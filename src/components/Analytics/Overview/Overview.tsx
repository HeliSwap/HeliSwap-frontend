import { useState, useEffect, useContext } from 'react';

import BigNumber from 'bignumber.js';
import _ from 'lodash';

import { GlobalContext } from '../../../providers/Global';

import { IPoolExtendedData, ITokenListData } from '../../../interfaces/tokens';
import { ChartDayData, PoolChartEntry } from '../../../interfaces/common';

import BarChart from '../../BarChart';
import Icon from '../../Icon';
import LineChart from '../../LineChart';
import TopPools from './TopPools';
import TopTokens from './TopTokens';
import Loader from '../../Loader';

import { getTokenPrice } from '../../../utils/tokenUtils';
import { filterPoolsByPattern } from '../../../utils/poolUtils';

import usePoolsByTokensList from '../../../hooks/usePoolsByTokensList';
import usePoolsByFilter from '../../../hooks/usePoolsByFilter';
import { client, fetchPoolChartData } from '../../../hooks/useUniswapChartData';

import {
  ASYNC_SEARCH_THRESHOLD,
  useQueryOptions,
  useQueryOptionsProvideSwapRemove,
} from '../../../constants';

const Overview = () => {
  const contextValue = useContext(GlobalContext);
  const { tokensWhitelisted, hbarPrice } = contextValue;

  const tokensWhitelistedAddresses = tokensWhitelisted.map(item => item.address) || [];
  const dataClient = client;

  const [chartData, setChartData] = useState<ChartDayData[]>([]);
  const [poolsToShow, setPoolsToShow] = useState<IPoolExtendedData[]>([]);
  const [tokensToShow, setTokensToShow] = useState<ITokenListData[]>([]);
  const [loadingTokens, setLoadingTokens] = useState(false);

  const {
    poolsByTokenList: pools,
    loadingPoolsByTokenList: loadingPools,
    errorPoolsByTokenList: errorPools,
  } = usePoolsByTokensList(useQueryOptionsProvideSwapRemove, true, tokensWhitelistedAddresses);
  const { filteredPools, filteredPoolsLoading } = usePoolsByFilter(useQueryOptions, true, pools);

  // Merge whitelisted and pools by filter arrays
  useEffect(() => {
    if ((pools.length || filteredPools.length) && !filteredPoolsLoading && !loadingPools) {
      const whitelistedFilteredPools = filterPoolsByPattern('', pools, ASYNC_SEARCH_THRESHOLD);
      const visiblePools = _.unionBy(whitelistedFilteredPools, filteredPools, 'id');

      setPoolsToShow(visiblePools);
    }
  }, [pools, filteredPools, filteredPoolsLoading, loadingPools]);

  useEffect(() => {
    setLoadingTokens(true);

    if (tokensWhitelisted.length && poolsToShow.length && hbarPrice) {
      // calculate TVL per token
      const tvlPerToken: any = {};
      poolsToShow.forEach(pool => {
        const { token0, token0Amount } = pool;
        const { token1, token1Amount } = pool;

        const token0AmountToBN = new BigNumber(token0Amount);
        const token1AmountToBN = new BigNumber(token1Amount);

        if (!tvlPerToken[token0]) {
          tvlPerToken[token0] = token0AmountToBN;
        } else {
          tvlPerToken[token0] = tvlPerToken[token0].plus(new BigNumber(token0AmountToBN));
        }

        if (!tvlPerToken[token1]) {
          tvlPerToken[token1] = token1AmountToBN;
        } else {
          tvlPerToken[token1] = tvlPerToken[token1].plus(new BigNumber(token1AmountToBN));
        }
      });
      // prepare local currentTokens state
      const tokensWithData = tokensWhitelisted.map(token => {
        const tokenPrice = getTokenPrice(poolsToShow, token.address, hbarPrice);
        token.price = tokenPrice;
        if (tvlPerToken[token.address]) {
          token.tvl = tvlPerToken[token.address].toString();
        }
        return token;
      });

      setLoadingTokens(false);
      setTokensToShow(tokensWithData);
    }
  }, [tokensWhitelisted, poolsToShow, hbarPrice]);

  useEffect(() => {
    const addresses = [
      '0x5777d92f208679db4b9778590fa3cab3ac9e2168',
      '0x6c6bc977e13df9b0de53b251522280bb72383700',
      '0x8ad599c3a0ff1de082011efddc58f1908eb6e6d8',
      '0x88e6a0c2ddd26feeb64f039a2c41296fcb3f5640',
      '0xcbcdf9626bc03e24f779434178a73a0b4bad62ed',
      '0x3416cf6c708da44db2624d63ea0aaef7113527c6',
      '0xc63b0708e2f7e69cb8a1df0e1389a98c35a76d52',
      '0x4e68ccd3e89f51c3074ca5072bbac773960dfa36',
      '0x8ee3cc8e29e72e03c4ab430d7b7e08549f0c71cc',
      '0x4585fe77225b41b697c938b018e2ac67ac5a20c0',
      '0x99ac8ca7087fa4a2a1fb6357269965a2014abc35',
      '0xc2e9f25be6257c210d7adf0d4cd6e3e881ba25f8',
      '0x7379e81228514a1d2a6cf7559203998e20598346',
      '0x11b815efb8f581194ae79006d24e0d814b7697f6',
      '0x7bea39867e4169dbe237d55c8242a8f2fcdcc387',
      '0x00cef0386ed94d738c8f8a74e8bfd0376926d24c',
      '0x97e7d56a0408570ba1a7852de36350f7713906ec',
      '0x7858e59e0c01ea06df3af3d20ac7b0003275d4bf',
      '0xa6cc3c2531fdaa6ae1a3ca84c2855806728693e8',
      '0x64a078926ad9f9e88016c199017aea196e3899e1',
      '0x5c128d25a21f681e678cb050e551a895c9309945',
      '0xac4b3dacb91461209ae9d41ec517c2b9cb1b7daf',
      '0x735a26a57a0a0069dfabd41595a970faf5e1ee8b',
      '0x60594a405d53811d3bc4766596efd80fd545a270',
      '0x69d91b94f0aaf8e8a2586909fa77a5c2c89818d5',
      '0xd83d78108dd0d1dffff11ea3f99871671a52488b',
      '0xb9044f46dcdea7ecebbd918a9659ba8239bd9f37',
      '0x40e629a26d96baa6d81fae5f97205c2ab2c1ff29',
      '0x04a2004b2032fef2ba93f40b0e34d26ab7b00120',
      '0x75099758a9d1f43198043825c8fbcf8a12be7a74',
      '0x1c5c60bef00c820274d4938a5e6d04b124d4910b',
      '0x1d42064fc4beb5f8aaf85f4617ae8b3b5b8bd801',
      '0x4b5ab61593a2401b1075b90c04cbcdd3f87ce011',
      '0x290a6a7460b308ee3f19023d2d00de604bcf5b42',
      '0x5764a6f2212d502bc5970f9f129ffcd61e5d7563',
      '0x39529e96c28807655b5856b3d342c6225111770e',
      '0x2eb8f5708f238b0a2588f044ade8dea7221639ab',
      '0xf482fce04ef6f29ad56e46fef2de038c42126e2e',
      '0x3730ecd0aa7eb9b35a4e89b032bef80a1a41aa7f',
      '0xc2a856c3aff2110c1171b8f942256d40e980c726',
      '0xcf56b49b435f4d326467788f2c8543cf9a99660f',
      '0xa9ffb27d36901f87f1d0f20773f7072e38c5bfba',
      '0xf4ad61db72f114be877e87d62dc5e7bd52df4d9b',
      '0xbea615376d1184f3670a341b70f6f45d9d0fbaad',
      '0x87986ae1e99f99da1f955d16930dc8914ffbed56',
      '0xd35efae4097d005720608eaf37e42a5936c94b44',
      '0xf56d08221b5942c428acc5de8f78489a97fc5599',
      '0xe15e6583425700993bd08f51bf6e7b73cd5da91b',
      '0x68082ecc5bbad8fe77c2cb9d0e3403d9a00ccbc2',
    ];

    async function fetchAll() {
      if (!addresses) {
        return;
      }

      // fetch all data for each pool
      const data = await addresses
        .slice(0, 20) // @TODO: must be replaced with aggregate with subgraph data fixed.
        .reduce(async (accumP: Promise<{ [key: number]: ChartDayData }>, address) => {
          const accum = await accumP;
          const { data } = await fetchPoolChartData(address, dataClient);
          if (!data) return accum;

          data.forEach((poolDayData: PoolChartEntry) => {
            const { date, totalValueLockedUSD, volumeUSD } = poolDayData;
            const roundedDate = date;
            if (!accum[roundedDate]) {
              accum[roundedDate] = {
                tvlUSD: 0,
                date: roundedDate,
                volumeUSD: 0,
              };
            }
            accum[roundedDate].tvlUSD = accum[roundedDate].tvlUSD + totalValueLockedUSD;
            accum[roundedDate].volumeUSD = accum[roundedDate].volumeUSD + volumeUSD;
          });
          return accum;
        }, Promise.resolve({} as { [key: number]: ChartDayData }));

      // Format as array
      setChartData(Object.values(data));
    }

    if (chartData.length === 0) {
      fetchAll();
    }
  }, [chartData, dataClient]);

  return (
    <div className="my-9">
      <div className="row">
        <div className="col-6">
          {chartData.length ? (
            <div className="container-blue-neutral-800 rounded p-4">
              <LineChart chartData={chartData} aggregatedValue={0} />
            </div>
          ) : (
            <div className="d-flex justify-content-center my-6">
              <Loader />
            </div>
          )}
        </div>

        <div className="col-6">
          {chartData.length ? (
            <div className="container-blue-neutral-800 rounded p-4">
              <BarChart chartData={chartData} aggregatedValue={0} />
            </div>
          ) : (
            <div className="d-flex justify-content-center my-6">
              <Loader />
            </div>
          )}
        </div>
      </div>

      <section className="d-flex align-items-center container-blue-neutral-800 rounded mt-5 py-4 px-5 text-small">
        <div className="me-5">
          <span className="text-gray me-2">Volume 24h:</span>
          <span className="text-bold me-2 text-numeric">$123.45m</span>
          <span className="text-positive-400">
            (
            <Icon color="success" name="arrow-up" size="small" />
            <span className="text-numeric">23.45%</span> )
          </span>
        </div>

        <div className="me-5">
          <span className="text-gray me-2">Fees 24h:</span>
          <span className="text-bold me-2 text-numeric">$1.23m</span>
          <span className="text-positive-400">
            (
            <Icon color="success" name="arrow-up" size="small" />
            <span className="text-numeric">23.45%</span> )
          </span>
        </div>
        <div className="me-5">
          <span className="text-gray me-2">TVL:</span>
          <span className="text-bold me-2 text-numeric">$1.23b</span>
          <span className="text-positive-400">
            (
            <Icon color="success" name="arrow-up" size="small" />
            <span className="text-numeric">3.45%</span> )
          </span>
        </div>
      </section>

      <section className="d-flex my-5 flex-column text-small">
        <p className="text-small text-bold mb-4">Pools</p>
        {loadingPools ? (
          <div className="d-flex justify-content-center my-6">
            <Loader />
          </div>
        ) : (
          <TopPools error={errorPools} pools={poolsToShow} />
        )}
      </section>

      <section className="d-flex my-5 flex-column text-small">
        <p className="text-small text-bold mb-4">Tokens</p>
        {loadingTokens ? (
          <div className="d-flex justify-content-center my-6">
            <Loader />
          </div>
        ) : (
          <TopTokens tokens={tokensToShow} />
        )}
      </section>
    </div>
  );
};

export default Overview;
