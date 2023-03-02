import { useNavigate } from 'react-router-dom';
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
  const haveClaimdrops = claimdrops[networkType].length > 0;

  return (
    <div className="d-flex justify-content-center">
      <div className="container-max-with-1042">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div className="d-flex">
            <h2 className={`text-subheader tab-title is-active mx-4 `}>Claim</h2>
          </div>
        </div>

        <hr />

        {haveClaimdrops ? (
          <div className="table-pools">
            <div className={`d-none d-md-grid table-pools-row`}>
              <div className="table-pools-cell">
                <span className="text-small">Drops</span>
              </div>
            </div>
            {claimdrops[networkType].map((item: any, index: number) => (
              <div
                key={index}
                onClick={() => handleViewDetailsRowClick(item.claimdropAddress)}
                className="table-pools-row"
              >
                <div className="table-pools-cell">
                  <span className="text-small text-bold">{item.title}</span>
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
