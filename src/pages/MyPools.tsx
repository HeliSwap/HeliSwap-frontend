import React, { useEffect, useState, useContext } from 'react';
import { GlobalContext } from '../providers/Global';

import { useLazyQuery } from '@apollo/client';
import { GET_POOLS_BY_USER } from '../GraphQL/Queries';
import { IPairData } from '../interfaces/tokens';
import { idToAddress } from '../utils/tokenUtils';
import {
  getTransactionSettings,
  INITIAL_REMOVE_SLIPPAGE_TOLERANCE,
  handleSaveTransactionSettings,
} from '../utils/transactionUtils';

import PoolInfo from '../components/PoolInfo';
import TransactionSettingsModalContent from '../components/Modals/TransactionSettingsModalContent';
import Modal from '../components/Modal';

const Pairs = () => {
  const contextValue = useContext(GlobalContext);
  const { connection } = contextValue;
  const { userId } = connection;

  const [getPoolsByUser, { error, loading, data }] = useLazyQuery(GET_POOLS_BY_USER);
  const [pairData, setPairData] = useState<IPairData[]>([]);
  const [showModalTransactionSettings, setShowModalTransactionSettings] = useState(false);

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

  const havePairs = pairData.length > 0;

  return (
    <div className="d-flex justify-content-center">
      <div className="container-swap">
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

        {loading ? (
          <p className="text-info">Loading pairs...</p>
        ) : havePairs ? (
          <div>
            {pairData.map((item, index) => (
              <PoolInfo key={index} pairData={item} />
            ))}
          </div>
        ) : (
          <p className="text-warning">No pools found</p>
        )}
      </div>
    </div>
  );
};

export default Pairs;
