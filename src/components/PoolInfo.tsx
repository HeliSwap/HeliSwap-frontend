import React, { useEffect, useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Tippy from '@tippyjs/react';

import { IPoolExtendedData } from '../interfaces/tokens';
import { PageViews } from '../interfaces/common';

import Button from './Button';
import IconToken from './IconToken';
import Icon from './Icon';
import Modal from './Modal';
import TransferLPModalContent from './Modals/TransferLPModalContent';
import InputTokenSelector from './InputTokenSelector';

import {
  formatStringETHtoPriceFormatted,
  formatStringToPrice,
  formatStringWeiToStringEther,
} from '../utils/numberUtils';
import { formatIcons } from '../utils/iconUtils';

import { generalFeesAndKeysWarning } from '../content/messages';

import { POOLS_FEE } from '../constants';
import InputToken from './InputToken';
import ButtonSelector from './ButtonSelector';
import WalletBalance from './WalletBalance';
import ToasterWrapper from './ToasterWrapper';

import { GlobalContext } from '../providers/Global';
import getErrorMessage from '../content/errors';
import toast from 'react-hot-toast';
import { idToAddress, invalidInputTokensData, isHederaIdValid } from '../utils/tokenUtils';

interface IPoolInfoProps {
  poolData: IPoolExtendedData;
  index: number;
  setShowRemoveContainer: React.Dispatch<React.SetStateAction<boolean>>;
  setCurrentPoolAddress: React.Dispatch<React.SetStateAction<string>>;
  view: PageViews;
  collapseAll?: boolean;
  setCollapseAll?: (collapsed: boolean) => void;
}

const PoolInfo = ({
  poolData,
  index,
  setShowRemoveContainer,
  setCurrentPoolAddress,
  view,
  collapseAll,
  setCollapseAll,
}: IPoolInfoProps) => {
  const contextValue = useContext(GlobalContext);
  const { connection, sdk } = contextValue;
  const { userId, hashconnectConnectorInstance } = connection;
  const navigate = useNavigate();

  const maxLpInputValue: string = formatStringWeiToStringEther(poolData?.lpShares as string);

  const [showPoolDetails, setShowPoolDetails] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [inputId, setInputId] = useState('');
  const [inputIdValid, setInputIdValid] = useState(true);
  const [inputLPAmount, setInputLPAmount] = useState(
    formatStringWeiToStringEther(poolData.lpShares as string),
  );
  const [inputLPAmountValid, setInputLPAMountValid] = useState(true);

  const [transferLoading, setTransferLoading] = useState(false);

  const handleRemoveButtonClick = () => {
    setShowRemoveContainer(prev => !prev);
    setCurrentPoolAddress(poolData?.pairAddress);
  };

  const handleTransferModalButtonClick = () => {
    setShowTransferModal(true);
  };

  const handleInputIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { target } = e;
    const { value } = target;

    setInputIdValid(!!isHederaIdValid(value));
    setInputId(value);
  };

  const handleInputLPAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;

    if (invalidInputTokensData(value, maxLpInputValue, 18)) {
      setInputLPAmount(formatStringWeiToStringEther(poolData.lpShares as string));
      setInputLPAMountValid(false);
      return;
    }

    setInputLPAMountValid(true);
    setInputLPAmount(value);
  };

  const handleMaxButtonClick = (value: string) => {
    setInputLPAmount(formatStringWeiToStringEther(poolData.lpShares as string));
  };

  const handleTransferButtonClick = async (
    tokenAddress: string,
    amount: string,
    address: string,
  ) => {
    setTransferLoading(true);

    try {
      const receipt = await sdk.transferERC20(
        hashconnectConnectorInstance,
        userId,
        tokenAddress,
        amount,
        address,
      );
      const {
        response: { success, error },
      } = receipt;

      if (!success) {
        toast.error(getErrorMessage(error.status ? error.status : error));
      } else {
        toast.success('Success! Tokens were trasfered.');
        setShowTransferModal(false);
        setInputId('');
      }
    } catch (err) {
      console.error(err);
      toast('Error on transfer');
    } finally {
      setTransferLoading(false);
    }
  };

  const handleStakeButtonClick = () => {
    const { farmAddress } = poolData;

    if (farmAddress) {
      navigate(`/farms/${farmAddress}`);
    } else {
      navigate(`/farms/`);
    }
  };

  useEffect(() => {
    if (collapseAll) setShowPoolDetails(false);
  }, [collapseAll]);

  const renderAllPoolsDetails = () => {
    return (
      <div className="row align-items-center">
        <div className="col-md-6">
          <div className="container-rounded-dark">
            <p className="text-small">TVL</p>
            <p className="text-title text-numeric">{formatStringToPrice(poolData.tvl)}</p>

            <hr className="my-4" />

            <div className="d-flex justify-content-between align-items-center">
              <div className="d-flex align-items-center">
                <IconToken symbol={poolData.token0Symbol} />
                <span className="text-main text-bold ms-3">{poolData.token0Symbol}</span>
              </div>

              <span className="text-numeric text-small">
                {formatStringETHtoPriceFormatted(poolData.token0AmountFormatted)}
              </span>
            </div>

            <div className="d-flex justify-content-between align-items-center mt-3">
              <div className="d-flex align-items-center">
                <IconToken symbol={poolData.token1Symbol} />
                <span className="text-main text-bold ms-3">{poolData.token1Symbol}</span>
              </div>

              <span className="text-numeric text-small">
                {formatStringETHtoPriceFormatted(poolData.token1AmountFormatted)}
              </span>
            </div>
          </div>
        </div>

        <div className="col-md-6 mt-4 mt-md-0 d-flex">
          <div className="flex-1">
            <Link
              className="d-block btn btn-sm btn-primary ms-3"
              to={`/${poolData.token0}/${poolData.token1}`}
            >
              Trade
            </Link>
          </div>

          <div className="flex-1">
            <Link
              className="d-block btn btn-sm btn-primary ms-3"
              to={`/create/${poolData.token0}/${poolData.token1}`}
            >
              Add Liquidity
            </Link>
          </div>

          <div className="flex-1">
            <Link
              className="d-block btn btn-sm btn-outline-primary ms-3"
              to={`/analytics/pool/${poolData.pairAddress}`}
            >
              View analytics
            </Link>
          </div>
        </div>
      </div>
    );
  };

  const renderMyPoolsDetails = () => {
    return (
      <div className="row align-items-center">
        <div className="col-md-8">
          <div className="row">
            <div className="col-md-6">
              <div className="container-rounded-dark">
                <p className="text-small">Liquidity</p>
                <p className="text-title text-numeric">{formatStringToPrice(poolData.tvl)}</p>

                <hr className="my-4" />

                <div className="d-flex justify-content-between align-items-center">
                  <div className="d-flex align-items-center">
                    <IconToken symbol={poolData.token0Symbol} />
                    <span className="text-main text-bold ms-3">{poolData.token0Symbol}</span>
                  </div>

                  <span className="text-numeric text-small">
                    {formatStringETHtoPriceFormatted(poolData.token0AmountFormatted)}
                  </span>
                </div>

                <div className="d-flex justify-content-between align-items-center mt-3">
                  <div className="d-flex align-items-center">
                    <IconToken symbol={poolData.token1Symbol} />
                    <span className="text-main text-bold ms-3">{poolData.token1Symbol}</span>
                  </div>

                  <span className="text-numeric text-small">
                    {formatStringETHtoPriceFormatted(poolData.token1AmountFormatted)}
                  </span>
                </div>
              </div>
            </div>

            <div className="col-md-6 mt-4 mt-md-0">
              {haveStakedTokens ? (
                <div className="container-rounded-dark">
                  <p className="text-small">Staked Liquidity</p>
                  <p className="text-title text-numeric text-warning">
                    {formatStringToPrice(poolData.stakedTvl as string)}
                  </p>

                  <hr className="my-4" />

                  <div className="d-flex justify-content-between align-items-center">
                    <div className="d-flex align-items-center">
                      <IconToken symbol={poolData.token0Symbol} />
                      <span className="text-main text-bold ms-3">{poolData.token0Symbol}</span>
                    </div>

                    <span className="text-numeric text-small">
                      {formatStringETHtoPriceFormatted(
                        poolData.stakedToken0AmountFormatted as string,
                      )}
                    </span>
                  </div>

                  <div className="d-flex justify-content-between align-items-center mt-3">
                    <div className="d-flex align-items-center">
                      <IconToken symbol={poolData.token1Symbol} />
                      <span className="text-main text-bold ms-3">{poolData.token1Symbol}</span>
                    </div>

                    <span className="text-numeric text-small">
                      {formatStringETHtoPriceFormatted(
                        poolData.stakedToken1AmountFormatted as string,
                      )}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="container-rounded-dark">
                  <p className="text-small">Unclaimed fees</p>
                  <p className="text-title text-numeric text-success">
                    ${formatStringETHtoPriceFormatted(poolData.feesStr as string)}
                  </p>

                  <hr className="my-4" />

                  <div className="d-flex justify-content-between align-items-center">
                    <div className="d-flex align-items-center">
                      <IconToken symbol={poolData.token0Symbol} />
                      <span className="text-main text-bold ms-3">{poolData.token0Symbol}</span>
                    </div>

                    <span className="text-numeric text-small">
                      {formatStringETHtoPriceFormatted(poolData.fee0AmountFormatted as string)}
                    </span>
                  </div>

                  <div className="d-flex justify-content-between align-items-center mt-3">
                    <div className="d-flex align-items-center">
                      <IconToken symbol={poolData.token1Symbol} />
                      <span className="text-main text-bold ms-3">{poolData.token1Symbol}</span>
                    </div>

                    <span className="text-numeric text-small">
                      {formatStringETHtoPriceFormatted(poolData.fee1AmountFormatted as string)}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="container-rounded-dark mt-4">
            <div className="d-flex justify-content-between align-items-center">
              <span className="text-small text-bold">% of the pool</span>
              <span className="text-small text-numeric">{poolData.poolPercenatage}%</span>
            </div>
          </div>

          <div className="container-rounded-dark mt-4">
            <div className="d-md-flex justify-content-between align-items-center">
              <div className="d-flex align-items-center">
                <span className="text-small text-bold me-4">LP token count</span>
                <Button
                  onClick={handleTransferModalButtonClick}
                  size="small"
                  type="primary"
                  outline
                  className="me-4"
                >
                  Transfer
                </Button>
                {poolData.hasCampaign ? (
                  <Button onClick={handleStakeButtonClick} size="small" type="primary" outline>
                    Stake
                  </Button>
                ) : null}
              </div>
              <div>
                {Number(poolData.lpSharesFormatted) > 0 ? (
                  <p className="text-small text-numeric text-end">
                    {formatStringETHtoPriceFormatted(poolData.lpSharesFormatted as string)}
                  </p>
                ) : null}

                {haveStakedTokens ? (
                  <div className="d-flex align-items-center">
                    <Tippy content={`Staked LP tokens`}>
                      <span className="me-2">
                        <Icon size="small" color="warning" name="hint" />
                      </span>
                    </Tippy>
                    <p className="text-small text-numeric text-end text-warning">
                      {formatStringETHtoPriceFormatted(poolData.stakedBalanceFormatted as string)}
                    </p>
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </div>

        {showTransferModal ? (
          <Modal show={showTransferModal} closeModal={() => setShowTransferModal(false)}>
            <TransferLPModalContent
              closeModal={() => setShowTransferModal(false)}
              modalTitle="Transfer LP Tokens"
            >
              <div>
                <label className="text-small mb-2">Transfer to Wallet ID</label>
                <input
                  onChange={handleInputIdChange}
                  value={inputId}
                  type="text"
                  className={`form-control ${!inputIdValid ? 'is-invalid' : ''}`}
                />

                <label className="text-small mt-5 mb-2">Enter amount</label>

                <InputTokenSelector
                  inputTokenComponent={
                    <InputToken
                      value={inputLPAmount}
                      onChange={handleInputLPAmountChange}
                      name="amountOut"
                    />
                  }
                  buttonSelectorComponent={
                    <ButtonSelector selectorText="" disabled selectedToken="LP" />
                  }
                  walletBalanceComponent={
                    poolData.lpShares !== '0' ? (
                      <WalletBalance
                        onMaxButtonClick={handleMaxButtonClick}
                        walletBalance={formatStringWeiToStringEther(poolData.lpShares as string)}
                      />
                    ) : null
                  }
                />

                <div className="d-grid mt-5">
                  <Button
                    onClick={() =>
                      handleTransferButtonClick(
                        poolData.pairAddress,
                        inputLPAmount,
                        idToAddress(inputId),
                      )
                    }
                    loading={transferLoading}
                    type="primary"
                    disabled={!canTransfer}
                  >
                    Transfer
                  </Button>
                </div>
              </div>
            </TransferLPModalContent>
          </Modal>
        ) : null}

        <div className="col-md-4 mt-4 mt-md-0">
          <div>
            <Link
              className="d-block btn btn-sm btn-primary"
              to={`/create/${poolData.token0}/${poolData.token1}`}
            >
              Increase Liquidity
            </Link>
          </div>

          <div className="d-grid mt-3">
            <Button
              className="btn-sm"
              type="secondary"
              outline={true}
              onClick={handleRemoveButtonClick}
            >
              Remove Liquidity
            </Button>
          </div>
        </div>
      </div>
    );
  };

  const canTransfer = inputIdValid && inputId !== '' && inputLPAmountValid;
  const haveStakedTokens = Number(poolData.stakedBalance) > 0;

  return (
    <>
      <div
        onClick={() => {
          setShowPoolDetails(prev => !prev);
          if (setCollapseAll) {
            setCollapseAll(false);
          }
        }}
        className={`table-pools-row ${showPoolDetails && !collapseAll ? 'is-opened' : ''} ${
          view === PageViews.ALL_POOLS ? 'with-6-columns' : ''
        }`}
      >
        <div className="d-none d-md-flex table-pools-cell">
          <span className="text-small">{index + 1}</span>
        </div>
        <div className="table-pools-cell">
          {formatIcons([poolData.token0Symbol, poolData.token1Symbol])}
          <p className="text-small ms-3">
            {poolData.token0Symbol}/{poolData.token1Symbol}
          </p>
          <Tippy
            content={`${POOLS_FEE} swap fee within this pool, awarded to liquidity providers proportional to their contribution`}
          >
            <span className="text-micro text-numeric badge bg-secondary-800 ms-3">{POOLS_FEE}</span>
          </Tippy>
          {poolData.hasCampaign ? (
            <span className="text-micro text-uppercase badge bg-success-600 ms-3">
              Yield farming
            </span>
          ) : null}

          {poolData.hasProblematicToken ? (
            <Tippy content={generalFeesAndKeysWarning}>
              <span className="ms-3">
                <Icon name="info" color="info" />
              </span>
            </Tippy>
          ) : null}
        </div>
        {view === PageViews.ALL_POOLS ? (
          <>
            <div className="table-pools-cell justify-content-between justify-content-md-end">
              <span className="d-md-none text-small">TVL</span>
              <span className="text-small text-numeric">
                {poolData.tokensPriceEvaluated ? formatStringToPrice(poolData.tvl) : 'N/A'}
              </span>
            </div>
            <div className="table-pools-cell justify-content-between justify-content-md-end">
              <span className="d-md-none text-small">Volume 24h</span>
              <span className="text-small text-numeric">
                {poolData.tokensPriceEvaluated
                  ? formatStringToPrice(poolData.volume24 || '')
                  : 'N/A'}
              </span>
            </div>
            <div className="table-pools-cell justify-content-between justify-content-md-end">
              <span className="d-md-none text-small">Volume 7d</span>
              <span className="text-small text-numeric">
                {poolData.tokensPriceEvaluated
                  ? formatStringToPrice(poolData.volume7 || '')
                  : 'N/A'}
              </span>
            </div>
          </>
        ) : null}
        <div className="table-pools-cell d-none d-md-flex justify-content-md-end">
          <p className="d-inline-flex align-items-center text-white">
            <span className="text-small text-bold me-2">{showPoolDetails ? 'Less' : 'More'}</span>
            <Icon name={`chevron-${showPoolDetails ? 'up' : 'down'}`} />
          </p>
        </div>
      </div>

      {showPoolDetails ? (
        <div className="container-pool-details">
          {view === PageViews.ALL_POOLS ? renderAllPoolsDetails() : renderMyPoolsDetails()}
        </div>
      ) : null}

      <ToasterWrapper />
    </>
  );
};

export default PoolInfo;
