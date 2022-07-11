import React, { useEffect, useState, useContext } from 'react';
import { GlobalContext } from '../providers/Global';
import { Link } from 'react-router-dom';

import { useLazyQuery, useQuery } from '@apollo/client';
import { GET_POOLS_BY_USER, GET_POOLS } from '../GraphQL/Queries';
import { IPairData } from '../interfaces/tokens';
import { getHBarPrice, idToAddress } from '../utils/tokenUtils';
import {
  getTransactionSettings,
  INITIAL_REMOVE_SLIPPAGE_TOLERANCE,
  handleSaveTransactionSettings,
} from '../utils/transactionUtils';

import PoolInfo from '../components/PoolInfo';
import TransactionSettingsModalContent from '../components/Modals/TransactionSettingsModalContent';
import Modal from '../components/Modal';
import RemoveLiquidity from '../components/RemoveLiquidity';

const Pools = () => {
  const contextValue = useContext(GlobalContext);
  const { connection } = contextValue;
  const { userId } = connection;

  const [getPoolsByUser, { error, loading, data }] = useLazyQuery(GET_POOLS_BY_USER);
  const { loading: loadingPools, data: dataPools } = useQuery(GET_POOLS);
  const [pairData, setPairData] = useState<IPairData[]>([]);
  const [allPairsData, setAllPairsData] = useState<IPairData[]>([]);
  const [showModalTransactionSettings, setShowModalTransactionSettings] = useState(false);
  const [showRemoveContainer, setShowRemoveContainer] = useState(false);
  const [currentPoolIndex, setCurrentPoolIndex] = useState(0);
  const [hbarPrice, setHbarPrice] = useState(0);

  useEffect(() => {
    userId &&
      getPoolsByUser({
        variables: { address: idToAddress(userId) },
        pollInterval: 10000,
        fetchPolicy: 'network-only',
      });
  }, [userId, getPoolsByUser]);

  useEffect(() => {
    data && setPairData(data.getPoolsByUser);
  }, [data]);

  useEffect(() => {
    dataPools && setAllPairsData(dataPools.pools);
  }, [dataPools]);

  useEffect(() => {
    const getHBARPrice = async () => {
      const hbarPrice = await getHBarPrice();
      setHbarPrice(hbarPrice);
    };

    getHBARPrice();
  }, []);

  const havePairs = pairData.length > 0;

  return (
    <div className="d-flex justify-content-center">
      {showRemoveContainer ? (
        <RemoveLiquidity
          pairData={pairData[currentPoolIndex]}
          setShowRemoveContainer={setShowRemoveContainer}
        />
      ) : (
        <div className="container-pools">
          <div className="d-flex justify-content-between align-items-center mb-6">
            <h1 className="text-subheader">My positions</h1>
            <Link className="btn btn-sm btn-primary" to="/create">
              Create pool
            </Link>
          </div>

          <div className="d-flex justify-content-end">
            <span className="cursor-pointer" onClick={() => setShowModalTransactionSettings(true)}>
              <img className="me-2" width={24} src={`/icons/settings.png`} alt="" />
            </span>
          </div>

          {showModalTransactionSettings ? (
            <Modal show={showModalTransactionSettings}>
              <TransactionSettingsModalContent
                modalTitle="Transaction settings"
                closeModal={() => setShowModalTransactionSettings(false)}
                slippage={getTransactionSettings().removeSlippage}
                expiration={getTransactionSettings().transactionExpiration}
                saveChanges={handleSaveTransactionSettings}
                defaultSlippageValue={INITIAL_REMOVE_SLIPPAGE_TOLERANCE}
              />
            </Modal>
          ) : null}

          {error ? (
            <div className="alert alert-danger mt-5" role="alert">
              <strong>Something went wrong!</strong> Cannot get pairs...
              <p>{error.message}</p>
            </div>
          ) : null}

          {loading || loadingPools ? (
            <p className="text-info">Loading pools...</p>
          ) : havePairs ? (
            <div className="table-pools">
              <div className="table-pools-row">
                <div className="table-pools-cell">
                  <span className="text-small">#</span>
                </div>
                <div className="table-pools-cell">
                  <span className="text-small">Pool</span>
                </div>
              </div>
              {pairData.map((item, index) => (
                <PoolInfo
                  setShowRemoveContainer={setShowRemoveContainer}
                  setCurrentPoolIndex={setCurrentPoolIndex}
                  index={index}
                  key={index}
                  pairData={item}
                  allPoolsData={allPairsData}
                  hbarPrice={hbarPrice}
                />
              ))}
            </div>
          ) : (
            <p className="text-warning">No pools found</p>
          )}
        </div>
      )}
    </div>
  );
};

export default Pools;
