import { useMemo, useEffect, useContext, useCallback, useState } from 'react';
import Tippy from '@tippyjs/react';
import { ethers } from 'ethers';

import { GlobalContext } from '../providers/Global';

import Button from '../components/Button';
import Icon from '../components/Icon';
import Loader from '../components/Loader';

import { getProvider } from '../utils/tokenUtils';

// TODO: needs to be changed with the claim drop ABI
import ClaimDropABI from '../abi/LockDrop.json';

const ClaimDrop = () => {
  const contextValue = useContext(GlobalContext);
  const { connection } = contextValue;
  const { userId } = connection;

  const claimDropContract = useMemo(() => {
    const provider = getProvider();
    const lockDropContractAddress = process.env.REACT_APP_CLAIMDROP_ADDRESS; // TODO: need to be changed with the correct contract address
    return new ethers.Contract(lockDropContractAddress as string, ClaimDropABI, provider);
  }, []);

  const [loadingContractData, setLoadingContractData] = useState(true);

  const getContractData = useCallback(async () => {
    setLoadingContractData(true);

    const promisesArray = [];

    try {
    } catch (e) {
      console.error('Error on fetching contract data:', e);
    } finally {
      setLoadingContractData(false);
    }
  }, [claimDropContract, userId]);

  useEffect(() => {
    claimDropContract && getContractData();
  }, [claimDropContract, getContractData]);

  return (
    <div className="row justify-content-between">
      {loadingContractData ? (
        <div className="d-flex justify-content-center my-6">
          <Loader />
        </div>
      ) : (
        <>
          <div className="col-md-8 mb-10">
            <h1 className="text-display text-bold mb-5">Airdrop reward</h1>
            <p className="text-gray">
              You may have received claimable token rewards from the HeliSwap Airdrop. Claiming your
              airdrop will forfeit a portion of your balance. Your total claimable amount will rise
              whenever someone forfeits a portion of their reward.
            </p>
          </div>
          <div className="col-md-4"></div>
          <div className="col-md-8 mb-6">
            <div className="container-blue-neutral-800 d-flex justify-content-between rounded">
              <div className="p-5">
                <p className="text-small text-gray text-uppercase text-bold mb-3">
                  total tokens allocated{' '}
                  <Tippy content={`some text.`}>
                    <span className="ms-2">
                      <Icon name="hint" size="small" color="gray" />
                    </span>
                  </Tippy>
                </p>
                <div className="text-subheader text-bold d-flex">
                  <div className="w-28 h-28">
                    <Icon name="heli" size="small" color="white" />
                  </div>
                  <div>2,000,000</div>
                </div>
              </div>
              <div className="p-5">
                <p className="text-small text-gray text-uppercase text-bold mb-3">
                  total claimed{' '}
                  <Tippy content={`some text.`}>
                    <span className="ms-2">
                      <Icon name="hint" size="small" color="gray" />
                    </span>
                  </Tippy>
                </p>
                <div className="text-subheader text-bold d-flex">
                  <div className="w-28 h-28">
                    <Icon name="heli" size="small" color="white" />
                  </div>
                  <div>346,154.3383</div>
                </div>
              </div>
              <div className="p-5">
                <p className="text-small text-gray text-uppercase text-bold mb-3">
                  left to claim{' '}
                  <Tippy content={`some text.`}>
                    <span className="ms-2">
                      <Icon name="hint" size="small" color="gray" />
                    </span>
                  </Tippy>
                </p>
                <div className="text-subheader text-bold d-flex">
                  <div className="w-28 h-28">
                    <Icon name="heli" size="small" color="white" />
                  </div>
                  <div>42,645.6617</div>
                </div>
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="container-blue-neutral-800 p-5 text-center">
              <p className="text-small text-gray text-uppercase text-bold mb-3">
                heli price per unit{' '}
                <Tippy content={`some text.`}>
                  <span className="ms-2">
                    <Icon name="hint" size="small" color="gray" />
                  </span>
                </Tippy>
              </p>
              <div className="text-subheader text-bold">$0.25</div>
            </div>
          </div>
          <div className="col-md-8">
            <div className="container-blue-neutral-800 rounded">
              <div className="p-5">
                <p className="text-small text-gray text-uppercase text-bold mb-3">
                  your total airdrop amount{' '}
                  <Tippy content={`some text.`}>
                    <span className="ms-2">
                      <Icon name="hint" size="small" color="gray" />
                    </span>
                  </Tippy>
                </p>
                <div className="text-headline text-bold">2,000,000</div>
              </div>
              <div className="p-5">
                <p className="text-small text-gray text-uppercase text-bold mb-3">
                  total airdropped{' '}
                  <Tippy content={`some text.`}>
                    <span className="ms-2">
                      <Icon name="hint" size="small" color="gray" />
                    </span>
                  </Tippy>
                </p>
                <div className="text-subheader text-bold">2,000,000</div>
              </div>
              <div className="p-5">
                <p className="text-small text-gray text-uppercase text-bold mb-3">
                  your bonus amount{' '}
                  <Tippy content={`some text.`}>
                    <span className="ms-2">
                      <Icon name="hint" size="small" color="gray" />
                    </span>
                  </Tippy>
                </p>
                <div className="text-subheader text-bold">2,000,000</div>
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="container-blue-neutral-800 p-5 text-center">
              <p className="text-small text-gray text-uppercase text-bold mb-3">week 26/26</p>
              <p className="text-small text-gray text-uppercase text-bold mb-3">
                available to claim now:
              </p>
              <div className="text-subheader text-bold d-flex">
                <div className="w-28 h-28">
                  <Icon name="heli" size="small" color="white" />
                </div>
                <div>2,000,000</div>
              </div>
              <p className="text-small text-gray text-uppercase text-bold mb-3">your profit:</p>
              <div className="text-subheader text-bold d-flex">
                <div className="w-28 h-28">
                  <Icon name="heli" size="small" color="white" />
                </div>
                <div>0</div>
              </div>
              <Button type="primary" size="default" className="mx-2" onClick={() => {}}>
                Claim
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ClaimDrop;
