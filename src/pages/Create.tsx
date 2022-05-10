import React, { useState, useEffect, useContext } from 'react';
import { ITokenData } from '../interfaces/tokens';
import { GlobalContext } from '../providers/Global';

import Button from '../components/Button';
import Modal from '../components/Modal';
import ModalSearchContent from '../components/Modals/ModalSearchContent';
import WalletBalance from '../components/WalletBalance';

interface ITokensData {
  tokenA: ITokenData;
  tokenB: ITokenData;
}

const Create = () => {
  const contextValue = useContext(GlobalContext);
  const { connection } = contextValue;
  const { userId } = connection;

  const [showModalA, setShowModalA] = useState(false);
  const [showModalB, setShowModalB] = useState(false);

  const [tokensData, setTokensData] = useState<ITokensData>();
  const [createPairData, setCreatePairData] = useState({
    tokenAAmount: '0',
    tokenBAmount: '0',
    tokenAId: '',
    tokenBId: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value, name } = e.target;

    setCreatePairData(prev => ({ ...prev, [name]: value }));
  };

  useEffect(() => {
    console.log('tokensData', tokensData);

    // setCreatePairData(prev => ({ ...prev, ...tokensData }));
  }, [tokensData]);

  return (
    <div className="d-flex justify-content-center">
      <div className="container-swap">
        <div className="d-flex justify-content-between">
          <span className="badge bg-primary text-uppercase">Token A</span>
          <span></span>
        </div>

        <div className="row justify-content-between align-items-end mt-3">
          <div className="col-8">
            <div className="input-container">
              <input
                value={createPairData.tokenAAmount}
                name="tokenAAmount"
                onChange={handleInputChange}
                type="text"
                className="form-control mt-2"
              />
              {/* <span onClick={() => setMaxNumber()} className="link-primary text-link-input">
                Max
              </span> */}
            </div>
            <p className="text-success mt-3">$0.00</p>
          </div>

          <div className="col-4">
            <div className="d-flex justify-content-between align-items-center">
              {tokensData?.tokenA ? (
                <span className="me-2">{tokensData?.tokenA.symbol}</span>
              ) : (
                <span>Select token</span>
              )}

              <Button onClick={() => setShowModalA(true)}>Find token</Button>
            </div>
            <Modal
              modalTitle="Find token"
              show={showModalA}
              closeModal={() => setShowModalA(false)}
            >
              <ModalSearchContent
                tokenFieldId="tokenA"
                setTokensData={setTokensData}
                closeModal={() => setShowModalA(false)}
              />
            </Modal>
            {tokensData?.tokenA ? (
              <WalletBalance userId={userId} tokenData={tokensData.tokenA} />
            ) : null}
          </div>
        </div>

        <div className="d-flex justify-content-between mt-5">
          <span className="badge bg-info text-uppercase">Token B</span>
          <span></span>
        </div>

        <div className="row justify-content-between align-items-end mt-3">
          <div className="col-8">
            <div className="input-container">
              <input
                value={createPairData.tokenBAmount}
                name="tokenBAmount"
                onChange={handleInputChange}
                type="text"
                className="form-control mt-2"
              />
              {/* <span onClick={() => setMaxNumber()} className="link-primary text-link-input">
                Max
              </span> */}
            </div>
            <p className="text-success mt-3">$0.00</p>
          </div>

          <div className="col-4">
            <div className="d-flex justify-content-between align-items-center">
              {tokensData?.tokenB ? (
                <span className="me-2">{tokensData?.tokenB.symbol}</span>
              ) : (
                <span>Select token</span>
              )}

              <Button onClick={() => setShowModalB(true)}>Find token</Button>
            </div>
            <Modal
              modalTitle="Find token"
              show={showModalB}
              closeModal={() => setShowModalB(false)}
            >
              <ModalSearchContent
                tokenFieldId="tokenB"
                setTokensData={setTokensData}
                closeModal={() => setShowModalB(false)}
              />
            </Modal>
            {tokensData?.tokenB ? (
              <WalletBalance userId={userId} tokenData={tokensData.tokenB} />
            ) : null}
          </div>
        </div>

        <div className="mt-5 d-flex justify-content-center">
          <Button>Create</Button>
        </div>
      </div>
    </div>
  );
};

export default Create;
