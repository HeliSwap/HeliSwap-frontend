import { useNavigate } from 'react-router-dom';

const claimdrops = [
  {
    tokenAddress: '0x0000000000000000000000000000000000340a6a',
    title: 'OM',
  },
  {
    tokenAddress: '0x000000000000000000000000000000000033dac0',
    title: 'HELI',
  },
];

const Claimdrop = () => {
  const navigate = useNavigate();

  const handleViewDetailsRowClick = (address: string) => {
    navigate(address);
  };

  return (
    <div className="d-flex justify-content-center">
      <div className="container-max-with-1042">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div className="d-flex">
            <h2 className={`text-subheader tab-title is-active mx-4 `}>Claim</h2>
          </div>
        </div>

        <hr />

        <div className="table-pools">
          <div className={`d-none d-md-grid table-pools-row`}>
            <div className="table-pools-cell">
              <span className="text-small">Drops</span>
            </div>
          </div>
          {claimdrops.map((item, index) => (
            <div
              key={index}
              onClick={() => handleViewDetailsRowClick(item.tokenAddress)}
              className="table-pools-row"
            >
              <div className="table-pools-cell">
                <span className="text-small text-bold">{item.title}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Claimdrop;
