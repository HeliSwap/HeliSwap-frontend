import { useNavigate } from 'react-router-dom';
import Tippy from '@tippyjs/react';

import Icon from '../components/Icon';

import claimdropsTestnet from '../claimdrops/testnet';
import claimdropsMainet from '../claimdrops/mainnet';

const Claimdrop = () => {
  const navigate = useNavigate();

  const claimdrops: { [key: string]: any } = {
    testnet: claimdropsTestnet,
    mainnet: claimdropsMainet,
  };

  const handleViewDetailsRowClick = (address: string) => {
    navigate(address);
  };

  const networkType = process.env.REACT_APP_NETWORK_TYPE as string;
  const filteredClaimdrops =
    claimdrops[networkType].length > 0
      ? claimdrops[networkType].filter((item: any) => item.expiryEnd.timestamp > Date.now())
      : [];

  const haveClaimdrops = filteredClaimdrops.length > 0;

  return (
    <div className="d-flex justify-content-center">
      <div className="container-max-with-1042">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div className="d-flex">
            <h2 className={`text-subheader tab-title is-active mx-4 `}>Claimdrops</h2>
          </div>
        </div>

        <hr />

        {haveClaimdrops ? (
          <div className="table-pools">
            <div className={`d-none d-md-grid table-pools-row with-3-columns`}>
              <div className="table-pools-cell">
                <span className="text-small">Drops</span>
              </div>
              <div className="table-pools-cell">
                <div className="d-flex align-items-center">
                  <span className="text-small">Start Date</span>
                  <Tippy
                    content={`This is when the vesting period starts. If the date lies in the future, this specific claim drop is still within the cliff period.`}
                  >
                    <span className="ms-2">
                      <Icon name="hint" size="small" color="gray" />
                    </span>
                  </Tippy>
                </div>
              </div>
              <div className="table-pools-cell">
                <div className="d-flex align-items-center">
                  <span className="text-small">Expiry date</span>
                  <Tippy
                    content={`IMPORTANT: After the Claimdrop has fully vested, there is a limited time where tokens can be claimed. When this day expires, you forfeit all unclaimed tokens of this claimdrop.`}
                  >
                    <span className="ms-2">
                      <Icon name="hint" size="small" color="gray" />
                    </span>
                  </Tippy>
                </div>
              </div>
            </div>
            {filteredClaimdrops.map((item: any, index: number) => (
              <div
                key={index}
                onClick={() => handleViewDetailsRowClick(item.claimdropAddress)}
                className="table-pools-row with-3-columns"
              >
                <div className="table-pools-cell">
                  <span className="text-small text-bold">{item.title}</span>
                </div>
                <div className="table-pools-cell">
                  <span className="text-small">{item.claimdropStart.date}</span>
                </div>
                <div className="table-pools-cell">
                  <span className="text-small">{item.expiryEnd.date}</span>
                </div>
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default Claimdrop;
